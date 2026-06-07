'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const INTERESTS = ['Temples', 'Beaches', 'Mountains', 'Food', 'Adventure', 'Nature', 'Museums', 'Shopping', 'Monuments', 'Wildlife', 'Waterfalls', 'Forts']
const TRAVEL_WITH = [
  { value: 'solo', label: 'Solo', emoji: '🧍' },
  { value: 'couple', label: 'Couple', emoji: '👫' },
  { value: 'friends', label: 'Friends', emoji: '👯' },
  { value: 'family_kids', label: 'Family + Kids', emoji: '👨‍👩‍👧' },
  { value: 'family_elders', label: 'Family + Elders', emoji: '👴' },
]
const TRANSPORT = ['Train', 'Flight', 'Bus', 'Car', 'Any']
const TRAVEL_STYLES = [
  { value: 'budget', label: 'Budget', desc: 'Under ₹5k/person', emoji: '💰' },
  { value: 'moderate', label: 'Moderate', desc: '₹5k–₹15k/person', emoji: '✈️' },
  { value: 'comfortable', label: 'Comfortable', desc: '₹15k–₹30k/person', emoji: '🌟' },
  { value: 'premium', label: 'Premium', desc: 'Above ₹30k/person', emoji: '💎' },
]

const STEPS = ['Welcome', 'Home City', 'Travel Style', 'Group Type', 'Interests', 'Transport']

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    home_city: '',
    travel_style: '',
    group_type: '',
    interests: [] as string[],
    preferred_transport: '',
  })

  const toggleInterest = (i: string) => {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(i)
        ? f.interests.filter(x => x !== i)
        : [...f.interests, i],
    }))
  }

  const canProceed = () => {
    if (step === 1) return form.home_city.trim().length > 0
    if (step === 2) return form.travel_style !== ''
    if (step === 3) return form.group_type !== ''
    if (step === 4) return form.interests.length > 0
    if (step === 5) return form.preferred_transport !== ''
    return true
  }

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      await handleSubmit()
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || '',
        avatar_url: user.user_metadata?.avatar_url || '',
        home_city: form.home_city,
        travel_style: form.travel_style,
        group_type: form.group_type,
        interests: form.interests,
        preferred_transport: form.preferred_transport.toLowerCase(),
        onboarding_complete: true,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error
      toast.success('Profile saved! Let\'s plan your first trip.')
      router.push('/dashboard')
    } catch (err) {
      toast.error('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const progress = ((step) / (STEPS.length - 1)) * 100

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center px-6 relative overflow-hidden">
      <div className="glow-amber" />
      <div className="glow-red" />

      <div className="w-full max-w-md relative z-10">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-slate-600 mb-2">
            <span>Setting up your profile</span>
            <span>{step + 1} of {STEPS.length}</span>
          </div>
          <div className="h-1.5 bg-brand-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 0 - Welcome */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card text-center py-10">
              <div className="text-5xl mb-4">✈️</div>
              <h2 className="font-display text-3xl font-normal text-slate-100 mb-3">Welcome to TripMind</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                Let&apos;s take 60 seconds to understand your travel style. Every plan we generate will be personalized just for you.
              </p>
              <button onClick={handleNext} className="btn-primary px-10 py-3">
                Let&apos;s Go →
              </button>
            </motion.div>
          )}

          {/* Step 1 - Home City */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card">
              <h2 className="font-display text-2xl font-normal text-slate-100 mb-2">Where are you based?</h2>
              <p className="text-slate-500 text-sm mb-6">Your home city helps us suggest the best routes and transport options for you.</p>
              <input
                type="text"
                className="input"
                placeholder="e.g. Hyderabad, Mumbai, Delhi..."
                value={form.home_city}
                onChange={e => setForm(f => ({ ...f, home_city: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && canProceed() && handleNext()}
                autoFocus
              />
            </motion.div>
          )}

          {/* Step 2 - Travel Style */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card">
              <h2 className="font-display text-2xl font-normal text-slate-100 mb-2">What&apos;s your travel style?</h2>
              <p className="text-slate-500 text-sm mb-6">We&apos;ll suggest hotels, trains, and activities that fit your budget.</p>
              <div className="flex flex-col gap-3">
                {TRAVEL_STYLES.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setForm(f => ({ ...f, travel_style: s.value }))}
                    className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                      form.travel_style === s.value
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-brand-border bg-brand-border/30 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-2xl">{s.emoji}</span>
                    <div>
                      <div className={`font-semibold text-sm ${form.travel_style === s.value ? 'text-amber-400' : 'text-slate-300'}`}>{s.label}</div>
                      <div className="text-xs text-slate-500">{s.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3 - Group Type */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card">
              <h2 className="font-display text-2xl font-normal text-slate-100 mb-2">Who do you usually travel with?</h2>
              <p className="text-slate-500 text-sm mb-6">Plans will be tailored for your group — kid-friendly, elder-friendly, or adventure-ready.</p>
              <div className="grid grid-cols-2 gap-3">
                {TRAVEL_WITH.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setForm(f => ({ ...f, group_type: t.value }))}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      form.group_type === t.value
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-brand-border hover:border-slate-600'
                    }`}
                  >
                    <span className="text-3xl">{t.emoji}</span>
                    <span className={`text-xs font-semibold ${form.group_type === t.value ? 'text-amber-400' : 'text-slate-400'}`}>{t.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 4 - Interests */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card">
              <h2 className="font-display text-2xl font-normal text-slate-100 mb-2">What do you love?</h2>
              <p className="text-slate-500 text-sm mb-6">Pick everything that excites you. We&apos;ll prioritize these in every plan.</p>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map(i => (
                  <button
                    key={i}
                    onClick={() => toggleInterest(i)}
                    className={`chip ${form.interests.includes(i) ? 'active' : ''}`}
                  >
                    {i}
                  </button>
                ))}
              </div>
              {form.interests.length > 0 && (
                <p className="text-xs text-amber-500 mt-3">{form.interests.length} selected</p>
              )}
            </motion.div>
          )}

          {/* Step 5 - Transport */}
          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card">
              <h2 className="font-display text-2xl font-normal text-slate-100 mb-2">Preferred way to travel?</h2>
              <p className="text-slate-500 text-sm mb-6">We&apos;ll recommend this by default, but you can always change it per trip.</p>
              <div className="flex flex-wrap gap-2">
                {TRANSPORT.map(t => (
                  <button
                    key={t}
                    onClick={() => setForm(f => ({ ...f, preferred_transport: t }))}
                    className={`chip ${form.preferred_transport === t ? 'active' : ''}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {step > 0 && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setStep(s => s - 1)}
              className="btn-outline flex-1 py-3"
            >
              ← Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed() || loading}
              className="btn-primary flex-1 py-3 disabled:opacity-40"
            >
              {loading ? 'Saving...' : step === STEPS.length - 1 ? 'Finish Setup ✨' : 'Next →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
