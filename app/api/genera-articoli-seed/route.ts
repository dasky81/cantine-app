import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase-admin'

const client = new Anthropic()

const ARTICOLI = [
  {
    titolo: "I migliori vini biologici d'Italia: guida alle cantine certificate",
    slug: 'vini-biologici-italia-guida',
    tag: ['biologico', 'certificazioni', 'sostenibilità'],
    prompt: "Scrivi un articolo in italiano di circa 600 parole sui migliori vini biologici d'Italia, includendo informazioni sulle certificazioni (Biologico, Biodinamico, Sostenibile), le regioni più importanti per la viticoltura biologica e consigli per scegliere un vino biologico di qualità. Formato HTML con tag h2, p, ul, strong.",
  },
  {
    titolo: 'Barolo e Brunello: i due re del vino italiano a confronto',
    slug: 'barolo-vs-brunello-confronto',
    tag: ['barolo', 'brunello', 'piemonte', 'toscana', 'nebbiolo', 'sangiovese'],
    prompt: "Scrivi un articolo in italiano di circa 600 parole che confronta Barolo e Brunello di Montalcino: origini, vitigni, caratteristiche organolettiche, invecchiamento, abbinamenti gastronomici e prezzi. Formato HTML con tag h2, p, ul, strong.",
  },
  {
    titolo: 'Come degustare il vino: guida completa per principianti',
    slug: 'come-degustare-vino-guida',
    tag: ['degustazione', 'guida', 'principianti', 'tecnica'],
    prompt: "Scrivi un articolo in italiano di circa 600 parole su come degustare il vino in modo corretto, coprendo: l'esame visivo, olfattivo e gustativo, i termini tecnici principali e consigli pratici per i principianti. Formato HTML con tag h2, p, ul, strong.",
  },
  {
    titolo: 'Enoturismo in Toscana: le 5 esperienze da non perdere',
    slug: 'enoturismo-toscana-esperienze',
    tag: ['enoturismo', 'toscana', 'vigneti', 'visite', 'esperienze'],
    prompt: "Scrivi un articolo in italiano di circa 600 parole sull'enoturismo in Toscana, descrivendo 5 esperienze imperdibili tra vigneti, cantine e borghi del vino. Includi zone come Chianti, Montalcino, Montepulciano e Bolgheri. Formato HTML con tag h2, p, ul, strong.",
  },
  {
    titolo: 'Prosecco, Franciacorta o Champagne: le differenze degli spumanti',
    slug: 'prosecco-franciacorta-champagne-differenze',
    tag: ['prosecco', 'franciacorta', 'spumante', 'champagne', 'bollicine'],
    prompt: "Scrivi un articolo in italiano di circa 600 parole che spiega le differenze tra Prosecco, Franciacorta e Champagne: metodi di produzione, caratteristiche, prezzi e occasioni d'uso. Formato HTML con tag h2, p, ul, strong.",
  },
]

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-seed-secret')
  if (secret !== 'cantine2026') {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const risultati: { slug: string; status: string }[] = []

  for (const art of ARTICOLI) {
    try {
      const msg = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        messages: [{ role: 'user', content: art.prompt }],
      })
      const contenuto = msg.content[0].type === 'text' ? msg.content[0].text : ''
      const excerpt = contenuto.replace(/<[^>]+>/g, '').slice(0, 200).trim() + '...'

      await supabase.from('post').upsert({
        slug: art.slug,
        titolo: art.titolo,
        contenuto,
        excerpt,
        tag: art.tag,
        published: true,
        published_at: new Date().toISOString(),
      }, { onConflict: 'slug' })

      risultati.push({ slug: art.slug, status: 'ok' })
    } catch (err) {
      risultati.push({ slug: art.slug, status: `errore: ${String(err)}` })
    }
  }

  return NextResponse.json({ generati: risultati.length, risultati })
}
