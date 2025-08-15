'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GitBranch, Lock, Globe, Calendar, Activity } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'

interface Repository {
  id: string
  name: string
  fullName: string
  description?: string
  isPrivate: boolean
  defaultBranch: string
  language: string
  lastScanAt?: string
  riskScore: number
  status: 'healthy' | 'warning' | 'critical'
  findings: {
    critical: number
    high: number
    medium: number
    low: number
  }
}

const statusConfig = {
  healthy: { color: 'bg-green-100 text-green-800', variant: 'default' as const },
  warning: { color: 'bg-yellow-100 text-yellow-800', variant: 'secondary' as const },
  critical: { color: 'bg-red-100 text-red-800', variant: 'destructive' as const },
}

export function RepositoryGrid() {
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRepositories()
  }, [])

  const fetchRepositories = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/repositories`)
      if (response.ok) {
        const result = await response.json()
        setRepositories(result.data)
      } else {
        // Fallback demo data
        const demoData: Repository[] = [
          {
            id: '1',
            name: 'user-service',
            fullName: 'company/user-service',
            description: 'User authentication and management service',
            isPrivate: true,
            defaultBranch: 'main',
            language: 'TypeScript',
            lastScanAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            riskScore: 7.2,
            status: 'warning',
            findings: { critical: 0, high: 2, medium: 5, low: 3 }
          },
          {
            id: '2',
            name: 'api-gateway',
            fullName: 'company/api-gateway',
            description: 'Main API gateway for microservices',
            isPrivate: true,
            defaultBranch: 'main',
            language: 'Go',
            lastScanAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            riskScore: 3.1,
            status: 'healthy',
            findings: { critical: 0, high: 0, medium: 1, low: 2 }
          },
          {
            id: '3',
            name: 'auth-service',
            fullName: 'company/auth-service',
            description: 'Authentication service with OAuth2 support',
            isPrivate: true,
            defaultBranch: 'main',
            language: 'Python',
            lastScanAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
            riskScore: 8.7,
            status: 'critical',
            findings: { critical: 2, high: 3, medium: 4, low: 1 }
          },
          {
            id: '4',
            name: 'frontend-app',
            fullName: 'company/frontend-app',
            description: 'React-based frontend application',
            isPrivate: false,
            defaultBranch: 'main',
            language: 'JavaScript',
            lastScanAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
            riskScore: 4.5,
            status: 'healthy',
            findings: { critical: 0, high: 1, medium: 2, low: 4 }
          },
        ]
        setRepositories(demoData)
      }
    } catch (err) {
      console.error('Failed to fetch repositories:', err)
      // Fallback demo data
      const demoData: Repository[] = [
        {
          id: '1',
          name: 'user-service',
          fullName: 'company/user-service',
          description: 'User authentication and management service',
          isPrivate: true,
          defaultBranch: 'main',
          language: 'TypeScript',
          lastScanAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          riskScore: 7.2,
          status: 'warning',
          findings: { critical: 0, high: 2, medium: 5, low: 3 }
        },
        {
          id: '2',
          name: 'api-gateway',
          fullName: 'company/api-gateway',
          description: 'Main API gateway for microservices',
          isPrivate: true,
          defaultBranch: 'main',
          language: 'Go',
          lastScanAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          riskScore: 3.1,
          status: 'healthy',
          findings: { critical: 0, high: 0, medium: 1, low: 2 }
        },
      ]
      setRepositories(demoData)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {repositories.map((repo, index) => {
        const statusConf = statusConfig[repo.status]
        
        return (
          <motion.div
            key={repo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {repo.isPrivate ? (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    )}
                    <CardTitle className="text-lg">{repo.name}</CardTitle>
                  </div>
                  <Badge variant={statusConf.variant} className={statusConf.color}>
                    {repo.status}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {repo.description || 'No description available'}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <GitBranch className="h-4 w-4 text-muted-foreground" />
                    <span>{repo.defaultBranch}</span>
                  </div>
                  <Badge variant="outline">{repo.language}</Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Risk Score</span>
                  <span className={`font-medium ${
                    repo.riskScore >= 8 ? 'text-red-600' :
                    repo.riskScore >= 6 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {repo.riskScore.toFixed(1)}/10
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Findings</span>
                  <div className="flex space-x-1">
                    {repo.findings.critical > 0 && (
                      <Badge variant="destructive" className="text-xs px-1">
                        {repo.findings.critical}C
                      </Badge>
                    )}
                    {repo.findings.high > 0 && (
                      <Badge variant="secondary" className="text-xs px-1 bg-orange-100 text-orange-800">
                        {repo.findings.high}H
                      </Badge>
                    )}
                    {repo.findings.medium > 0 && (
                      <Badge variant="secondary" className="text-xs px-1 bg-yellow-100 text-yellow-800">
                        {repo.findings.medium}M
                      </Badge>
                    )}
                  </div>
                </div>
                
                {repo.lastScanAt && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Activity className="h-3 w-3 mr-1" />
                    Last scan {formatDistanceToNow(new Date(repo.lastScanAt), { addSuffix: true })}
                  </div>
                )}
                
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button size="sm" className="flex-1">
                    Run Scan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}