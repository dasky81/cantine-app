'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { BarChart2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { Cantina } from '@/lib/supabase'

const LineChart = dynamic(() => import('recharts').then(m => m.LineChart), { ssr: false })
const Line = dynamic(() => import('recharts').then(m => m.Line), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false })

interface DayPoint { giorno: string; visite: number }

function buildDayMap(records: { created_at: string }[], days: number): DayPoint[] {
  const map: Record<string, number> = {}
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
    map[d] = 0
  }
  records.forEach(r => {
    const d = r.created_at.slice(0, 10)
    if (d in map) map[d]++
  })
  return Object.entries(map).map(([date, visite]) => ({
    giorno: new Date(date).toLocaleDateString('it', { day: '2-digit', month: 'short' }),
    visite,
  }))
}

export default function StatistichePage() {
  const [cantina, setCantina] = useState<Cantina | null>(null)
  const [chart30, setChart30] = useState<DayPoint[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: c } = await supabase.from('cantine').select('*').eq('owner_id', user.id).single()
      if (!c) { setLoading(false); return }
      setCantina(c as Cantina)

      const trenta = new Date(Date.now() - 30 * 86400000).toISOString()
      const { data: visite } = await supabase
        .from('visite_log')
        .select('created_at')
        .eq('path', `/cantine/${c.slug}`)
        .gte('created_at', trenta)
        .order('created_at')

      setChart30(buildDayMap(visite ?? [], 30))
      setLoading(false)
    }
    load()
  }, [router, supabase])

  if (loading) return <div className="p-8 text-gray-400">Caricamento...</div>

  if (!cantina) {
    return (
      <div className="p-8 text-gray-500">
        Nessuna cantina associata al tuo account.
      </div>
    )
  }

  const totale30 = chart30.reduce((s, d) => s + d.visite, 0)

  return (
    <div className="p-8 max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-[#722F37]" /> Statistiche visite
        </h1>
        <p className="text-gray-500 text-sm mt-1">{cantina.nome} · ultimi 30 giorni</p>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <p className="text-xs text-gray-500 mb-1">Totale visite (30 giorni)</p>
        <p className="text-3xl font-bold text-gray-900 mb-5">{totale30.toLocaleString('it')}</p>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart30} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="giorno" tick={{ fontSize: 11 }} interval={4} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                formatter={(v) => [v, 'Visite']}
              />
              <Line
                type="monotone"
                dataKey="visite"
                stroke="#722F37"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#722F37' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
