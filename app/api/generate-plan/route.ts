import { createClient } from '@/lib/supabase/server'
import { generateTripPlan } from '@/lib/ai'
// NOTE: delete lib/gemini.ts — it has been replaced by lib/ai.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { tripId } = await request.json()
    if (!tripId) return NextResponse.json({ error: 'Trip ID required' }, { status: 400 })

    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .eq('user_id', user.id)
      .single()

    if (tripError || !trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 })

    // Check regen limit for free users; also verify pro subscription has not expired
    if (trip.regen_count >= 3) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_pro, pro_expires_at')
        .eq('id', user.id)
        .single()

      const isPro =
        profile?.is_pro &&
        profile?.pro_expires_at &&
        new Date(profile.pro_expires_at) > new Date()

      if (!isPro) {
        return NextResponse.json({ error: 'REGEN_LIMIT_REACHED' }, { status: 403 })
      }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    const userPreferences = profile
      ? `
      Home city: ${profile.home_city}
      Travel style: ${profile.travel_style}
      Group type: ${profile.group_type}
      Interests: ${profile.interests?.join(', ')}
      Preferred transport: ${profile.preferred_transport}
    `
      : undefined

    const generatedPlan = await generateTripPlan(trip.form_data, userPreferences)

    const { error: updateError } = await supabase
      .from('trips')
      .update({
        generated_plan: generatedPlan,
        status: 'saved',
        regen_count: trip.regen_count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', tripId)

    if (updateError) throw updateError

    return NextResponse.json({ plan: generatedPlan })
  } catch (error: any) {
    console.error('Generation error:', error)
    return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 })
  }
}
