import { Suspense } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { ScansList } from '@/components/scans/scans-list'
import { ScanStats } from '@/components/scans/scan-stats'
import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'

export default function ScansPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Scans</h1>
            <p className="text-muted-foreground">
              Monitor and manage security and compliance scans
            </p>
          </div>
          <Button>
            <Play className="mr-2 h-4 w-4" />
            Run New Scan
          </Button>
        </div>
        
        <Suspense fallback={<div className="h-32 rounded-lg bg-muted animate-pulse" />}>
          <ScanStats />
        </Suspense>
        
        <Suspense fallback={<div className="h-96 rounded-lg bg-muted animate-pulse" />}>
          <ScansList />
        </Suspense>
      </div>
    </MainLayout>
  )
}