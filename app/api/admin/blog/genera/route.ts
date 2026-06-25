import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })

  const { titolo } = await req.json()
  const client = new Anthropic()
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Scrivi un articolo di blog sul vino italiano con titolo: "${titolo}".
      Formato HTML con tag h2, p, strong, ul/li. Circa 800 parole.
      Stile giornalistico, appassionato, rivolto agli amanti del vino.
      Inizia direttamente con il testo, senza markdown, senza \`\`\`html.
      Include: introduzione, 3 sezioni con h2, lista curiosità, conclusione.`
    }]
  })
  const contenuto = msg.content[0].type === 'text' ? msg.content[0].text : ''
  return NextResponse.json({ contenuto })
}
