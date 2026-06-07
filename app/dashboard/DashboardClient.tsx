'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, MapPin, Calendar, Clock, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const POPULAR_ROUTES = [
  { from: 'Hyderabad', to: 'Tirupati', emoji: '🛕' },
  { from: 'Mumbai', to: 'Goa', emoji: '🏖️' },
  { from: 'Delhi', to: 'Agra', emoji: '🕌' },
  { from: 'Bangalore', to: 'Mysore', emoji: '🏰' },
]

export default function DashboardClient({ profile, trips }: { profile: any, trips: any[] }) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/')
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'Traveller'

  const statusColor: Record<string, string> = {
    draft: '#64748b',
    saved: '#f59e0b',
    completed: '#10b981',
  }

  const statusLabel: Record<string, string> = {
    draft: 'Draft',
    saved: 'Saved',
    completed: 'Completed',
  }

  return (
    <div className="min-h-screen bg-brand-dark relative overflow-hidden">
      <div className="glow-amber" />
      <div className="glow-red" />

      {/* NAV */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-brand-border backdrop-blur-md bg-brand-dark/80">
        <div className="text-xl font-display gradient-text font-bold">✈ TripMind</div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} className="w-8 h-8 rounded-full" alt="avatar" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center text-xs font-bold text-brand-dark">
                {firstName[0]}
              </div>
            )}
            <span className="text-sm text-slate-400 hidden sm:block">{firstName}</span>
          </div>
          <button onClick={handleSignOut} className="p-2 text-slate-600 hover:text-slate-400 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <div className="relative z-10 max-w-2xl mx-auto px-6 pb-24 pt-8">

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-normal text-slate-100 mb-1">
            Hey {firstName} 👋
          </h1>
          <p className="text-slate-500 text-sm">
            {trips.length === 0
              ? "Ready to plan your first trip?"
              : `You've planned ${trips.length} trip${trips.length > 1 ? 's' : ''} so far.`}
          </p>
        </motion.div>

        {/* Plan New Trip CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push('/plan/new')}
            className="w-full card border-amber-500/30 hover:border-amber-500/60 transition-all duration-200 text-left group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400 text-sm font-semibold uppercase tracking-wider">New Trip</span>
                </div>
                <div className="font-display text-xl text-slate-100">Where are you going?</div>
                <p className="text-slate-500 text-sm mt-1">Get a complete plan in 20 seconds</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center text-brand-dark group-hover:scale-110 transition-transform">
                <span className="text-xl">✨</span>
              </div>
            </div>
          </button>
        </motion.div>

        {/* Quick Routes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <p className="text-xs text-slate-600 tracking-widest uppercase font-semibold mb-3">Quick Plan</p>
          <div className="grid grid-cols-2 gap-2">
            {POPULAR_ROUTES.map(r => (
              <button
                key={r.to}
                onClick={() => router.push(`/plan/new?from=${encodeURIComponent(r.from)}&to=${encodeURIComponent(r.to)}`)}
                className="card p-4 text-left hover:border-amber-500/30 transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="text-xl mb-1">{r.emoji}</div>
                <div className="text-xs text-slate-500">{r.from}</div>
                <div className="text-sm font-bold text-slate-200">→ {r.to}</div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Your Trips */}
        {trips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-xs text-slate-600 tracking-widest uppercase font-semibold mb-3">Your Trips</p>
            <div className="flex flex-col gap-3">
              {trips.map((trip: any) => (
                <button
                  key={trip.id}
                  onClick={() => router.push(`/plan/${trip.id}`)}
                  className="card text-left hover:border-slate-600 transition-all duration-200 group p-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-semibold text-slate-200">
                          {trip.form_data?.from} → {trip.form_data?.to}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {trip.form_data?.days} days
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(trip.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                    <div
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{
                        color: statusColor[trip.status] || '#64748b',
                        background: (statusColor[trip.status] || '#64748b') + '22',
                      }}
                    >
                      {statusLabel[trip.status] || 'Draft'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {trips.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-12"
          >
            <div className="text-5xl mb-4">🗺️</div>
            <div className="text-slate-400 font-medium mb-1">No trips yet</div>
            <p className="text-slate-600 text-sm">Plan your first trip and it will appear here.</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
