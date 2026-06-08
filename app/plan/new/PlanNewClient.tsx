'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { TripForm } from '@/types'

const INTERESTS = ['Temples','Beaches','Mountains','Food','Adventure','Nature','Museums','Shopping','Monuments','Wildlife','Waterfalls','Forts']
const TRAVEL_WITH = [
  { value: 'solo', label: 'Solo', emoji: '🧍' },
  { value: 'couple', label: 'Couple', emoji: '👫' },
  { value: 'friends', label: 'Friends', emoji: '👯' },
  { value: 'family_kids', label: 'Family + Kids', emoji: '👨‍👩‍👧' },
  { value: 'family_elders', label: 'Family + Elders', emoji: '👴' },
]
const TRANSPORT = ['Train','Flight','Bus','Car','Any']
const BUDGET = [
  { value: 'budget', label: 'Economy', desc: 'Under ₹5k/person' },
  { value: 'moderate', label: 'Moderate', desc: '₹5k–₹15k/person' },
  { value: 'comfortable', label: 'Comfortable', desc: '₹15k–₹30k/person' },
  { value: 'premium', label: 'Premium', desc: 'Above ₹30k/person' },
]
const AGE_GROUPS = ['Kids (0–12)','Teens (13–17)','Adults (18–40)','Middle-aged (40–60)','Seniors (60+)']

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

  const handleDays = (days: number) => {
    setForm(f => {
      const start = new Date(f.start_date || tomorrow)
      const end = new Date(start)
      end.setDate(end.getDate() + days - 1)
      return { ...f, days, end_date: end.toISOString().split('T')[0] }
    })
  }

  const handleStartDate = (date: string) => {
    setForm(f => {
      const start = new Date(date)
      const end = new Date(start)
      end.setDate(end.getDate() + f.days - 1)
      return { ...f, start_date: date, end_date: end.toISOString().split('T')[0] }
    })
  }

  const toggle = (key: 'interests' | 'age_groups', val: string) =>
    setForm(f => ({ ...f, [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val] }))

  const handleGenerate = async () => {
    if (!form.from.trim()) { toast.error('Enter starting city'); return }
    if (!form.to.trim()) { toast.error('Enter destination'); return }
    if (form.interests.length === 0) { toast.error('Pick at least one interest'); return }
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')
      const { data: trip, error } = await supabase
        .from('trips').insert({ user_id: user.id, form_data: form, status: 'draft', regen_count: 0 })
        .select().single()
      if (error) throw error
      router.push(`/plan/${trip.id}?generating=true`)
    } catch { toast.error('Something went wrong. Try again.'); setLoading(false) }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="glow-1" /><div className="glow-2" />
      <nav className="glass sticky top-0 z-50 flex items-center gap-3 px-5 py-4 border-b border-[var(--border)]">
        <button onClick={() => router.push('/dashboard')} className="p-2 rounded-xl transition-colors" style={{ color: 'var(--text-2)' }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="font-display text-lg font-bold gradient-text">Plan a Trip</div>
      </nav>

      <div className="relative z-10 max-w-xl mx-auto px-5 pb-32 pt-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">

          <div>
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: 'var(--text)' }}>Where are you going?</h2>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">From</label>
                <input className="input" placeholder="e.g. Hyderabad" value={form.from} onChange={e => setForm(f => ({ ...f, from: e.target.value }))} /></div>
              <div><label className="label">To</label>
                <input className="input" placeholder="e.g. Tirupati" value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))} /></div>
            </div>
          </div>

          <div>
            <label className="label">Travel Dates</label>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className="label" style={{ fontSize: 10 }}>Start Date</label>
                <input type="date" className="input" min={today} value={form.start_date} onChange={e => handleStartDate(e.target.value)} /></div>
              <div><label className="label" style={{ fontSize: 10 }}>End Date</label>
                <input type="date" className="input" value={form.end_date} readOnly style={{ opacity: 0.5 }} /></div>
            </div>
            <label className="label">Number of Days</label>
            <div className="flex items-center gap-4">
              <button onClick={() => handleDays(Math.max(1, form.days - 1))}
                className="w-10 h-10 rounded-xl border font-bold text-lg" style={{ borderColor: 'var(--border)', color: 'var(--amber)', background: 'var(--surface2)' }}>−</button>
              <span className="text-2xl font-bold w-8 text-center" style={{ color: 'var(--text)' }}>{form.days}</span>
              <button onClick={() => handleDays(Math.min(14, form.days + 1))}
                className="w-10 h-10 rounded-xl font-bold text-lg" style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)', color: '#080810' }}>+</button>
            </div>
          </div>

          <div>
            <label className="label">Number of Travelers</label>
            <div className="flex items-center gap-4">
              <button onClick={() => setForm(f => ({ ...f, travelers: Math.max(1, f.travelers - 1) }))}
                className="w-10 h-10 rounded-xl border font-bold text-lg" style={{ borderColor: 'var(--border)', color: 'var(--amber)', background: 'var(--surface2)' }}>−</button>
              <span className="text-2xl font-bold w-8 text-center" style={{ color: 'var(--text)' }}>{form.travelers}</span>
              <button onClick={() => setForm(f => ({ ...f, travelers: Math.min(30, f.travelers + 1) }))}
                className="w-10 h-10 rounded-xl font-bold text-lg" style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)', color: '#080810' }}>+</button>
            </div>
          </div>

          <div><label className="label">Traveling With</label>
            <div className="flex flex-wrap gap-2">
              {TRAVEL_WITH.map(t => (
                <button key={t.value} onClick={() => setForm(f => ({ ...f, group_type: t.value as any }))}
                  className={`chip ${form.group_type === t.value ? 'active' : ''}`}>{t.emoji} {t.label}</button>
              ))}
            </div>
          </div>

          <div><label className="label">Age Groups</label>
            <div className="flex flex-wrap gap-2">
              {AGE_GROUPS.map(a => (
                <button key={a} onClick={() => toggle('age_groups', a)}
                  className={`chip ${form.age_groups.includes(a) ? 'active' : ''}`}>{a}</button>
              ))}
            </div>
          </div>

          <div><label className="label">Budget Range</label>
            <div className="grid grid-cols-2 gap-2">
              {BUDGET.map(b => (
                <button key={b.value} onClick={() => setForm(f => ({ ...f, budget: b.value as any }))}
                  className="p-3 rounded-xl border text-left transition-all"
                  style={{ border: form.budget === b.value ? '1.5px solid var(--amber)' : '1px solid var(--border)', background: form.budget === b.value ? 'var(--amber-dim)' : 'var(--surface2)' }}>
                  <div className="text-sm font-semibold" style={{ color: form.budget === b.value ? 'var(--amber)' : 'var(--text)' }}>{b.label}</div>
                  <div className="text-xs" style={{ color: 'var(--text-2)' }}>{b.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div><label className="label">Interests</label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(i => (
                <button key={i} onClick={() => toggle('interests', i)}
                  className={`chip ${form.interests.includes(i) ? 'active' : ''}`}>{i}</button>
              ))}
            </div>
          </div>

          <div><label className="label">Preferred Transport</label>
            <div className="flex flex-wrap gap-2">
              {TRANSPORT.map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, transport: t.toLowerCase() as any }))}
                  className={`chip ${form.transport === t.toLowerCase() ? 'active' : ''}`}>{t}</button>
              ))}
            </div>
          </div>

          <div><label className="label">Anything special? (optional)</label>
            <textarea className="input resize-none" rows={3}
              placeholder="e.g. One person uses a wheelchair, prefer vegetarian food, early morning starts..."
              value={form.special_notes} onChange={e => setForm(f => ({ ...f, special_notes: e.target.value }))} />
          </div>

          <button onClick={handleGenerate} disabled={loading} className="btn btn-primary w-full py-4 text-base disabled:opacity-40">
            {loading ? '⏳ Saving...' : '✨ Generate My Trip Plan'}
          </button>

        </motion.div>
      </div>
    </div>
  )
}
