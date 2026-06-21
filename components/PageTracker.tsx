'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function PageTracker() {
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    supabase.from('visite_log').insert({
      path: pathname,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
    }).then(() => {})
  }, [pathname])

  return null
}
