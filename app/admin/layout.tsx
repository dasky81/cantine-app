'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Store, ClipboardCheck, FileText, Users } from 'lucide-react'

const LINKS = [
  { href: '/admin', label: 'Panoramica', Icon: LayoutDashboard, exact: true },
  { href: '/admin/cantine', label: 'Cantine', Icon: Store },
  { href: '/admin/rivendicazioni', label: 'Rivendicazioni', Icon: ClipboardCheck },
  { href: '/admin/blog', label: 'Blog', Icon: FileText },
  { href: '/admin/utenti', label: 'Utenti', Icon: Users },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-[#722F37] text-white flex flex-col shrink-0 fixed inset-y-0 left-0 z-20">
        {/* Logo */}
        <div className="px-5 pt-6 pb-5">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-white/50 mb-1">
            Admin Panel
          </p>
          <p className="text-base font-bold text-white">cantine.app</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {LINKS.map(({ href, label, Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-white/15 text-white font-medium'
                    : 'text-white/60 hover:text-white/90 hover:bg-white/10'
                }`}>
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-5 border-t border-white/10">
          <Link href="/" className="text-xs text-white/40 hover:text-white/80 transition-colors">
            ← Torna al sito
          </Link>
        </div>
      </aside>

      {/* Contenuto principale */}
      <main className="flex-1 ml-56 bg-gray-50 overflow-auto min-h-screen">
        {children}
      </main>
    </div>
  )
}
