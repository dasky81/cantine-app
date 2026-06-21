import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import CantineCard from '@/components/CantineCard'
import type { Cantina } from '@/lib/supabase'

const VINI: Record<string, { nome: string; descrizione: string }> = {
  'brunello-di-montalcino': {
    nome: 'Brunello di Montalcino',
    descrizione: 'Il Brunello di Montalcino DOCG è uno dei vini rossi più pregiati al mondo, prodotto da uve Sangiovese Grosso nel comune di Montalcino in Toscana. Invecchiamento minimo di 5 anni, fino a 10 per le riserve.',
  },
  'barolo': {
    nome: 'Barolo',
    descrizione: 'Il Barolo DOCG, il "re dei vini italiani", è prodotto da uve Nebbiolo nelle Langhe piemontesi. Vino strutturato, tannico e longevo, con note di rosa, tar e frutti rossi.',
  },
  'chianti-classico': {
    nome: 'Chianti Classico',
    descrizione: 'Il Chianti Classico DOCG è prodotto nella zona storica tra Firenze e Siena. Il Gallo Nero è il suo simbolo. Da uve Sangiovese, è elegante, fruttato e di grande versatilità.',
  },
  'amarone': {
    nome: 'Amarone della Valpolicella',
    descrizione: "L'Amarone della Valpolicella DOCG è prodotto con uve appassite (corvina, rondinella, molinara) nella Valpolicella veronese. Vino potente, ricco e longevo.",
  },
  'prosecco': {
    nome: 'Prosecco',
    descrizione: 'Il Prosecco DOCG e DOC è lo spumante italiano più venduto al mondo, prodotto da uve Glera nel Veneto e Friuli. Fresco, delicato, con note di fiori bianchi e mela verde.',
  },
  'nero-davola': {
    nome: "Nero d'Avola",
    descrizione: "Il Nero d'Avola è il vitigno rosso più importante della Sicilia. Produce vini caldi, corposi, con note di prugna e cioccolato. Ottimo sia in purezza che in blend.",
  },
  'primitivo': {
    nome: 'Primitivo',
    descrizione: 'Il Primitivo di Manduria DOC è il grande rosso della Puglia. Ricco, alcolico e fruttato, è geneticamente identico allo Zinfandel californiano. Ideale con la cucina pugliese.',
  },
  'vermentino': {
    nome: 'Vermentino',
    descrizione: 'Il Vermentino di Gallura DOCG è il grande bianco della Sardegna settentrionale. Fresco, sapido, con note di agrumi e fiori bianchi, è perfetto con i frutti di mare.',
  },
  'montepulciano': {
    nome: "Montepulciano d'Abruzzo",
    descrizione: "Il Montepulciano d'Abruzzo DOC è uno dei rossi più apprezzati del centro Italia. Robusto, generoso, con note di ciliegia e spezie, si abbina magnificamente ai piatti abruzzesi.",
  },
  'franciacorta': {
    nome: 'Franciacorta',
    descrizione: 'Il Franciacorta DOCG è il metodo classico italiano per eccellenza, prodotto in Lombardia. Elegante, cremoso e complesso, rivaleggia con le migliori bollicine europee.',
  },
}

export function generateStaticParams() {
  return Object.keys(VINI).map(tipo => ({ tipo }))
}

export async function generateMetadata({ params }: { params: Promise<{ tipo: string }> }): Promise<Metadata> {
  const { tipo } = await params
  const info = VINI[tipo]
  if (!info) return {}
  return {
    title: `Cantine ${info.nome} — cantine.app`,
    description: `Scopri le migliori cantine che producono ${info.nome}. Visita, degustazione e acquisto diretto.`,
  }
}

export default async function ViniPage({ params }: { params: Promise<{ tipo: string }> }) {
  const { tipo } = await params
  const info = VINI[tipo]
  if (!info) notFound()

  const supabase = await createServerClient()
  const { data: cantine } = await supabase
    .from('cantine')
    .select('*')
    .overlaps('vini_prodotti', [info.nome])
    .order('featured', { ascending: false })

  return (
    <main className="bg-[#FAF7F2] min-h-screen">
      <div className="bg-[#722F37] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-widest mb-2">Scopri i vini italiani</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{info.nome}</h1>
          <p className="text-white/80 text-lg max-w-2xl leading-relaxed">{info.descrizione}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <p className="text-gray-500 mb-6 text-sm">
          {(cantine ?? []).length} {(cantine ?? []).length === 1 ? 'cantina produce' : 'cantine producono'} {info.nome}
        </p>
        {(cantine ?? []).length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">Nessuna cantina trovata per {info.nome}</p>
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
