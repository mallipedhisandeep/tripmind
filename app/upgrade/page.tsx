'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useI18n } from '@/lib/i18n'

declare global {
  interface Window { Razorpay: any }
}

const FEATURES = [
  'Unlimited trip generations',
  'Unlimited regenerations',
  'Save unlimited trips',
  'Live availability alerts via WhatsApp',
  'Shareable trip links',
  'Offline PDF download',
  'Group trip planning (invite friends)',
  'Priority support',
]

export default function UpgradePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-500 text-sm">Loading...</div>
      </main>
    }>
      <UpgradePageInner />
    </Suspense>
  )
}

function UpgradePageInner() {
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const initialPlan = searchParams.get('plan') === 'monthly' ? 'monthly' : 'yearly'
  const [plan, setPlan]       = useState<'monthly' | 'yearly'>(initialPlan)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

  const loadRazorpay = (): Promise<boolean> =>
    new Promise(resolve => {
      if (window.Razorpay) return resolve(true)
      const s = document.createElement('script')
      s.src = 'https://checkout.razorpay.com/v1/checkout.js'
      s.onload = () => resolve(true)
      s.onerror = () => resolve(false)
      document.body.appendChild(s)
    })

  const handlePay = async () => {
    setLoading(true); setError('')
    const ok = await loadRazorpay()
    if (!ok) { setError('Failed to load payment gateway'); setLoading(false); return }

    const res = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const order = await res.json()
    if (!res.ok) { setError(order.error); setLoading(false); return }

    const rzp = new window.Razorpay({
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      name: 'TripMind Pro',
      description: plan === 'yearly' ? 'Yearly plan — ₹799' : 'Monthly plan — ₹99',
      order_id: order.order_id,
      prefill: { email: order.user_email },
      theme: { color: '#f97316' },
      handler: async (response: any) => {
        const verifyRes = await fetch('/api/razorpay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...response, plan }),
        })
        if (verifyRes.ok) {
          setSuccess(true)
        } else {
          setError('Payment verification failed. Contact support.')
        }
        setLoading(false)
      },
      modal: { ondismiss: () => setLoading(false) },
    })
    rzp.open()
  }

  if (success) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-2xl font-bold mb-3">Welcome to Pro!</h1>
          <p className="text-gray-400 mb-8">All features are now unlocked. Happy planning!</p>
          <a href="/dashboard" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl inline-block transition">Go to Dashboard</a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 px-4 py-1.5 rounded-full text-orange-400 text-sm mb-6">
            ✨ Pro
          </div>
          <h1 className="text-4xl font-bold mb-3">{t.proTitle}</h1>
          <p className="text-gray-400">{t.proSubtitle}</p>
        </div>

        {/* Plan toggle */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-2 flex gap-2 mb-8">
          {(['monthly', 'yearly'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPlan(p)}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition relative ${plan === p ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              {p === 'yearly' ? t.yearly : t.monthly}
              {p === 'yearly' && (
                <span className="absolute -top-2 right-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full">{t.savePercent}</span>
              )}
            </button>
          ))}
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-10">
          {FEATURES.map(f => (
            <li key={f} className="flex items-center gap-3 text-sm">
              <span className="text-orange-400 text-lg">✓</span>
              <span className="text-gray-300">{f}</span>
            </li>
          ))}
        </ul>

        {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-4 rounded-xl text-lg transition"
        >
          {loading ? 'Opening payment...' : `Pay ${plan === 'yearly' ? '₹799/yr' : '₹99/mo'}`}
        </button>

        <p className="text-center text-xs text-gray-600 mt-4">Secured by Razorpay · Cancel anytime</p>
      </div>
    </main>
  )
}
