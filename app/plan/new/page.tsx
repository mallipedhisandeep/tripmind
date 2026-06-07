import { Suspense } from 'react'
import PlanNewClient from './PlanNewClient'

export default function PlanNewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="text-slate-500 text-sm">Loading...</div>
      </div>
    }>
      <PlanNewClient />
    </Suspense>
  )
}
