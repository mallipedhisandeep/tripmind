import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PlanClient from './PlanClient'

export default async function PlanPage({ params, searchParams }: {
  params: { id: string }
  searchParams: { generating?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: trip } = await supabase
    .from('trips')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!trip) redirect('/dashboard')

  return (
    <PlanClient
      trip={trip}
      isGenerating={searchParams.generating === 'true'}
    />
  )
}
