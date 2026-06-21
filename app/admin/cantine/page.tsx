'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Search, CheckCircle, Star, Edit, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { Cantina } from '@/lib/supabase'

const REGIONI = ['Toscana', 'Piemonte', 'Veneto', 'Sicilia', 'Puglia', 'Campania', 'Lombardia',
  'Trentino-Alto Adige', 'Friuli-Venezia Giulia', 'Sardegna', 'Umbria', 'Marche', 'Abruzzo',
  'Lazio', 'Emilia-Romagna', 'Calabria', 'Basilicata', 'Liguria', 'Molise', "Valle d'Aosta"]

export default function AdminCantinePage() {
  const [cantine, setCantine] = useState<Cantina[]>([])
  const [search, setSearch] = useState('')
  const [regione, setRegione] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const loadCantine = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('cantine').select('*').order('nome')
    if (search) q = q.ilike('nome', `%${search}%`)
    if (regione) q = q.eq('regione', regione)
    const { data } = await q.limit(100)
    setCantine((data as Cantina[]) ?? [])
    setLoading(false)
  }, [search, regione])

  useEffect(() => { loadCantine() }, [loadCantine])

  async function toggleField(id: string, field: 'verified' | 'featured', current: boolean) {
    await supabase.from('cantine').update({ [field]: !current }).eq('id', id)
    setCantine(prev => prev.map(c => c.id === id ? { ...c, [field]: !current } : c))
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cantine</h1>
          <p className="text-gray-500 text-sm">{cantine.length} cantine caricate</p>
        </div>
      </div>

      {/* Filtri */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca per nome..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#722F37]/20"
          />
        </div>
        <div className="relative">
          <select
            value={regione}
            onChange={e => setRegione(e.target.value)}
            className="appearance-none pl-4 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#722F37]/20 bg-white"
          >
            <option value="">Tutte le regioni</option>
            {REGIONI.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Nome</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Regione</th>
              <th className="text-center px-4 py-3 text-gray-500 font-medium">Verificata</th>
              <th className="text-center px-4 py-3 text-gray-500 font-medium">Featured</th>
              <th className="text-right px-5 py-3 text-gray-500 font-medium">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-400">Caricamento...</td></tr>
            ) : cantine.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-400">Nessuna cantina trovata</td></tr>
            ) : cantine.map(c => (
              <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="font-medium text-gray-900">{c.nome}</div>
                  <div className="text-xs text-gray-400">{c.slug}</div>
                </td>
                <td className="px-4 py-3.5 text-gray-600">{c.regione}</td>
                <td className="px-4 py-3.5 text-center">
                  <button onClick={() => toggleField(c.id, 'verified', c.verified)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto transition-colors ${c.verified ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-300'}`}>
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <button onClick={() => toggleField(c.id, 'featured', c.featured)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto transition-colors ${c.featured ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-300'}`}>
                    <Star className="w-4 h-4" />
                  </button>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link href={`/admin/cantine/${c.id}`}
                    className="inline-flex items-center gap-1.5 text-xs text-[#722F37] hover:underline">
                    <Edit className="w-3.5 h-3.5" /> Modifica
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
