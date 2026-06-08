'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, RefreshCw, ExternalLink, MapPin, Train, Hotel, Utensils, Lightbulb, AlertTriangle, Cloud } from 'lucide-react'
import toast from 'react-hot-toast'
import { GeneratedPlan } from '@/types'
import { createClient } from '@/lib/supabase/client'

const STAGES = ['Fetching train data...','Looking up temple timings...','Finding local food...','Calculating route...','Personalising for you...','Building your plan...']

const TC: Record<string, string> = {
  travel:'#3b82f6', temple:'#e8a020', food:'#34d399', stay:'#8b5cf6',
  nature:'#2dd4bf', heritage:'#f97316', shopping:'#fb7185', leisure:'#9090b0',
}

const BC: Record<string, string> = {
  transport:'#3b82f6', accommodation:'#8b5cf6', food:'#34d399', activities:'#e8a020', misc:'#50506a',
}

function Loader({ pct, stage }: { pct: number; stage: number }) {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
      <div style={{ position: 'relative', width: 100, height: 100 }}>
        <svg viewBox="0 0 100 100" style={{ width: 100, height: 100, transform: 'rotate(-90deg)' }}>
          <circle cx="50" cy="50" r="44" fill="none" stroke="var(--border)" strokeWidth="5" />
          <circle cx="50" cy="50" r="44" fill="none" stroke="url(#g)" strokeWidth="5"
            strokeDasharray={`${2 * Math.PI * 44}`}
            strokeDashoffset={`${2 * Math.PI * 44 * (1 - pct / 100)}`}
            style={{ transition: 'stroke-dashoffset 0.4s ease' }} strokeLinecap="round" />
          <defs>
            <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e8a020" /><stop offset="100%" stopColor="#f5bc4a" />
            </linearGradient>
          </defs>
        </svg>
        <div className="font-display" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'var(--gold)' }}>{pct}%</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div className="label" style={{ marginBottom: 6 }}>Planning your trip</div>
        <div style={{ fontSize: 15, color: 'var(--t1)', fontWeight: 500 }}>{STAGES[stage] || 'Almost ready...'}</div>
      </div>
      <div style={{ width: 240, height: 3, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg,#e8a020,#f5bc4a)', width: `${pct}%`, transition: 'width 0.3s ease', borderRadius: 99 }} />
      </div>
    </div>
  )
}

export default function PlanClient({ trip, isGenerating }: { trip: any; isGenerating: boolean }) {
  const [plan, setPlan] = useState<GeneratedPlan | null>(trip.generated_plan || null)
  const [loading, setLoading] = useState(isGenerating && !trip.generated_plan)
  const [pct, setPct] = useState(0)
  const [stage, setStage] = useState(0)
  const [activeDay, setActiveDay] = useState(0)
  const [regenCount, setRegenCount] = useState(trip.regen_count || 0)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [regenLoading, setRegenLoading] = useState(false)

  useEffect(() => { if (loading) doGenerate() }, [])

  const animatePct = (onDone: () => void) => {
    let p = 0
    const iv = setInterval(() => {
      p += Math.random() * 3.5 + 1
      if (p >= 95) { p = 95; clearInterval(iv); onDone(); return }
      setPct(Math.floor(p)); setStage(Math.floor(p / 17))
    }, 280)
  }

  const doGenerate = async () => {
    setLoading(true); setPct(0)
    animatePct(async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { toast.error('Session expired. Please login again.'); setLoading(false); return }

        const res = await fetch('/api/generate-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tripId: trip.id, accessToken: session.access_token }),
        })
        const data = await res.json()

        if (!res.ok) {
          if (data.error === 'REGEN_LIMIT_REACHED') { setShowUpgrade(true); setLoading(false); return }
          throw new Error(data.error || 'Generation failed')
        }

        setPct(100); setStage(5)
        setTimeout(() => { setPlan(data.plan); setRegenCount((c: number) => c + 1); setLoading(false) }, 500)
      } catch (err: any) {
        toast.error(err.message || 'Failed to generate. Try again.')
        setLoading(false)
      }
    })
  }

  const handleRegen = async () => {
    if (regenCount >= 3) { setShowUpgrade(true); return }
    setPlan(null); setRegenLoading(true)
    await doGenerate(); setRegenLoading(false)
  }

  const total = plan ? Object.values(plan.budget_breakdown).reduce((a: number, b: number) => a + b, 0) : 0

  const card = { background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 20, padding: 20, marginBottom: 14 }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      <div className="amb-1" /><div className="amb-2" />

      {/* NAV */}
      <nav className="glass" style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
        <button onClick={() => window.location.href = '/dashboard'} style={{ padding: 8, borderRadius: 10, background: 'transparent', border: 'none', color: 'var(--t2)', cursor: 'pointer' }}>
          <ArrowLeft style={{ width: 18, height: 18 }} />
        </button>
        <span className="font-display gold" style={{ fontSize: 18, fontWeight: 700 }}>Your Trip Plan</span>
        {plan && !loading && (
          <button onClick={handleRegen} disabled={regenLoading} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--t2)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 8 }}>
            <RefreshCw style={{ width: 14, height: 14 }} />
          </button>
        )}
      </nav>

      <div style={{ position: 'relative', zIndex: 10, maxWidth: 640, margin: '0 auto', padding: '16px 18px 100px' }}>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Loader pct={pct} stage={stage} />
            </motion.div>
          ) : plan ? (
            <motion.div key="plan" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

              {/* HERO */}
              <div style={{ ...card, background: 'linear-gradient(135deg, var(--s1), #1a1408)', borderColor: 'rgba(232,160,32,0.2)', marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div className="label" style={{ color: 'var(--gold)', marginBottom: 6 }}>Trip Plan</div>
                    <h1 className="font-display" style={{ fontSize: 26, fontWeight: 700, color: 'var(--t1)', lineHeight: 1.2 }}>
                      {plan.from} → <span style={{ color: 'var(--gold)' }}>{plan.destination}</span>
                    </h1>
                    <p style={{ fontSize: 12, color: 'var(--t2)', marginTop: 5 }}>
                      {plan.days} days · {trip.form_data?.group_type?.replace('_', ' ')} · {trip.form_data?.transport}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 3 }}>Est. Total</div>
                    <div className="font-display" style={{ fontSize: 24, fontWeight: 700, color: 'var(--gold)' }}>
                      ₹{plan.total_budget_min?.toLocaleString()}–{plan.total_budget_max?.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t3)' }}>for {trip.form_data?.travelers} traveller{trip.form_data?.travelers > 1 ? 's' : ''}</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.7, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>{plan.summary}</p>
              </div>

              {/* WHY */}
              <div style={{ ...card, borderLeft: '3px solid var(--gold)', borderRadius: '0 16px 16px 0', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Lightbulb style={{ width: 14, height: 14, color: 'var(--gold)' }} />
                  <span className="label" style={{ color: 'var(--gold)' }}>Why This Plan?</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.7 }}>{plan.why_this_plan}</p>
              </div>

              {/* ALERTS */}
              {(plan.crowd_warning || plan.weather_note) && (
                <div style={{ marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {plan.crowd_warning && (
                    <div style={{ background: 'rgba(251,113,133,0.07)', border: '1px solid rgba(251,113,133,0.2)', borderRadius: 14, padding: '12px 16px', display: 'flex', gap: 10 }}>
                      <AlertTriangle style={{ width: 14, height: 14, color: '#fb7185', flexShrink: 0, marginTop: 1 }} />
                      <p style={{ fontSize: 12, color: '#fb7185', lineHeight: 1.6 }}>{plan.crowd_warning}</p>
                    </div>
                  )}
                  {plan.weather_note && (
                    <div style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 14, padding: '12px 16px', display: 'flex', gap: 10 }}>
                      <Cloud style={{ width: 14, height: 14, color: '#3b82f6', flexShrink: 0, marginTop: 1 }} />
                      <p style={{ fontSize: 12, color: '#3b82f6', lineHeight: 1.6 }}>{plan.weather_note}</p>
                    </div>
                  )}
                </div>
              )}

              {/* BUDGET */}
              <div style={{ ...card, marginBottom: 14 }}>
                <div className="label" style={{ marginBottom: 16 }}>Budget Breakdown</div>
                {Object.entries(plan.budget_breakdown).map(([k, v]: [string, any]) => {
                  const pct = Math.round((v / total) * 100)
                  return (
                    <div key={k} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                        <span style={{ color: 'var(--t2)', textTransform: 'capitalize', fontWeight: 500 }}>{k}</span>
                        <span style={{ fontWeight: 700, color: 'var(--t1)' }}>₹{v?.toLocaleString()} <span style={{ color: 'var(--t3)', fontWeight: 400 }}>({pct}%)</span></span>
                      </div>
                      <div style={{ height: 5, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.9, delay: 0.2 }}
                          style={{ height: '100%', background: BC[k] || '#50506a', borderRadius: 99 }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* DAY TABS */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                {plan.days_plan?.map((d: any, i: number) => (
                  <button key={i} onClick={() => setActiveDay(i)}
                    style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.15s', background: activeDay === i ? 'linear-gradient(135deg,#e8a020,#f5bc4a)' : 'var(--s2)', color: activeDay === i ? '#0c0c0f' : 'var(--t3)' }}>
                    Day {d.day}
                  </button>
                ))}
              </div>

              {/* DAY PLAN */}
              {plan.days_plan?.[activeDay] && (
                <div style={{ ...card, marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 3, height: 32, borderRadius: 99, background: 'linear-gradient(180deg,#e8a020,#f5bc4a)' }} />
                    <div>
                      <div className="label">Day {plan.days_plan[activeDay].day}</div>
                      <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--t1)' }}>{plan.days_plan[activeDay].title}</div>
                    </div>
                    {plan.days_plan[activeDay].date && <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--t3)' }}>{plan.days_plan[activeDay].date}</div>}
                  </div>
                  {plan.days_plan[activeDay].slots?.map((slot: any, si: number) => (
                    <div key={si} style={{ display: 'flex', gap: 12, paddingBottom: 18, position: 'relative' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 12 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: TC[slot.type] || 'var(--t3)', marginTop: 3, flexShrink: 0 }} />
                        {si < plan.days_plan[activeDay].slots.length - 1 && <div style={{ width: 1, flex: 1, background: 'var(--border)', marginTop: 4 }} />}
                      </div>
                      <div style={{ flex: 1, paddingBottom: 2 }}>
                        <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 600, marginBottom: 3 }}>{slot.time}</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)', marginBottom: 6 }}>{slot.icon} {slot.activity}</div>
                        <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.6, background: 'var(--s2)', padding: '8px 12px', borderRadius: 10, borderLeft: '2px solid var(--border2)' }}>
                          💡 {slot.tip}
                        </div>
                        {slot.booking_link && (
                          <a href={slot.booking_link} target="_blank" rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--gold)', marginTop: 6 }}>
                            Book here <ExternalLink style={{ width: 10, height: 10 }} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* HOTELS */}
              {plan.hotels?.length > 0 && (
                <div style={{ ...card, marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <Hotel style={{ width: 14, height: 14, color: 'var(--t3)' }} />
                    <span className="label">Where to Stay</span>
                  </div>
                  {plan.hotels.map((h: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--s2)', borderRadius: 14, marginBottom: 8, border: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--t1)', marginBottom: 4 }}>{h.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ padding: '2px 8px', borderRadius: 99, background: 'var(--gold-dim)', color: 'var(--gold)', fontSize: 10, fontWeight: 700 }}>{h.tag}</span>
                          <span style={{ fontSize: 11, color: 'var(--t3)' }}>⭐ {h.rating}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>{h.price_range}</div>
                        <a href={h.booking_url} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 11, color: 'var(--gold)', display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 4 }}>
                          Book <ExternalLink style={{ width: 10, height: 10 }} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* FOOD */}
              {plan.food_recommendations?.length > 0 && (
                <div style={{ ...card, marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Utensils style={{ width: 14, height: 14, color: 'var(--t3)' }} />
                    <span className="label">What to Eat</span>
                  </div>
                  {plan.food_recommendations.map((f: string, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, fontSize: 13, color: 'var(--t2)', lineHeight: 1.5 }}>
                      <span style={{ color: 'var(--green)', flexShrink: 0 }}>•</span>{f}
                    </div>
                  ))}
                </div>
              )}

              {/* ROUTE HIGHLIGHTS */}
              {plan.route_highlights?.length > 0 && (
                <div style={{ ...card, marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <MapPin style={{ width: 14, height: 14, color: 'var(--t3)' }} />
                    <span className="label">On Your Route</span>
                  </div>
                  {plan.route_highlights.map((r: string, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, fontSize: 13, color: 'var(--t2)', lineHeight: 1.5 }}>
                      <span style={{ color: '#3b82f6', flexShrink: 0 }}>→</span>{r}
                    </div>
                  ))}
                </div>
              )}

              {/* TIPS */}
              {plan.practical_tips?.length > 0 && (
                <div style={{ ...card, marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Lightbulb style={{ width: 14, height: 14, color: 'var(--t3)' }} />
                    <span className="label">Must-Know Tips</span>
                  </div>
                  {plan.practical_tips.map((tip: string, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', background: 'var(--s2)', borderRadius: 12, marginBottom: 7, border: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--gold)', flexShrink: 0, fontWeight: 700 }}>•</span>
                      <span style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6 }}>{tip}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* BOOKING LINKS */}
              {plan.booking_links && (
                <div style={{ ...card, marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Train style={{ width: 14, height: 14, color: 'var(--t3)' }} />
                    <span className="label">Book Now</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {plan.booking_links.train && <a href={plan.booking_links.train} target="_blank" rel="noopener noreferrer" className="btn-outline-gold" style={{ padding: '9px 14px', fontSize: 12, borderRadius: 10, textDecoration: 'none' }}>🚂 IRCTC Train</a>}
                    {plan.booking_links.hotel && <a href={plan.booking_links.hotel} target="_blank" rel="noopener noreferrer" className="btn-outline-gold" style={{ padding: '9px 14px', fontSize: 12, borderRadius: 10, textDecoration: 'none' }}>🏨 Hotels</a>}
                    {plan.booking_links.bus && <a href={plan.booking_links.bus} target="_blank" rel="noopener noreferrer" className="btn-outline-gold" style={{ padding: '9px 14px', fontSize: 12, borderRadius: 10, textDecoration: 'none' }}>🚌 Bus</a>}
                    {plan.booking_links.flight && <a href={plan.booking_links.flight} target="_blank" rel="noopener noreferrer" className="btn-outline-gold" style={{ padding: '9px 14px', fontSize: 12, borderRadius: 10, textDecoration: 'none' }}>✈️ Flights</a>}
                  </div>
                </div>
              )}

              {/* REGEN */}
              <div style={{ ...card, borderColor: regenCount >= 3 ? 'rgba(251,113,133,0.2)' : 'var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--t1)' }}>Not quite right?</div>
                    <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 3 }}>
                      {regenCount >= 3 ? 'Upgrade to Pro for unlimited regenerations' : `${3 - regenCount} free regeneration${3 - regenCount !== 1 ? 's' : ''} left`}
                    </div>
                  </div>
                  {regenCount < 3
                    ? <button onClick={handleRegen} disabled={regenLoading} className="btn-ghost" style={{ padding: '9px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 7 }}>
                        <RefreshCw style={{ width: 13, height: 13 }} /> Regenerate
                      </button>
                    : <button onClick={() => setShowUpgrade(true)} className="btn-gold" style={{ padding: '9px 16px', fontSize: 13 }}>⚡ Upgrade to Pro</button>}
                </div>
                {regenCount > 0 && regenCount < 3 && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                    {[0,1,2].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i < regenCount ? '#fb7185' : 'var(--border)' }} />)}
                  </div>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* UPGRADE MODAL */}
      {showUpgrade && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
            style={{ background: 'var(--s1)', border: '1px solid rgba(232,160,32,0.25)', borderRadius: 24, padding: 32, maxWidth: 380, width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>⚡</div>
              <h3 className="font-display" style={{ fontSize: 24, fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>Upgrade to Pro</h3>
              <p style={{ fontSize: 13, color: 'var(--t2)' }}>Unlimited planning. Zero limits.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {['Unlimited generations','Unlimited regenerations','Save unlimited trips','Live availability alerts','Shareable trip links','Offline download'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--t2)' }}>
                  <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓</span> {f}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn-gold" style={{ width: '100%', padding: '13px' }}>Start Pro — ₹99/month</button>
              <button className="btn-ghost" style={{ width: '100%', padding: '12px', fontSize: 13 }}>₹799/year (save 33%)</button>
              <button onClick={() => setShowUpgrade(false)} style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', fontSize: 13, padding: '8px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Maybe later</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
