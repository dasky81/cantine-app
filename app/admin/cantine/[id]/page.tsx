'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Cantina } from '@/lib/supabase'

const CERT_OPTIONS = ['Biologico', 'Biodinamico', 'Sostenibile']
const SERVIZI_OPTIONS = ['Degustazione', 'Vendita diretta', 'Visita guidata', 'Ristorante', 'Pernottamento', 'Enoteca', 'Agriturismo']
const LINGUA_OPTIONS = ['Italiano', 'Inglese', 'Francese', 'Tedesco', 'Spagnolo', 'Cinese']

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
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
            e.preventDefault()
            if (!value.includes(input.trim())) onChange([...value, input.trim()])
            setInput('')
          }
        }}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 min-w-24 outline-none text-sm bg-transparent"
      />
    </div>
  )
}

export default function EditCantinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [form, setForm] = useState<Partial<Cantina>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.from('cantine').select('*').eq('id', id).single().then(({ data }) => {
      if (data) setForm(data as Cantina)
      setLoading(false)
    })
  }, [id])

  function set(field: keyof Cantina, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('cantine').update({ ...form, updated_at: new Date().toISOString() }).eq('id', id)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setSaving(false)
  }

  if (loading) return <div className="p-8 text-gray-400">Caricamento...</div>

  const field = (label: string, key: keyof Cantina, type = 'text') => (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input
        type={type}
        value={(form[key] as string) ?? ''}
        onChange={e => set(key, type === 'number' ? Number(e.target.value) : e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#722F37]/20"
      />
    </div>
  )

  const checkboxGroup = (label: string, key: keyof Cantina, options: string[]) => (
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
        <h1 className="text-2xl font-bold text-gray-900">{form.nome ?? 'Modifica cantina'}</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <section className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Informazioni base</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field('Nome cantina *', 'nome')}
            {field('Slug (URL) *', 'slug')}
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
            {field('Regione *', 'regione')}
            {field('Provincia', 'provincia')}
            {field('Comune', 'comune')}
          </div>
          {field('Indirizzo completo', 'indirizzo')}
          <div className="grid grid-cols-2 gap-4">
            {field('Latitudine', 'lat', 'number')}
            {field('Longitudine', 'lng', 'number')}
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Contatti</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field('Telefono', 'telefono')}
            {field('Email', 'email', 'email')}
            {field('Sito web', 'sito_web', 'url')}
            {field('Instagram (@handle)', 'instagram')}
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Vini e produzione</h2>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Vini prodotti (premi Invio per aggiungere)</label>
            <TagInput value={form.vini_prodotti ?? []} onChange={v => set('vini_prodotti', v)} placeholder="Es. Barolo, Brunello..." />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Denominazioni (DOC, DOCG, IGT…)</label>
            <TagInput value={form.denominazioni ?? []} onChange={v => set('denominazioni', v)} placeholder="Es. DOCG, DOC..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {field('Ettari vigneto', 'ettari_vigneto', 'number')}
            {field('Bottiglie/anno', 'bottiglie_anno', 'number')}
          </div>
          {checkboxGroup('Certificazioni', 'certificazioni', CERT_OPTIONS)}
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Visita e servizi</h2>
          {field('Orari apertura', 'orari_apertura')}
          {field('Prezzo degustazione (es. €20–40 a persona)', 'prezzo_degustazione')}
          {checkboxGroup('Servizi offerti', 'servizi', SERVIZI_OPTIONS)}
          {checkboxGroup('Lingue visita', 'lingua_visita', LINGUA_OPTIONS)}
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Foto</h2>
          {field('URL foto principale', 'foto_principale', 'url')}
          {form.foto_principale && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.foto_principale} alt="" className="w-full max-w-sm h-36 object-cover rounded-xl" />
          )}
        </section>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving}
            className="bg-[#722F37] text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-[#5a1f25] transition-colors disabled:opacity-60">
            {saving ? 'Salvataggio...' : 'Salva modifiche'}
          </button>
          {saved && <span className="text-sm text-green-600 font-medium">✓ Salvato!</span>}
        </div>
      </form>
    </div>
  )
}
