'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { Cantina } from '@/lib/supabase'

const CERT_OPTIONS = ['Biologico', 'Biodinamico', 'Sostenibile']
const SERVIZI_OPTIONS = ['Degustazione', 'Vendita diretta', 'Visita guidata', 'Ristorante', 'Pernottamento', 'Enoteca', 'Agriturismo']
const LINGUA_OPTIONS = ['Italiano', 'Inglese', 'Francese', 'Tedesco', 'Spagnolo', 'Cinese']
const REGIONI = ['Toscana', 'Piemonte', 'Veneto', 'Sicilia', 'Puglia', 'Campania', 'Lombardia',
  'Trentino-Alto Adige', 'Friuli-Venezia Giulia', 'Sardegna', 'Umbria', 'Marche', 'Abruzzo',
  'Lazio', 'Emilia-Romagna', 'Calabria', 'Basilicata', 'Liguria', 'Molise', "Valle d'Aosta"]

const SLUG = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [input, setInput] = useState('')
  return (
    <div className="border border-gray-200 rounded-xl px-3 py-2 flex flex-wrap gap-1.5 min-h-[44px]">
      {value.map(t => (
        <span key={t} className="bg-[#722F37]/10 text-[#722F37] text-xs px-2 py-1 rounded-full flex items-center gap-1">
          {t}
          <button type="button" onClick={() => onChange(value.filter(v => v !== t))} className="hover:text-red-600">×</button>
        </span>
      ))}
      <input type="text" value={input} onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
            e.preventDefault()
            if (!value.includes(input.trim())) onChange([...value, input.trim()])
            setInput('')
          }
        }}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 min-w-24 outline-none text-sm bg-transparent" />
    </div>
  )
}

type FormState = Partial<Omit<Cantina, 'id' | 'created_at' | 'updated_at' | 'owner_id'>>

export default function NuovaCantinaPage() {
  const [form, setForm] = useState<FormState>({
    verified: false, featured: false, vini_prodotti: [], denominazioni: [],
    certificazioni: [], servizi: [], lingua_visita: [], foto_galleria: [],
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  function set(field: keyof FormState, value: unknown) {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'nome' && !prev.slug) next.slug = SLUG(value as string)
      return next
    })
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const slug = form.slug || `cantina-${Date.now()}`
    const path = `cantine/${slug}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('cantine-foto').upload(path, file, { upsert: true })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('cantine-foto').getPublicUrl(path)
      set('foto_principale', publicUrl)
    }
    setUploading(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome || !form.slug || !form.regione) {
      alert('Nome, slug e regione sono obbligatori')
      return
    }
    setSaving(true)
    const { data, error } = await supabase.from('cantine').insert({
      ...form, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }).select().single()
    if (error) { alert(`Errore: ${error.message}`); setSaving(false); return }
    router.push(`/admin/cantine/${data.id}`)
  }

  const textField = (label: string, key: keyof FormState, type = 'text', required = false) => (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}{required && ' *'}</label>
      <input type={type} value={(form[key] as string) ?? ''} required={required}
        onChange={e => set(key, type === 'number' ? Number(e.target.value) || null : e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#722F37]/20" />
    </div>
  )

  const checkboxGroup = (label: string, key: keyof FormState, options: string[]) => (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const arr = (form[key] as string[]) ?? []
          return (
            <label key={opt} className={`cursor-pointer text-xs px-3 py-1.5 rounded-full border transition-colors ${arr.includes(opt) ? 'bg-[#722F37] text-white border-[#722F37]' : 'border-gray-200 text-gray-600 hover:border-[#722F37]'}`}>
              <input type="checkbox" className="sr-only" checked={arr.includes(opt)}
                onChange={e => set(key, e.target.checked ? [...arr, opt] : arr.filter(v => v !== opt))} />
              {opt}
            </label>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-[#722F37]">← Indietro</button>
        <h1 className="text-2xl font-bold text-gray-900">Nuova cantina</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <section className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Informazioni base</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {textField('Nome cantina', 'nome', 'text', true)}
            {textField('Slug (URL)', 'slug', 'text', true)}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Descrizione breve</label>
            <textarea value={form.descrizione_breve ?? ''} onChange={e => set('descrizione_breve', e.target.value)} rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#722F37]/20 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Descrizione completa</label>
            <textarea value={form.descrizione ?? ''} onChange={e => set('descrizione', e.target.value)} rows={4}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#722F37]/20 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className={`cursor-pointer flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-colors ${form.verified ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
              <input type="checkbox" className="sr-only" checked={!!form.verified} onChange={e => set('verified', e.target.checked)} />
              <span className={`text-sm font-medium ${form.verified ? 'text-green-700' : 'text-gray-500'}`}>✓ Verificata</span>
            </label>
            <label className={`cursor-pointer flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-colors ${form.featured ? 'border-amber-500 bg-amber-50' : 'border-gray-200'}`}>
              <input type="checkbox" className="sr-only" checked={!!form.featured} onChange={e => set('featured', e.target.checked)} />
              <span className={`text-sm font-medium ${form.featured ? 'text-amber-700' : 'text-gray-500'}`}>⭐ Featured</span>
            </label>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Posizione</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Regione *</label>
              <select value={form.regione ?? ''} onChange={e => set('regione', e.target.value)} required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#722F37]/20 bg-white">
                <option value="">Seleziona...</option>
                {REGIONI.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {textField('Provincia', 'provincia')}
            {textField('Comune', 'comune')}
          </div>
          {textField('Indirizzo completo', 'indirizzo')}
          <div className="grid grid-cols-2 gap-4">
            {textField('Latitudine', 'lat', 'number')}
            {textField('Longitudine', 'lng', 'number')}
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Contatti</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {textField('Telefono', 'telefono')}
            {textField('Email', 'email', 'email')}
            {textField('Sito web', 'sito_web', 'url')}
            {textField('Instagram (@handle)', 'instagram')}
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Vini e produzione</h2>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Vini prodotti (Invio per aggiungere)</label>
            <TagInput value={form.vini_prodotti ?? []} onChange={v => set('vini_prodotti', v)} placeholder="Es. Barolo, Brunello..." />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Denominazioni (DOC, DOCG, IGT…)</label>
            <TagInput value={form.denominazioni ?? []} onChange={v => set('denominazioni', v)} placeholder="Es. DOCG, DOC..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {textField('Ettari vigneto', 'ettari_vigneto', 'number')}
            {textField('Bottiglie/anno', 'bottiglie_anno', 'number')}
          </div>
          {checkboxGroup('Certificazioni', 'certificazioni', CERT_OPTIONS)}
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Visita e servizi</h2>
          {textField('Orari apertura', 'orari_apertura')}
          {textField('Prezzo degustazione (es. €20–40 a persona)', 'prezzo_degustazione')}
          {checkboxGroup('Servizi offerti', 'servizi', SERVIZI_OPTIONS)}
          {checkboxGroup('Lingue visita', 'lingua_visita', LINGUA_OPTIONS)}
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Foto</h2>
          {form.foto_principale && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.foto_principale} alt="" className="w-full max-w-sm h-36 object-cover rounded-xl" />
          )}
          <div className="flex gap-2">
            <input type="url" value={form.foto_principale ?? ''} onChange={e => set('foto_principale', e.target.value)}
              placeholder="https://..."
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#722F37]/20" />
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex items-center gap-2 border border-gray-200 text-sm px-4 py-2.5 rounded-xl hover:bg-gray-50 disabled:opacity-60 transition-colors">
              <Upload className="w-4 h-4" />
              {uploading ? 'Carico...' : 'Carica'}
            </button>
          </div>
        </section>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-[#722F37] text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-[#5a1f25] transition-colors disabled:opacity-60">
            <Save className="w-4 h-4" />
            {saving ? 'Salvataggio...' : 'Crea cantina'}
          </button>
        </div>
      </form>
    </div>
  )
}
