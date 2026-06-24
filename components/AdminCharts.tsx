'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase'

const LineChart = dynamic(() => import('recharts').then(m => m.LineChart), { ssr: false })
const Line = dynamic(() => import('recharts').then(m => m.Line), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false })

interface DayPoint { giorno: string; visite: number; ricerche: number }
interface TopItem { label: string; count: number }

function buildDays(
  visite: { created_at: string }[],
  ricerche: { created_at: string }[],
): DayPoint[] {
  const map: Record<string, DayPoint> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
    map[d] = { giorno: new Date(d).toLocaleDateString('it', { weekday: 'short', day: '2-digit' }), visite: 0, ricerche: 0 }
  }
  visite.forEach(v => { const d = v.created_at.slice(0, 10); if (d in map) map[d].visite++ })
  ricerche.forEach(r => { const d = r.created_at.slice(0, 10); if (d in map) map[d].ricerche++ })
  return Object.values(map)
}

function topN(items: string[], n: number): TopItem[] {
  const counts: Record<string, number> = {}
  items.forEach(i => { counts[i] = (counts[i] ?? 0) + 1 })
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([label, count]) => ({ label, count }))
}

export default function AdminCharts() {
  const [chartData, setChartData] = useState<DayPoint[]>([])
  const [topCantine, setTopCantine] = useState<TopItem[]>([])
  const [topRicerche, setTopRicerche] = useState<TopItem[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const setteDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()
      const trentaDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()

      const [
        { data: visite7 },
        { data: ricerche7 },
        { data: visite30 },
        { data: ricerche30 },
      ] = await Promise.all([
        supabase.from('visite_log').select('created_at').gte('created_at', setteDaysAgo),
        supabase.from('ricerche_log').select('created_at').gte('created_at', setteDaysAgo),
        supabase.from('visite_log').select('path').gte('created_at', trentaDaysAgo).ilike('path', '/cantine/%').limit(2000),
        supabase.from('ricerche_log').select('query').gte('created_at', trentaDaysAgo).limit(2000),
      ])

      setChartData(buildDays(visite7 ?? [], ricerche7 ?? []))

      const slugToNome: Record<string, string> = {}
      const cantinePaths = (visite30 ?? []).map(v => v.path as string)
      const slugs = [...new Set(cantinePaths.map(p => p.replace('/cantine/', '')))]
      if (slugs.length > 0) {
        const { data: cantine } = await supabase.from('cantine').select('slug, nome').in('slug', slugs)
        cantine?.forEach(c => { slugToNome[`/cantine/${c.slug}`] = c.nome })
      }
      setTopCantine(
        topN(cantinePaths, 5).map(t => ({ label: slugToNome[t.label] ?? t.label, count: t.count }))
      )

      setTopRicerche(topN((ricerche30 ?? []).map(r => r.query as string), 5))
      setLoading(false)
    }
    load()
  }, [supabase])

  if (loading) return <div className="text-gray-400 text-sm py-6">Caricamento grafici...</div>

  return (
    <div className="space-y-6 mt-6">
      {/* Grafico visite + ricerche */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">Ultimi 7 giorni</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="giorno" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
              <Line type="monotone" dataKey="visite" name="Visite" stroke="#722F37" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="ricerche" name="Ricerche AI" stroke="#C9A84C" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 mt-2 justify-end">
          <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-0.5 bg-[#722F37] inline-block" /> Visite</span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-0.5 bg-[#C9A84C] inline-block" /> Ricerche AI</span>
        </div>
      </div>

      {/* Top 5 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Top 5 cantine più visitate</h2>
          {topCantine.length === 0
            ? <p className="text-sm text-gray-400">Nessun dato disponibile</p>
            : (
              <ol className="space-y-2">
                {topCantine.map((c, i) => (
                  <li key={c.label} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#722F37]/10 text-[#722F37] text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <span className="text-sm text-gray-700 truncate flex-1">{c.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{c.count.toLocaleString('it')}</span>
                  </li>
                ))}
              </ol>
            )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Top 5 ricerche più frequenti</h2>
          {topRicerche.length === 0
            ? <p className="text-sm text-gray-400">Nessun dato disponibile</p>
            : (
              <ol className="space-y-2">
                {topRicerche.map((r, i) => (
                  <li key={r.label} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <span className="text-sm text-gray-700 truncate flex-1">{r.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{r.count.toLocaleString('it')}</span>
                  </li>
                ))}
              </ol>
            )}
        </div>
      </div>
    </div>
  )
}
