import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'

async function requireAdmin() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin' ? user : null
}

// POST — inserisce nuovo post
export async function POST(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const body = await req.json()
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('post')
    .insert({ ...body, autore_id: user.id })
    .select()
    .single()

  if (error) {
    console.error('[api/admin/blog] POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}

// PATCH — aggiorna post esistente (save completo o toggle published)
export async function PATCH(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { id, ...fields } = await req.json()
  if (!id) return NextResponse.json({ error: 'id mancante' }, { status: 400 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('post')
    .update(fields)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[api/admin/blog] PATCH error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

// DELETE — elimina post
export async function DELETE(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id mancante' }, { status: 400 })

  const admin = createAdminClient()
  const { error } = await admin.from('post').delete().eq('id', id)

  if (error) {
    console.error('[api/admin/blog] DELETE error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return new NextResponse(null, { status: 204 })
}
