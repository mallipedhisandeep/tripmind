import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const RAZORPAY_KEY_ID     = process.env.RAZORPAY_KEY_ID     ?? 'PLACEHOLDER_KEY_ID'
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? 'PLACEHOLDER_KEY_SECRET'

const PLANS = {
  monthly: { amount: 9900,  label: 'TripMind Pro — Monthly' },  // ₹99 in paise
  yearly:  { amount: 79900, label: 'TripMind Pro — Yearly' },   // ₹799 in paise
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await req.json()
  if (!plan || !(plan in PLANS)) {
    return NextResponse.json({ error: 'Invalid plan. Use monthly or yearly.' }, { status: 400 })
  }

  const { amount, label } = PLANS[plan as keyof typeof PLANS]

  // Create Razorpay order
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64'),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount,
      currency: 'INR',
      receipt: `tripmind_${user.id.slice(0, 8)}_${Date.now()}`,
      notes: { user_id: user.id, plan, label },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Razorpay order error:', err)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }

  const order = await res.json()

  // Log payment attempt
  await supabase.from('payments').insert({
    user_id: user.id,
    razorpay_order: order.id,
    plan,
    amount,
    status: 'created',
  })

  return NextResponse.json({
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
    key_id: RAZORPAY_KEY_ID,
    user_email: user.email,
  })
}
