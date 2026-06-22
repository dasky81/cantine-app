'use client'

import { Suspense, useState, useEffect } from 'react'
import { Wine, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useSearchParams } from 'next/navigation'

function RivendicaContent() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [messaggio, setMessaggio] = useState('')
  const [cantinaId, setCantinaId] = useState('')
  const [cantine, setCantine] = useState<{ id: string; nome: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    supabase.from('cantine').select('id, nome').order('nome').then(({ data }) => {
      setCantine(data ?? [])
    })
    const preselect = searchParams.get('cantina')
    if (preselect) setCantinaId(preselect)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!cantinaId) { setError('Seleziona la tua cantina dall\'elenco.'); return }
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }

    const { error } = await supabase.from('rivendicazioni').insert({
      cantina_id: cantinaId,
      user_id: user.id,
      nome_referente: nome,
      email_referente: email,
      telefono,
      messaggio,
    })

    if (error) setError('Errore durante l\'invio. Riprova.')
    else setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-[#722F37] flex items-center justify-center">
          <Wine className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rivendica la tua scheda cantina</h1>
          <p className="text-gray-500 text-sm">Sei il titolare? Prendi il controllo della tua scheda.</p>
        </div>
      </div>

      {success ? (
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
          <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Richiesta inviata!</h2>
          <p className="text-gray-500">
            Verificheremo i dati e ti contatteremo entro 48 ore all&apos;indirizzo {email}.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <p className="text-gray-600 mb-6 leading-relaxed">
            Se sei il proprietario o il responsabile marketing di una cantina, puoi richiedere la gestione della scheda.
            Potrai aggiornare le informazioni, aggiungere foto e rispondere alle recensioni.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Cantina *</label>
              <select
                value={cantinaId}
                onChange={e => setCantinaId(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#722F37]/30 focus:border-[#722F37]"
              >
                <option value="">Seleziona la tua cantina...</option>
                {cantine.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome e Cognome *</label>
                <input type="text" value={nome} onChange={e => setNome(e.target.value)} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#722F37]/30 focus:border-[#722F37]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefono</label>
                <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#722F37]/30 focus:border-[#722F37]" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="La tua email aziendale"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#722F37]/30 focus:border-[#722F37]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Messaggio</label>
              <textarea value={messaggio} onChange={e => setMessaggio(e.target.value)} rows={4}
                placeholder="Presentati brevemente e spiega il tuo ruolo in cantina..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#722F37]/30 focus:border-[#722F37] resize-none" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#722F37] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#5a1f25] transition-colors disabled:opacity-60">
              {loading ? 'Invio in corso...' : 'Invia richiesta'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default function RivendicaSchedaPage() {
  return (
    <main className="bg-[#FAF7F2] min-h-screen py-16 px-4">
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-gray-400">Caricamento...</div>}>
        <RivendicaContent />
      </Suspense>
    </main>
  )
}
