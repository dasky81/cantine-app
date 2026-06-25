import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'

const anthropic = new Anthropic()

export async function POST(req: NextRequest) {
  // Verifica sessione
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  // Verifica ruolo admin tramite service_role (bypassa RLS su profiles)
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
  }

  const { titolo } = await req.json()
  if (!titolo?.trim()) {
    return NextResponse.json({ error: 'Titolo mancante' }, { status: 400 })
  }

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2500,
    system: `Sei un giornalista enogastronomico esperto che scrive per cantine.app,
il magazine digitale sul vino italiano. Il tuo stile è elegante ma accessibile,
coinvolgente, ricco di dettagli sensoriali e culturali. Scrivi sempre in italiano.

Restituisci SOLO l'HTML dell'articolo con questi tag: h2, h3, p, ul, li, strong, em.
Non includere il tag h1 (il titolo è già nel template), nessun div, nessun commento HTML.`,
    messages: [{
      role: 'user',
      content: `Scrivi un articolo blog completo sul tema: "${titolo}"

Struttura richiesta:
- Paragrafo introduttivo evocativo (2-3 frasi che catturano il lettore)
- 3-4 sezioni con tag <h2>, ognuna con 2-3 paragrafi di testo
- Una lista <ul> con almeno 4 punti pratici o curiosità
- Paragrafo conclusivo

Requisiti:
- Circa 800 parole totali
- Tono giornalistico, non pubblicitario
- Riferimenti concreti al territorio, ai vitigni, alle tradizioni italiane
- Usa <strong> per enfatizzare termini tecnici del vino la prima volta che compaiono`,
    }],
  })

  const html = msg.content[0].type === 'text' ? msg.content[0].text : ''
  return NextResponse.json({ html })
}
