import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { GeneratedPlan } from '@/types'

export default async function SharePage({ params }: { params: { token: string } }) {
  const supabase = createClient()

  const { data: trip } = await supabase
    .from('trips')
    .select('*')
    .eq('share_token', params.token)
    .eq('share_enabled', true)
    .single()

  if (!trip) notFound()

  const plan: GeneratedPlan = trip.generated_plan

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Banner */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-500 py-3 text-center text-sm font-medium">
        Shared via TripMind · <a href="/" className="underline">Plan your own trip →</a>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-1">{plan.destination}</h1>
        <p className="text-gray-400 mb-2">{trip.form_data.from} → {plan.destination} · {plan.days} days</p>
        <p className="text-gray-300 mb-8">{plan.summary}</p>

        {plan.crowd_warning && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 text-sm text-yellow-300">
            ⚠️ {plan.crowd_warning}
          </div>
        )}

        {/* Budget */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Budget Estimate</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total (min)', value: `₹${plan.total_budget_min?.toLocaleString('en-IN')}` },
              { label: 'Total (max)', value: `₹${plan.total_budget_max?.toLocaleString('en-IN')}` },
              { label: 'Transport',  value: `₹${plan.budget_breakdown?.transport?.toLocaleString('en-IN')}` },
              { label: 'Stay',       value: `₹${plan.budget_breakdown?.accommodation?.toLocaleString('en-IN')}` },
              { label: 'Food',       value: `₹${plan.budget_breakdown?.food?.toLocaleString('en-IN')}` },
              { label: 'Activities', value: `₹${plan.budget_breakdown?.activities?.toLocaleString('en-IN')}` },
            ].map(b => (
              <div key={b.label} className="bg-gray-800 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-400 mb-1">{b.label}</div>
                <div className="font-bold text-orange-400">{b.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Days */}
        {plan.days_plan?.map(day => (
          <div key={day.day} className="mb-8">
            <h3 className="text-base font-bold bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 mb-3 flex items-center gap-2">
              <span className="bg-orange-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">{day.day}</span>
              {day.date} — {day.title}
            </h3>
            <div className="space-y-2">
              {day.slots?.map((slot, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex gap-3">
                  <span className="text-2xl">{slot.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-0.5">
                      <span className="text-xs text-gray-500">{slot.time}</span>
                      <span className="text-xs text-orange-400 capitalize">{slot.type}</span>
                    </div>
                    <p className="text-sm font-medium">{slot.activity}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{slot.tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Tips */}
        {plan.practical_tips?.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-semibold mb-3">Practical Tips</h2>
            <ul className="space-y-2">
              {plan.practical_tips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-300">
                  <span className="text-orange-400 mt-0.5">→</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-center py-6 border-t border-gray-800">
          <p className="text-gray-500 text-sm mb-4">Want to plan your own trip?</p>
          <a href="/" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl inline-block transition">
            Plan with TripMind →
          </a>
        </div>
      </div>
    </main>
  )
}
