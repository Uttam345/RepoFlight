import { Suspense } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { FindingsList } from '@/components/findings/findings-list'
import { FindingsFilters } from '@/components/findings/findings-filters'
import { FindingsStats } from '@/components/findings/findings-stats'
import { Button } from '@/components/ui/button'
import { Download, Filter, RefreshCw, Zap } from 'lucide-react'

export default function FindingsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Security Findings</h1>
            <p className="text-muted-foreground">
              Review and manage security vulnerabilities and compliance issues across your repositories
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export SARIF
            </Button>
            <Button size="sm" className="gap-2">
              <Zap className="h-4 w-4" />
              Auto-Fix All
            </Button>
          </div>
        </div>
        
        <Suspense fallback={
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        }>
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