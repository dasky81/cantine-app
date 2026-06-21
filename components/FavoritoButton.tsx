'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export default function FavoritoButton({ cantinaId }: { cantinaId: string }) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      supabase
        .from('preferiti')
        .select('id')
        .eq('user_id', user.id)
        .eq('cantina_id', cantinaId)
        .maybeSingle()
        .then(({ data }) => setIsFavorite(!!data))
    })
  }, [cantinaId])

  async function toggle() {
    if (!userId) {
      window.location.href = '/login'
      return
    }
    setLoading(true)
    if (isFavorite) {
      await supabase.from('preferiti').delete()
        .eq('user_id', userId).eq('cantina_id', cantinaId)
      setIsFavorite(false)
    } else {
      await supabase.from('preferiti').insert({ user_id: userId, cantina_id: cantinaId })
      setIsFavorite(true)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 font-medium text-sm transition-all disabled:opacity-60 ${
        isFavorite
          ? 'bg-[#722F37] border-[#722F37] text-white'
          : 'border-[#722F37] text-[#722F37] hover:bg-[#722F37]/5'
      }`}
    >
      <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
      {isFavorite ? 'Salvata' : 'Salva nei preferiti'}
    </button>
  )
}
