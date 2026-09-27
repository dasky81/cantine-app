import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Funzione AI non configurata' }, { status: 503 })
  }

  const { prompt, titolo } = await req.json()
  if (!prompt) return NextResponse.json({ error: 'Prompt mancante' }, { status: 400 })

  const systemPrompt = `Sei un esperto di vino italiano e scrittore di contenuti per cantine.app.
Scrivi articoli informativi e coinvolgenti sul vino italiano, cantine, degustazioni e territorio.
Usa un tono elegante ma accessibile. Scrivi sempre in italiano.
Restituisci SOLO l'HTML dell'articolo usando tag: h2, h3, p, ul, li, strong, em. Nessun altro markup.`

  const userPrompt = titolo
    ? `Titolo: "${titolo}"\n\nIstruzioni: ${prompt}`
    : prompt

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const html = msg.content[0].type === 'text' ? msg.content[0].text : ''
  return NextResponse.json({ html })
}
