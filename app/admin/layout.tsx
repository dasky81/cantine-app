import Link from 'next/link'
import { Wine } from 'lucide-react'
import { createServerClient } from '@/lib/supabase-server'
import AdminNav from '@/components/AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles').select('nome, cognome').eq('id', user?.id ?? '').maybeSingle()

  const initials = profile?.nome && profile?.cognome
    ? `${profile.nome[0]}${profile.cognome[0]}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? 'A'

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar fissa */}
      <aside className="w-56 bg-[#722F37] text-white flex flex-col shrink-0 fixed inset-y-0 left-0 z-20">
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <Wine className="w-5 h-5 text-[#C9A84C]" />
            <span className="font-bold text-sm tracking-wide">cantine.app</span>
          </Link>
          <span className="inline-block mt-2 text-[10px] font-bold tracking-widest uppercase text-[#C9A84C]/80 bg-[#C9A84C]/10 px-2 py-0.5 rounded">
            Admin Panel
          </span>
        </div>

        <AdminNav />

        <div className="p-4 border-t border-white/10">
          <Link href="/" className="text-xs text-white/50 hover:text-white/90 transition-colors">
            ← Torna al sito
          </Link>
        </div>
      </aside>

      {/* Area principale */}
      <div className="flex-1 ml-56 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 h-14 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="font-semibold tracking-widest uppercase">Admin Panel</span>
            <span className="text-gray-300">·</span>
            <span>cantine.app</span>
          </div>
          <div
            title={user?.email}
            className="w-8 h-8 rounded-full bg-[#722F37] text-white text-xs font-bold flex items-center justify-center select-none"
          >
            {initials}
          </div>
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
