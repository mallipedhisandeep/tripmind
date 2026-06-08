'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const INTERESTS = ['Temples','Beaches','Mountains','Food','Adventure','Nature','Museums','Shopping','Monuments','Wildlife','Waterfalls','Forts']
const TRAVEL_WITH = [
  { value: 'solo', label: 'Solo', emoji: '🧍' },
  { value: 'couple', label: 'Couple', emoji: '👫' },
  { value: 'friends', label: 'Friends', emoji: '👯' },
  { value: 'family_kids', label: 'Family + Kids', emoji: '👨‍👩‍👧' },
  { value: 'family_elders', label: 'Family + Elders', emoji: '👴' },
]
const TRANSPORT = ['Train','Flight','Bus','Car','Any']
const STYLES = [
  { value: 'budget', label: 'Budget', desc: 'Under ₹5k/person', emoji: '💰' },
  { value: 'moderate', label: 'Moderate', desc: '₹5k–₹15k/person', emoji: '✈️' },
  { value: 'comfortable', label: 'Comfortable', desc: '₹15k–₹30k/person', emoji: '🌟' },
  { value: 'premium', label: 'Premium', desc: 'Above ₹30k/person', emoji: '💎' },
]
const STEPS = 5

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    home_city: '', travel_style: '', group_type: '',
    interests: [] as string[], preferred_transport: '',
  })

  const toggle = (key: 'interests', val: string) =>
    setForm(f => ({ ...f, [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val] }))

  const canNext = () => {
    if (step === 0) return form.home_city.trim().length > 0
    if (step === 1) return !!form.travel_style
    if (step === 2) return !!form.group_type
    if (step === 3) return form.interests.length > 0
    if (step === 4) return !!form.preferred_transport
    return true
  }

  const handleNext = async () => {
    if (step < STEPS - 1) { setStep(s => s + 1); return }
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')
      const { error } = await supabase.from('profiles').upsert({
        id: user.id, email: user.email,
        full_name: user.user_metadata?.full_name || '',
        avatar_url: user.user_metadata?.avatar_url || '',
        home_city: form.home_city, travel_style: form.travel_style,
        group_type: form.group_type, interests: form.interests,
        preferred_transport: form.preferred_transport.toLowerCase(),
        onboarding_complete: true, updated_at: new Date().toISOString(),
      })
      if (error) throw error
      toast.success('All set!')
      router.push('/dashboard')
    } catch { toast.error('Something went wrong'); setLoading(false) }
  }

  const pct = (step / (STEPS - 1)) * 100

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative" style={{ background: 'var(--bg)' }}>
      <div className="glow-1" /><div className="glow-2" />
      <div className="w-full max-w-md relative z-10">

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--text-3)' }}>
            <span>Setting up your profile</span><span>{step + 1}/{STEPS}</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <motion.div className="h-full rounded-full" animate={{ width: `${pct}%` }} transition={{ duration: 0.3 }}
              style={{ background: 'linear-gradient(90deg, #f59e0b, #f97316)' }} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card" style={{ padding: 28 }}>
              <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>Where are you based?</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--text-2)' }}>We'll use this to suggest the best routes from your city.</p>
              <label className="label">Home city</label>
              <input className="input" placeholder="e.g. Hyderabad, Mumbai, Delhi..."
                value={form.home_city} onChange={e => setForm(f => ({ ...f, home_city: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && canNext() && handleNext()} autoFocus />
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card" style={{ padding: 28 }}>
              <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>Travel style?</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--text-2)' }}>We'll match hotels and transport to your budget.</p>
              <div className="flex flex-col gap-2">
                {STYLES.map(s => (
                  <button key={s.value} onClick={() => setForm(f => ({ ...f, travel_style: s.value }))}
                    className="flex items-center gap-4 p-4 rounded-xl border text-left transition-all"
                    style={{ border: form.travel_style === s.value ? '1.5px solid var(--amber)' : '1px solid var(--border)', background: form.travel_style === s.value ? 'var(--amber-dim)' : 'var(--surface2)' }}>
                    <span className="text-2xl">{s.emoji}</span>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: form.travel_style === s.value ? 'var(--amber)' : 'var(--text)' }}>{s.label}</div>
                      <div className="text-xs" style={{ color: 'var(--text-2)' }}>{s.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card" style={{ padding: 28 }}>
              <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>Who do you travel with?</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--text-2)' }}>Plans adapt for kids, elders, or adventure groups.</p>
              <div className="grid grid-cols-2 gap-2">
                {TRAVEL_WITH.map(t => (
                  <button key={t.value} onClick={() => setForm(f => ({ ...f, group_type: t.value }))}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border transition-all"
                    style={{ border: form.group_type === t.value ? '1.5px solid var(--amber)' : '1px solid var(--border)', background: form.group_type === t.value ? 'var(--amber-dim)' : 'var(--surface2)' }}>
                    <span className="text-3xl">{t.emoji}</span>
                    <span className="text-xs font-semibold" style={{ color: form.group_type === t.value ? 'var(--amber)' : 'var(--text-2)' }}>{t.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card" style={{ padding: 28 }}>
              <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>What do you love?</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--text-2)' }}>Pick everything that excites you.</p>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map(i => (
                  <button key={i} onClick={() => toggle('interests', i)} className={`chip ${form.interests.includes(i) ? 'active' : ''}`}>{i}</button>
                ))}
              </div>
              {form.interests.length > 0 && <p className="text-xs mt-3" style={{ color: 'var(--amber)' }}>{form.interests.length} selected</p>}
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card" style={{ padding: 28 }}>
              <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>Preferred transport?</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--text-2)' }}>We'll recommend this by default on every trip.</p>
              <div className="flex flex-wrap gap-2">
                {TRANSPORT.map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, preferred_transport: t }))}
                    className={`chip ${form.preferred_transport === t ? 'active' : ''}`}>{t}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`flex gap-3 mt-4 ${step === 0 ? 'justify-end' : ''}`}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="btn btn-ghost flex-1 py-3">← Back</button>
          )}
          <button onClick={handleNext} disabled={!canNext() || loading}
            className="btn btn-primary flex-1 py-3 disabled:opacity-40">
            {loading ? 'Saving...' : step === STEPS - 1 ? 'Finish Setup ✨' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
