import Link from 'next/link'
import { Wine, Store, Edit, BarChart2, MessageSquare } from 'lucide-react'

const LINKS = [
  { href: '/dashboard/cantina', label: 'La mia cantina', Icon: Store },
  { href: '/dashboard/cantina/modifica', label: 'Modifica scheda', Icon: Edit },
  { href: '/dashboard/statistiche', label: 'Statistiche visite', Icon: BarChart2 },
  { href: '/rivendica-scheda', label: 'Richieste ricevute', Icon: MessageSquare },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
        <div className="p-4 border-t border-white/10">
          <Link href="/profilo" className="text-xs text-white/50 hover:text-white transition-colors">
            ← Il mio profilo
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
