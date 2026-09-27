import { createServerClient as createSSRServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import 'server-only'
import { supabasePublishableKey, supabaseUrl } from '@/lib/supabase-config'
import type { Database } from '@/lib/database.types'

export async function createServerClient() {
  const cookieStore = await cookies()
  return createSSRServerClient<Database>(
    supabaseUrl,
    supabasePublishableKey,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) }
          catch {}
        },
      },
    }
  )
}
