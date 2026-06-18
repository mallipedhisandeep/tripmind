import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WatchlistClient from './WatchlistClient'

export default async function WatchlistPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: items } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_pro, whatsapp_number')
    .eq('id', user.id)
    .single()

  return <WatchlistClient initialItems={items ?? []} isPro={profile?.is_pro ?? false} defaultWhatsapp={profile?.whatsapp_number ?? ''} />
}
