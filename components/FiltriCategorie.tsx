'use client'

import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export const CATEGORIE = [
  { key: 'tutti',        emoji: '🍷', label: 'Tutti' },
  { key: 'toscana',     emoji: '🌿', label: 'Toscana' },
  { key: 'piemonte',    emoji: '🏔',  label: 'Piemonte' },
  { key: 'veneto',      emoji: '🌊', label: 'Veneto' },
  { key: 'sicilia',     emoji: '☀️', label: 'Sicilia' },
  { key: 'puglia',      emoji: '🌾', label: 'Puglia' },
  { key: 'campania',    emoji: '🌋', label: 'Campania' },
  { key: 'franciacorta',emoji: '🍾', label: 'Franciacorta' },
  { key: 'famiglie',    emoji: '👨‍👩‍👧', label: 'Famiglie' },
  { key: 'biologico',   emoji: '🌱', label: 'Biologico' },
  { key: 'biodinamico', emoji: '🌙', label: 'Biodinamico' },
]

interface Props {
  activeFilter: string
  onFilter: (key: string) => void
}

export default function FiltriCategorie({ activeFilter, onFilter }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  function updateArrows() {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  useEffect(() => {
    updateArrows()
    const el = scrollRef.current
    el?.addEventListener('scroll', updateArrows, { passive: true })
    const ro = new ResizeObserver(updateArrows)
    if (el) ro.observe(el)
    return () => { el?.removeEventListener('scroll', updateArrows); ro.disconnect() }
  }, [])

  function scroll(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -240 : 240, behavior: 'smooth' })
  }

  return (
    <div className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-2">

          {/* Freccia sinistra */}
          <button
            onClick={() => scroll('left')}
            aria-label="Scorri a sinistra"
            className={`hidden md:flex shrink-0 w-8 h-8 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-all duration-200 ${
              canLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>

          {/* Pillole scrollabili */}
          <div
            ref={scrollRef}
            className="flex items-center gap-2 overflow-x-auto flex-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {CATEGORIE.map(({ key, emoji, label }) => {
              const active = activeFilter === key
              return (
                <button
                  key={key}
                  onClick={() => onFilter(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap shrink-0 border transition-all duration-200 ${
                    active
                      ? 'bg-[#722F37] text-white border-[#722F37] shadow-md'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                >
                  <span className="text-base leading-none">{emoji}</span>
                  <span>{label}</span>
                </button>
              )
            })}
          </div>

          {/* Freccia destra */}
          <button
            onClick={() => scroll('right')}
            aria-label="Scorri a destra"
            className={`hidden md:flex shrink-0 w-8 h-8 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-all duration-200 ${
              canRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>

        </div>
      </div>
    </div>
  )
}
