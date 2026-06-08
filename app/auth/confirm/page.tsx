'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function ConfirmInner() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Signing you in...')

  useEffect(() => {
    const handleConfirm = async () => {
      const supabase = createClient()
      const code = searchParams.get('code')

      if (!code) {
        window.location.href = '/login?error=no_code'
        return
      }

      try {
        setStatus('Completing Google sign in...')
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
          console.error('Exchange error:', error.message)
          window.location.href = `/login?error=${encodeURIComponent(error.message)}`
          return
        }

        if (!data.user) {
          window.location.href = '/login?error=no_user'
          return
        }

        setStatus('Setting up your profile...')

        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_complete')
          .eq('id', data.user.id)
          .single()

        // Full page reload so server sees the new session cookie
        if (!profile?.onboarding_complete) {
          window.location.href = '/onboarding'
        } else {
          window.location.href = '/dashboard'
        }

      } catch (err: any) {
        console.error('Confirm error:', err)
        window.location.href = `/login?error=${encodeURIComponent(err.message || 'unknown')}`
      }
    }

    handleConfirm()
  }, [])

  return (
    <div style={{
      minHeight: '100vh', background: '#080810',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 20,
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        width: 44, height: 44,
        border: '3px solid rgba(245,158,11,0.15)',
        borderTop: '3px solid #f59e0b',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite'
      }} />
      <p style={{ color: '#8888a8', fontSize: 14 }}>{status}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 44, height: 44, border: '3px solid rgba(245,158,11,0.15)', borderTop: '3px solid #f59e0b', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    }>
      <ConfirmInner />
    </Suspense>
  )
}
