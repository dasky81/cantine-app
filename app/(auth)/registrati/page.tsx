'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Wine, Building2, User } from 'lucide-react'
import { createClient } from '@/lib/supabase'

type Ruolo = 'user' | 'cantina_owner'

export default function RegistratiPage() {
  const [nome, setNome] = useState('')
  const [cognome, setCognome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [ruolo, setRuolo] = useState<Ruolo>('user')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setError('La password deve avere almeno 8 caratteri.')
      return
    }
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome, cognome, role: ruolo },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      setError(error.message.includes('already registered')
        ? 'Questa email è già registrata.'
        : 'Errore durante la registrazione. Riprova.')
    } else if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        nome,
        cognome,
        role: ruolo,
      })
      setSuccess(true)
      setTimeout(() => router.push('/benvenuto'), 2000)
    }
    setLoading(false)
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2">
          <Wine className="w-7 h-7 text-[#722F37]" />
          <span className="font-bold text-2xl text-[#722F37]">cantine</span>
          <span className="font-bold text-2xl text-[#C9A84C]">.app</span>
        </Link>
        <p className="text-sm text-gray-400 mt-1">by viaggi.app</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Crea il tuo account</h1>

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
            Registrazione completata! Controlla la tua email per confermare l&apos;account.
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Ruolo selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {([
            { value: 'user', label: 'Degustatore', desc: 'Scopri e salva le cantine', Icon: User },
            { value: 'cantina_owner', label: 'Titolare cantina', desc: 'Gestisci la tua cantina', Icon: Building2 },
          ] as const).map(({ value, label, desc, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setRuolo(value)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                ruolo === value
                  ? 'border-[#722F37] bg-[#722F37]/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1.5 ${ruolo === value ? 'text-[#722F37]' : 'text-gray-400'}`} />
              <p className={`text-sm font-medium ${ruolo === value ? 'text-[#722F37]' : 'text-gray-700'}`}>{label}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-tight">{desc}</p>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-5"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Registrati con Google
        </button>

        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
          <div className="relative text-center"><span className="bg-white px-3 text-xs text-gray-400">oppure con email</span></div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome</label>
              <input type="text" value={nome} onChange={e => setNome(e.target.value)} required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#722F37]/30 focus:border-[#722F37]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Cognome</label>
              <input type="text" value={cognome} onChange={e => setCognome(e.target.value)} required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#722F37]/30 focus:border-[#722F37]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="nome@esempio.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#722F37]/30 focus:border-[#722F37]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="Minimo 8 caratteri"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#722F37]/30 focus:border-[#722F37]" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-[#722F37] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#5a1f25] transition-colors disabled:opacity-60">
            {loading ? 'Registrazione...' : 'Crea account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Hai già un account?{' '}
          <Link href="/login" className="text-[#722F37] font-medium hover:underline">Accedi</Link>
        </p>
      </div>
    </div>
  )
}
