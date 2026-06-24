'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('cantine').select('id').eq('owner_id', user.id).single()
      if (data) {
        router.replace('/dashboard/cantina')
      } else {
        setLoading(false)
      }
    }
    check()
  }, [router, supabase])

  if (loading) return <div className="p-8 text-gray-400">Caricamento...</div>

  return (
    <div className="p-8">
      <div className="bg-white rounded-2xl p-10 text-center shadow-sm max-w-md">
        <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-4" />
        <h1 className="text-lg font-bold text-gray-900 mb-2">Nessuna cantina associata</h1>
        <p className="text-gray-500 text-sm mb-6">
          Non hai ancora una cantina collegata al tuo account.
          Invia una richiesta di rivendicazione e il nostro team la verificherà entro 48 ore.
        </p>
        <Link href="/rivendica-scheda"
          className="inline-flex items-center gap-2 bg-[#722F37] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#5a1f25] transition-colors">
          Rivendica la tua scheda
        </Link>
      </div>
    </div>
  )
}
