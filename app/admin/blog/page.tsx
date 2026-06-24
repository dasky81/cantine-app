'use client'

import { useEffect, useState, useRef } from 'react'
import { Plus, Eye, EyeOff, Trash2, Sparkles, Save, Upload, X } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import dynamic from 'next/dynamic'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

const TiptapEditor = dynamic(() => import('@/components/TiptapEditor'), { ssr: false })

interface Post {
  id: string
  slug: string
  titolo: string
  contenuto: string | null
  excerpt: string | null
  cover_url: string | null
  published: boolean
  published_at: string | null
  tag: string[] | null
}

const SLUG = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [selected, setSelected] = useState<Post | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [tagInput, setTagInput] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function loadPosts() {
    const { data } = await supabase.from('post').select('*').order('created_at', { ascending: false })
    setPosts((data as Post[]) ?? [])
  }

  useEffect(() => { loadPosts() }, [])

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `blog/cover-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('cantine-foto').upload(path, file, { upsert: true })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('cantine-foto').getPublicUrl(path)
      setField('cover_url', publicUrl)
    }
    setUploading(false)
  }

  function newPost() {
    setSelected({
      id: '', slug: '', titolo: '', contenuto: '', excerpt: '', cover_url: null, published: false, published_at: null, tag: []
    })
    setIsNew(true)
    setTagInput('')
  }

  function setField(field: keyof Post, value: unknown) {
    setSelected(prev => prev ? { ...prev, [field]: value } : prev)
  }

  async function handleSave() {
    if (!selected) return
    setSaving(true)
    const payload = {
      slug: selected.slug || SLUG(selected.titolo),
      titolo: selected.titolo,
      contenuto: selected.contenuto,
      excerpt: selected.excerpt || selected.contenuto?.replace(/<[^>]+>/g, '').slice(0, 200),
      cover_url: selected.cover_url,
      published: selected.published,
      published_at: selected.published ? (selected.published_at || new Date().toISOString()) : null,
      tag: selected.tag,
    }
    if (isNew) {
      const { data } = await supabase.from('post').insert(payload).select().single()
      if (data) { setSelected(data as Post); setIsNew(false) }
    } else {
      await supabase.from('post').update(payload).eq('id', selected.id)
    }
    await loadPosts()
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Eliminare questo articolo?')) return
    await supabase.from('post').delete().eq('id', id)
    setSelected(null)
    await loadPosts()
  }

  async function handleTogglePublish(post: Post) {
    const update = { published: !post.published, published_at: !post.published ? new Date().toISOString() : null }
    await supabase.from('post').update(update).eq('id', post.id)
    await loadPosts()
    if (selected?.id === post.id) setSelected(prev => prev ? { ...prev, ...update } : prev)
  }

  async function handleAiGenerate() {
    if (!aiPrompt || !selected) return
    setGenerating(true)
    try {
      const res = await fetch('/api/genera-testo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, titolo: selected.titolo }),
      })
      const { html } = await res.json()
      setField('contenuto', html)
    } catch { /* silent */ }
    setGenerating(false)
    setAiPrompt('')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Lista articoli */}
      <div className="w-64 bg-white border-r border-gray-100 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-100">
          <button onClick={newPost}
            className="w-full flex items-center justify-center gap-2 bg-[#722F37] text-white text-sm py-2.5 rounded-xl hover:bg-[#5a1f25] transition-colors">
            <Plus className="w-4 h-4" /> Nuovo articolo
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {posts.map(p => (
            <button key={p.id} onClick={() => { setSelected(p); setIsNew(false); setTagInput((p.tag ?? []).join(', ')) }}
              className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${selected?.id === p.id ? 'bg-[#722F37]/5' : ''}`}>
              <p className="text-sm font-medium text-gray-900 truncate">{p.titolo}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-xs ${p.published ? 'text-green-600' : 'text-gray-400'}`}>
                  {p.published ? '● Pubblicato' : '○ Bozza'}
                </span>
                {p.published_at && (
                  <span className="text-xs text-gray-400">
                    · {format(new Date(p.published_at), 'd MMM', { locale: it })}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        {!selected ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Seleziona o crea un articolo</p>
          </div>
        ) : (
          <div className="p-6 max-w-3xl mx-auto">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5 gap-3">
              <div className="flex items-center gap-2">
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 text-sm bg-[#722F37] text-white px-4 py-2 rounded-xl hover:bg-[#5a1f25] disabled:opacity-60 transition-colors">
                  <Save className="w-3.5 h-3.5" /> {saving ? 'Salvo...' : 'Salva'}
                </button>
                <button onClick={() => handleTogglePublish(selected)}
                  className="flex items-center gap-1.5 text-sm border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                  {selected.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {selected.published ? 'Ritira' : 'Pubblica'}
                </button>
              </div>
              {!isNew && (
                <button onClick={() => handleDelete(selected.id)}
                  className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <input
              type="text"
              placeholder="Titolo dell'articolo..."
              value={selected.titolo}
              onChange={e => { setField('titolo', e.target.value); if (!selected.slug) setField('slug', SLUG(e.target.value)) }}
              className="w-full text-2xl font-bold text-gray-900 bg-transparent border-none outline-none placeholder-gray-300 mb-3"
            />

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs text-gray-400 font-medium">Slug (URL)</label>
                <input type="text" value={selected.slug} onChange={e => setField('slug', e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 mt-1 focus:outline-none focus:ring-1 focus:ring-[#722F37]/30" />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium">Tag (separati da virgola)</label>
                <input type="text" value={tagInput}
                  onChange={e => { setTagInput(e.target.value); setField('tag', e.target.value.split(',').map(t => t.trim()).filter(Boolean)) }}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 mt-1 focus:outline-none focus:ring-1 focus:ring-[#722F37]/30" />
              </div>
            </div>

            {/* Cover image */}
            <div className="mb-4 space-y-2">
              <label className="text-xs text-gray-400 font-medium">Cover image</label>
              {selected.cover_url && (
                <div className="relative w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selected.cover_url} alt="" className="w-full h-36 object-cover rounded-xl" />
                  <button type="button" onClick={() => setField('cover_url', null)}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:text-red-600 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <input type="url" value={selected.cover_url ?? ''} onChange={e => setField('cover_url', e.target.value || null)}
                  placeholder="https://..."
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#722F37]/30" />
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="flex items-center gap-1.5 text-xs border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-60 transition-colors whitespace-nowrap">
                  <Upload className="w-3.5 h-3.5" />
                  {uploading ? 'Carico...' : 'Carica'}
                </button>
              </div>
            </div>

            {/* AI generation */}
            <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-xs font-medium text-amber-700">Genera con AI</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder="Es: Scrivi un articolo su Barolo e Barbaresco..."
                  className="flex-1 text-sm border border-amber-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-300 bg-white"
                />
                <button onClick={handleAiGenerate} disabled={generating || !aiPrompt}
                  className="text-xs bg-amber-600 text-white px-3 py-2 rounded-lg hover:bg-amber-700 disabled:opacity-60 transition-colors whitespace-nowrap">
                  {generating ? 'Genero...' : 'Genera'}
                </button>
              </div>
            </div>

            {/* Editor Tiptap */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <TiptapEditor content={selected.contenuto ?? ''} onChange={html => setField('contenuto', html)} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
