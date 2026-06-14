import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/group/invite — invite someone to a trip
export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { trip_id, email, role } = await req.json()
  if (!trip_id || !email) {
    return NextResponse.json({ error: 'trip_id and email are required' }, { status: 400 })
  }

  // Verify requester owns the trip
  const { data: trip } = await supabase
    .from('trips')
    .select('id, user_id')
    .eq('id', trip_id)
    .single()

  if (!trip || trip.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Upsert member (avoid duplicate invites)
  const { data: member, error } = await supabase
    .from('trip_members')
    .upsert(
      { trip_id, email, role: role ?? 'viewer' },
      { onConflict: 'trip_id,email', ignoreDuplicates: false }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Build invite link
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const inviteLink = `${baseUrl}/invite/${member.invite_token}`

  // TODO: send invite email via Resend / SendGrid
  // For now, just return the link
  // await sendInviteEmail(email, inviteLink, trip.destination)

  return NextResponse.json({ member, invite_link: inviteLink }, { status: 201 })
}

// GET /api/group/invite?trip_id=xxx — list members of a trip
export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const trip_id = req.nextUrl.searchParams.get('trip_id')
  if (!trip_id) return NextResponse.json({ error: 'trip_id required' }, { status: 400 })

  const { data, error } = await supabase
    .from('trip_members')
    .select('*')
    .eq('trip_id', trip_id)
    .order('created_at')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/group/invite?id=xxx — remove a member
export async function DELETE(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { error } = await supabase
    .from('trip_members')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
