import { createClient } from '@/lib/supabase/server'
import { generateTripPlan } from '@/lib/gemini'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { tripId } = await request.json()
    if (!tripId) return NextResponse.json({ error: 'Trip ID required' }, { status: 400 })

    // Fetch the trip
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .eq('user_id', user.id)
      .single()

    if (tripError || !trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 })

    // Check regen limit for free users (3 max)
    if (trip.regen_count >= 3) {
      // Check if user is Pro
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_pro')
        .eq('id', user.id)
        .single()

      if (!profile?.is_pro) {
        return NextResponse.json({ error: 'REGEN_LIMIT_REACHED' }, { status: 403 })
      }
    }

    // Get user preferences summary
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    const userPreferences = profile ? `
      Home city: ${profile.home_city}
      Usual travel style: ${profile.travel_style}
      Typical group: ${profile.group_type}
      Top interests: ${profile.interests?.join(', ')}
      Preferred transport: ${profile.preferred_transport}
    ` : undefined

    // Generate plan
    const generatedPlan = await generateTripPlan(trip.form_data, userPreferences)

    // Save plan to database
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
    console.error('Plan generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Generation failed' },
      { status: 500 }
    )
  }
}
