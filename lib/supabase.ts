import { createBrowserClient, createServerClient as createSSRServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export interface Cantina {
  id: string
  slug: string
  nome: string
  descrizione: string | null
  descrizione_breve: string | null
  regione: string
  provincia: string | null
  comune: string | null
  indirizzo: string | null
  lat: number | null
  lng: number | null
  telefono: string | null
  email: string | null
  sito_web: string | null
  instagram: string | null
  orari_apertura: string | null
  prezzo_degustazione: string | null
  vini_prodotti: string[] | null
  denominazioni: string[] | null
  ettari_vigneto: number | null
  bottiglie_anno: number | null
  certificazioni: string[] | null
  lingua_visita: string[] | null
  servizi: string[] | null
  foto_principale: string | null
  foto_galleria: string[] | null
  verified: boolean
  featured: boolean
  owner_id: string | null
  created_at: string
  updated_at: string
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function createServerClient() {
  const cookieStore = await cookies()
  return createSSRServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
