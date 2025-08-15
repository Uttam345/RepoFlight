'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ScanStats {
  total: number
  running: number
  completed: number
  failed: number
}

const statCards = [
  {
    title: 'Total Scans',
    key: 'total' as keyof ScanStats,
    icon: Activity,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'Running',
    key: 'running' as keyof ScanStats,
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  {
    title: 'Completed',
    key: 'completed' as keyof ScanStats,
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    title: 'Failed',
    key: 'failed' as keyof ScanStats,
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
]

export function ScanStats() {
  const [stats, setStats] = useState<ScanStats>({
    total: 0,
    running: 0,
    completed: 0,
    failed: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchScanStats()
  }, [])

  const fetchScanStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/scans/stats`)
      if (response.ok) {
        const result = await response.json()
        setStats(result.data)
      } else {
        // Fallback demo data
        setStats({
          total: 47,
          running: 3,
          completed: 41,
          failed: 3,
        })
      }
    } catch (err) {
      console.error('Failed to fetch scan stats:', err)
      // Fallback demo data
      setStats({
        total: 47,
        running: 3,
        completed: 41,
        failed: 3,
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
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}