'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) window.location.href = '/dashboard'
    })
  }, [])

  const handleGoogle = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://tripmind-six.vercel.app/auth/callback',
        queryParams: { prompt: 'select_account' },
      },
    })
    if (error) { toast.error('Google sign-in failed. Try again.'); setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      <div className="amb-1" /><div className="amb-2" />
      <div className="dot-grid" style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.35 }} />

      <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42 }}
        style={{ width: '100%', maxWidth: 380, position: 'relative', zIndex: 10 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="font-display gold" style={{ fontSize: 30, fontWeight: 700, marginBottom: 6 }}>✈ TripMind</div>
          <p style={{ color: 'var(--t2)', fontSize: 13 }}>India&apos;s smartest travel planner</p>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 24, padding: 32 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--gold-dim)', border: '1px solid rgba(232,160,32,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 16px' }}>🗺️</div>
            <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>Welcome to TripMind</h2>
            <p style={{ color: 'var(--t2)', fontSize: 13, lineHeight: 1.65 }}>
              Plan complete India trips in seconds — real train timings, temple tips &amp; live alerts.
            </p>
          </div>

          <button onClick={handleGoogle} disabled={loading}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '14px 20px', background: loading ? '#d1d5db' : '#fff', color: '#111', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.15s' }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Connecting...' : 'Continue with Google'}
          </button>

          <p style={{ textAlign: 'center', color: 'var(--t3)', fontSize: 11, marginTop: 16, lineHeight: 1.6 }}>
            Free to use · No credit card · Your data stays private
          </p>
        </div>
      </motion.div>
    </div>
  )
}
