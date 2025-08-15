import { Suspense } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { FindingsList } from '@/components/findings/findings-list'
import { FindingsFilters } from '@/components/findings/findings-filters'
import { FindingsStats } from '@/components/findings/findings-stats'

export default function FindingsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Findings</h1>
          <p className="text-muted-foreground">
            Review and manage security vulnerabilities and compliance issues
          </p>
        </div>
        
        <Suspense fallback={<div className="h-32 rounded-lg bg-muted animate-pulse" />}>
          <FindingsStats />
        </Suspense>
        
        <FindingsFilters />
        
        <Suspense fallback={<div className="h-96 rounded-lg bg-muted animate-pulse" />}>
          <FindingsList />
        </Suspense>
      </div>
    </MainLayout>
  )
}