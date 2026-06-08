'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Bell, Map, Brain } from 'lucide-react'

const ROUTES = [
  { from: 'Hyderabad', to: 'Tirupati', emoji: '🛕', time: '4h train' },
  { from: 'Mumbai', to: 'Goa', emoji: '🏖️', time: '8h train' },
  { from: 'Delhi', to: 'Shimla', emoji: '⛰️', time: '5h bus' },
  { from: 'Bangalore', to: 'Coorg', emoji: '🌿', time: '4h car' },
  { from: 'Chennai', to: 'Ooty', emoji: '🏔️', time: '6h bus' },
  { from: 'Hyderabad', to: 'Srisailam', emoji: '🕌', time: '3h car' },
]

const FEATURES = [
  { icon: Brain, label: 'Thinks Like a Local', desc: 'Real train numbers, actual darshan queues, insider food spots — not generic suggestions.' },
  { icon: Bell, label: 'Watches While You Wait', desc: 'Save a trip. We monitor slots, seats and prices. Alert you the moment everything aligns.' },
  { icon: Zap, label: 'Plan in 20 Seconds', desc: 'Fill one form. Get a complete day-by-day itinerary, budget breakdown and booking links.' },
  { icon: Map, label: 'Route Intelligence', desc: 'Spots hidden gems between origin and destination that match your exact interests.' },
]

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.08 } } },
  item: { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } },
}

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen grid-bg" style={{ background: 'var(--bg)' }}>
      <div className="glow-1" /><div className="glow-2" />

      {/* NAV */}
      <nav className="glass sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <div className="font-display text-xl font-bold gradient-text tracking-tight">✈ TripMind</div>
        <button onClick={() => router.push('/login')} className="btn btn-primary py-2 px-5 text-sm">
          Start Free <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </nav>

      <div className="relative z-10 max-w-2xl mx-auto px-6 pb-28">

        {/* HERO */}
        <motion.div
          variants={stagger.container} initial="initial" animate="animate"
          className="pt-20 pb-16 text-center"
        >
          <motion.div variants={stagger.item}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
              style={{ background: 'var(--amber-dim)', color: 'var(--amber)', border: '1px solid rgba(245,158,11,0.2)' }}>
              ✦ India&apos;s Travel Intelligence System
            </span>
          </motion.div>

          <motion.h1 variants={stagger.item}
            className="font-display mt-6 mb-5 leading-[1.05] tracking-tight"
            style={{ fontSize: 'clamp(40px, 9vw, 72px)', color: 'var(--text)' }}>
            Stop searching.<br />
            <span className="gradient-text italic">Start travelling.</span>
          </motion.h1>

          <motion.p variants={stagger.item}
            className="text-base leading-relaxed mb-10 max-w-md mx-auto"
            style={{ color: 'var(--text-2)' }}>
            One form. A complete plan — real train timings, temple tips, local food, and live ticket alerts. Built for India.
          </motion.p>

          <motion.div variants={stagger.item} className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => router.push('/login')} className="btn btn-primary px-8 py-3.5 text-base">
              Plan My Trip Free ✨
            </button>
          </motion.div>
          <motion.p variants={stagger.item} className="text-xs mt-3" style={{ color: 'var(--text-3)' }}>
            No credit card · No setup · Instant plans
          </motion.p>
        </motion.div>

        {/* POPULAR ROUTES */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <p className="label text-center mb-4">Popular Routes</p>
          <div className="grid grid-cols-2 gap-2.5">
            {ROUTES.map((r, i) => (
              <motion.button
                key={r.to}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.05 }}
                onClick={() => router.push('/login')}
                className="card card-hover text-left p-4"
              >
                <div className="text-2xl mb-2">{r.emoji}</div>
                <div className="text-xs mb-0.5" style={{ color: 'var(--text-3)' }}>{r.from}</div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>→ {r.to}</div>
                <div className="text-xs mt-1.5 font-semibold" style={{ color: 'var(--amber)' }}>{r.time}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* FEATURES */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <p className="label text-center mb-4">Why TripMind</p>
          <div className="flex flex-col gap-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.05 }}
                className="card flex items-start gap-4 p-5"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--amber-dim)', color: 'var(--amber)', border: '1px solid rgba(245,158,11,0.15)' }}>
                  <f.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm mb-1" style={{ color: 'var(--text)' }}>{f.label}</div>
                  <div className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>{f.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="card text-center py-10 px-8"
          style={{ border: '1px solid rgba(245,158,11,0.15)', background: 'var(--amber-glow)' }}
        >
          <div className="font-display text-2xl mb-2" style={{ color: 'var(--text)' }}>Ready to travel smarter?</div>
          <p className="text-sm mb-6" style={{ color: 'var(--text-2)' }}>Join Indian travelers who plan with TripMind.</p>
          <button onClick={() => router.push('/login')} className="btn btn-primary px-8 py-3">
            Get Started — It&apos;s Free
          </button>
        </motion.div>
      </div>
    </div>
  )
}
