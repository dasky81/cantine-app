import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { data: cantina } = await supabase
    .from('cantine')
    .select('slug, regione')
    .eq('owner_id', user.id)
    .single()

  if (!cantina) return NextResponse.json({ error: 'Nessuna cantina associata' }, { status: 404 })

  const path = `/cantine/${cantina.slug}`
  const unMeseAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [{ count: totali }, { count: ultimoMese }] = await Promise.all([
    supabase.from('visite_log').select('*', { count: 'exact', head: true }).eq('path', path),
    supabase.from('visite_log').select('*', { count: 'exact', head: true })
      .eq('path', path).gte('created_at', unMeseAgo),
  ])

  // Posizione nella regione: quante cantine della stessa regione hanno più visite
  const { data: cantineRegione } = await supabase
    .from('cantine')
    .select('slug')
    .eq('regione', cantina.regione)

  let posizioneRegione = 0
  if (cantineRegione && cantineRegione.length > 1) {
    const counts = await Promise.all(
      cantineRegione.map(c =>
        supabase.from('visite_log').select('*', { count: 'exact', head: true }).eq('path', `/cantine/${c.slug}`)
      )
    )
    const ranked = cantineRegione
      .map((c, i) => ({ slug: c.slug, count: counts[i].count ?? 0 }))
      .sort((a, b) => b.count - a.count)
    posizioneRegione = ranked.findIndex(c => c.slug === cantina.slug) + 1
  }

  return NextResponse.json({
    totali: totali ?? 0,
    ultimoMese: ultimoMese ?? 0,
    posizioneRegione,
  })
}
