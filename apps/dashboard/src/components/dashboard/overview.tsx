"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Shield, GitBranch, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { apiClient, type DashboardStats } from "@/lib/api"

export function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOverviewStats()
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchOverviewStats, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchOverviewStats = async () => {
    try {
      const response = await apiClient.getDashboardStats()
      if (response.success && response.data) {
        setStats(response.data)
        setError(null)
      } else {
        throw new Error(response.error || 'Failed to fetch stats')
      }
    } catch (err) {
      console.error('Failed to fetch overview stats:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      
      // Fallback data for demo
      setStats({
        totalRepositories: 24,
        activeScans: 3,
        criticalFindings: 7,
        compliantRepos: 22,
        riskTrend: 'improving',
        complianceTrend: 'stable',
      })
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend: 'improving' | 'stable' | 'degrading') => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-3 w-3 text-green-600" />
      case 'degrading':
        return <TrendingDown className="h-3 w-3 text-red-600" />
      default:
        return <Minus className="h-3 w-3 text-gray-600" />
    }
  }

  const getTrendText = (trend: 'improving' | 'stable' | 'degrading') => {
    switch (trend) {
      case 'improving':
        return 'Improving'
      case 'degrading':
        return 'Needs attention'
      default:
        return 'Stable'
    }
  }

  if (!stats) {
    return (
      <>
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </>
    )
  }

  const compliancePercentage = Math.round((stats.compliantRepos / stats.totalRepositories) * 100)
  const riskScore = Math.max(0, 100 - compliancePercentage + (stats.criticalFindings * 5))

  const metrics = [
    {
      title: "Total Repositories",
      value: stats.totalRepositories.toString(),
      icon: GitBranch,
      trend: "+2 this week",
      description: "Connected repositories",
      color: "text-blue-600",
    },
    {
      title: "Security Issues",
      value: stats.criticalFindings.toString(),
      icon: AlertTriangle,
      trend: stats.riskTrend,
      description: "Critical vulnerabilities",
      color: stats.criticalFindings > 5 ? "text-red-600" : "text-orange-600",
      badge: stats.criticalFindings > 0 ? "Needs attention" : "Good",
      badgeVariant: stats.criticalFindings > 0 ? "destructive" : "success",
    },
    {
      title: "Compliance Score",
      value: `${compliancePercentage}%`,
      icon: CheckCircle,
      trend: stats.complianceTrend,
      description: "Policy adherence",
      color: compliancePercentage >= 90 ? "text-green-600" : compliancePercentage >= 70 ? "text-yellow-600" : "text-red-600",
      progress: compliancePercentage,
    },
    {
      title: "Active Scans",
      value: stats.activeScans.toString(),
      icon: Shield,
      trend: stats.activeScans > 0 ? "Running now" : "Idle",
      description: "Currently scanning",
      color: stats.activeScans > 0 ? "text-blue-600" : "text-gray-600",
      pulse: stats.activeScans > 0,
    },
  ]

  return (
    <>
      {metrics.map((metric, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              {metric.badge && (
                <Badge variant={metric.badgeVariant as any} className="text-xs">
                  {metric.badge}
                </Badge>
              )}
              <metric.icon
                className={`h-4 w-4 ${metric.color} ${metric.pulse ? 'animate-pulse' : ''}`}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className={`text-2xl font-bold ${metric.color}`}>
                {loading ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                ) : (
                  metric.value
                )}
              </div>
              
              {metric.progress !== undefined && (
                <Progress value={metric.progress} className="h-2" />
              )}
              
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{metric.description}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {getTrendIcon(metric.trend as any)}
                  <span>{getTrendText(metric.trend as any)}</span>
                </div>
              </div>
            </div>
          </CardContent>
          
          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 pointer-events-none" />
        </Card>
      ))}
      
      {error && (
        <Card className="col-span-full border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Using cached data. API connection issue: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}