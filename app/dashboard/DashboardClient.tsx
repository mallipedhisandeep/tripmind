'use client'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MapPin, Calendar, Clock, ChevronRight, LogOut, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import toast from 'react-hot-toast'

const QUICK = [
  { from: 'Hyderabad', to: 'Tirupati', emoji: '🛕' },
  { from: 'Mumbai', to: 'Goa', emoji: '🏖️' },
  { from: 'Delhi', to: 'Agra', emoji: '🕌' },
  { from: 'Bangalore', to: 'Mysore', emoji: '🏰' },
]

const ST: Record<string, { bg: string; color: string; label: string }> = {
  draft:     { bg: 'rgba(80,80,106,0.2)',    color: '#9090b0', label: 'Draft' },
  saved:     { bg: 'rgba(232,160,32,0.12)',  color: '#e8a020', label: 'Saved' },
  completed: { bg: 'rgba(52,211,153,0.12)',  color: '#34d399', label: 'Done ✓' },
}

export default function DashboardClient({ profile, trips }: { profile: any; trips: any[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [showProfile, setShowProfile] = useState(false)
  const name = profile?.full_name?.split(' ')[0] || 'Traveller'
  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const signOut = async () => {
    await supabase.auth.signOut()
    toast.success('Signed out')
    window.location.href = '/login'
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      <div className="amb-1" /><div className="amb-2" />

      {/* NAV */}
      <nav className="glass" style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
        <span className="font-display gold" style={{ fontSize: 20, fontWeight: 700 }}>✈ TripMind</span>
        <button onClick={() => setShowProfile(p => !p)}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', borderRadius: 12, background: showProfile ? 'var(--s2)' : 'transparent', border: `1px solid ${showProfile ? 'var(--border)' : 'transparent'}`, cursor: 'pointer', transition: 'all 0.15s' }}>
          {profile?.avatar_url
            ? <img src={profile.avatar_url} style={{ width: 28, height: 28, borderRadius: '50%' }} alt="" />
            : <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#e8a020,#f5bc4a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#0c0c0f' }}>{name[0]}</div>}
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--t2)' }} className="hidden sm:block">{name}</span>
        </button>
      </nav>

      {/* PROFILE PANEL */}
      <AnimatePresence>
        {showProfile && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowProfile(false)} />
            <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: 0.18 }}
              style={{ position: 'fixed', top: 64, right: 16, zIndex: 50, width: 288, background: 'var(--s1)', border: '1px solid var(--border2)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>

              {/* Header */}
              <div style={{ padding: '20px', background: 'var(--s2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14 }}>
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid var(--gold)', }} alt="" />
                  : <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#e8a020,#f5bc4a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#0c0c0f', border: '2px solid rgba(232,160,32,0.3)' }}>{name[0]}</div>}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>{profile?.full_name || name}</div>
                  <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 2 }}>{profile?.email}</div>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid var(--border)' }}>
                {[
                  { v: trips.length, l: 'Trips' },
                  { v: profile?.home_city || '—', l: 'Base' },
                  { v: profile?.travel_style || '—', l: 'Style' },
                ].map((s, i) => (
                  <div key={i} style={{ padding: '14px 0', textAlign: 'center', borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--t1)', textTransform: 'capitalize' }}>{s.v}</div>
                    <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 2, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{s.l}</div>
                  </div>
                ))}
              </div>

              {/* Interests */}
              {profile?.interests?.length > 0 && (
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                  <div className="label" style={{ marginBottom: 8 }}>Interests</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {profile.interests.slice(0, 8).map((i: string) => (
                      <span key={i} style={{ padding: '3px 10px', borderRadius: 99, background: 'var(--gold-dim)', color: 'var(--gold)', fontSize: 11, fontWeight: 600 }}>{i}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Transport & Budget */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 16 }}>
                <div>
                  <div className="label" style={{ marginBottom: 4 }}>Transport</div>
                  <div style={{ fontSize: 13, color: 'var(--t1)', textTransform: 'capitalize' }}>{profile?.preferred_transport || '—'}</div>
                </div>
                <div>
                  <div className="label" style={{ marginBottom: 4 }}>Home City</div>
                  <div style={{ fontSize: 13, color: 'var(--t1)' }}>{profile?.home_city || '—'}</div>
                </div>
              </div>

              {/* Sign out */}
              <div style={{ padding: 8 }}>
                <button onClick={signOut} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'transparent', border: 'none', color: 'var(--t2)', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.12s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--s2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <LogOut style={{ width: 14, height: 14 }} /> Sign out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MAIN */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 600, margin: '0 auto', padding: '28px 20px 100px' }}>

        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 4, letterSpacing: '0.5px' }}>{greet},</p>
          <h1 className="font-display" style={{ fontSize: 30, fontWeight: 700, color: 'var(--t1)', lineHeight: 1.2 }}>{name} 👋</h1>
          <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 6 }}>
            {trips.length === 0 ? 'Plan your first trip below.' : `${trips.length} trip${trips.length > 1 ? 's' : ''} planned so far.`}
          </p>
        </motion.div>

        {/* New Trip CTA */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }} style={{ marginBottom: 24 }}>
          <button onClick={() => router.push('/plan/new')}
            style={{ width: '100%', padding: 20, borderRadius: 20, textAlign: 'left', cursor: 'pointer', background: 'linear-gradient(135deg, rgba(232,160,32,0.07), rgba(45,212,191,0.04))', border: '1px solid rgba(232,160,32,0.2)', transition: 'all 0.18s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(232,160,32,0.4)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(232,160,32,0.2)')}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                  <Plus style={{ width: 14, height: 14, color: 'var(--gold)' }} />
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--gold)' }}>New Trip</span>
                </div>
                <div className="font-display" style={{ fontSize: 20, fontWeight: 700, color: 'var(--t1)' }}>Where to next?</div>
                <p style={{ fontSize: 12, color: 'var(--t2)', marginTop: 3 }}>Full plan in 20 seconds</p>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#e8a020,#f5bc4a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>✨</div>
            </div>
          </button>
        </motion.div>

        {/* Quick routes */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} style={{ marginBottom: 28 }}>
          <p className="label" style={{ marginBottom: 10 }}>Quick Plan</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {QUICK.map(q => (
              <button key={q.to} onClick={() => router.push(`/plan/new?from=${encodeURIComponent(q.from)}&to=${encodeURIComponent(q.to)}`)}
                style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 16, padding: '14px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{q.emoji}</div>
                <div style={{ fontSize: 10, color: 'var(--t3)' }}>{q.from}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginTop: 1 }}>→ {q.to}</div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Trip history */}
        {trips.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
            <p className="label" style={{ marginBottom: 10 }}>Your Trips</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {trips.map((t: any) => {
                const s = ST[t.status] || ST.draft
                return (
                  <button key={t.id} onClick={() => router.push(`/plan/${t.id}`)}
                    style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 16, padding: '16px', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, transition: 'all 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                        <MapPin style={{ width: 12, height: 12, color: 'var(--gold)', flexShrink: 0 }} />
                        <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.form_data?.from} → {t.form_data?.to}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--t3)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar style={{ width: 10, height: 10 }} />{t.form_data?.days}d
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock style={{ width: 10, height: 10 }} />
                          {new Date(t.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <span style={{ padding: '3px 10px', borderRadius: 99, background: s.bg, color: s.color, fontSize: 11, fontWeight: 700 }}>{s.label}</span>
                      <ChevronRight style={{ width: 14, height: 14, color: 'var(--t3)' }} />
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {trips.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ textAlign: 'center', paddingTop: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--t2)' }}>No trips yet</div>
            <p style={{ fontSize: 12, color: 'var(--t3)', marginTop: 4 }}>Plan your first trip above.</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
