'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { TripForm } from '@/types'

const INTERESTS = ['Temples','Beaches','Mountains','Food','Adventure','Nature','Museums','Shopping','Monuments','Wildlife','Waterfalls','Forts']
const WITH = [
  { v: 'solo', l: 'Solo', e: '🧍' },
  { v: 'couple', l: 'Couple', e: '👫' },
  { v: 'friends', l: 'Friends', e: '👯' },
  { v: 'family_kids', l: 'Family + Kids', e: '👨‍👩‍👧' },
  { v: 'family_elders', l: 'Family + Elders', e: '👴' },
]
const TRANSPORT = ['Train','Flight','Bus','Car','Any']
const BUDGET = [
  { v: 'budget', l: 'Economy', d: 'Under ₹5k/person' },
  { v: 'moderate', l: 'Moderate', d: '₹5k–₹15k/person' },
  { v: 'comfortable', l: 'Comfortable', d: '₹15k–₹30k/person' },
  { v: 'premium', l: 'Premium', d: 'Above ₹30k/person' },
]
const AGES = ['Kids (0–12)','Teens (13–17)','Adults (18–40)','Middle-aged (40–60)','Seniors (60+)']

export default function PlanNewClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState<TripForm>({
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
    start_date: tomorrow, end_date: '',
    days: 2, travelers: 2,
    group_type: 'family_kids', age_groups: ['Adults (18–40)'],
    budget: 'moderate', interests: ['Temples'],
    transport: 'train', special_notes: '',
  })

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) setForm(f => ({
        ...f,
        from: f.from || data.home_city || '',
        group_type: data.group_type || 'family_kids',
        interests: data.interests?.length ? data.interests : ['Temples'],
        transport: data.preferred_transport || 'train',
        budget: data.travel_style || 'moderate',
      }))
    }
    load()
  }, [])

  const setDays = (days: number) => {
    setForm(f => {
      const start = new Date(f.start_date || tomorrow)
      const end = new Date(start)
      end.setDate(end.getDate() + days - 1)
      return { ...f, days, end_date: end.toISOString().split('T')[0] }
    })
  }

  const setStart = (date: string) => {
    setForm(f => {
      const start = new Date(date)
      const end = new Date(start)
      end.setDate(end.getDate() + f.days - 1)
      return { ...f, start_date: date, end_date: end.toISOString().split('T')[0] }
    })
  }

  const toggleArr = (key: 'interests' | 'age_groups', val: string) =>
    setForm(f => ({ ...f, [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val] }))

  const generate = async () => {
    if (!form.from.trim()) { toast.error('Enter starting city'); return }
    if (!form.to.trim()) { toast.error('Enter destination'); return }
    if (!form.interests.length) { toast.error('Pick at least one interest'); return }
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const { data: trip, error } = await supabase
        .from('trips').insert({ user_id: user.id, form_data: form, status: 'draft', regen_count: 0 })
        .select().single()
      if (error) throw error
      router.push(`/plan/${trip.id}?generating=true`)
    } catch { toast.error('Something went wrong. Try again.'); setLoading(false) }
  }

  const S = (active: boolean) => ({
    border: `1.5px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
    background: active ? 'var(--gold-dim)' : 'var(--s2)',
    borderRadius: 12, padding: '12px 14px',
    cursor: 'pointer', textAlign: 'left' as const, transition: 'all 0.15s',
  })

  const counter = (val: number, min: number, max: number, set: (n: number) => void) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <button onClick={() => set(Math.max(min, val - 1))}
        style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--s2)', color: 'var(--gold)', fontSize: 18, fontWeight: 700, cursor: 'pointer' }}>−</button>
      <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--t1)', minWidth: 28, textAlign: 'center' }}>{val}</span>
      <button onClick={() => set(Math.min(max, val + 1))}
        style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#e8a020,#f5bc4a)', border: 'none', color: '#0c0c0f', fontSize: 18, fontWeight: 700, cursor: 'pointer' }}>+</button>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      <div className="amb-1" /><div className="amb-2" />

      {/* NAV */}
      <nav className="glass" style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px' }}>
        <button onClick={() => router.push('/dashboard')} style={{ padding: 8, borderRadius: 10, background: 'transparent', border: 'none', color: 'var(--t2)', cursor: 'pointer' }}>
          <ArrowLeft style={{ width: 18, height: 18 }} />
        </button>
        <span className="font-display gold" style={{ fontSize: 18, fontWeight: 700 }}>Plan a Trip</span>
      </nav>

      <div style={{ position: 'relative', zIndex: 10, maxWidth: 560, margin: '0 auto', padding: '24px 20px 120px' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* From / To */}
          <div>
            <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--t1)', marginBottom: 16 }}>Where are you going?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label className="label">From</label>
                <input className="input" placeholder="e.g. Hyderabad" value={form.from} onChange={e => setForm(f => ({ ...f, from: e.target.value }))} /></div>
              <div><label className="label">To</label>
                <input className="input" placeholder="e.g. Tirupati" value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))} /></div>
            </div>
          </div>

          {/* Dates */}
          <div>
            <label className="label">Travel Dates</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div><label className="label" style={{ fontSize: 10 }}>Start</label>
                <input type="date" className="input" min={today} value={form.start_date} onChange={e => setStart(e.target.value)} /></div>
              <div><label className="label" style={{ fontSize: 10 }}>End (auto)</label>
                <input type="date" className="input" value={form.end_date} readOnly style={{ opacity: 0.45 }} /></div>
            </div>
            <label className="label">Days</label>
            {counter(form.days, 1, 14, setDays)}
          </div>

          {/* Travelers */}
          <div>
            <label className="label">Travelers</label>
            {counter(form.travelers, 1, 30, n => setForm(f => ({ ...f, travelers: n })))}
          </div>

          {/* Group */}
          <div>
            <label className="label">Traveling With</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {WITH.map(t => <button key={t.v} onClick={() => setForm(f => ({ ...f, group_type: t.v as any }))} className={`chip ${form.group_type === t.v ? 'active' : ''}`}>{t.e} {t.l}</button>)}
            </div>
          </div>

          {/* Ages */}
          <div>
            <label className="label">Age Groups</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {AGES.map(a => <button key={a} onClick={() => toggleArr('age_groups', a)} className={`chip ${form.age_groups.includes(a) ? 'active' : ''}`}>{a}</button>)}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="label">Budget Range</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {BUDGET.map(b => (
                <button key={b.v} onClick={() => setForm(f => ({ ...f, budget: b.v as any }))} style={S(form.budget === b.v)}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: form.budget === b.v ? 'var(--gold)' : 'var(--t1)' }}>{b.l}</div>
                  <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 2 }}>{b.d}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="label">Interests</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {INTERESTS.map(i => <button key={i} onClick={() => toggleArr('interests', i)} className={`chip ${form.interests.includes(i) ? 'active' : ''}`}>{i}</button>)}
            </div>
          </div>

          {/* Transport */}
          <div>
            <label className="label">Preferred Transport</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TRANSPORT.map(t => <button key={t} onClick={() => setForm(f => ({ ...f, transport: t.toLowerCase() as any }))} className={`chip ${form.transport === t.toLowerCase() ? 'active' : ''}`}>{t}</button>)}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="label">Special Notes (optional)</label>
            <textarea className="input" rows={3} style={{ resize: 'none' }}
              placeholder="e.g. Wheelchair access needed, prefer vegetarian, early morning starts..."
              value={form.special_notes} onChange={e => setForm(f => ({ ...f, special_notes: e.target.value }))} />
          </div>

          <button onClick={generate} disabled={loading} className="btn-gold" style={{ width: '100%', padding: '16px', fontSize: 15 }}>
            {loading ? '⏳ Saving trip...' : '✨ Generate My Trip Plan'}
          </button>
        </motion.div>
      </div>
    </div>
  )
}
