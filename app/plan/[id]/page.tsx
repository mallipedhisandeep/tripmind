'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import PlanClient from './PlanClient'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function PlanPageInner({ id }: { id: string }) {
  const [trip, setTrip] = useState<any>(null)
  const [notFound, setNotFound] = useState(false)
  const searchParams = useSearchParams()
  const isGenerating = searchParams.get('generating') === 'true'

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) { window.location.href = '/login'; return }

      const { data: trip } = await supabase
        .from('trips')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (!trip) { setNotFound(true); return }
      setTrip(trip)
    }
    load()
  }, [id])

  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 40 }}>🗺️</div>
        <p style={{ color: '#8888a8', fontFamily: 'sans-serif' }}>Trip not found</p>
        <button onClick={() => window.location.href = '/dashboard'}
          style={{ background: '#f59e0b', color: '#080810', border: 'none', borderRadius: 12, padding: '10px 24px', fontWeight: 700, cursor: 'pointer' }}>
          Back to Dashboard
        </button>
      </div>
    )
  }

  if (!trip) return (
    <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(245,158,11,0.15)', borderTop: '3px solid #f59e0b', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return <PlanClient trip={trip} isGenerating={isGenerating} />
}

export default function PlanPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(245,158,11,0.15)', borderTop: '3px solid #f59e0b', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <PlanPageInner id={params.id} />
    </Suspense>
  )
}
