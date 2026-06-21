import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays, ArrowLeft, Tag } from 'lucide-react'
import { createServerClient } from '@/lib/supabase-server'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createServerClient()
  const { data } = await supabase.from('post').select('titolo, excerpt, cover_url').eq('slug', slug).single()
  if (!data) return {}
  return {
    title: `${data.titolo} — cantine.app Blog`,
    description: data.excerpt ?? '',
    openGraph: {
      title: data.titolo,
      description: data.excerpt ?? '',
      images: data.cover_url ? [data.cover_url] : [],
      type: 'article',
    },
  }
}

export default async function ArticoloPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createServerClient()
  const { data: post } = await supabase
    .from('post')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!post) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.titolo,
    description: post.excerpt ?? '',
    image: post.cover_url ?? undefined,
    datePublished: post.published_at ?? undefined,
    publisher: { '@type': 'Organization', name: 'cantine.app', url: 'https://cantine.app' },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="bg-[#FAF7F2] min-h-screen">
        {post.cover_url && (
          <div className="relative h-72 md:h-96 w-full">
            <Image src={post.cover_url} alt={post.titolo} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}

        <div className="max-w-3xl mx-auto px-4 py-10">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#722F37] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Torna al blog
          </Link>

          {post.tag && post.tag.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tag.map((t: string) => (
                <span key={t} className="text-xs px-2.5 py-1 bg-[#722F37]/10 text-[#722F37] rounded-full flex items-center gap-1">
                  <Tag className="w-2.5 h-2.5" />{t}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">{post.titolo}</h1>

          {post.published_at && (
            <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-8 pb-8 border-b border-gray-200">
              <CalendarDays className="w-4 h-4" />
              {format(new Date(post.published_at), "d MMMM yyyy", { locale: it })}
            </div>
          )}

          <article
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-[#722F37] prose-strong:text-gray-900"
            dangerouslySetInnerHTML={{ __html: post.contenuto ?? '' }}
          />
        </div>
      </main>
    </>
  )
}
