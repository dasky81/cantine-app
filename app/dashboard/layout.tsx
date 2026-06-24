import Link from 'next/link'
import { Wine, Store, Edit, BarChart2, ArrowLeft } from 'lucide-react'
import { createServerClient } from '@/lib/supabase-server'

const LINKS = [
  { href: '/dashboard/cantina', label: 'La mia cantina', Icon: Store },
  { href: '/dashboard/cantina/modifica', label: 'Modifica scheda', Icon: Edit },
  { href: '/dashboard/statistiche', label: 'Statistiche visite', Icon: BarChart2 },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  let nomeUtente = 'Titolare'
  if (user) {
    const { data: prof } = await supabase
      .from('profiles')
      .select('nome, cognome')
      .eq('id', user.id)
      .single()
    nomeUtente = [prof?.nome, prof?.cognome].filter(Boolean).join(' ') || user.email?.split('@')[0] || 'Titolare'
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 bg-[#722F37] text-white flex flex-col shrink-0">
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <Wine className="w-5 h-5 text-[#C9A84C]" />
            <span className="font-bold text-sm">cantine.app</span>
          </Link>
          <p className="text-white/50 text-xs mt-1">Area Titolare</p>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-0.5">
          {LINKS.map(({ href, label, Icon }) => (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-3">
          {/* Nome utente + badge */}
          <div className="px-1">
            <p className="text-white/90 text-sm font-medium truncate">{nomeUtente}</p>
            <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-white/15 text-white/80 rounded-full">
              Titolare cantina
            </span>
          </div>
          <Link href="/" className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="w-3 h-3" /> Torna al sito
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
