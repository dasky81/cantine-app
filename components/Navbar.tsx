'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Wine, ChevronDown, User, Heart, LogOut, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface Profile {
  role: string
  nome: string | null
  avatar_url: string | null
}

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/cantine', label: 'Cantine' },
  { href: '/mappa', label: 'Mappa' },
  { href: '/blog', label: 'Blog' },
]

const AUTH_ROUTES = ['/login', '/registrati', '/benvenuto']

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('role, nome, avatar_url')
          .eq('id', user.id)
          .single()
        if (data) setProfile(data as Profile)
      }
    }
    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) setProfile(null)
      else loadUser()
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  if (AUTH_ROUTES.some(r => pathname.startsWith(r))) return null

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const initials = profile?.nome
    ? profile.nome.slice(0, 2).toUpperCase()
    : (user?.email?.slice(0, 2).toUpperCase() ?? 'U')

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Wine className="w-6 h-6 text-[#722F37]" />
          <div className="leading-none">
            <span className="font-bold text-[#722F37] text-lg">cantine</span>
            <span className="font-bold text-[#C9A84C] text-lg">.app</span>
            <span className="hidden sm:inline text-[#C9A84C] text-xs ml-1.5">by viaggi.app</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors ${
                isActive(href) ? 'text-[#722F37]' : 'text-gray-600 hover:text-[#722F37]'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 rounded-full border border-gray-200 px-2 py-1 hover:border-[#722F37] transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-[#722F37] flex items-center justify-center text-white text-xs font-semibold overflow-hidden">
                  {profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : initials}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  <Link href="/profilo" onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                    <User className="w-4 h-4" /> Profilo
                  </Link>
                  <Link href="/profilo#preferiti" onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                    <Heart className="w-4 h-4" /> I miei preferiti
                  </Link>
                  {profile?.role === 'admin' && (
                    <Link href="/admin" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#722F37] font-medium hover:bg-red-50">
                      <Settings className="w-4 h-4" /> Pannello admin
                    </Link>
                  )}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <LogOut className="w-4 h-4" /> Esci
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login"
                className="text-sm font-medium text-gray-600 hover:text-[#722F37] px-3 py-1.5 transition-colors">
                Accedi
              </Link>
              <Link href="/registrati"
                className="text-sm font-medium bg-[#722F37] text-white px-4 py-2 rounded-full hover:bg-[#5a1f25] transition-colors">
                Registrati
              </Link>
            </div>
          )}

          <button
            className="md:hidden p-1.5 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href}
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                isActive(href) ? 'bg-[#722F37]/10 text-[#722F37]' : 'text-gray-700 hover:bg-gray-50'
              }`}>
              {label}
            </Link>
          ))}
          {!user && (
            <div className="pt-2 border-t border-gray-100 flex gap-2">
              <Link href="/login" className="flex-1 text-center py-2 text-sm font-medium border border-gray-200 rounded-lg text-gray-700">
                Accedi
              </Link>
              <Link href="/registrati" className="flex-1 text-center py-2 text-sm font-medium bg-[#722F37] text-white rounded-lg">
                Registrati
              </Link>
            </div>
          )}
          {user && (
            <div className="pt-2 border-t border-gray-100 space-y-1">
              <Link href="/profilo" className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Profilo</Link>
              {profile?.role === 'admin' && (
                <Link href="/admin" className="block px-3 py-2 rounded-lg text-sm text-[#722F37] font-medium hover:bg-red-50">Admin</Link>
              )}
              <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                Esci
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
