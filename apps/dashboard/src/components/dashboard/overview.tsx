'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GitBranch, Shield, AlertTriangle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface OverviewStats {
  totalRepositories: number
  activeScans: number
  criticalFindings: number
  compliantRepos: number
}

const statCards = [
  {
    title: 'Total Repositories',
    key: 'totalRepositories' as keyof OverviewStats,
    icon: GitBranch,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'Active Scans',
    key: 'activeScans' as keyof OverviewStats,
    icon: Shield,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    title: 'Critical Findings',
    key: 'criticalFindings' as keyof OverviewStats,
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  {
    title: 'Compliant Repos',
    key: 'compliantRepos' as keyof OverviewStats,
    icon: CheckCircle,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
]

export function DashboardOverview() {
  const [stats, setStats] = useState<OverviewStats>({
    totalRepositories: 0,
    activeScans: 0,
    criticalFindings: 0,
    compliantRepos: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOverviewStats()
  }, [])

  const fetchOverviewStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/dashboard/overview`)
      if (response.ok) {
        const data = await response.json()
        setStats(data.data || {
          totalRepositories: 12,
          activeScans: 3,
          criticalFindings: 7,
          compliantRepos: 8,
        })
      } else {
        // Fallback data for demo
        setStats({
          totalRepositories: 12,
          activeScans: 3,
          criticalFindings: 7,
          compliantRepos: 8,
        })
      }
    } catch (err) {
      console.error('Failed to fetch overview stats:', err)
      // Fallback data for demo
      setStats({
        totalRepositories: 12,
        activeScans: 3,
        criticalFindings: 7,
        compliantRepos: 8,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {statCards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                ) : (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {stats[card.key]}
                  </motion.span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {card.key === 'criticalFindings' && stats[card.key] > 0 && 'Requires attention'}
                {card.key === 'activeScans' && 'Currently running'}
                {card.key === 'totalRepositories' && 'Connected repositories'}
                {card.key === 'compliantRepos' && 'Meeting standards'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </>
  )
}