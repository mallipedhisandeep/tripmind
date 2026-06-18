import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { trip_id, email, role } = await req.json()
  if (!trip_id || !email) {
    return NextResponse.json({ error: 'trip_id and email are required' }, { status: 400 })
  }

  const { data: trip } = await supabase
    .from('trips')
    .select('id, user_id')
    .eq('id', trip_id)
    .single()

  if (!trip || trip.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: member, error } = await supabase
    .from('trip_members')
    .upsert(
      { trip_id, email, role: role ?? 'viewer' },
      { onConflict: 'trip_id,email', ignoreDuplicates: false }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const inviteLink = `${baseUrl}/invite/${member.invite_token}`

  // TODO: wire up email provider (Resend / SendGrid)
  // await sendInviteEmail(email, inviteLink, trip.destination)

  return NextResponse.json({ member, invite_link: inviteLink }, { status: 201 })
}

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

export async function DELETE(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  // Ownership check: only the trip owner can remove members
  const { data: member } = await supabase
    .from('trip_members')
    .select('trip_id')
    .eq('id', id)
    .single()

  if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 })

  const { data: trip } = await supabase
    .from('trips')
    .select('user_id')
    .eq('id', member.trip_id)
    .single()

  if (!trip || trip.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase
    .from('trip_members')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
