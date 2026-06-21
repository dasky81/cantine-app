import { createServerClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { Store, CheckCircle, Users, ClipboardCheck, Search, FileText } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createServerClient()
  const admin = createAdminClient()

  const [
    { count: totalCantine },
    { count: cantineVerificate },
    { count: rivendicazioniPending },
    { count: postPubblicati },
    { count: ricercheOggi },
  ] = await Promise.all([
    supabase.from('cantine').select('*', { count: 'exact', head: true }),
    supabase.from('cantine').select('*', { count: 'exact', head: true }).eq('verified', true),
    supabase.from('rivendicazioni').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('post').select('*', { count: 'exact', head: true }).eq('published', true),
    supabase.from('ricerche_log').select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
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
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">Panoramica di cantine.app</p>

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
    </div>
  )
}
