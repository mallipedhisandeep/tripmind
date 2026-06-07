'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, RefreshCw, ExternalLink, MapPin, Train, Hotel, Utensils, Lightbulb, AlertTriangle, Cloud } from 'lucide-react'
import toast from 'react-hot-toast'
import { GeneratedPlan } from '@/types'

const LOADING_STAGES = [
  'Checking train availability...',
  'Looking up temple timings...',
  'Finding local food spots...',
  'Calculating best route...',
  'Personalizing for your group...',
  'Building your itinerary...',
]

const TYPE_COLORS: Record<string, string> = {
  travel: '#3b82f6',
  temple: '#f59e0b',
  food: '#10b981',
  stay: '#8b5cf6',
  nature: '#22c55e',
  heritage: '#f97316',
  shopping: '#ec4899',
  leisure: '#64748b',
}

function LoadingScreen({ progress, stage }: { progress: number; stage: number }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 120 120" className="w-28 h-28 -rotate-90">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#1e293b" strokeWidth="6" />
          <circle cx="60" cy="60" r="54" fill="none" stroke="url(#grad)" strokeWidth="6"
            strokeDasharray={`${2 * Math.PI * 54}`}
            strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
            style={{ transition: 'stroke-dashoffset 0.4s ease' }}
          />
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-amber-400 font-display">
          {progress}%
        </div>
      </div>
      <div className="text-center">
        <div className="text-xs text-slate-600 tracking-widest uppercase mb-2">Planning Your Trip</div>
        <div className="text-slate-300 font-medium text-lg">{LOADING_STAGES[stage] || 'Almost ready...'}</div>
      </div>
      <div className="w-64 h-1.5 bg-brand-border rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export default function PlanClient({ trip, isGenerating }: { trip: any; isGenerating: boolean }) {
  const router = useRouter()
  const [plan, setPlan] = useState<GeneratedPlan | null>(trip.generated_plan || null)
  const [loading, setLoading] = useState(isGenerating && !trip.generated_plan)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState(0)
  const [activeDay, setActiveDay] = useState(0)
  const [regenCount, setRegenCount] = useState(trip.regen_count || 0)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [regenLoading, setRegenLoading] = useState(false)

  useEffect(() => {
    if (loading) generatePlan()
  }, [])

  const animateProgress = (onComplete: () => void) => {
    let p = 0
    let s = 0
    const interval = setInterval(() => {
      p += Math.random() * 4 + 1.5
      if (p >= 95) { p = 95; clearInterval(interval); onComplete(); return }
      s = Math.floor(p / 17)
      setProgress(Math.floor(p))
      setStage(s)
    }, 250)
  }

  const generatePlan = async () => {
    setLoading(true)
    setProgress(0)

    animateProgress(async () => {
      try {
        const res = await fetch('/api/generate-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tripId: trip.id }),
        })

        const data = await res.json()

        if (!res.ok) {
          if (data.error === 'REGEN_LIMIT_REACHED') {
            setShowUpgrade(true)
            setLoading(false)
            return
          }
          throw new Error(data.error || 'Generation failed')
        }

        setProgress(100)
        setStage(5)
        setTimeout(() => {
          setPlan(data.plan)
          setRegenCount(c => c + 1)
          setLoading(false)
        }, 500)
      } catch (err: any) {
        toast.error(err.message || 'Failed to generate plan. Try again.')
        setLoading(false)
      }
    })
  }

  const handleRegen = async () => {
    if (regenCount >= 3) { setShowUpgrade(true); return }
    setRegenLoading(true)
    setLoading(true)
    setPlan(null)
    await generatePlan()
    setRegenLoading(false)
  }

  const totalBudget = plan
    ? Object.values(plan.budget_breakdown).reduce((a: number, b: number) => a + b, 0)
    : 0

  const budgetColors: Record<string, string> = {
    transport: '#3b82f6',
    accommodation: '#8b5cf6',
    food: '#10b981',
    activities: '#f59e0b',
    misc: '#64748b',
  }

  return (
    <div className="min-h-screen bg-brand-dark relative overflow-hidden">
      <div className="glow-amber" />
      <div className="glow-red" />

      {/* NAV */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-5 py-4 border-b border-brand-border backdrop-blur-md bg-brand-dark/80">
        <button onClick={() => router.push('/dashboard')} className="p-2 text-slate-500 hover:text-slate-300 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="font-display text-lg gradient-text font-bold">Your Trip Plan</div>
        {plan && !loading && (
          <button
            onClick={handleRegen}
            disabled={regenLoading}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-amber-400 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${regenLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:block">Regenerate</span>
          </button>
        )}
      </nav>

      <div className="relative z-10 max-w-2xl mx-auto px-5 pb-28 pt-4">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoadingScreen progress={progress} stage={stage} />
            </motion.div>
          ) : plan ? (
            <motion.div key="plan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

              {/* HERO CARD */}
              <div className="card border-amber-500/20 mb-4 bg-gradient-to-br from-brand-card to-[#1a1505]">
                <div className="flex justify-between items-start flex-wrap gap-3">
                  <div>
                    <div className="text-xs text-amber-500 tracking-widest uppercase font-semibold mb-2">Trip Plan</div>
                    <h1 className="font-display text-3xl font-normal text-slate-100">
                      {plan.from} → <span className="text-amber-400">{plan.destination}</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                      {plan.days} days · {trip.form_data?.group_type?.replace('_', ' ')} · {trip.form_data?.transport}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-600 mb-1">Est. Total</div>
                    <div className="text-2xl font-bold text-amber-400 font-display">
                      ₹{plan.total_budget_min?.toLocaleString()}–{plan.total_budget_max?.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-600">for {trip.form_data?.travelers} traveler{trip.form_data?.travelers > 1 ? 's' : ''}</div>
                  </div>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mt-4 pt-4 border-t border-brand-border">
                  {plan.summary}
                </p>
              </div>

              {/* WHY THIS PLAN */}
              <div className="card mb-4 border-l-4 border-l-amber-500 rounded-l-none">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Why This Plan?</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{plan.why_this_plan}</p>
              </div>

              {/* ALERTS */}
              {(plan.crowd_warning || plan.weather_note) && (
                <div className="flex flex-col gap-2 mb-4">
                  {plan.crowd_warning && (
                    <div className="card border-orange-500/30 bg-orange-500/5 p-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-orange-300">{plan.crowd_warning}</p>
                      </div>
                    </div>
                  )}
                  {plan.weather_note && (
                    <div className="card border-blue-500/30 bg-blue-500/5 p-4">
                      <div className="flex items-start gap-2">
                        <Cloud className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-300">{plan.weather_note}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* BUDGET BREAKDOWN */}
              <div className="card mb-4">
                <div className="text-xs text-slate-500 tracking-widest uppercase font-semibold mb-4">Budget Breakdown</div>
                {Object.entries(plan.budget_breakdown).map(([key, val]: [string, any]) => {
                  const pct = Math.round((val / totalBudget) * 100)
                  return (
                    <div key={key} className="mb-3">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-slate-400 capitalize font-medium">{key}</span>
                        <span className="font-semibold text-slate-200">
                          ₹{val?.toLocaleString()} <span className="text-slate-600 font-normal">({pct}%)</span>
                        </span>
                      </div>
                      <div className="h-1.5 bg-brand-border rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className="h-full rounded-full"
                          style={{ background: budgetColors[key] || '#64748b' }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* DAY SELECTOR */}
              <div className="flex gap-2 mb-3">
                {plan.days_plan?.map((d, i) => (
                  <button key={i} onClick={() => setActiveDay(i)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      activeDay === i
                        ? 'bg-gradient-to-r from-amber-500 to-red-500 text-brand-dark'
                        : 'bg-brand-border text-slate-500 hover:text-slate-300'
                    }`}>
                    Day {d.day}
                  </button>
                ))}
              </div>

              {/* DAY PLAN */}
              {plan.days_plan?.[activeDay] && (
                <div className="card mb-4">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-1 h-8 rounded-full bg-gradient-to-b from-amber-500 to-red-500" />
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider">Day {plan.days_plan[activeDay].day}</div>
                      <div className="font-semibold text-slate-100">{plan.days_plan[activeDay].title}</div>
                    </div>
                    {plan.days_plan[activeDay].date && (
                      <div className="ml-auto text-xs text-slate-600">{plan.days_plan[activeDay].date}</div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    {plan.days_plan[activeDay].slots?.map((slot, si) => (
                      <div key={si} className="flex gap-3 pb-5 relative">
                        <div className="flex flex-col items-center min-w-[14px]">
                          <div className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0"
                            style={{ background: TYPE_COLORS[slot.type] || '#64748b' }} />
                          {si < plan.days_plan[activeDay].slots.length - 1 && (
                            <div className="w-px flex-1 bg-brand-border mt-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-1">
                          <div className="text-xs text-slate-600 font-medium mb-1">{slot.time}</div>
                          <div className="text-sm font-semibold text-slate-200 mb-2">
                            {slot.icon} {slot.activity}
                          </div>
                          <div className="text-xs text-slate-500 leading-relaxed bg-brand-dark rounded-lg p-2.5 border border-brand-border">
                            💡 {slot.tip}
                          </div>
                          {slot.booking_link && (
                            <a href={slot.booking_link} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-amber-400 mt-2 hover:underline">
                              Book here <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HOTELS */}
              {plan.hotels?.length > 0 && (
                <div className="card mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Hotel className="w-4 h-4 text-slate-500" />
                    <span className="text-xs text-slate-500 tracking-widest uppercase font-semibold">Where to Stay</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {plan.hotels.map((h, i) => (
                      <div key={i} className="flex items-center justify-between p-3.5 bg-brand-dark rounded-xl border border-brand-border">
                        <div>
                          <div className="font-semibold text-sm text-slate-200 mb-1">{h.name}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold">
                              {h.tag}
                            </span>
                            <span className="text-xs text-slate-600">⭐ {h.rating}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-green-400">{h.price_range}</div>
                          <a href={h.booking_url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-amber-400 hover:underline mt-1">
                            Check <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FOOD */}
              {plan.food_recommendations?.length > 0 && (
                <div className="card mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Utensils className="w-4 h-4 text-slate-500" />
                    <span className="text-xs text-slate-500 tracking-widest uppercase font-semibold">What to Eat</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {plan.food_recommendations.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-slate-400">
                        <span className="text-green-400 mt-0.5">•</span> {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ROUTE HIGHLIGHTS */}
              {plan.route_highlights?.length > 0 && (
                <div className="card mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span className="text-xs text-slate-500 tracking-widest uppercase font-semibold">On Your Route</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {plan.route_highlights.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-slate-400">
                        <span className="text-blue-400 mt-0.5">→</span> {r}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PRACTICAL TIPS */}
              {plan.practical_tips?.length > 0 && (
                <div className="card mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-slate-500" />
                    <span className="text-xs text-slate-500 tracking-widest uppercase font-semibold">Must-Know Tips</span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {plan.practical_tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-3 bg-brand-dark rounded-xl border border-brand-border">
                        <span className="text-amber-400 font-bold mt-0.5 flex-shrink-0">•</span>
                        <span className="text-sm text-slate-400 leading-relaxed">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* BOOKING LINKS */}
              {plan.booking_links && (
                <div className="card mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Train className="w-4 h-4 text-slate-500" />
                    <span className="text-xs text-slate-500 tracking-widest uppercase font-semibold">Book Now</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {plan.booking_links.train && (
                      <a href={plan.booking_links.train} target="_blank" rel="noopener noreferrer"
                        className="btn-outline text-sm py-2 px-4 flex items-center gap-2">
                        🚂 Book Train on IRCTC <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {plan.booking_links.hotel && (
                      <a href={plan.booking_links.hotel} target="_blank" rel="noopener noreferrer"
                        className="btn-outline text-sm py-2 px-4 flex items-center gap-2">
                        🏨 Find Hotels <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {plan.booking_links.bus && (
                      <a href={plan.booking_links.bus} target="_blank" rel="noopener noreferrer"
                        className="btn-outline text-sm py-2 px-4 flex items-center gap-2">
                        🚌 Book Bus <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {plan.booking_links.flight && (
                      <a href={plan.booking_links.flight} target="_blank" rel="noopener noreferrer"
                        className="btn-outline text-sm py-2 px-4 flex items-center gap-2">
                        ✈️ Check Flights <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* REGEN BAR */}
              <div className={`card ${regenCount >= 3 ? 'border-red-500/30' : ''}`}>
                <div className="flex justify-between items-center flex-wrap gap-3">
                  <div>
                    <div className="font-semibold text-slate-200 text-sm">Not quite right?</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {regenCount >= 3
                        ? 'Upgrade to Pro for unlimited regenerations'
                        : `${3 - regenCount} free regeneration${3 - regenCount !== 1 ? 's' : ''} left`}
                    </div>
                  </div>
                  {regenCount < 3 ? (
                    <button onClick={handleRegen} disabled={regenLoading} className="btn-outline text-sm py-2 px-4 flex items-center gap-2">
                      <RefreshCw className={`w-3.5 h-3.5 ${regenLoading ? 'animate-spin' : ''}`} />
                      Regenerate
                    </button>
                  ) : (
                    <button onClick={() => setShowUpgrade(true)} className="btn-primary text-sm py-2 px-4">
                      ⚡ Upgrade to Pro
                    </button>
                  )}
                </div>
                {regenCount > 0 && regenCount < 3 && (
                  <div className="flex gap-1.5 mt-3">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="flex-1 h-1 rounded-full"
                        style={{ background: i < regenCount ? '#ef4444' : '#1e293b' }} />
                    ))}
                  </div>
                )}
              </div>

            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* UPGRADE MODAL */}
      {showUpgrade && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card max-w-sm w-full border-amber-500/30"
          >
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">⚡</div>
              <h3 className="font-display text-2xl font-normal text-slate-100 mb-2">Upgrade to Pro</h3>
              <p className="text-slate-500 text-sm">Unlimited planning. Zero limits.</p>
            </div>
            <div className="flex flex-col gap-2 mb-6">
              {[
                'Unlimited trip generations',
                'Unlimited regenerations',
                'Save unlimited trips',
                'Live availability alerts',
                'Shareable trip links',
                'Offline plan download',
              ].map(f => (
                <div key={f} className="flex items-center gap-2.5 text-sm text-slate-400">
                  <span className="text-green-400 font-bold">✓</span> {f}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <button className="btn-primary py-3 w-full">Start Pro — ₹99/month</button>
              <button className="btn-outline py-3 w-full">₹799/year (save 33%)</button>
              <button onClick={() => setShowUpgrade(false)} className="text-slate-600 text-sm py-2">
                Maybe later
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
