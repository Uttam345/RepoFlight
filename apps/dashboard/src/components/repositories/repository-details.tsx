"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  GitBranch, 
  Lock, 
  Globe, 
  Calendar, 
  Activity, 
  Star,
  GitFork,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { apiClient, type Repository, formatDate, getRiskScoreColor } from '@/lib/api'

interface RepositoryDetailsProps {
  repositoryId: string
}

export function RepositoryDetails({ repositoryId }: RepositoryDetailsProps) {
  const [repository, setRepository] = useState<Repository | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRepository()
  }, [repositoryId])

  const fetchRepository = async () => {
    try {
      const response = await apiClient.getRepository(repositoryId)
      if (response.success && response.data) {
        setRepository(response.data)
      } else {
        throw new Error(response.error || 'Failed to fetch repository')
      }
    } catch (err) {
      console.error('Failed to fetch repository:', err)
      
      // Fallback demo data
      setRepository({
        id: repositoryId,
        githubId: 123456,
        name: 'user-service',
        owner: 'company',
        fullName: 'company/user-service',
        description: 'User authentication and management service with JWT tokens and OAuth2 support',
        language: 'TypeScript',
        isPrivate: true,
        defaultBranch: 'main',
        lastScanAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        riskScore: 72,
        complianceScore: 85,
        status: 'active',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
        updatedAt: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!repository) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Repository not found</h3>
            <p className="text-muted-foreground">
              The requested repository could not be loaded.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {repository.isPrivate ? (
                <Lock className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Globe className="h-5 w-5 text-muted-foreground" />
              )}
              <CardTitle className="text-2xl">{repository.name}</CardTitle>
              <Badge variant={repository.status === 'active' ? 'default' : 'secondary'}>
                {repository.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{repository.fullName}</p>
            {repository.description && (
              <p className="text-sm leading-relaxed max-w-2xl">
                {repository.description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Repository Info */}
          <div className="space-y-4">
            <h4 className="font-medium">Repository Information</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Language</span>
                <Badge variant="outline">{repository.language || 'Unknown'}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Default Branch</span>
                <div className="flex items-center gap-1 text-sm">
                  <GitBranch className="h-3 w-3" />
                  {repository.defaultBranch}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Visibility</span>
                <Badge variant={repository.isPrivate ? 'secondary' : 'outline'}>
                  {repository.isPrivate ? 'Private' : 'Public'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm">{formatDate(repository.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Security Metrics */}
          <div className="space-y-4">
            <h4 className="font-medium">Security Metrics</h4>
            
            {repository.riskScore !== undefined && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Risk Score</span>
                  <span className={`text-sm font-medium ${getRiskScoreColor(repository.riskScore)}`}>
                    {repository.riskScore}/100
                  </span>
                </div>
                <Progress value={repository.riskScore} className="h-2" />
              </div>
            )}
            
            {repository.complianceScore !== undefined && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Compliance</span>
                  <span className={`text-sm font-medium ${
                    repository.complianceScore >= 80 ? 'text-green-600' : 
                    repository.complianceScore >= 60 ? 'text-yellow-600' : 
                    'text-red-600'
                  }`}>
                    {repository.complianceScore}%
                  </span>
                </div>
                <Progress value={repository.complianceScore} className="h-2" />
              </div>
            )}
            
            {repository.lastScanAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Scan</span>
                <div className="flex items-center gap-1 text-sm">
                  <Activity className="h-3 w-3" />
                  {formatDate(repository.lastScanAt)}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h4 className="font-medium">Quick Actions</h4>
            
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <Eye className="h-3 w-3" />
                View on GitHub
              </Button>
              
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <Star className="h-3 w-3" />
                Add to Favorites
              </Button>
              
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <GitFork className="h-3 w-3" />
                Clone Repository
              </Button>
              
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <Clock className="h-3 w-3" />
                Schedule Scans
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}