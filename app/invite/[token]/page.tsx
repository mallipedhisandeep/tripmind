'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface InviteRow {
  id: string
  trip_id: string
  email: string
  role: string
  accepted: boolean
}

export default function InvitePage({ params }: { params: { token: string } }) {
  const [status, setStatus] = useState<'loading' | 'found' | 'wrong_email' | 'not_found' | 'accepted' | 'error'>('loading')
  const [invite, setInvite] = useState<InviteRow | null>(null)
  const [tripLabel, setTripLabel] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/login'
        return
      }
      setUserEmail(user.email ?? '')

      const { data: member, error } = await supabase
        .from('trip_members')
        .select('id, trip_id, email, role, accepted')
        .eq('invite_token', params.token)
        .single()

      if (error || !member) {
        setStatus('not_found')
        return
      }

      if (member.accepted) {
        setInvite(member)
        setStatus('accepted')
        return
      }

      if (user.email && member.email.toLowerCase() !== user.email.toLowerCase()) {
        setStatus('wrong_email')
        return
      }

      const { data: trip } = await supabase
        .from('trips')
        .select('form_data, generated_plan')
        .eq('id', member.trip_id)
        .single()

      setTripLabel(
        trip?.generated_plan?.destination ||
        trip?.form_data?.to ||
        'this trip'
      )

      setInvite(member)
      setStatus('found')
    }

    load()
  }, [params.token])

  const accept = async () => {
    if (!invite) return
    setAccepting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }

    const { error } = await supabase
      .from('trip_members')
      .update({ accepted: true, user_id: user.id })
      .eq('id', invite.id)

    if (error) {
      setStatus('error')
      setAccepting(false)
      return
    }

    window.location.href = `/plan/${invite.trip_id}`
  }

  const Shell = ({ children }: { children: React.ReactNode }) => (
    <main style={{ minHeight: '100vh', background: 'var(--bg, #0c0c0f)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 380, width: '100%', background: '#111116', border: '1px solid #252530', borderRadius: 20, padding: 32, textAlign: 'center', fontFamily: 'sans-serif' }}>
        {children}
      </div>
    </main>
  )

  if (status === 'loading') {
    return (
      <Shell>
        <div style={{ width: 36, height: 36, border: '3px solid rgba(232,160,32,0.15)', borderTop: '3px solid #e8a020', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#9090b0', fontSize: 13 }}>Loading invite...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </Shell>
    )
  }

  if (status === 'not_found') {
    return (
      <Shell>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🔗</div>
        <h1 style={{ color: '#f0f0f8', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Invite not found</h1>
        <p style={{ color: '#9090b0', fontSize: 13, marginBottom: 20 }}>This invite link is invalid or has been removed.</p>
        <a href="/dashboard" style={{ display: 'inline-block', background: 'linear-gradient(135deg,#e8a020,#f5bc4a)', color: '#0c0c0f', fontWeight: 700, padding: '10px 20px', borderRadius: 12, textDecoration: 'none', fontSize: 13 }}>Go to Dashboard</a>
      </Shell>
    )
  }

  if (status === 'wrong_email') {
    return (
      <Shell>
        <div style={{ fontSize: 36, marginBottom: 12 }}>✉️</div>
        <h1 style={{ color: '#f0f0f8', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Wrong account</h1>
        <p style={{ color: '#9090b0', fontSize: 13, marginBottom: 4 }}>This invite was sent to <strong style={{ color: '#f0f0f8' }}>{invite?.email}</strong>.</p>
        <p style={{ color: '#9090b0', fontSize: 13, marginBottom: 20 }}>You're signed in as {userEmail}. Sign in with the invited email to accept.</p>
        <a href="/dashboard" style={{ display: 'inline-block', background: '#16161c', border: '1px solid #252530', color: '#9090b0', padding: '10px 20px', borderRadius: 12, textDecoration: 'none', fontSize: 13 }}>Go to Dashboard</a>
      </Shell>
    )
  }

  if (status === 'accepted') {
    return (
      <Shell>
        <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
        <h1 style={{ color: '#f0f0f8', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Already accepted</h1>
        <p style={{ color: '#9090b0', fontSize: 13, marginBottom: 20 }}>You're already part of this trip.</p>
        <a href={`/plan/${invite?.trip_id}`} style={{ display: 'inline-block', background: 'linear-gradient(135deg,#e8a020,#f5bc4a)', color: '#0c0c0f', fontWeight: 700, padding: '10px 20px', borderRadius: 12, textDecoration: 'none', fontSize: 13 }}>View Trip</a>
      </Shell>
    )
  }

  if (status === 'error') {
    return (
      <Shell>
        <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
        <h1 style={{ color: '#f0f0f8', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Something went wrong</h1>
        <p style={{ color: '#9090b0', fontSize: 13, marginBottom: 20 }}>Please try again in a moment.</p>
        <button onClick={accept} style={{ background: 'linear-gradient(135deg,#e8a020,#f5bc4a)', color: '#0c0c0f', fontWeight: 700, padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13 }}>Retry</button>
      </Shell>
    )
  }

  return (
    <Shell>
      <div style={{ fontSize: 36, marginBottom: 12 }}>🗺️</div>
      <h1 style={{ color: '#f0f0f8', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>You're invited!</h1>
      <p style={{ color: '#9090b0', fontSize: 13, marginBottom: 4 }}>
        You've been invited to join the trip to <strong style={{ color: '#f0f0f8' }}>{tripLabel}</strong>
      </p>
      <p style={{ color: '#50506a', fontSize: 12, marginBottom: 20 }}>as {invite?.role}</p>
      <button
        onClick={accept}
        disabled={accepting}
        style={{ width: '100%', background: 'linear-gradient(135deg,#e8a020,#f5bc4a)', color: '#0c0c0f', fontWeight: 700, padding: '12px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 14, opacity: accepting ? 0.6 : 1 }}
      >
        {accepting ? 'Joining...' : 'Accept Invite'}
      </button>
    </Shell>
  )
}
