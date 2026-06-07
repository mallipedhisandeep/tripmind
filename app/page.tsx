'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MapPin, Zap, Bell, Shield } from 'lucide-react'

const POPULAR_ROUTES = [
  { from: 'Hyderabad', to: 'Tirupati', emoji: '🛕', tag: 'Most Popular' },
  { from: 'Mumbai', to: 'Goa', emoji: '🏖️', tag: 'Weekend Getaway' },
  { from: 'Delhi', to: 'Shimla', emoji: '⛰️', tag: 'Hill Station' },
  { from: 'Bangalore', to: 'Coorg', emoji: '🌿', tag: 'Nature Escape' },
  { from: 'Chennai', to: 'Ooty', emoji: '🏔️', tag: 'Family Favourite' },
  { from: 'Hyderabad', to: 'Srisailam', emoji: '🕌', tag: 'Pilgrimage' },
]

const FEATURES = [
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'AI-Powered Planning',
    desc: 'Get a complete itinerary in 20 seconds — day-by-day, with exact timings, train numbers, and local tips.',
  },
  {
    icon: <Bell className="w-5 h-5" />,
    title: 'Live Availability Alerts',
    desc: 'Watch a trip and get notified the moment darshan slots open, train seats free up, or prices drop.',
  },
  {
    icon: <MapPin className="w-5 h-5" />,
    title: 'Hyperlocal India Knowledge',
    desc: 'Real temple queues, IRCTC quota tips, local food spots, and ground-level advice no other app gives.',
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'Learns Your Preferences',
    desc: 'The more you plan, the smarter it gets. Your taste, budget, and travel style remembered forever.',
  },
]

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-brand-dark relative overflow-hidden">
      <div className="glow-amber" />
      <div className="glow-red" />

      {/* NAV */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-brand-border backdrop-blur-md bg-brand-dark/80">
        <div className="text-2xl font-display gradient-text font-bold">✈ TripMind</div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/login')}
            className="btn-outline text-sm py-2 px-5"
          >
            Sign In
          </button>
          <button
            onClick={() => router.push('/login')}
            className="btn-primary text-sm py-2 px-5"
          >
            Get Started Free
          </button>
        </div>
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto px-6 pb-24">
        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center pt-20 pb-16"
        >
          <div className="inline-block px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-widest uppercase mb-6">
            India&apos;s First Travel Intelligence System
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-normal leading-tight mb-6 text-slate-50">
            Plan smarter trips.<br />
            <span className="italic gradient-text">Zero effort.</span>
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed max-w-xl mx-auto mb-10">
            Stop spending hours on Google, IRCTC, and WhatsApp groups.
            Tell TripMind where you want to go — get a complete, trusted plan in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/login')}
              className="btn-primary text-lg px-10 py-4"
            >
              ✨ Plan My First Trip — Free
            </button>
          </div>
          <p className="text-slate-600 text-sm mt-4">No credit card. No setup. Just your destination.</p>
        </motion.div>

        {/* POPULAR ROUTES */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-16"
        >
          <p className="text-xs text-slate-600 tracking-widest uppercase font-semibold text-center mb-5">Popular Routes</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {POPULAR_ROUTES.map((r) => (
              <button
                key={r.to}
                onClick={() => router.push('/login')}
                className="card text-left hover:border-amber-500/40 transition-all duration-200 hover:-translate-y-0.5 p-4"
              >
                <div className="text-2xl mb-2">{r.emoji}</div>
                <div className="text-xs text-slate-500 font-medium">{r.from}</div>
                <div className="text-sm font-bold text-slate-200">→ {r.to}</div>
                <div className="mt-2 text-xs text-amber-500 font-semibold">{r.tag}</div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* FEATURES */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-16"
        >
          <p className="text-xs text-slate-600 tracking-widest uppercase font-semibold text-center mb-5">Why TripMind</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                  {f.icon}
                </div>
                <div className="font-semibold text-slate-200 mb-2">{f.title}</div>
                <div className="text-sm text-slate-500 leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="card text-center border-amber-500/20 py-10"
        >
          <div className="text-3xl font-display font-normal text-slate-100 mb-3">
            Ready to travel smarter?
          </div>
          <p className="text-slate-500 text-sm mb-6">Join thousands of Indian travelers who plan with TripMind.</p>
          <button
            onClick={() => router.push('/login')}
            className="btn-primary px-10 py-4 text-base"
          >
            Start Planning — It&apos;s Free
          </button>
        </motion.div>
      </div>
    </div>
  )
}
