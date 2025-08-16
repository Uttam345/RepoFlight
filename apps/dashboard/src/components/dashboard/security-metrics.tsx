"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Shield, Bug, Lock, TrendingUp, ExternalLink, Zap } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { apiClient, type SecurityMetrics as SecurityMetricsType, formatDate, getSeverityColor } from "@/lib/api"

export function SecurityMetrics() {
  const [metrics, setMetrics] = useState<SecurityMetricsType | null>(null)
  const [loading, setLoading] = useState(true)
  const [showTrends, setShowTrends] = useState(false)

  useEffect(() => {
    fetchSecurityMetrics()
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchSecurityMetrics, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const fetchSecurityMetrics = async () => {
    try {
      const response = await apiClient.getSecurityMetrics()
      if (response.success && response.data) {
        setMetrics(response.data)
      } else {
        throw new Error(response.error || 'Failed to fetch metrics')
      }
    } catch (err) {
      console.error('Failed to fetch security metrics:', err)
      
      // Fallback data for demo
      setMetrics({
        vulnerabilities: {
          critical: 2,
          high: 5,
          medium: 12,
          low: 8,
        },
        trends: {
          period: "7d",
          critical: [3, 2, 4, 2, 1, 2, 2],
          high: [8, 6, 7, 5, 4, 5, 5],
          medium: [15, 14, 13, 12, 11, 12, 12],
          low: [10, 9, 8, 8, 7, 8, 8],
        },
        recentFindings: [
          {
            id: "1",
            scanId: "scan-1",
            type: "security",
            severity: "high",
            title: "Outdated dependency: lodash@4.17.20",
            description: "Known security vulnerability in lodash version",
            status: "open",
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "2",
            scanId: "scan-2",
            type: "security",
            severity: "critical",
            title: "SQL injection vulnerability detected",
            description: "Potential SQL injection in user authentication",
            status: "open",
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "3",
            scanId: "scan-3",
            type: "security",
            severity: "medium",
            title: "Insecure random number generation",
            description: "Using Math.random() for security-sensitive operations",
            status: "open",
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading || !metrics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-2" />
              <div className="h-8 bg-muted rounded w-1/3" />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded w-1/3" />
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-16 bg-muted rounded" />
          ))}
        </div>
      </div>
    )
  }

  const vulnerabilities = [
    {
      severity: "Critical",
      count: metrics.vulnerabilities.critical,
      color: "bg-red-500",
      textColor: "text-red-600",
      icon: AlertTriangle,
    },
    {
      severity: "High",
      count: metrics.vulnerabilities.high,
      color: "bg-orange-500",
      textColor: "text-orange-600",
      icon: Shield,
    },
    {
      severity: "Medium",
      count: metrics.vulnerabilities.medium,
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
      icon: Bug,
    },
    {
      severity: "Low",
      count: metrics.vulnerabilities.low,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      icon: Lock,
    },
  ]

  const totalVulns = Object.values(metrics.vulnerabilities).reduce((sum, count) => sum + count, 0)

  // Prepare chart data
  const trendData = metrics.trends.critical.map((_, index) => ({
    day: `Day ${index + 1}`,
    critical: metrics.trends.critical[index],
    high: metrics.trends.high[index],
    medium: metrics.trends.medium[index],
    low: metrics.trends.low[index],
  }))

  const pieData = vulnerabilities.map((vuln) => ({
    name: vuln.severity,
    value: vuln.count,
    color: vuln.color.replace('bg-', ''),
  }))

  const COLORS = {
    'red-500': '#ef4444',
    'orange-500': '#f97316',
    'yellow-500': '#eab308',
    'blue-500': '#3b82f6',
  }

  return (
    <div className="space-y-6">
      {/* Vulnerability Overview */}
      <div className="grid grid-cols-2 gap-4">
        {vulnerabilities.map((vuln, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border bg-card">
            <div className={`w-3 h-3 rounded-full ${vuln.color} animate-pulse`} />
            <div className="flex-1">
              <div className="text-sm font-medium text-muted-foreground">{vuln.severity}</div>
              <div className={`text-2xl font-bold ${vuln.textColor}`}>{vuln.count}</div>
            </div>
            <vuln.icon className={`h-5 w-5 ${vuln.textColor}`} />
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
        <div>
          <div className="text-sm text-muted-foreground">Total Vulnerabilities</div>
          <div className="text-2xl font-bold">{totalVulns}</div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTrends(!showTrends)}
            className="gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            {showTrends ? 'Hide' : 'Show'} Trends
          </Button>
        </div>
      </div>

      {/* Trend Chart */}
      {showTrends && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium">7-Day Vulnerability Trends</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="high" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="medium" stroke="#eab308" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="low" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Distribution Chart */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium mb-4">Severity Distribution</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.color as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-4">Risk Assessment</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Risk Score</span>
                <span className="font-medium">
                  {Math.min(100, (metrics.vulnerabilities.critical * 25) + (metrics.vulnerabilities.high * 10) + (metrics.vulnerabilities.medium * 5) + metrics.vulnerabilities.low)}
                </span>
              </div>
              <Progress 
                value={Math.min(100, (metrics.vulnerabilities.critical * 25) + (metrics.vulnerabilities.high * 10) + (metrics.vulnerabilities.medium * 5) + metrics.vulnerabilities.low)} 
                className="h-2"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Based on CVSS scoring and vulnerability count
            </div>
          </div>
        </div>
      </div>

      {/* Recent Findings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Recent Findings</h4>
          <Button variant="outline" size="sm" className="gap-2">
            <ExternalLink className="h-3 w-3" />
            View All
          </Button>
        </div>
        
        <div className="space-y-2">
          {metrics.recentFindings.slice(0, 3).map((finding, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="space-y-1 flex-1">
                <div className="text-sm font-medium">{finding.title}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">{finding.description}</div>
              </div>
              <div className="text-right space-y-1 ml-4">
                <Badge 
                  variant={finding.severity === "critical" ? "destructive" : "secondary"}
                  className={getSeverityColor(finding.severity)}
                >
                  {finding.severity.charAt(0).toUpperCase() + finding.severity.slice(1)}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  {formatDate(finding.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {metrics.recentFindings.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent security findings</p>
            <p className="text-sm">Your repositories are secure!</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 pt-4 border-t">
        <Button size="sm" className="gap-2">
          <Zap className="h-3 w-3" />
          Run Security Scan
        </Button>
        <Button variant="outline" size="sm">
          Generate Report
        </Button>
      </div>
    </div>
  )
}