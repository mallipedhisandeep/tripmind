'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Suspense } from 'react'

function ConfirmInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Signing you in...')

  useEffect(() => {
    const handleConfirm = async () => {
      const code = searchParams.get('code')
      if (!code) {
        router.push('/login?error=no_code')
        return
      }

      const supabase = createClient()

      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
          console.error('Auth error:', error)
          router.push(`/login?error=${encodeURIComponent(error.message)}`)
          return
        }

        if (!data.user) {
          router.push('/login?error=no_user')
          return
        }

        setStatus('Setting up your profile...')

        // Check onboarding
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_complete')
          .eq('id', data.user.id)
          .single()

        if (!profile?.onboarding_complete) {
          router.push('/onboarding')
        } else {
          router.push('/dashboard')
        }
      } catch (err: any) {
        console.error('Confirm error:', err)
        router.push(`/login?error=${encodeURIComponent(err.message || 'unknown')}`)
      }
    }

    handleConfirm()
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-6">
      <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      <p className="text-slate-400 text-sm font-medium">{status}</p>
    </div>
  )
}

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    }>
      <ConfirmInner />
    </Suspense>
  )
}
