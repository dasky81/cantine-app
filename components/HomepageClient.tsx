'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import FiltriCategorie from './FiltriCategorie'
import SearchSection from './SearchSection'
import CantineCard from './CantineCard'
import type { Cantina } from '@/lib/supabase'

const FILTER_FN: Record<string, (c: Cantina) => boolean> = {
  toscana:      c => c.regione === 'Toscana',
  piemonte:     c => c.regione === 'Piemonte',
  veneto:       c => c.regione === 'Veneto',
  sicilia:      c => c.regione === 'Sicilia',
  puglia:       c => c.regione === 'Puglia',
  campania:     c => c.regione === 'Campania',
  franciacorta: c => c.vini_prodotti?.some(v => v.toLowerCase().includes('franciacorta')) ?? false,
  famiglie:     c => c.servizi?.some(s => s.toLowerCase().includes('famil')) ?? false,
  biologico:    c => c.certificazioni?.includes('Biologico') ?? false,
  biodinamico:  c => c.certificazioni?.includes('Biodinamico') ?? false,
}

interface Props {
  initialCantine: Cantina[]
}

export default function HomepageClient({ initialCantine }: Props) {
  const [searchResults, setSearchResults] = useState<Cantina[] | null>(null)
  const [searchLabel, setSearchLabel] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState('tutti')

  const displayCantine = useMemo(() => {
    if (searchResults !== null) return searchResults
    if (activeFilter === 'tutti') return initialCantine
    const fn = FILTER_FN[activeFilter]
    return fn ? initialCantine.filter(fn) : initialCantine
  }, [searchResults, activeFilter, initialCantine])

  function handleFilter(key: string) {
    setActiveFilter(key)
    setSearchResults(null)
    setSearchLabel(null)
  }

  function handleResults(cantine: Cantina[], label: string) {
    setSearchResults(cantine)
    setSearchLabel(label)
    setActiveFilter('tutti')
  }

  function handleReset() {
    setSearchResults(null)
    setSearchLabel(null)
  }

  return (
    <div className="bg-[#FAF7F2]">
      <FiltriCategorie activeFilter={activeFilter} onFilter={handleFilter} />

      <SearchSection
        onResults={handleResults}
        onReset={handleReset}
        hasResults={searchResults !== null}
      />

      {/* Griglia cantine */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-start justify-between mb-6">
          <div>
            {searchLabel ? (
              <>
                <h2 className="text-xl font-bold text-[#722F37]">{searchLabel}</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {searchResults?.length ?? 0}{' '}
                  {(searchResults?.length ?? 0) === 1 ? 'cantina trovata' : 'cantine trovate'}
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900">Le nostre cantine</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Scopri le migliori cantine d&apos;Italia o usa la ricerca AI
                </p>
              </>
            )}
          </div>
        </div>

        {displayCantine.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Nessuna cantina trovata</p>
            <p className="text-sm mt-1">Prova a modificare i criteri di ricerca</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayCantine.map((cantina) => (
              <CantineCard key={cantina.id} cantina={cantina} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
