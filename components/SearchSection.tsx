'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Loader2, MapPin, X } from 'lucide-react'
import type { Cantina } from '@/lib/supabase'

const PLACEHOLDERS = [
  'es. Barolo con degustazione biologica in Piemonte…',
  'es. Cantina sul mare con vista e ristorante…',
  'es. Degustazione Amarone sotto i 20 euro Veneto…',
]

const CHIPS = [
  'Barolo',
  'Brunello',
  'Biologico',
  'Degustazione Toscana',
  'Cantina con ristorante',
]

interface Props {
  onResults: (cantine: Cantina[], label: string) => void
  onReset: () => void
  hasResults: boolean
}

export default function SearchSection({ onResults, onReset, hasResults }: Props) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pidx, setPidx] = useState(0)

  useEffect(() => {
    if (query) return
    const id = setInterval(() => setPidx((i) => (i + 1) % PLACEHOLDERS.length), 3500)
    return () => clearInterval(id)
  }, [query])

  async function doSearch(searchQuery: string) {
    if (!searchQuery.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/cerca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      })
      if (!res.ok) throw new Error('Errore')
      const data = await res.json()
      onResults(data.cantine ?? [], data.filtri?.query_friendly ?? searchQuery)
    } catch {
      setError('Errore nella ricerca. Riprova tra qualche secondo.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGeoSearch() {
    if (!navigator.geolocation) { setError('Geolocalizzazione non disponibile'); return }
    setGeoLoading(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lon } }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
            { headers: { 'User-Agent': 'cantine.app/1.0' } }
          )
          const data = await res.json()
          const city = data.address?.city ?? data.address?.town ?? data.address?.county ?? 'Italia'
          const q = `cantine vicino a ${city}`
          setQuery(q)
          await doSearch(q)
        } catch { setError('Impossibile ottenere la posizione') }
        finally { setGeoLoading(false) }
      },
      () => { setError('Permesso di geolocalizzazione negato'); setGeoLoading(false) }
    )
  }

  function handleReset() {
    setQuery('')
    setError(null)
    onReset()
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <form onSubmit={(e) => { e.preventDefault(); doSearch(query) }} className="space-y-3">
        {/* Input principale */}
        <div className="relative flex items-center bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <Sparkles className="absolute left-4 w-5 h-5 text-[#C9A84C] shrink-0 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={PLACEHOLDERS[pidx]}
            className="w-full pl-12 pr-36 py-4 text-base bg-transparent focus:outline-none text-gray-900 placeholder:text-gray-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 bg-[#722F37] hover:bg-[#5a1f25] disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cerca con AI'}
          </button>
        </div>

        {/* Riga secondaria */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleGeoSearch}
            disabled={geoLoading}
            className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-60"
          >
            {geoLoading
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <MapPin className="w-3.5 h-3.5 text-[#722F37]" />
            }
            Vicino a me
          </button>

          {/* Chips suggerimento rapido */}
          <div className="flex items-center gap-2 flex-wrap">
            {CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => { setQuery(chip); doSearch(chip) }}
                className="text-xs text-gray-500 bg-gray-100 hover:bg-[#722F37]/10 hover:text-[#722F37] px-3 py-1 rounded-full transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {hasResults && (
            <button
              type="button"
              onClick={handleReset}
              className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-[#722F37] transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Annulla ricerca
            </button>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>
        )}
      </form>
    </div>
  )
}
