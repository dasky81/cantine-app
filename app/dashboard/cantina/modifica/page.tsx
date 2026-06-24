'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Upload, X } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { Cantina } from '@/lib/supabase'

const CERT_OPTIONS = ['Biologico', 'Biodinamico', 'Sostenibile']
const SERVIZI_OPTIONS = ['Degustazione', 'Vendita diretta', 'Visita guidata', 'Ristorante', 'Pernottamento', 'Enoteca', 'Agriturismo']
const LINGUA_OPTIONS = ['Italiano', 'Inglese', 'Francese', 'Tedesco', 'Spagnolo', 'Cinese']

type EditableFields = Pick<Cantina,
  'descrizione' | 'descrizione_breve' | 'orari_apertura' | 'prezzo_degustazione' |
  'telefono' | 'email' | 'sito_web' | 'instagram' |
  'servizi' | 'lingua_visita' | 'certificazioni' | 'foto_principale'
>

export default function ModificaCantinaPage() {
  const [cantina, setCantina] = useState<Cantina | null>(null)
  const [form, setForm] = useState<Partial<EditableFields>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('cantine').select('*').eq('owner_id', user.id).single()
      if (!data) { setLoading(false); return }
      const c = data as Cantina
      setCantina(c)
      setForm({
        descrizione: c.descrizione,
        descrizione_breve: c.descrizione_breve,
        orari_apertura: c.orari_apertura,
        prezzo_degustazione: c.prezzo_degustazione,
        telefono: c.telefono,
        email: c.email,
        sito_web: c.sito_web,
        instagram: c.instagram,
        servizi: c.servizi ?? [],
        lingua_visita: c.lingua_visita ?? [],
        certificazioni: c.certificazioni ?? [],
        foto_principale: c.foto_principale,
      })
      setLoading(false)
    }
    load()
  }, [router, supabase])

  function set(field: keyof EditableFields, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function toggleArray(field: 'servizi' | 'lingua_visita' | 'certificazioni', opt: string) {
    const arr = (form[field] as string[]) ?? []
    set(field, arr.includes(opt) ? arr.filter(v => v !== opt) : [...arr, opt])
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !cantina) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `cantine/${cantina.slug}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('cantine-foto').upload(path, file, { upsert: true })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('cantine-foto').getPublicUrl(path)
      set('foto_principale', publicUrl)
    }
    setUploading(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!cantina) return
    setSaving(true)
    await supabase.from('cantine').update({ ...form, updated_at: new Date().toISOString() }).eq('id', cantina.id)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    setSaving(false)
  }

  if (loading) return <div className="p-8 text-gray-400">Caricamento...</div>

  if (!cantina) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Nessuna cantina associata al tuo account.</p>
      </div>
    )
  }

  const textField = (label: string, key: keyof EditableFields, type = 'text') => (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input type={type} value={(form[key] as string) ?? ''}
        onChange={e => set(key, e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#722F37]/20" />
    </div>
  )

  const checkboxGroup = (label: string, key: 'servizi' | 'lingua_visita' | 'certificazioni', options: string[]) => (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const active = ((form[key] as string[]) ?? []).includes(opt)
          return (
            <button key={opt} type="button"
              onClick={() => toggleArray(key, opt)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${active ? 'bg-[#722F37] text-white border-[#722F37]' : 'border-gray-200 text-gray-600 hover:border-[#722F37]'}`}>
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-[#722F37]">← Indietro</button>
        <h1 className="text-2xl font-bold text-gray-900">Modifica scheda</h1>
      </div>

      {/* Campi sola lettura */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-6 text-sm text-amber-700">
        <strong>Nome, regione, comune, vini e denominazioni</strong> possono essere modificati solo dall'amministratore. Contattaci per aggiornamenti.
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <section className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Descrizione</h2>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Descrizione breve</label>
            <textarea value={form.descrizione_breve ?? ''} onChange={e => set('descrizione_breve', e.target.value)} rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#722F37]/20 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Descrizione completa</label>
            <textarea value={form.descrizione ?? ''} onChange={e => set('descrizione', e.target.value)} rows={5}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#722F37]/20 resize-none" />
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Contatti</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {textField('Telefono', 'telefono', 'tel')}
            {textField('Email', 'email', 'email')}
            {textField('Sito web', 'sito_web', 'url')}
            {textField('Instagram (@handle)', 'instagram')}
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Visita</h2>
          {textField('Orari di apertura', 'orari_apertura')}
          {textField('Prezzo degustazione (es. €20–40 a persona)', 'prezzo_degustazione')}
          {checkboxGroup('Servizi offerti', 'servizi', SERVIZI_OPTIONS)}
          {checkboxGroup('Lingue visita', 'lingua_visita', LINGUA_OPTIONS)}
          {checkboxGroup('Certificazioni', 'certificazioni', CERT_OPTIONS)}
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Foto principale</h2>
          {form.foto_principale && (
            <div className="relative w-full max-w-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.foto_principale} alt="" className="w-full h-44 object-cover rounded-xl" />
              <button type="button" onClick={() => set('foto_principale', null)}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:text-red-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <input type="url" value={form.foto_principale ?? ''} onChange={e => set('foto_principale', e.target.value)}
              placeholder="https://..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#722F37]/20" />
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="self-start flex items-center gap-2 border border-gray-200 text-sm px-4 py-2 rounded-xl hover:bg-gray-50 disabled:opacity-60 transition-colors">
              <Upload className="w-4 h-4" />
              {uploading ? 'Caricamento...' : 'Carica da file'}
            </button>
          </div>
        </section>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-[#722F37] text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-[#5a1f25] transition-colors disabled:opacity-60">
            <Save className="w-4 h-4" />
            {saving ? 'Salvataggio...' : 'Salva modifiche'}
          </button>
          {saved && <span className="text-sm text-green-600 font-medium">✓ Salvato!</span>}
        </div>
      </form>
    </div>
  )
}
