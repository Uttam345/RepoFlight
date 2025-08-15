'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { Play, Pause, RotateCcw, Eye, MoreHorizontal } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface Scan {
  id: string
  repository: string
  type: 'security' | 'compliance' | 'license' | 'quality'
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  startedAt: string
  completedAt?: string
  duration?: number
  findings: {
    critical: number
    high: number
    medium: number
    low: number
  }
}

const typeConfig = {
  security: { color: 'bg-red-100 text-red-800', label: 'Security' },
  compliance: { color: 'bg-blue-100 text-blue-800', label: 'Compliance' },
  license: { color: 'bg-purple-100 text-purple-800', label: 'License' },
  quality: { color: 'bg-green-100 text-green-800', label: 'Quality' },
}

const statusConfig = {
  pending: { variant: 'outline' as const, color: 'text-gray-600' },
  running: { variant: 'default' as const, color: 'text-blue-600' },
  completed: { variant: 'default' as const, color: 'text-green-600' },
  failed: { variant: 'destructive' as const, color: 'text-red-600' },
}

export function ScansList() {
  const [scans, setScans] = useState<Scan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchScans()
  }, [])

  const fetchScans = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/scans`)
      if (response.ok) {
        const result = await response.json()
        setScans(result.data)
      } else {
        // Fallback demo data
        const demoData: Scan[] = [
          {
            id: '1',
            repository: 'user-service',
            type: 'security',
            status: 'running',
            progress: 65,
            startedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            findings: { critical: 0, high: 0, medium: 0, low: 0 }
          },
          {
            id: '2',
            repository: 'api-gateway',
            type: 'compliance',
            status: 'completed',
            progress: 100,
            startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            completedAt: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString(),
            duration: 1800,
            findings: { critical: 0, high: 0, medium: 1, low: 2 }
          },
          {
            id: '3',
            repository: 'auth-service',
            type: 'security',
            status: 'completed',
            progress: 100,
            startedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
            completedAt: new Date(Date.now() - 1000 * 60 * 60 * 3.5).toISOString(),
            duration: 1200,
            findings: { critical: 2, high: 3, medium: 4, low: 1 }
          },
          {
            id: '4',
            repository: 'frontend-app',
            type: 'license',
            status: 'failed',
            progress: 45,
            startedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
            findings: { critical: 0, high: 0, medium: 0, low: 0 }
          },
        ]
        setScans(demoData)
      }
    } catch (err) {
      console.error('Failed to fetch scans:', err)
      // Fallback demo data
      const demoData: Scan[] = [
        {
          id: '1',
          repository: 'user-service',
          type: 'security',
          status: 'running',
          progress: 65,
          startedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          findings: { critical: 0, high: 0, medium: 0, low: 0 }
        },
        {
          id: '2',
          repository: 'api-gateway',
          type: 'compliance',
          status: 'completed',
          progress: 100,
          startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          completedAt: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString(),
          duration: 1800,
          findings: { critical: 0, high: 0, medium: 1, low: 2 }
        },
      ]
      setScans(demoData)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-muted animate-pulse rounded" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-32" />
                    <div className="h-3 bg-muted animate-pulse rounded w-24" />
                  </div>
                </div>
                <div className="h-8 w-20 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
          <CardDescription>
            Monitor the status and results of your security and compliance scans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scans.map((scan, index) => {
              const typeConf = typeConfig[scan.type]
              const statusConf = statusConfig[scan.status]
              
              return (
                <motion.div
                  key={scan.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-center space-y-1">
                      <Badge className={typeConf.color}>
                        {typeConf.label}
                      </Badge>
                      <Badge variant={statusConf.variant}>
                        {scan.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="font-medium">{scan.repository}</div>
                      <div className="text-sm text-muted-foreground">
                        Started {formatDistanceToNow(new Date(scan.startedAt), { addSuffix: true })}
                        {scan.completedAt && (
                          <span> • Completed {formatDistanceToNow(new Date(scan.completedAt), { addSuffix: true })}</span>
                        )}
                      </div>
                      {scan.status === 'running' && (
                        <div className="w-48">
                          <Progress value={scan.progress} className="h-2" />
                          <div className="text-xs text-muted-foreground mt-1">
                            {scan.progress}% complete
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {scan.status === 'completed' && (
                      <div className="flex space-x-1">
                        {scan.findings.critical > 0 && (
                          <Badge variant="destructive" className="text-xs px-1">
                            {scan.findings.critical}C
                          </Badge>
                        )}
                        {scan.findings.high > 0 && (
                          <Badge variant="secondary" className="text-xs px-1 bg-orange-100 text-orange-800">
                            {scan.findings.high}H
                          </Badge>
                        )}
                        {scan.findings.medium > 0 && (
                          <Badge variant="secondary" className="text-xs px-1 bg-yellow-100 text-yellow-800">
                            {scan.findings.medium}M
                          </Badge>
                        )}
                        {scan.findings.low > 0 && (
                          <Badge variant="secondary" className="text-xs px-1 bg-green-100 text-green-800">
                            {scan.findings.low}L
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex space-x-1">
                      {scan.status === 'running' && (
                        <Button variant="outline" size="sm">
                          <Pause className="h-4 w-4" />
                        </Button>
                      )}
                      {scan.status === 'failed' && (
                        <Button variant="outline" size="sm">
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                      {scan.status === 'completed' && (
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}