'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import DashboardClient from './DashboardClient'

export default function DashboardPage() {
  const [data, setData] = useState<{ profile: any; trips: any[] } | null>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) { window.location.href = '/login'; return }

      const { data: profile } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()

      if (!profile?.onboarding_complete) { window.location.href = '/onboarding'; return }

      const { data: trips } = await supabase
        .from('trips').select('*').eq('user_id', user.id)
        .order('created_at', { ascending: false }).limit(10)

      setData({ profile, trips: trips || [] })
    }
    load()
  }, [])

  if (!data) return (
    <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(245,158,11,0.15)', borderTop: '3px solid #f59e0b', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return <DashboardClient profile={data.profile} trips={data.trips} />
}
