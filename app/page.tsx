'use client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const ROUTES = [
  { from: 'Hyderabad', to: 'Tirupati', emoji: '🛕', tag: 'Pilgrimage' },
  { from: 'Mumbai', to: 'Goa', emoji: '🏖️', tag: 'Beach' },
  { from: 'Delhi', to: 'Shimla', emoji: '⛰️', tag: 'Hill Station' },
  { from: 'Bangalore', to: 'Coorg', emoji: '🌿', tag: 'Nature' },
  { from: 'Chennai', to: 'Ooty', emoji: '🏔️', tag: 'Family' },
  { from: 'Hyderabad', to: 'Srisailam', emoji: '🕌', tag: 'Temple' },
]

const WHY = [
  { n: '01', title: 'Thinks Like a Local', body: 'Real train numbers, exact darshan queue times, insider food spots — not AI-generated guesses.' },
  { n: '02', title: 'Live Slot Alerts', body: 'Save a trip. We watch darshan slots, train seats and hotel prices. Alert you the moment things align.' },
  { n: '03', title: 'Complete in 20s', body: 'One form. Full day-by-day plan with budget breakdown, booking links and practical tips.' },
  { n: '04', title: 'Remembers You', body: 'Every plan teaches the system your preferences. Future plans are pre-personalised.' },
]

export default function Home() {
  const r = useRouter()
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      <div className="amb-1" /><div className="amb-2" />
      <div className="dot-grid" style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.4 }} />

      {/* NAV */}
      <nav className="glass" style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px' }}>
        <span className="font-display gold" style={{ fontSize: 22, fontWeight: 700 }}>✈ TripMind</span>
        <button onClick={() => r.push('/login')} className="btn-gold" style={{ padding: '10px 22px', fontSize: 13 }}>
          Get Started Free →
        </button>
      </nav>

      <div style={{ position: 'relative', zIndex: 10, maxWidth: 680, margin: '0 auto', padding: '0 24px 80px' }}>

        {/* HERO */}
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}
          style={{ textAlign: 'center', padding: '80px 0 64px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, background: 'var(--gold-dim)', border: '1px solid rgba(232,160,32,0.2)', marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold)' }}>India&apos;s Travel Intelligence System</span>
          </div>
          <h1 className="font-display" style={{ fontSize: 'clamp(38px,8vw,68px)', lineHeight: 1.08, fontWeight: 700, color: 'var(--t1)', marginBottom: 20 }}>
            Stop searching.<br />
            <span className="gold" style={{ fontStyle: 'italic' }}>Start travelling.</span>
          </h1>
          <p style={{ color: 'var(--t2)', fontSize: 16, lineHeight: 1.75, maxWidth: 460, margin: '0 auto 36px' }}>
            One form. A complete trip plan — real train timings, temple queues, local food, and budget breakdown. Built specifically for India.
          </p>
          <button onClick={() => r.push('/login')} className="btn-gold" style={{ padding: '15px 40px', fontSize: 15 }}>
            Plan My Trip Free ✨
          </button>
          <p style={{ color: 'var(--t3)', fontSize: 12, marginTop: 14 }}>Free · No credit card · Instant plans</p>
        </motion.div>

        {/* ROUTES */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginBottom: 64 }}>
          <p className="label" style={{ textAlign: 'center', marginBottom: 16 }}>Popular Routes</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {ROUTES.map((rt, i) => (
              <motion.button key={rt.to} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.04 }}
                onClick={() => r.push('/login')}
                style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 16, padding: '16px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.18s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,160,32,0.3)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{rt.emoji}</div>
                <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 2 }}>{rt.from}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>→ {rt.to}</div>
                <div style={{ marginTop: 8, display: 'inline-block', padding: '2px 10px', borderRadius: 99, background: 'var(--gold-dim)', color: 'var(--gold)', fontSize: 10, fontWeight: 700, letterSpacing: '0.5px' }}>{rt.tag}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* WHY */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} style={{ marginBottom: 64 }}>
          <p className="label" style={{ textAlign: 'center', marginBottom: 16 }}>Why TripMind</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {WHY.map((w, i) => (
              <motion.div key={w.n} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.06 }}
                style={{ display: 'flex', gap: 20, padding: '20px 0', borderBottom: i < WHY.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'flex-start' }}>
                <span className="font-display" style={{ fontSize: 13, color: 'var(--t3)', fontWeight: 600, minWidth: 24, paddingTop: 2 }}>{w.n}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--t1)', marginBottom: 5 }}>{w.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.65 }}>{w.body}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{ background: 'linear-gradient(135deg, rgba(232,160,32,0.07), rgba(45,212,191,0.04))', border: '1px solid rgba(232,160,32,0.15)', borderRadius: 24, padding: '48px 32px', textAlign: 'center' }}>
          <h2 className="font-display" style={{ fontSize: 28, fontWeight: 700, color: 'var(--t1)', marginBottom: 10 }}>Ready to travel smarter?</h2>
          <p style={{ color: 'var(--t2)', fontSize: 14, marginBottom: 24 }}>Join Indian travellers who plan with TripMind.</p>
          <button onClick={() => r.push('/login')} className="btn-gold" style={{ padding: '13px 36px', fontSize: 14 }}>
            Start Planning — Free
          </button>
        </motion.div>
      </div>
    </div>
  )
}
