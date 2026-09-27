import Anthropic from '@anthropic-ai/sdk'

export interface FiltriRicerca {
  regione: string | null
  vini: string[]
  certificazioni: string[]
  servizi: string[]
  prezzo_max: number | null
  lingua: string | null
  query_friendly: string
}

const SYSTEM_PROMPT = `Sei un esperto di vino italiano e cantine. Aiuti gli utenti a trovare la cantina perfetta.
Interpreti ricerche in linguaggio naturale come:
- "cantina con degustazione biologica in Toscana con bambini"
- "Brunello di Montalcino visita guidata weekend"
- "cantina biodinamica Piemonte sotto i 20 euro"

Restituisci SOLO un oggetto JSON valido (senza markdown, senza backtick, senza testo aggiuntivo):
{
  "regione": string | null,
  "vini": string[],
  "certificazioni": string[],
  "servizi": string[],
  "prezzo_max": number | null,
  "lingua": string | null,
  "query_friendly": string
}

Regole:
- "regione": nome completo della regione italiana (es. "Toscana", "Piemonte") o null
- "vini": nomi dei vini menzionati (es. ["Barolo", "Brunello di Montalcino"])
- "certificazioni": solo tra "Biologico", "Biodinamico", "Sostenibile"
- "servizi": solo tra "Vendita diretta", "Ristorante", "Pernottamento", "Enoteca", "Degustazione"
- "prezzo_max": numero intero in euro estratto dalla query (es. 20) o null
- "lingua": lingua richiesta per la visita o null
- "query_friendly": riassunto leggibile della ricerca (es. "Cantine biologiche in Toscana con degustazione")`

const REGIONI = ['Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna',
  'Friuli-Venezia Giulia', 'Lazio', 'Liguria', 'Lombardia', 'Marche', 'Molise',
  'Piemonte', 'Puglia', 'Sardegna', 'Sicilia', 'Toscana', 'Trentino-Alto Adige',
  'Umbria', "Valle d'Aosta", 'Veneto']

const VINI = ['Barolo', 'Barbaresco', 'Brunello di Montalcino', 'Chianti Classico',
  'Amarone', 'Prosecco', "Nero d'Avola", 'Primitivo', 'Vermentino',
  'Montepulciano', 'Franciacorta', 'Sagrantino', 'Etna Rosso', 'Falanghina']

const CERTIFICAZIONI = ['Biologico', 'Biodinamico', 'Sostenibile']
const SERVIZI = ['Vendita diretta', 'Ristorante', 'Pernottamento', 'Enoteca', 'Degustazione']

function includesTerm(query: string, value: string) {
  return query.includes(value.toLocaleLowerCase('it-IT'))
}

export function parseRicercaLocale(query: string): FiltriRicerca {
  const normalized = query.toLocaleLowerCase('it-IT')
  const regione = REGIONI.find((item) => includesTerm(normalized, item)) ?? null
  const vini = VINI.filter((item) => includesTerm(normalized, item))
  const certificazioni = CERTIFICAZIONI.filter((item) => includesTerm(normalized, item))
  const servizi = SERVIZI.filter((item) => includesTerm(normalized, item))
  const prezzo = normalized.match(/(?:sotto|max|massimo|entro)\s*(?:i\s*)?(\d{1,3})/)

  return {
    regione,
    vini,
    certificazioni,
    servizi,
    prezzo_max: prezzo ? Number(prezzo[1]) : null,
    lingua: null,
    query_friendly: query,
  }
}

export async function parseRicercaAI(query: string): Promise<FiltriRicerca> {
  if (!process.env.ANTHROPIC_API_KEY) return parseRicercaLocale(query)

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: query }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Risposta AI non valida')

  return JSON.parse(jsonMatch[0]) as FiltriRicerca
}
