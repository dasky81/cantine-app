import { createServerClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { Store, CheckCircle, Users, ClipboardCheck, Search, FileText } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import AdminCharts from '@/components/AdminChartsWrapper'

export default async function AdminDashboard() {
  const supabase = await createServerClient()
  const admin = createAdminClient()

  const [
    { count: totalCantine },
    { count: cantineVerificate },
    { count: rivendicazioniPending },
    { count: postPubblicati },
    { count: ricercheOggi },
    { data: ultimeRivendicazioni },
    { data: ultimeRicerche },
  ] = await Promise.all([
    supabase.from('cantine').select('*', { count: 'exact', head: true }),
    supabase.from('cantine').select('*', { count: 'exact', head: true }).eq('verified', true),
    supabase.from('rivendicazioni').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('post').select('*', { count: 'exact', head: true }).eq('published', true),
    supabase.from('ricerche_log').select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    supabase.from('rivendicazioni')
      .select('id, created_at, nome_referente, email_referente, status, cantine(nome)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('ricerche_log')
      .select('id, query, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const { data: userData } = await admin.auth.admin.listUsers()
  const totalUtenti = userData?.users?.length ?? 0

  const KPI = [
    { label: 'Cantine totali', value: totalCantine ?? 0, Icon: Store, color: 'text-[#722F37]', bg: 'bg-[#722F37]/10' },
    { label: 'Cantine verificate', value: cantineVerificate ?? 0, Icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Utenti registrati', value: totalUtenti, Icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Rivendicazioni pending', value: rivendicazioniPending ?? 0, Icon: ClipboardCheck, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Ricerche AI oggi', value: ricercheOggi ?? 0, Icon: Search, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Post pubblicati', value: postPubblicati ?? 0, Icon: FileText, color: 'text-teal-600', bg: 'bg-teal-50' },
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Panoramica</h1>
      <p className="text-gray-500 text-sm mb-8">Stato della piattaforma cantine.app</p>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {KPI.map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{label}</p>
                <p className="text-3xl font-bold text-gray-900">{value.toLocaleString('it')}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Grafici visite + top cantine/ricerche (client) */}
      <AdminCharts />

      {/* Liste rapide server-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
        {/* Ultime 5 rivendicazioni pending */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Ultime rivendicazioni</h2>
            <Link href="/admin/rivendicazioni" className="text-xs text-[#722F37] hover:underline">
              Vedi tutte →
            </Link>
          </div>
          {!ultimeRivendicazioni || ultimeRivendicazioni.length === 0 ? (
            <p className="text-sm text-gray-400">Nessuna rivendicazione pending</p>
          ) : (
            <ul className="space-y-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(ultimeRivendicazioni as any[]).map((r) => (
                <li key={r.id} className="flex items-start gap-3">
                  <span className="mt-0.5 w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {Array.isArray(r.cantine) ? r.cantine[0]?.nome : r.cantine?.nome ?? '—'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {r.nome_referente ?? r.email_referente ?? '—'} ·{' '}
                      {format(new Date(r.created_at), 'd MMM', { locale: it })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Ultime 5 ricerche AI */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Ultime ricerche AI</h2>
          </div>
          {!ultimeRicerche || ultimeRicerche.length === 0 ? (
            <p className="text-sm text-gray-400">Nessuna ricerca recente</p>
          ) : (
            <ul className="space-y-3">
              {ultimeRicerche.map((r: { id: string; query: string; created_at: string }) => (
                <li key={r.id} className="flex items-start gap-3">
                  <Search className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-700 truncate">{r.query}</p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(r.created_at), 'd MMM, HH:mm', { locale: it })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
