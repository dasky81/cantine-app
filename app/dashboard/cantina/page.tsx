'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, CalendarDays, TrendingUp, Edit, CheckCircle, Star, Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import CantineCard from '@/components/CantineCard'
import type { Cantina } from '@/lib/supabase'

export default function DashboardCantinaPage() {
  const [cantina, setCantina] = useState<Cantina | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totali: 0, ultimoMese: 0, posizioneRegione: 0 })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: c } = await supabase.from('cantine').select('*').eq('owner_id', user.id).single()
      if (!c) { setLoading(false); return }
      setCantina(c as Cantina)

      fetch('/api/stats/cantina')
        .then(r => r.ok ? r.json() : null)
        .then(s => { if (s) setStats(s) })

      setLoading(false)
    }
    load()
  }, [router, supabase])

  if (loading) return <div className="p-8 text-gray-400">Caricamento...</div>

  if (!cantina) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm max-w-md">
          <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">Nessuna cantina associata</h2>
          <p className="text-gray-500 text-sm mb-6">
            Non hai ancora una cantina collegata al tuo account.
          </p>
          <Link href="/rivendica-scheda"
            className="inline-flex items-center gap-2 bg-[#722F37] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#5a1f25] transition-colors">
            Rivendica la tua scheda
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{cantina.nome}</h1>
          <p className="text-gray-500 text-sm">{[cantina.comune, cantina.regione].filter(Boolean).join(', ')}</p>
        </div>
        <Link href="/dashboard/cantina/modifica"
          className="flex items-center gap-2 bg-[#722F37] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#5a1f25] transition-colors">
          <Edit className="w-4 h-4" /> Modifica scheda
        </Link>
      </div>

      {/* Badge stato */}
      <div className="flex flex-wrap gap-2">
        <span className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full ${cantina.verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          <CheckCircle className="w-4 h-4" />
          {cantina.verified ? 'Scheda verificata' : 'In attesa di verifica'}
        </span>
        {cantina.featured && (
          <span className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-amber-100 text-amber-700">
            <Star className="w-4 h-4" /> Featured
          </span>
        )}
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Visite totali', value: stats.totali, Icon: Eye, color: 'text-[#722F37]', bg: 'bg-[#722F37]/10' },
          { label: 'Visite ultimo mese', value: stats.ultimoMese, Icon: CalendarDays, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Posizione in regione', value: stats.posizioneRegione > 0 ? `#${stats.posizioneRegione}` : '—', Icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {typeof value === 'number' ? value.toLocaleString('it') : value}
                </p>
              </div>
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Anteprima scheda */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Anteprima scheda pubblica
        </h2>
        <div className="max-w-xs">
          <CantineCard cantina={cantina} />
        </div>
      </div>

      <Link href={`/cantine/${cantina.slug}`} target="_blank"
        className="inline-block text-sm text-[#722F37] hover:underline">
        → Visualizza scheda sul sito
      </Link>
    </div>
  )
}
