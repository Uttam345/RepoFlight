'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { GitBranch, Lock, Globe, Activity, Zap, Eye, MoreHorizontal, Star, GitFork } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDistanceToNow } from 'date-fns'
import { apiClient, type Repository, formatDate, getRiskScoreColor } from '@/lib/api'

const statusConfig = {
  active: { color: 'bg-green-100 text-green-800', variant: 'default' as const },
  scanning: { color: 'bg-blue-100 text-blue-800', variant: 'secondary' as const },
  archived: { color: 'bg-gray-100 text-gray-800', variant: 'outline' as const },
}

export function RepositoryGrid() {
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [scanningRepos, setScanningRepos] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchRepositories()
  }, [])

  const fetchRepositories = async () => {
    try {
      const response = await apiClient.getRepositories({ limit: 50 })
      if (response.success && response.data) {
        setRepositories(response.data.repositories)
      } else {
        throw new Error(response.error || 'Failed to fetch repositories')
      }
    } catch (err) {
      console.error('Failed to fetch repositories:', err)
      
      // Fallback demo data
      const demoData: Repository[] = [
        {
          id: '1',
          githubId: 123456,
          name: 'user-service',
          owner: 'company',
          fullName: 'company/user-service',
          description: 'User authentication and management service with JWT tokens',
          language: 'TypeScript',
          isPrivate: true,
          defaultBranch: 'main',
          lastScanAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          riskScore: 72,
          complianceScore: 85,
          status: 'active',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          githubId: 123457,
          name: 'api-gateway',
          owner: 'company',
          fullName: 'company/api-gateway',
          description: 'Main API gateway for microservices architecture',
          language: 'Go',
          isPrivate: true,
          defaultBranch: 'main',
          lastScanAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          riskScore: 31,
          complianceScore: 95,
          status: 'active',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          githubId: 123458,
          name: 'auth-service',
          owner: 'company',
          fullName: 'company/auth-service',
          description: 'Authentication service with OAuth2 and SAML support',
          language: 'Python',
          isPrivate: true,
          defaultBranch: 'main',
          lastScanAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          riskScore: 87,
          complianceScore: 65,
          status: 'active',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '4',
          githubId: 123459,
          name: 'frontend-app',
          owner: 'company',
          fullName: 'company/frontend-app',
          description: 'React-based frontend application with modern UI components',
          language: 'JavaScript',
          isPrivate: false,
          defaultBranch: 'main',
          lastScanAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
          riskScore: 45,
          complianceScore: 88,
          status: 'active',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '5',
          githubId: 123460,
          name: 'data-pipeline',
          owner: 'company',
          fullName: 'company/data-pipeline',
          description: 'ETL pipeline for processing customer data',
          language: 'Python',
          isPrivate: true,
          defaultBranch: 'main',
          status: 'scanning',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '6',
          githubId: 123461,
          name: 'legacy-system',
          owner: 'company',
          fullName: 'company/legacy-system',
          description: 'Legacy monolithic application (deprecated)',
          language: 'Java',
          isPrivate: true,
          defaultBranch: 'master',
          lastScanAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
          riskScore: 95,
          complianceScore: 45,
          status: 'archived',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      setRepositories(demoData)
    } finally {
      setLoading(false)
    }
  }

  const handleStartScan = async (repositoryId: string) => {
    setScanningRepos(prev => new Set(prev).add(repositoryId))
    
    try {
      await apiClient.startScan({
        repositoryId,
        scanType: 'full'
      })
      
      // Update repository status
      setRepositories(prev => prev.map(repo => 
        repo.id === repositoryId 
          ? { ...repo, status: 'scanning' }
          : repo
      ))
      
      // Simulate scan completion after 30 seconds
      setTimeout(() => {
        setScanningRepos(prev => {
          const newSet = new Set(prev)
          newSet.delete(repositoryId)
          return newSet
        })
        
        setRepositories(prev => prev.map(repo => 
          repo.id === repositoryId 
            ? { 
                ...repo, 
                status: 'active',
                lastScanAt: new Date().toISOString(),
                riskScore: Math.floor(Math.random() * 100),
                complianceScore: Math.floor(Math.random() * 40) + 60
              }
            : repo
        ))
      }, 30000)
      
    } catch (err) {
      console.error('Failed to start scan:', err)
      setScanningRepos(prev => {
        const newSet = new Set(prev)
        newSet.delete(repositoryId)
        return newSet
      })
    }
  }

  const getLanguageColor = (language?: string) => {
    const colors: Record<string, string> = {
      'TypeScript': 'bg-blue-100 text-blue-800',
      'JavaScript': 'bg-yellow-100 text-yellow-800',
      'Python': 'bg-green-100 text-green-800',
      'Go': 'bg-cyan-100 text-cyan-800',
      'Java': 'bg-red-100 text-red-800',
      'Rust': 'bg-orange-100 text-orange-800',
    }
    return colors[language || ''] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-8 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (repositories.length === 0) {
    return (
      <div className="text-center py-12">
        <GitBranch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No repositories found</h3>
        <p className="text-muted-foreground mb-4">
          Connect your first repository to start monitoring security and compliance.
        </p>
        <Button>Connect Repository</Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {repositories.map((repo, index) => {
        const statusConf = statusConfig[repo.status]
        const isScanning = scanningRepos.has(repo.id) || repo.status === 'scanning'
        
        return (
          <motion.div
            key={repo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-200 group relative overflow-hidden">
              {/* Status indicator */}
              <div className={`absolute top-0 left-0 w-full h-1 ${
                repo.riskScore && repo.riskScore > 80 ? 'bg-red-500' :
                repo.riskScore && repo.riskScore > 60 ? 'bg-yellow-500' :
                'bg-green-500'
              }`} />
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    {repo.isPrivate ? (
                      <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">
                        {repo.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground truncate">
                        {repo.owner}/{repo.name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={statusConf.variant} className={`${statusConf.color} ${isScanning ? 'animate-pulse' : ''}`}>
                      {isScanning ? 'Scanning' : repo.status}
                    </Badge>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/repositories/${repo.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStartScan(repo.id)} disabled={isScanning}>
                          <Zap className="h-4 w-4 mr-2" />
                          {isScanning ? 'Scanning...' : 'Run Scan'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Star className="h-4 w-4 mr-2" />
                          Add to Favorites
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <GitFork className="h-4 w-4 mr-2" />
                          View on GitHub
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <CardDescription className="line-clamp-2 text-sm">
                  {repo.description || 'No description available'}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Repository Info */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <GitBranch className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{repo.defaultBranch}</span>
                  </div>
                  {repo.language && (
                    <Badge variant="outline" className={getLanguageColor(repo.language)}>
                      {repo.language}
                    </Badge>
                  )}
                </div>
                
                {/* Risk and Compliance Scores */}
                {(repo.riskScore !== undefined || repo.complianceScore !== undefined) && (
                  <div className="space-y-3">
                    {repo.riskScore !== undefined && (
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Risk Score</span>
                          <span className={`font-medium ${getRiskScoreColor(repo.riskScore)}`}>
                            {repo.riskScore}/100
                          </span>
                        </div>
                        <Progress value={repo.riskScore} className="h-2" />
                      </div>
                    )}
                    
                    {repo.complianceScore !== undefined && (
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Compliance</span>
                          <span className={`font-medium ${repo.complianceScore >= 80 ? 'text-green-600' : repo.complianceScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {repo.complianceScore}%
                          </span>
                        </div>
                        <Progress value={repo.complianceScore} className="h-2" />
                      </div>
                    )}
                  </div>
                )}
                
                {/* Last Scan Info */}
                {repo.lastScanAt && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Activity className="h-3 w-3 mr-1" />
                    Last scan {formatDistanceToNow(new Date(repo.lastScanAt), { addSuffix: true })}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    asChild
                  >
                    <Link href={`/repositories/${repo.id}`}>
                      <Eye className="h-3 w-3 mr-1" />
                      Details
                    </Link>
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleStartScan(repo.id)}
                    disabled={isScanning}
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    {isScanning ? 'Scanning...' : 'Scan'}
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