'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, MapPin, Calendar, LogOut, User, Settings, ChevronRight, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import toast from 'react-hot-toast'

const QUICK_ROUTES = [
  { from: 'Hyderabad', to: 'Tirupati', emoji: '🛕' },
  { from: 'Mumbai', to: 'Goa', emoji: '🏖️' },
  { from: 'Delhi', to: 'Agra', emoji: '🕌' },
  { from: 'Bangalore', to: 'Mysore', emoji: '🏰' },
]

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  draft: { bg: 'rgba(100,100,120,0.15)', color: '#64748b', label: 'Draft' },
  saved: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', label: 'Saved' },
  completed: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', label: 'Completed ✓' },
}

export default function DashboardClient({ profile, trips }: { profile: any; trips: any[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [showProfile, setShowProfile] = useState(false)
  const firstName = profile?.full_name?.split(' ')[0] || 'Traveller'

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/')
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="glow-1" /><div className="glow-2" />

      {/* NAV */}
      <nav className="glass sticky top-0 z-50 flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
        <div className="font-display text-lg font-bold gradient-text">✈ TripMind</div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowProfile(p => !p)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all"
            style={{ background: showProfile ? 'var(--surface2)' : 'transparent', border: '1px solid transparent', borderColor: showProfile ? 'var(--border)' : 'transparent' }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} className="w-7 h-7 rounded-full" alt="" />
              : <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)', color: '#080810' }}>
                  {firstName[0]}
                </div>
            }
            <span className="text-sm font-medium hidden sm:block" style={{ color: 'var(--text-2)' }}>{firstName}</span>
          </button>
        </div>
      </nav>

      {/* PROFILE DROPDOWN */}
      {showProfile && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="fixed top-16 right-4 z-50 w-72 card shadow-2xl"
          style={{ border: '1px solid var(--border2)', padding: 0, overflow: 'hidden' }}>
          {/* Profile header */}
          <div className="p-5 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface2)' }}>
            <div className="flex items-center gap-3">
              {profile?.avatar_url
                ? <img src={profile.avatar_url} className="w-12 h-12 rounded-full" alt="" />
                : <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                    style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)', color: '#080810' }}>
                    {firstName[0]}
                  </div>
              }
              <div>
                <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{profile?.full_name || firstName}</div>
                <div className="text-xs" style={{ color: 'var(--text-2)' }}>{profile?.email}</div>
              </div>
            </div>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-3 border-b" style={{ borderColor: 'var(--border)' }}>
            {[
              { label: 'Trips', value: trips.length },
              { label: 'City', value: profile?.home_city || '—' },
              { label: 'Style', value: profile?.travel_style || '—' },
            ].map(s => (
              <div key={s.label} className="py-3 text-center border-r last:border-0" style={{ borderColor: 'var(--border)' }}>
                <div className="text-base font-bold capitalize" style={{ color: 'var(--text)' }}>{s.value}</div>
                <div className="text-xs" style={{ color: 'var(--text-3)' }}>{s.label}</div>
              </div>
            ))}
          </div>
          {/* Interests */}
          {profile?.interests?.length > 0 && (
            <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="text-xs mb-2 font-semibold" style={{ color: 'var(--text-3)' }}>INTERESTS</div>
              <div className="flex flex-wrap gap-1.5">
                {profile.interests.slice(0, 6).map((i: string) => (
                  <span key={i} className="tag text-xs" style={{ background: 'var(--amber-dim)', color: 'var(--amber)' }}>{i}</span>
                ))}
              </div>
            </div>
          )}
          {/* Actions */}
          <div className="p-2">
            <button onClick={handleSignOut}
              className="btn w-full py-2.5 px-3 rounded-xl text-sm justify-start gap-2"
              style={{ background: 'transparent', color: 'var(--text-2)' }}>
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </motion.div>
      )}

      {showProfile && <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />}

      <div className="relative z-10 max-w-xl mx-auto px-5 pb-24 pt-8">

        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-sm mb-1" style={{ color: 'var(--text-3)' }}>{greeting},</p>
          <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--text)' }}>{firstName} 👋</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>
            {trips.length === 0 ? 'Plan your first trip below.' : `${trips.length} trip${trips.length > 1 ? 's' : ''} planned so far.`}
          </p>
        </motion.div>

        {/* New Trip CTA */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mb-6">
          <button onClick={() => router.push('/plan/new')}
            className="w-full p-5 rounded-2xl text-left group transition-all"
            style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(249,115,22,0.06))', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Plus className="w-4 h-4" style={{ color: 'var(--amber)' }} />
                  <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--amber)' }}>New Trip</span>
                </div>
                <div className="font-display text-xl font-bold" style={{ color: 'var(--text)' }}>Where to next?</div>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-2)' }}>Complete plan in 20 seconds</p>
              </div>
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg group-hover:scale-110 transition-transform"
                style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)', color: '#080810' }}>✨</div>
            </div>
          </button>
        </motion.div>

        {/* Quick Routes */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mb-8">
          <p className="label mb-3">Quick Plan</p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_ROUTES.map(r => (
              <button key={r.to}
                onClick={() => router.push(`/plan/new?from=${encodeURIComponent(r.from)}&to=${encodeURIComponent(r.to)}`)}
                className="card card-hover p-4 text-left">
                <div className="text-xl mb-1.5">{r.emoji}</div>
                <div className="text-xs" style={{ color: 'var(--text-3)' }}>{r.from}</div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>→ {r.to}</div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Your Trips */}
        {trips.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
            <p className="label mb-3">Your Trips</p>
            <div className="flex flex-col gap-2.5">
              {trips.map((trip: any) => {
                const s = STATUS_STYLES[trip.status] || STATUS_STYLES.draft
                return (
                  <button key={trip.id} onClick={() => router.push(`/plan/${trip.id}`)}
                    className="card card-hover p-4 text-left flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--amber)' }} />
                        <span className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>
                          {trip.form_data?.from} → {trip.form_data?.to}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-3)' }}>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{trip.form_data?.days}d</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(trip.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="tag text-xs" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                      <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-3)' }} />
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {trips.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-center py-14">
            <div className="text-5xl mb-3">🗺️</div>
            <div className="font-semibold text-sm mb-1" style={{ color: 'var(--text-2)' }}>No trips yet</div>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>Plan your first trip and it will appear here.</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
