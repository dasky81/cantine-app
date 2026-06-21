import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase'
import HeroSlideshow from '@/components/HeroSlideshow'
import SearchSection from '@/components/SearchSection'
import type { Cantina } from '@/lib/supabase'

export const metadata: Metadata = {
  title: "cantine.app — Scopri le cantine d'Italia",
  description:
    'Il motore di ricerca italiano per degustazioni, visite e scoperta del vino. Trova la cantina perfetta con la ricerca AI.',
  openGraph: {
    title: "cantine.app — Scopri le cantine d'Italia",
    description: 'Cerca per regione, vino, certificazione biologica e prenota degustazioni.',
    siteName: 'cantine.app',
    locale: 'it_IT',
    type: 'website',
  },
}

export default async function HomePage() {
  let initialCantine: Cantina[] = []

  try {
    const supabase = await createServerClient()
    const { data } = await supabase
      .from('cantine')
      .select('*')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(12)
    initialCantine = (data as Cantina[]) ?? []
  } catch {
    // DB not yet seeded — show empty state
  }

  return (
    <main className="flex flex-col min-h-screen">
      <HeroSlideshow />
      <SearchSection initialCantine={initialCantine} />
      <footer className="bg-[#722F37] text-white/60 text-sm py-6 text-center">
        <p className="font-medium text-white/80">
          cantine.app · parte della rete{' '}
          <span className="text-[#C9A84C] font-semibold">viaggi.app</span>
        </p>
        <p className="mt-2 space-x-3">
          <a href="https://agriturismi.app" className="hover:text-white transition-colors">agriturismi.app</a>
          <span>·</span>
          <a href="https://crociera.app" className="hover:text-white transition-colors">crociera.app</a>
          <span>·</span>
          <a href="https://bnb.london" className="hover:text-white transition-colors">bnb.london</a>
          <span>·</span>
          <a href="https://green.camp" className="hover:text-white transition-colors">green.camp</a>
        </p>
      </footer>
    </main>
  )
}
