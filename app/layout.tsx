import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import PageTracker from '@/components/PageTracker'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: "cantine.app — Il motore di ricerca delle cantine italiane",
  description: "Scopri le migliori cantine d'Italia. Cerca per regione, vino, certificazione biologica e prenota degustazioni.",
  icons: { icon: '/icon.svg' },
  openGraph: {
    siteName: 'cantine.app',
    locale: 'it_IT',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Navbar />
        <PageTracker />
        {children}
      </body>
    </html>
  )
}
