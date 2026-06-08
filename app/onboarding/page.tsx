'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const INTERESTS = ['Temples','Beaches','Mountains','Food','Adventure','Nature','Museums','Shopping','Monuments','Wildlife','Waterfalls','Forts']
const WITH = [
  { v: 'solo', l: 'Solo', e: '🧍' },
  { v: 'couple', l: 'Couple', e: '👫' },
  { v: 'friends', l: 'Friends', e: '👯' },
  { v: 'family_kids', l: 'Family + Kids', e: '👨‍👩‍👧' },
  { v: 'family_elders', l: 'Family + Elders', e: '👴' },
]
const TRANSPORT = ['Train','Flight','Bus','Car','Any']
const STYLES = [
  { v: 'budget', l: 'Budget', d: 'Under ₹5k/person', e: '💰' },
  { v: 'moderate', l: 'Moderate', d: '₹5k–₹15k/person', e: '✈️' },
  { v: 'comfortable', l: 'Comfortable', d: '₹15k–₹30k/person', e: '🌟' },
  { v: 'premium', l: 'Premium', d: 'Above ₹30k/person', e: '💎' },
]

export default function OnboardingPage() {
  const supabase = createClient()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ home_city: '', travel_style: '', group_type: '', interests: [] as string[], preferred_transport: '' })

  const toggle = (val: string) => setForm(f => ({ ...f, interests: f.interests.includes(val) ? f.interests.filter(x => x !== val) : [...f.interests, val] }))

  const ok = () => {
    if (step === 0) return form.home_city.trim().length > 0
    if (step === 1) return !!form.travel_style
    if (step === 2) return !!form.group_type
    if (step === 3) return form.interests.length > 0
    if (step === 4) return !!form.preferred_transport
    return true
  }

  const next = async () => {
    if (step < 4) { setStep(s => s + 1); return }
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')
      const { error } = await supabase.from('profiles').upsert({
        id: user.id, email: user.email,
        full_name: user.user_metadata?.full_name || '',
        avatar_url: user.user_metadata?.avatar_url || '',
        ...form,
        preferred_transport: form.preferred_transport.toLowerCase(),
        onboarding_complete: true,
        updated_at: new Date().toISOString(),
      })
      if (error) throw error
      toast.success('Profile saved!')
      window.location.href = '/dashboard'
    } catch { toast.error('Something went wrong'); setSaving(false) }
  }

  const pct = (step / 4) * 100

  const sel = (active: boolean) => ({
    border: `1.5px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
    background: active ? 'var(--gold-dim)' : 'var(--s2)',
    borderRadius: 14, padding: '14px 16px', cursor: 'pointer', textAlign: 'left' as const, transition: 'all 0.15s', width: '100%',
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      <div className="amb-1" /><div className="amb-2" />
      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 10 }}>

        {/* Progress */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--t3)', marginBottom: 8 }}>
            <span>Setting up your profile</span><span>{step + 1}/5</span>
          </div>
          <div style={{ height: 3, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
            <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.3 }}
              style={{ height: '100%', background: 'linear-gradient(90deg,#e8a020,#f5bc4a)', borderRadius: 99 }} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}
            style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 24, padding: 28 }}>

            {step === 0 && <>
              <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>Where are you based?</h2>
              <p style={{ color: 'var(--t2)', fontSize: 13, marginBottom: 20 }}>We'll suggest the best routes from your city.</p>
              <label className="label">Home city</label>
              <input className="input" placeholder="e.g. Hyderabad, Mumbai, Delhi..." value={form.home_city}
                onChange={e => setForm(f => ({ ...f, home_city: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && ok() && next()} autoFocus />
            </>}

            {step === 1 && <>
              <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>Your travel style?</h2>
              <p style={{ color: 'var(--t2)', fontSize: 13, marginBottom: 20 }}>We'll match hotels and transport to your budget.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {STYLES.map(s => (
                  <button key={s.v} onClick={() => setForm(f => ({ ...f, travel_style: s.v }))} style={sel(form.travel_style === s.v)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 22 }}>{s.e}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: form.travel_style === s.v ? 'var(--gold)' : 'var(--t1)' }}>{s.l}</div>
                        <div style={{ fontSize: 12, color: 'var(--t2)' }}>{s.d}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>}

            {step === 2 && <>
              <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>Who do you travel with?</h2>
              <p style={{ color: 'var(--t2)', fontSize: 13, marginBottom: 20 }}>Plans adapt for kids, elders or adventure groups.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {WITH.map(t => (
                  <button key={t.v} onClick={() => setForm(f => ({ ...f, group_type: t.v }))} style={{ ...sel(form.group_type === t.v), display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 12px' }}>
                    <span style={{ fontSize: 28, marginBottom: 6 }}>{t.e}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: form.group_type === t.v ? 'var(--gold)' : 'var(--t2)' }}>{t.l}</span>
                  </button>
                ))}
              </div>
            </>}

            {step === 3 && <>
              <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>What do you love?</h2>
              <p style={{ color: 'var(--t2)', fontSize: 13, marginBottom: 20 }}>Pick everything that excites you.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {INTERESTS.map(i => <button key={i} onClick={() => toggle(i)} className={`chip ${form.interests.includes(i) ? 'active' : ''}`}>{i}</button>)}
              </div>
              {form.interests.length > 0 && <p style={{ color: 'var(--gold)', fontSize: 11, marginTop: 10 }}>{form.interests.length} selected</p>}
            </>}

            {step === 4 && <>
              <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>Preferred transport?</h2>
              <p style={{ color: 'var(--t2)', fontSize: 13, marginBottom: 20 }}>We'll recommend this by default on every trip.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {TRANSPORT.map(t => <button key={t} onClick={() => setForm(f => ({ ...f, preferred_transport: t }))} className={`chip ${form.preferred_transport === t ? 'active' : ''}`}>{t}</button>)}
              </div>
            </>}
          </motion.div>
        </AnimatePresence>

        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          {step > 0 && <button onClick={() => setStep(s => s - 1)} className="btn-ghost" style={{ flex: 1, padding: '13px' }}>← Back</button>}
          <button onClick={next} disabled={!ok() || saving} className="btn-gold" style={{ flex: 1, padding: '13px', fontSize: 14, opacity: (!ok() || saving) ? 0.4 : 1 }}>
            {saving ? 'Saving...' : step === 4 ? 'Finish Setup ✨' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
