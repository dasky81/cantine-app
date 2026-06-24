import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays, Tag } from 'lucide-react'
import { createServerClient } from '@/lib/supabase-server'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

export const metadata: Metadata = {
  title: 'Blog sul vino — cantine.app',
  description: 'Articoli, guide e approfondimenti sul vino italiano, cantine, degustazioni e territorio.',
}

export default async function BlogPage() {
  const supabase = await createServerClient()
  const { data: post } = await supabase
    .from('post')
    .select('slug, titolo, excerpt, cover_url, published_at, tag')
    .eq('published', true)
    .order('published_at', { ascending: false })

  return (
    <main className="bg-[#FAF7F2] min-h-screen">
      <div className="bg-[#722F37] text-white py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Blog sul vino</h1>
          <p className="text-white/70 text-lg">Guide, storie e approfondimenti sul vino italiano e le cantine</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {(post ?? []).length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">Nessun articolo ancora pubblicato</p>
            <p className="text-sm mt-1">Torna presto per leggere le nostre guide sul vino italiano.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(post ?? []).filter(p => !!p.slug).map(p => (
              <Link key={p.slug} href={`/blog/${p.slug}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-52 bg-[#722F37]/10">
                  {p.cover_url ? (
                    <Image src={p.cover_url} alt={p.titolo} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#722F37] to-[#5a1f25] flex items-center justify-center">
                      <span className="text-[#C9A84C] text-4xl">🍷</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  {p.tag && p.tag.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {p.tag.slice(0, 3).map((t: string) => (
                        <span key={t} className="text-xs px-2 py-0.5 bg-[#722F37]/10 text-[#722F37] rounded-full flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5" />{t}
                        </span>
                      ))}
                    </div>
                  )}
                  <h2 className="font-bold text-gray-900 text-lg leading-snug mb-2 group-hover:text-[#722F37] transition-colors line-clamp-2">
                    {p.titolo}
                  </h2>
                  {p.excerpt && (
                    <p className="text-gray-500 text-sm line-clamp-2 mb-3">{p.excerpt}</p>
                  )}
                  {p.published_at && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {format(new Date(p.published_at), 'd MMMM yyyy', { locale: it })}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
