import { Suspense } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { ScansList } from '@/components/scans/scans-list'
import { ScanStats } from '@/components/scans/scan-stats'
import { Button } from '@/components/ui/button'
import { Play, RefreshCw, Download, Filter } from 'lucide-react'

export default function ScansPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Security Scans</h1>
            <p className="text-muted-foreground">
              Monitor and manage security and compliance scans across your repositories
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export Results
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button size="sm" className="gap-2">
              <Play className="h-4 w-4" />
              New Scan
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
          <ScanStats />
        </Suspense>
        
        <Suspense fallback={<div className="h-96 rounded-lg bg-muted animate-pulse" />}>
          <ScansList />
        </Suspense>
      </div>
    </MainLayout>
  )
}