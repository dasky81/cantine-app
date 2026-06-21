import { NextRequest, NextResponse } from 'next/server'
import { parseRicercaAI } from '@/lib/claude'
import { createServerClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const query: string = body?.query?.trim()

    if (!query) {
      return NextResponse.json({ error: 'Query mancante' }, { status: 400 })
    }

    const filtri = await parseRicercaAI(query)
    const supabase = await createServerClient()

    let dbQuery = supabase.from('cantine').select('*')

    if (filtri.regione) {
      dbQuery = dbQuery.ilike('regione', `%${filtri.regione}%`)
    }
    if (filtri.vini.length > 0) {
      dbQuery = dbQuery.overlaps('vini_prodotti', filtri.vini)
    }
    if (filtri.certificazioni.length > 0) {
      dbQuery = dbQuery.overlaps('certificazioni', filtri.certificazioni)
    }
    if (filtri.servizi.length > 0) {
      dbQuery = dbQuery.overlaps('servizi', filtri.servizi)
    }

    const { data: cantine, error } = await dbQuery.limit(20)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log search fire-and-forget (no RLS policy needed for anon yet)
    supabase
      .from('ricerche_log')
      .insert({ query, risultati_ids: (cantine ?? []).map((c) => c.id) })
      .then(() => {})

    return NextResponse.json({ cantine: cantine ?? [], filtri })
  } catch (err) {
    console.error('[POST /api/cerca]', err)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
