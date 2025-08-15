import { Suspense } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { RepositoryGrid } from '@/components/repositories/repository-grid'
import { RepositoryFilters } from '@/components/repositories/repository-filters'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function RepositoriesPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Repositories</h1>
            <p className="text-muted-foreground">
              Manage and monitor your connected repositories
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Connect Repository
          </Button>
        </div>
        
        <RepositoryFilters />
        
        <Suspense fallback={<div className="h-96 rounded-lg bg-muted animate-pulse" />}>
          <RepositoryGrid />
        </Suspense>
      </div>
    </MainLayout>
  )
}