'use client'

import { useState } from 'react'
import { Search, Loader2, X } from 'lucide-react'
import CantineCard from './CantineCard'
import type { Cantina } from '@/lib/supabase'
import type { FiltriRicerca } from '@/lib/claude'

interface SearchResult {
  cantine: Cantina[]
  filtri: FiltriRicerca
}

export default function SearchSection({ initialCantine }: { initialCantine: Cantina[] }) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SearchResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/cerca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      if (!res.ok) throw new Error('Errore')
      const data: SearchResult = await res.json()
      setResult(data)
    } catch {
      setError('Errore nella ricerca. Riprova tra qualche secondo.')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setQuery('')
    setResult(null)
    setError(null)
  }

  const cantine = result ? result.cantine : initialCantine

  return (
    <div className="bg-[#FAF7F2] min-h-screen">
      {/* Search bar strip */}
      <div className="bg-[#722F37] py-8 px-4 shadow-lg">
        <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca una cantina... es. Barolo con degustazione biologica in Piemonte"
              className="w-full h-14 pl-6 pr-14 rounded-full bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C] shadow-lg text-base"
            />
            <button
              type="submit"
              disabled={loading}
              aria-label="Cerca"
              className="absolute right-2 top-2 h-10 w-10 rounded-full bg-[#C9A84C] hover:bg-[#b8943d] text-white flex items-center justify-center transition-colors disabled:opacity-60 shadow"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results area */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
            <X className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            {result ? (
              <>
                <h2 className="text-xl font-bold text-[#722F37]">{result.filtri.query_friendly}</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {result.cantine.length}{' '}
                  {result.cantine.length === 1 ? 'cantina trovata' : 'cantine trovate'}
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900">Le nostre cantine</h2>
                <p className="text-gray-500 mt-1 text-sm">
                  Scopri le migliori cantine d&apos;Italia o usa la ricerca AI sopra
                </p>
              </>
            )}
          </div>
          {result && (
            <button
              onClick={handleReset}
              className="text-sm text-gray-500 hover:text-[#722F37] flex items-center gap-1 shrink-0 transition-colors"
            >
              <X className="w-4 h-4" />
              Annulla ricerca
            </button>
          )}
        </div>

        {cantine.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Nessuna cantina trovata</p>
            <p className="text-sm mt-1">Prova a modificare i criteri di ricerca</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cantine.map((cantina) => (
              <CantineCard key={cantina.id} cantina={cantina} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
