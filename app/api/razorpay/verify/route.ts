import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { createClient } from '@/lib/supabase/server'

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? 'PLACEHOLDER_KEY_SECRET'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = await req.json()

  // Verify signature
  const expectedSig = createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expectedSig !== razorpay_signature) {
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
  }

  // Calculate expiry
  const now = new Date()
  const expiresAt = new Date(now)
  if (plan === 'yearly') {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)
  } else {
    expiresAt.setMonth(expiresAt.getMonth() + 1)
  }

  // Upgrade user to Pro
  await supabase
    .from('profiles')
    .update({ is_pro: true, pro_expires_at: expiresAt.toISOString() })
    .eq('id', user.id)

  // Update payment record
  await supabase
    .from('payments')
    .update({ razorpay_payment: razorpay_payment_id, status: 'paid' })
    .eq('razorpay_order', razorpay_order_id)
    .eq('user_id', user.id)

  return NextResponse.json({ success: true, pro_expires_at: expiresAt.toISOString() })
}
