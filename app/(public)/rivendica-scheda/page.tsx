export const dynamic = 'force-dynamic'
'use client'

import { useState, useEffect, Suspense } from 'react'
import { Wine, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useSearchParams } from 'next/navigation'
import type { Cantina } from '@/lib/supabase'

function RivendicaContent() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [messaggio, setMessaggio] = useState('')
  const [cantinaId, setCantinaId] = useState('')
  const [cantine, setCantine] = useState<Cantina[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const id = searchParams.get('cantina')
    if (id) setCantinaId(id)
    supabase.from('cantine').select('id, nome, regione').order('nome')
      .then(({ data }) => { if (data) setCantine(data as Cantina[]) })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Devi essere registrato per rivendicare una scheda.'); setLoading(false); return }
    const { error: err } = await supabase.from('rivendicazioni').insert({
      cantina_id: cantinaId, user_id: user.id,
      nome_referente: nome, email_referente: email,
      telefono, messaggio
    })
    if (err) { setError('Errore durante l\'invio. Riprova.'); setLoading(false); return }
    setSuccess(true)
    setLoading(false)
  }

  if (success) return (
    <div className="text-center py-12">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Richiesta inviata!</h2>
      <p className="text-gray-600">Ti contatteremo entro 48 ore per verificare la tua identità.</p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Cantina</label>
        <select value={cantinaId} onChange={e => setCantinaId(e.target.value)} required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#722F37]">
          <option value="">Seleziona la tua cantina</option>
          {cantine.map(c => <option key={c.id} value={c.id}>{c.nome} — {c.regione}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome e cognome</label>
        <input value={nome} onChange={e => setNome(e.target.value)} required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#722F37]" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#722F37]" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
        <input value={telefono} onChange={e => setTelefono(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#722F37]" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Messaggio</label>
        <textarea value={messaggio} onChange={e => setMessaggio(e.target.value)} rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#722F37]" />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button type="submit" disabled={loading}
        className="w-full bg-[#722F37] text-white py-3 rounded-lg font-medium hover:bg-[#5a252c] transition-colors disabled:opacity-50">
        {loading ? 'Invio in corso...' : 'Invia richiesta'}
      </button>
    </form>
  )
}

export default function RivendicaSchedaPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <Wine className="w-12 h-12 text-[#722F37] mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Rivendica la tua scheda</h1>
        <p className="text-gray-600">Sei il titolare di una cantina? Prendi il controllo della tua scheda su cantine.app.</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <Suspense fallback={<div className="text-center py-8 text-gray-500">Caricamento...</div>}>
          <RivendicaContent />
        </Suspense>
      </div>
    </div>
  )
}

