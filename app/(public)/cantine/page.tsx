import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase-server'
import CantineCard from '@/components/CantineCard'
import type { Cantina } from '@/lib/supabase'

export const metadata: Metadata = {
  title: "Tutte le cantine d'Italia — cantine.app",
  description: 'Esplora il catalogo completo delle cantine italiane. Cerca per regione, vino, certificazione e trova la cantina perfetta per la tua visita.',
}

const REGIONI = ['Toscana', 'Piemonte', 'Veneto', 'Sicilia', 'Puglia', 'Campania', 'Lombardia',
  'Trentino-Alto Adige', 'Friuli-Venezia Giulia', 'Sardegna', 'Umbria', 'Marche', 'Abruzzo',
  'Lazio', 'Emilia-Romagna', 'Calabria', 'Basilicata', 'Liguria', 'Molise', "Valle d'Aosta"]

export default async function CantineListPage({
  searchParams,
}: {
  searchParams: Promise<{ regione?: string; cert?: string }>
}) {
  const { regione, cert } = await searchParams
  const supabase = await createServerClient()

  let q = supabase.from('cantine').select('*').order('featured', { ascending: false }).order('nome')
  if (regione) q = q.eq('regione', regione)
  if (cert) q = q.contains('certificazioni', [cert])

  const { data: cantine } = await q.limit(120)

  return (
    <main className="bg-[#FAF7F2] min-h-screen">
      <div className="bg-[#722F37] text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-1">Cantine d&apos;Italia</h1>
          <p className="text-white/70">Scopri le migliori cantine vinicole italiane</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtri */}
        <div className="flex flex-wrap gap-3 mb-8">
          <a href="/cantine"
            className={`text-sm px-4 py-2 rounded-full border transition-colors ${!regione && !cert ? 'bg-[#722F37] text-white border-[#722F37]' : 'border-gray-200 text-gray-600 hover:border-[#722F37]'}`}>
            Tutte
          </a>
          {['Biologico', 'Biodinamico', 'Sostenibile'].map(c => (
            <a key={c} href={`/cantine?cert=${c}`}
              className={`text-sm px-4 py-2 rounded-full border transition-colors ${cert === c ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 text-gray-600 hover:border-green-600'}`}>
              {c}
            </a>
          ))}
        </div>

        {/* Regioni */}
        <div className="flex flex-wrap gap-2 mb-8">
          {REGIONI.map(r => (
            <a key={r} href={`/cantine?regione=${r}`}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${regione === r ? 'bg-[#722F37] text-white border-[#722F37]' : 'border-gray-200 text-gray-600 hover:border-[#722F37]'}`}>
              {r}
            </a>
          ))}
        </div>

        <p className="text-sm text-gray-500 mb-6">
          {(cantine ?? []).length} cantine{regione ? ` in ${regione}` : ''}{cert ? ` · ${cert}` : ''}
        </p>

        {(cantine ?? []).length === 0 ? (
          <div className="text-center py-16 text-gray-400">Nessuna cantina trovata</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(cantine as Cantina[]).map(c => <CantineCard key={c.id} cantina={c} />)}
          </div>
        )}
      </div>
    </main>
  )
}
