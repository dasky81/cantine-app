'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Wine, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function BenvenutoPage() {
  const router = useRouter()

  useEffect(() => {
    const id = setTimeout(() => router.push('/'), 3000)
    return () => clearTimeout(id)
  }, [router])

  return (
    <div className="w-full max-w-md text-center">
      <Link href="/" className="inline-flex items-center gap-2 mb-8">
        <Wine className="w-7 h-7 text-[#722F37]" />
        <span className="font-bold text-2xl text-[#722F37]">cantine</span>
        <span className="font-bold text-2xl text-[#C9A84C]">.app</span>
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-9 h-9 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Benvenuto in cantine.app!</h1>
        <p className="text-gray-500 mb-6">
          Il tuo account è pronto. Tra poco verrai reindirizzato alla homepage per iniziare a esplorare le migliori cantine d&apos;Italia.
        </p>
        <div className="flex items-center justify-center gap-1.5 text-sm text-gray-400">
          <span className="inline-block w-2 h-2 rounded-full bg-[#C9A84C] animate-pulse" />
          Reindirizzamento in corso...
        </div>
        <Link href="/" className="mt-6 inline-block text-sm text-[#722F37] hover:underline">
          Vai subito alla homepage →
        </Link>
      </div>
    </div>
  )
}
