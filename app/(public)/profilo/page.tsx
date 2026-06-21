'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Heart, Wine, Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import CantineCard from '@/components/CantineCard'
import type { Cantina } from '@/lib/supabase'

interface Profile {
  nome: string | null
  cognome: string | null
  email: string | null
  role: string
  avatar_url: string | null
  created_at: string
}

export default function ProfiloPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [preferiti, setPreferiti] = useState<Cantina[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: prof } = await supabase
        .from('profiles')
        .select('nome, cognome, email, role, avatar_url, created_at')
        .eq('id', user.id)
        .single()
      if (prof) setProfile(prof as Profile)

      const { data: favs } = await supabase
        .from('preferiti')
        .select('cantine(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (favs) {
        setPreferiti(favs.map((f: { cantine: unknown }) => f.cantine as Cantina).filter(Boolean))
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="bg-[#FAF7F2] min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Caricamento...</div>
      </div>
    )
  }

  const nomeCognome = [profile?.nome, profile?.cognome].filter(Boolean).join(' ') || profile?.email || 'Utente'
  const roleLabel: Record<string, string> = {
    user: 'Visitatore',
    cantina_owner: 'Titolare cantina',
    admin: 'Amministratore',
  }

  return (
    <main className="bg-[#FAF7F2] min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header profilo */}
        <div className="bg-white rounded-2xl p-6 shadow-sm flex items-start gap-5">
          <div className="w-16 h-16 rounded-full bg-[#722F37] flex items-center justify-center text-white text-xl font-bold shrink-0 overflow-hidden">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              nomeCognome.slice(0, 2).toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{nomeCognome}</h1>
            <p className="text-gray-500 text-sm">{profile?.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-xs px-2.5 py-1 bg-[#722F37]/10 text-[#722F37] rounded-full flex items-center gap-1.5">
                {profile?.role === 'cantina_owner' ? <Building2 className="w-3 h-3" /> : <User className="w-3 h-3" />}
                {roleLabel[profile?.role ?? 'user'] ?? profile?.role}
              </span>
              {profile?.role === 'admin' && (
                <Link href="/admin"
                  className="text-xs px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full hover:bg-amber-200 transition-colors">
                  → Pannello admin
                </Link>
              )}
            </div>
          </div>
          <button onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-[#722F37] transition-colors">
            Esci
          </button>
        </div>

        {/* Preferiti */}
        <section id="preferiti">
          <div className="flex items-center gap-2 mb-5">
            <Heart className="w-5 h-5 text-[#722F37]" />
            <h2 className="text-lg font-bold text-gray-900">I miei preferiti</h2>
            <span className="text-sm text-gray-400">({preferiti.length})</span>
          </div>

          {preferiti.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
              <Wine className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">Nessuna cantina nei preferiti ancora</p>
              <Link href="/cantine" className="mt-4 inline-block text-sm text-[#722F37] hover:underline">
                Esplora le cantine →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {preferiti.map(c => <CantineCard key={c.id} cantina={c} />)}
            </div>
          )}
        </section>

        {profile?.role === 'cantina_owner' && (
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Gestisci la tua cantina</h2>
            <p className="text-gray-500 text-sm mb-4">
              Se hai già inviato una richiesta di rivendicazione, il nostro team la verificherà entro 48 ore.
            </p>
            <Link href="/rivendica-scheda"
              className="inline-flex items-center gap-2 bg-[#722F37] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#5a1f25] transition-colors">
              <Building2 className="w-4 h-4" /> Rivendica la tua scheda
            </Link>
          </section>
        )}
      </div>
    </main>
  )
}
