'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface FindingsStats {
  critical: number
  high: number
  medium: number
  low: number
}

const statCards = [
  {
    title: 'Critical',
    key: 'critical' as keyof FindingsStats,
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  {
    title: 'High',
    key: 'high' as keyof FindingsStats,
    icon: AlertCircle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    title: 'Medium',
    key: 'medium' as keyof FindingsStats,
    icon: Info,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  {
    title: 'Low',
    key: 'low' as keyof FindingsStats,
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
]

export function FindingsStats() {
  const [stats, setStats] = useState<FindingsStats>({
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFindingsStats()
  }, [])

  const fetchFindingsStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/findings/stats`)
      if (response.ok) {
        const result = await response.json()
        setStats(result.data)
      } else {
        // Fallback demo data
        setStats({
          critical: 7,
          high: 23,
          medium: 45,
          low: 12,
        })
      }
    } catch (err) {
      console.error('Failed to fetch findings stats:', err)
      // Fallback demo data
      setStats({
        critical: 7,
        high: 23,
        medium: 45,
        low: 12,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                {card.title} Severity
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
                {card.key === 'critical' && stats[card.key] > 0 && 'Immediate action required'}
                {card.key === 'high' && 'Should be addressed soon'}
                {card.key === 'medium' && 'Monitor and plan fixes'}
                {card.key === 'low' && 'Low priority items'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}