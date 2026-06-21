import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const { cantina_id } = await req.json()
  if (!cantina_id) return NextResponse.json({ error: 'cantina_id mancante' }, { status: 400 })

  const { error } = await supabase.from('preferiti').insert({ user_id: user.id, cantina_id })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const { cantina_id } = await req.json()
  if (!cantina_id) return NextResponse.json({ error: 'cantina_id mancante' }, { status: 400 })

  const { error } = await supabase.from('preferiti').delete()
    .eq('user_id', user.id).eq('cantina_id', cantina_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
