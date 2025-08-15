import { Suspense } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { DashboardOverview } from '@/components/dashboard/overview'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { SecurityMetrics } from '@/components/dashboard/security-metrics'
import { ComplianceStatus } from '@/components/dashboard/compliance-status'

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your repository compliance and security status
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Suspense fallback={<div className="h-32 rounded-lg bg-muted animate-pulse" />}>
            <DashboardOverview />
          </Suspense>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Suspense fallback={<div className="h-80 rounded-lg bg-muted animate-pulse" />}>
            <SecurityMetrics />
          </Suspense>
          <Suspense fallback={<div className="h-80 rounded-lg bg-muted animate-pulse" />}>
            <ComplianceStatus />
          </Suspense>
        </div>

        <Suspense fallback={<div className="h-96 rounded-lg bg-muted animate-pulse" />}>
          <RecentActivity />
        </Suspense>
      </div>
    </MainLayout>
  )
}