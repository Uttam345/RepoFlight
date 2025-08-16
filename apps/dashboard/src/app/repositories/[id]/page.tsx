import { Suspense } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { RepositoryDetails } from '@/components/repositories/repository-details'
import { RepositoryScans } from '@/components/repositories/repository-scans'
import { RepositoryFindings } from '@/components/repositories/repository-findings'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Play, Settings, GitBranch } from 'lucide-react'
import Link from 'next/link'

interface RepositoryPageProps {
  params: {
    id: string
  }
}

export default function RepositoryPage({ params }: RepositoryPageProps) {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/repositories">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Repositories
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Repository Details</h1>
              <p className="text-muted-foreground">
                Comprehensive security and compliance overview
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Configure
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <GitBranch className="h-4 w-4" />
              View on GitHub
            </Button>
            <Button size="sm" className="gap-2">
              <Play className="h-4 w-4" />
              Run Full Scan
            </Button>
          </div>
        </div>
        
        <Suspense fallback={<div className="h-48 bg-muted animate-pulse rounded-lg" />}>
          <RepositoryDetails repositoryId={params.id} />
        </Suspense>
        
        <div className="grid gap-6 lg:grid-cols-2">
          <Suspense fallback={<div className="h-96 bg-muted animate-pulse rounded-lg" />}>
            <RepositoryScans repositoryId={params.id} />
          </Suspense>
          
          <Suspense fallback={<div className="h-96 bg-muted animate-pulse rounded-lg" />}>
            <RepositoryFindings repositoryId={params.id} />
          </Suspense>
        </div>
      </div>
    </MainLayout>
  )
}