import { createClient } from '@supabase/supabase-js'
import { generateTripPlan } from '@/lib/gemini'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { tripId, accessToken } = await request.json()

    if (!tripId) return NextResponse.json({ error: 'Trip ID required' }, { status: 400 })
    if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Use service-level client authenticated with user's access token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      }
    )

    // Verify token by getting user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Fetch the trip
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .eq('user_id', user.id)
      .single()

    if (tripError || !trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 })

    // Check regen limit
    if (trip.regen_count >= 3) {
      const { data: profile } = await supabase
        .from('profiles').select('is_pro').eq('id', user.id).single()
      if (!profile?.is_pro) {
        return NextResponse.json({ error: 'REGEN_LIMIT_REACHED' }, { status: 403 })
      }
    }

    // Get user preferences
    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', user.id).single()

    const userPreferences = profile ? `
      Home city: ${profile.home_city}
      Travel style: ${profile.travel_style}
      Group type: ${profile.group_type}
      Interests: ${profile.interests?.join(', ')}
      Preferred transport: ${profile.preferred_transport}
    ` : undefined

    // Generate plan via Gemini
    const generatedPlan = await generateTripPlan(trip.form_data, userPreferences)

    // Save to DB
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
