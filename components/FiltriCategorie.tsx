'use client'

export const CATEGORIE = [
  { key: 'tutti',       emoji: '🍷', label: 'Tutti' },
  { key: 'toscana',    emoji: '🌿', label: 'Toscana' },
  { key: 'piemonte',   emoji: '🏔',  label: 'Piemonte' },
  { key: 'veneto',     emoji: '🌊', label: 'Veneto' },
  { key: 'sicilia',    emoji: '☀️', label: 'Sicilia' },
  { key: 'puglia',     emoji: '🌾', label: 'Puglia' },
  { key: 'campania',   emoji: '🌋', label: 'Campania' },
  { key: 'franciacorta', emoji: '🍾', label: 'Franciacorta' },
  { key: 'famiglie',   emoji: '👨‍👩‍👧', label: 'Famiglie' },
  { key: 'biologico',  emoji: '🌱', label: 'Biologico' },
  { key: 'biodinamico', emoji: '🌙', label: 'Biodinamico' },
]

interface Props {
  activeFilter: string
  onFilter: (key: string) => void
}

export default function FiltriCategorie({ activeFilter, onFilter }: Props) {
  return (
    <div className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {CATEGORIE.map(({ key, emoji, label }) => {
            const active = activeFilter === key
            return (
              <button
                key={key}
                onClick={() => onFilter(key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-medium whitespace-nowrap transition-all shrink-0 border ${
                  active
                    ? 'bg-[#722F37] text-white border-[#722F37] shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <span>{emoji}</span>
                <span>{label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
