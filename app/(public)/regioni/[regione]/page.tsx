import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import CantineCard from '@/components/CantineCard'
import type { Cantina } from '@/lib/supabase'

const REGIONI: Record<string, string> = {
  'toscana': 'Toscana',
  'piemonte': 'Piemonte',
  'veneto': 'Veneto',
  'sicilia': 'Sicilia',
  'puglia': 'Puglia',
  'campania': 'Campania',
  'lombardia': 'Lombardia',
  'trentino-alto-adige': 'Trentino-Alto Adige',
  'friuli-venezia-giulia': 'Friuli-Venezia Giulia',
  'sardegna': 'Sardegna',
  'umbria': 'Umbria',
  'marche': 'Marche',
  'abruzzo': 'Abruzzo',
  'lazio': 'Lazio',
  'emilia-romagna': 'Emilia-Romagna',
  'calabria': 'Calabria',
  'basilicata': 'Basilicata',
  'liguria': 'Liguria',
  'molise': 'Molise',
  'valle-daosta': "Valle d'Aosta",
}

const DESCRIZIONI: Record<string, string> = {
  'toscana': 'La Toscana è la regione vitivinicola più celebre d\'Italia, patria del Chianti Classico, Brunello di Montalcino e Vino Nobile di Montepulciano. Tra i dolci colli senesi e le colline del Chianti, le cantine toscane offrono esperienze di degustazione indimenticabili.',
  'piemonte': 'Il Piemonte è la casa del Barolo e del Barbaresco, i grandi vini da Nebbiolo delle Langhe. Con oltre 40 denominazioni, è una delle regioni vitivinicole più ricche d\'Italia, tra Moscato d\'Asti e Barbera.',
  'veneto': 'Il Veneto è la regione italiana che produce più vino DOC e DOCG. Dall\'Amarone della Valpolicella al Prosecco di Valdobbiadene, passando per il Soave, offre una varietà straordinaria di territori e stili.',
  'sicilia': 'La Sicilia è un\'isola di sole, mare e vino straordinario. Nero d\'Avola, Etna DOC, Marsala e Passito di Pantelleria sono solo alcuni dei vini che raccontano questa terra unica.',
  'puglia': 'La Puglia è la cantina d\'Italia per produzione, ma anche terra di vini di carattere come il Primitivo di Manduria e il Negroamaro. Un viaggio tra trulli e masserie tra i migliori del Sud.',
  'campania': 'La Campania vanta alcuni dei vitigni più antichi d\'Italia: Aglianico, Greco di Tufo e Fiano di Avellino sono eccellenze che sempre più appassionati scoprono nelle cantine irpine e sannite.',
  'lombardia': 'La Lombardia è la terra del Franciacorta DOCG, lo spumante italiano di metodo classico. Valtellina e Oltrepò Pavese completano un panorama vitivinicolo ricco e variegato.',
  'trentino-alto-adige': 'Il Trentino-Alto Adige produce vini bianchi alpini di straordinaria finezza. Gewürztraminer, Pinot Grigio e Lagrein sono le etichette più rinomate di questa regione montana.',
  'friuli-venezia-giulia': 'Il Friuli è celebre per i suoi bianchi freschi e aromatici, dal Pinot Grigio al Tocai Friulano. Le vigne del Collio e dei Colli Orientali producono vini di altissimo livello.',
  'sardegna': 'La Sardegna produce vini unici come il Cannonau e il Vermentino, espressione autentica di un\'isola selvaggia e affascinante. La longevità del Cannonau è leggendaria.',
  'umbria': 'L\'Umbria è il cuore verde d\'Italia con il Sagrantino di Montefalco, uno dei vini rossi più tannici al mondo, e il classico Orvieto Classico tra i bianchi.',
  'marche': 'Le Marche producono il Verdicchio, tra i migliori bianchi italiani, e il Rosso Conero dall\'uva Montepulciano. Vigneti che degradano verso l\'Adriatico in scenari incantevoli.',
  'abruzzo': 'L\'Abruzzo è la terra del Montepulciano d\'Abruzzo, vino robusto e generoso, e del Trebbiano d\'Abruzzo, uno dei bianchi più longevi d\'Italia grazie ai vigneti di Valentini.',
  'lazio': 'Il Lazio è famoso per i Castelli Romani, i Frascati e il Cesanese del Piglio DOCG. Una regione in crescita con nuovi produttori di qualità.',
  'emilia-romagna': 'L\'Emilia-Romagna è la regione del Lambrusco, frizzante e versatile, e del Sangiovese di Romagna. Una terra dove il vino si sposa perfettamente con la grande tradizione gastronomica.',
  'calabria': 'La Calabria produce il Cirò, uno dei vini più antichi della Magna Grecia, con il Gaglioppo come vitigno principe. Una regione tutta da scoprire.',
  'basilicata': 'La Basilicata è la terra dell\'Aglianico del Vulture DOCG, prodotto sulle pendici del Monte Vulture, un vulcano spento che dona mineralità unica ai suoi vini.',
  'liguria': 'La Liguria produce vini eroici su vigneti in forte pendenza. Il Rossese di Dolceacqua e il Cinque Terre bianco sono gemme difficili da trovare ma indimenticabili.',
  'molise': 'Il Molise è una piccola regione con una tradizione vinicola genuina. Il Tintilia, vitigno autoctono, produce vini rossi di grande personalità.',
  'valle-daosta': "La Valle d'Aosta produce vini alpini rari e preziosi. La Petite Arvine e il Fumin sono etichette che gli appassionati cercano con passione.",
}

export function generateStaticParams() {
  return Object.keys(REGIONI).map(r => ({ regione: r }))
}

export async function generateMetadata({ params }: { params: Promise<{ regione: string }> }): Promise<Metadata> {
  const { regione } = await params
  const nome = REGIONI[regione]
  if (!nome) return {}
  return {
    title: `Cantine in ${nome} — cantine.app`,
    description: `Scopri le migliori cantine vinicole in ${nome}. Degustazioni, visite guidate e vini DOC e DOCG.`,
  }
}

export default async function RegionePage({ params }: { params: Promise<{ regione: string }> }) {
  const { regione } = await params
  const nome = REGIONI[regione]
  if (!nome) notFound()

  const supabase = await createServerClient()
  const { data: cantine } = await supabase
    .from('cantine')
    .select('*')
    .ilike('regione', `%${nome}%`)
    .order('featured', { ascending: false })

  return (
    <main className="bg-[#FAF7F2] min-h-screen">
      <div className="bg-[#722F37] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-widest mb-2">Cantine per regione</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Cantine in {nome}</h1>
          <p className="text-white/80 text-lg max-w-2xl leading-relaxed">
            {DESCRIZIONI[regione] ?? `Esplora le migliori cantine vinicole in ${nome}.`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <p className="text-gray-500 mb-6 text-sm">
          {(cantine ?? []).length} {(cantine ?? []).length === 1 ? 'cantina trovata' : 'cantine trovate'} in {nome}
        </p>
        {(cantine ?? []).length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">Nessuna cantina ancora in {nome}</p>
            <p className="text-sm mt-1">Stiamo raccogliendo i dati — torna presto!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(cantine as Cantina[]).map(c => <CantineCard key={c.id} cantina={c} />)}
          </div>
        )}
      </div>
    </main>
  )
}
