'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Store, ClipboardCheck, FileText, Users } from 'lucide-react'

const LINKS = [
  { href: '/admin', label: 'Panoramica', Icon: LayoutDashboard, exact: true },
  { href: '/admin/cantine', label: 'Cantine', Icon: Store, exact: false },
  { href: '/admin/rivendicazioni', label: 'Rivendicazioni', Icon: ClipboardCheck, exact: false },
  { href: '/admin/blog', label: 'Blog', Icon: FileText, exact: false },
  { href: '/admin/utenti', label: 'Utenti', Icon: Users, exact: false },
]

export default function AdminNav() {
  const pathname = usePathname()
  return (
    <nav className="flex-1 py-4 px-2 space-y-0.5">
      {LINKS.map(({ href, label, Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link key={href} href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              active
                ? 'bg-white/15 text-white font-semibold'
                : 'text-white/65 hover:text-white hover:bg-white/10'
            }`}>
            <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#C9A84C]' : ''}`} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
