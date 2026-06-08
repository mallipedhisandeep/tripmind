'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function ConfirmInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Signing you in...')

  useEffect(() => {
    const handleConfirm = async () => {
      const supabase = createClient()

      // Handle both OAuth code and email magic link token_hash
      const code = searchParams.get('code')
      const tokenHash = searchParams.get('token_hash')
      const type = searchParams.get('type')

      try {
        if (tokenHash && type) {
          // Email OTP / Magic link
          setStatus('Verifying your email link...')
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as any,
          })
          if (error) {
            console.error('OTP verify error:', error)
            router.push(`/login?error=${encodeURIComponent(error.message)}`)
            return
          }
          if (data.user) {
            setStatus('Setting up your profile...')
            await redirectUser(supabase, data.user.id)
          }
        } else if (code) {
          // Google OAuth code
          setStatus('Completing Google sign in...')
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            console.error('Exchange error:', error)
            router.push(`/login?error=${encodeURIComponent(error.message)}`)
            return
          }
          if (data.user) {
            setStatus('Setting up your profile...')
            await redirectUser(supabase, data.user.id)
          }
        } else {
          // Check if already logged in (session exists)
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            await redirectUser(supabase, user.id)
          } else {
            router.push('/login?error=no_token')
          }
        }
      } catch (err: any) {
        console.error('Confirm error:', err)
        router.push(`/login?error=${encodeURIComponent(err.message || 'unknown')}`)
      }
    }

    handleConfirm()
  }, [])

  const redirectUser = async (supabase: any, userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_complete')
      .eq('id', userId)
      .single()

    if (!profile?.onboarding_complete) {
      router.push('/onboarding')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ width: 40, height: 40, border: '2px solid rgba(245,158,11,0.2)', borderTop: '2px solid #f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#8888a8', fontSize: 14, fontFamily: 'sans-serif' }}>{status}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '2px solid rgba(245,158,11,0.2)', borderTop: '2px solid #f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    }>
      <ConfirmInner />
    </Suspense>
  )
}
