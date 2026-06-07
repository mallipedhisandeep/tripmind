'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { TripForm } from '@/types'

const INTERESTS = ['Temples', 'Beaches', 'Mountains', 'Food', 'Adventure', 'Nature', 'Museums', 'Shopping', 'Monuments', 'Wildlife', 'Waterfalls', 'Forts']
const TRAVEL_WITH = [
  { value: 'solo', label: 'Solo', emoji: '🧍' },
  { value: 'couple', label: 'Couple', emoji: '👫' },
  { value: 'friends', label: 'Friends', emoji: '👯' },
  { value: 'family_kids', label: 'Family + Kids', emoji: '👨‍👩‍👧' },
  { value: 'family_elders', label: 'Family + Elders', emoji: '👴' },
]
const TRANSPORT = ['Train', 'Flight', 'Bus', 'Car', 'Any']
const BUDGET = [
  { value: 'budget', label: 'Economy', desc: 'Under ₹5k/person' },
  { value: 'moderate', label: 'Moderate', desc: '₹5k–₹15k/person' },
  { value: 'comfortable', label: 'Comfortable', desc: '₹15k–₹30k/person' },
  { value: 'premium', label: 'Premium', desc: 'Above ₹30k/person' },
]
const AGE_GROUPS = ['Kids (0–12)', 'Teens (13–17)', 'Adults (18–40)', 'Middle-aged (40–60)', 'Seniors (60+)']

export default function PlanNewClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  const [form, setForm] = useState<TripForm>({
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
    start_date: tomorrow,
    end_date: '',
    days: 2,
    travelers: 2,
    group_type: 'family_kids',
    age_groups: ['Adults (18–40)'],
    budget: 'moderate',
    interests: ['Temples'],
    transport: 'train',
    special_notes: '',
  })

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setForm(f => ({
          ...f,
          from: f.from || data.home_city || '',
          group_type: data.group_type || 'family_kids',
          interests: data.interests?.length ? data.interests : ['Temples'],
          transport: data.preferred_transport || 'train',
          budget: data.travel_style || 'moderate',
        }))
      }
    }
    loadProfile()
  }, [])

  const handleStartDate = (date: string) => {
    setForm(f => {
      const start = new Date(date)
      const end = new Date(start)
      end.setDate(end.getDate() + f.days - 1)
      return {
        ...f,
        start_date: date,
        end_date: end.toISOString().split('T')[0],
      }
    })
  }

  const handleDays = (days: number) => {
    setForm(f => {
      const start = new Date(f.start_date || tomorrow)
      const end = new Date(start)
      end.setDate(end.getDate() + days - 1)
      return {
        ...f,
        days,
        end_date: end.toISOString().split('T')[0],
      }
    })
  }

  const toggleInterest = (i: string) => {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(i)
        ? f.interests.filter(x => x !== i)
        : [...f.interests, i],
    }))
  }

  const toggleAgeGroup = (a: string) => {
    setForm(f => ({
      ...f,
      age_groups: f.age_groups.includes(a)
        ? f.age_groups.filter(x => x !== a)
        : [...f.age_groups, a],
    }))
  }

  const handleGenerate = async () => {
    if (!form.from.trim()) { toast.error('Enter your starting city'); return }
    if (!form.to.trim()) { toast.error('Enter your destination'); return }
    if (!form.start_date) { toast.error('Select travel dates'); return }
    if (form.interests.length === 0) { toast.error('Select at least one interest'); return }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')

      const { data: trip, error } = await supabase
        .from('trips')
        .insert({
          user_id: user.id,
          form_data: form,
          status: 'draft',
          regen_count: 0,
        })
        .select()
        .single()

      if (error) throw error

      router.push(`/plan/${trip.id}?generating=true`)
    } catch (err) {
      toast.error('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-dark relative overflow-hidden">
      <div className="glow-amber" />
      <div className="glow-red" />

      {/* NAV */}
      <nav className="sticky top-0 z-50 flex items-center gap-3 px-6 py-4 border-b border-brand-border backdrop-blur-md bg-brand-dark/80">
        <button onClick={() => router.push('/dashboard')} className="p-2 text-slate-500 hover:text-slate-300 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="font-display text-lg gradient-text font-bold">Plan a Trip</div>
      </nav>

      <div className="relative z-10 max-w-xl mx-auto px-6 pb-32 pt-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">

          {/* From / To */}
          <div>
            <h2 className="font-display text-2xl text-slate-100 font-normal mb-4">Where are you going?</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">From</label>
                <input className="input" placeholder="e.g. Hyderabad" value={form.from}
                  onChange={e => setForm(f => ({ ...f, from: e.target.value }))} />
              </div>
              <div>
                <label className="label">To</label>
                <input className="input" placeholder="e.g. Tirupati" value={form.to}
                  onChange={e => setForm(f => ({ ...f, to: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Dates & Days */}
          <div>
            <label className="label">Travel Dates</label>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="label" style={{ fontSize: 10 }}>Start Date</label>
                <input type="date" className="input" min={today} value={form.start_date}
                  onChange={e => handleStartDate(e.target.value)} />
              </div>
              <div>
                <label className="label" style={{ fontSize: 10 }}>End Date</label>
                <input type="date" className="input" value={form.end_date} readOnly
                  style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              </div>
            </div>
            <div>
              <label className="label">Number of Days</label>
              <div className="flex items-center gap-4">
                <button onClick={() => handleDays(Math.max(1, form.days - 1))}
                  className="w-10 h-10 rounded-xl border border-brand-border text-amber-400 font-bold text-lg hover:bg-brand-border transition-colors">−</button>
                <span className="text-2xl font-bold text-slate-100 w-8 text-center">{form.days}</span>
                <button onClick={() => handleDays(Math.min(14, form.days + 1))}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-500 text-brand-dark font-bold text-lg hover:opacity-90 transition-opacity">+</button>
                <span className="text-slate-500 text-sm">{form.days === 1 ? '1 day' : `${form.days} days`}</span>
              </div>
            </div>
          </div>

          {/* Travelers */}
          <div>
            <label className="label">Number of Travelers</label>
            <div className="flex items-center gap-4">
              <button onClick={() => setForm(f => ({ ...f, travelers: Math.max(1, f.travelers - 1) }))}
                className="w-10 h-10 rounded-xl border border-brand-border text-amber-400 font-bold text-lg hover:bg-brand-border transition-colors">−</button>
              <span className="text-2xl font-bold text-slate-100 w-8 text-center">{form.travelers}</span>
              <button onClick={() => setForm(f => ({ ...f, travelers: Math.min(30, f.travelers + 1) }))}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-500 text-brand-dark font-bold text-lg hover:opacity-90 transition-opacity">+</button>
              <span className="text-slate-500 text-sm">{form.travelers} {form.travelers === 1 ? 'person' : 'people'}</span>
            </div>
          </div>

          {/* Group Type */}
          <div>
            <label className="label">Traveling With</label>
            <div className="flex flex-wrap gap-2">
              {TRAVEL_WITH.map(t => (
                <button key={t.value}
                  onClick={() => setForm(f => ({ ...f, group_type: t.value as any }))}
                  className={`chip ${form.group_type === t.value ? 'active' : ''}`}>
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Age Groups */}
          <div>
            <label className="label">Age Groups in Your Party</label>
            <div className="flex flex-wrap gap-2">
              {AGE_GROUPS.map(a => (
                <button key={a}
                  onClick={() => toggleAgeGroup(a)}
                  className={`chip ${form.age_groups.includes(a) ? 'active' : ''}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="label">Budget Range</label>
            <div className="grid grid-cols-2 gap-2">
              {BUDGET.map(b => (
                <button key={b.value}
                  onClick={() => setForm(f => ({ ...f, budget: b.value as any }))}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    form.budget === b.value
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-brand-border hover:border-slate-600'
                  }`}>
                  <div className={`text-sm font-semibold ${form.budget === b.value ? 'text-amber-400' : 'text-slate-300'}`}>{b.label}</div>
                  <div className="text-xs text-slate-500">{b.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="label">Interests</label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(i => (
                <button key={i}
                  onClick={() => toggleInterest(i)}
                  className={`chip ${form.interests.includes(i) ? 'active' : ''}`}>
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Transport */}
          <div>
            <label className="label">Preferred Transport</label>
            <div className="flex flex-wrap gap-2">
              {TRANSPORT.map(t => (
                <button key={t}
                  onClick={() => setForm(f => ({ ...f, transport: t.toLowerCase() as any }))}
                  className={`chip ${form.transport === t.toLowerCase() ? 'active' : ''}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Special Notes */}
          <div>
            <label className="label">Anything special? (optional)</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="e.g. One person uses a wheelchair, we want to avoid spicy food, prefer early morning starts..."
              value={form.special_notes}
              onChange={e => setForm(f => ({ ...f, special_notes: e.target.value }))}
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn-primary w-full py-4 text-lg disabled:opacity-50"
          >
            {loading ? '⏳ Creating your trip...' : '✨ Generate My Trip Plan'}
          </button>

        </motion.div>
      </div>
    </div>
  )
}
