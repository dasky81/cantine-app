import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase'
import HeroSlideshow from '@/components/HeroSlideshow'
import SearchSection from '@/components/SearchSection'
import Footer from '@/components/Footer'
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
      <Footer />
    </main>
  )
}
