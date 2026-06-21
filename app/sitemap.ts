import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase-admin'

const BASE = 'https://cantine.app'

const REGIONI = ['toscana', 'piemonte', 'veneto', 'sicilia', 'puglia', 'campania', 'lombardia',
  'trentino-alto-adige', 'friuli-venezia-giulia', 'sardegna', 'umbria', 'marche', 'abruzzo',
  'lazio', 'emilia-romagna', 'calabria', 'basilicata', 'liguria', 'molise', 'valle-daosta']

const VINI = ['brunello-di-montalcino', 'barolo', 'chianti-classico', 'amarone', 'prosecco',
  'nero-davola', 'primitivo', 'vermentino', 'montepulciano', 'franciacorta']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient()

  const [{ data: cantine }, { data: post }] = await Promise.all([
    supabase.from('cantine').select('slug, updated_at'),
    supabase.from('post').select('slug, published_at').eq('published', true),
  ])

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/cantine`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/mappa`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/per-gestori`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },

    ...REGIONI.map(r => ({
      url: `${BASE}/regioni/${r}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),

    ...VINI.map(v => ({
      url: `${BASE}/vini/${v}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),

    ...(cantine ?? []).map(c => ({
      url: `${BASE}/cantine/${c.slug}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),

    ...(post ?? []).map(p => ({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: p.published_at ? new Date(p.published_at) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}
