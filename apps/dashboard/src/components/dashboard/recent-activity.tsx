'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { GitBranch, Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface ActivityItem {
  id: string
  type: 'scan' | 'finding' | 'compliance' | 'repository'
  title: string
  description: string
  timestamp: string
  status: 'success' | 'warning' | 'error' | 'info'
  repository?: string
}

const activityConfig = {
  scan: { icon: Shield, color: 'text-blue-600' },
  finding: { icon: AlertTriangle, color: 'text-red-600' },
  compliance: { icon: CheckCircle, color: 'text-green-600' },
  repository: { icon: GitBranch, color: 'text-purple-600' },
}

const statusConfig = {
  success: { variant: 'default' as const, color: 'bg-green-100' },
  warning: { variant: 'secondary' as const, color: 'bg-yellow-100' },
  error: { variant: 'destructive' as const, color: 'bg-red-100' },
  info: { variant: 'outline' as const, color: 'bg-blue-100' },
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentActivity()
  }, [])

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/activity/recent`)
      if (response.ok) {
        const result = await response.json()
        setActivities(result.data)
      } else {
        // Fallback demo data
        const demoData: ActivityItem[] = [
          {
            id: '1',
            type: 'scan',
            title: 'Security scan completed',
            description: 'Found 3 medium vulnerabilities in user-service',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
            status: 'warning',
            repository: 'user-service'
          },
          {
            id: '2',
            type: 'compliance',
            title: 'License compliance check passed',
            description: 'All dependencies use approved licenses',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            status: 'success',
            repository: 'api-gateway'
          },
          {
            id: '3',
            type: 'finding',
            title: 'Critical vulnerability detected',
            description: 'SQL injection vulnerability in authentication module',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
            status: 'error',
            repository: 'auth-service'
          },
          {
            id: '4',
            type: 'repository',
            title: 'New repository connected',
            description: 'payment-service has been added to monitoring',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
            status: 'info',
            repository: 'payment-service'
          },
          {
            id: '5',
            type: 'scan',
            title: 'Dependency scan completed',
            description: 'No new vulnerabilities found',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
            status: 'success',
            repository: 'frontend-app'
          },
        ]
        setActivities(demoData)
      }
    } catch (err) {
      console.error('Failed to fetch recent activity:', err)
      // Fallback demo data
      const demoData: ActivityItem[] = [
        {
          id: '1',
          type: 'scan',
          title: 'Security scan completed',
          description: 'Found 3 medium vulnerabilities in user-service',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          status: 'warning',
          repository: 'user-service'
        },
        {
          id: '2',
          type: 'compliance',
          title: 'License compliance check passed',
          description: 'All dependencies use approved licenses',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          status: 'success',
          repository: 'api-gateway'
        },
      ]
      setActivities(demoData)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                </div>
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
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest scans, findings, and compliance updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const typeConfig = activityConfig[activity.type]
              const statusConf = statusConfig[activity.status]
              const Icon = typeConfig.icon
              
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-start space-x-4 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <Avatar className={`h-10 w-10 ${statusConf.color}`}>
                    <AvatarFallback className="bg-transparent">
                      <Icon className={`h-5 w-5 ${typeConfig.color}`} />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">
                        {activity.title}
                      </p>
                      <div className="flex items-center space-x-2">
                        {activity.repository && (
                          <Badge variant="outline" className="text-xs">
                            {activity.repository}
                          </Badge>
                        )}
                        <Badge variant={statusConf.variant} className="text-xs">
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <div className="flex items-center mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
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