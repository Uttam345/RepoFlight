'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface ComplianceItem {
  id: string
  name: string
  status: 'compliant' | 'non-compliant' | 'warning' | 'pending'
  score: number
  description: string
}

const statusConfig = {
  compliant: { icon: CheckCircle, color: 'text-green-600', variant: 'default' as const },
  'non-compliant': { icon: XCircle, color: 'text-red-600', variant: 'destructive' as const },
  warning: { icon: AlertCircle, color: 'text-yellow-600', variant: 'secondary' as const },
  pending: { icon: Clock, color: 'text-blue-600', variant: 'outline' as const },
}

export function ComplianceStatus() {
  const [complianceData, setComplianceData] = useState<ComplianceItem[]>([])
  const [overallScore, setOverallScore] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchComplianceStatus()
  }, [])

  const fetchComplianceStatus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/compliance/status`)
      if (response.ok) {
        const result = await response.json()
        setComplianceData(result.data.items)
        setOverallScore(result.data.overallScore)
      } else {
        // Fallback demo data
        const demoData = [
          {
            id: '1',
            name: 'License Compliance',
            status: 'compliant' as const,
            score: 95,
            description: 'All dependencies use approved licenses'
          },
          {
            id: '2',
            name: 'Security Scanning',
            status: 'warning' as const,
            score: 78,
            description: '3 medium vulnerabilities found'
          },
          {
            id: '3',
            name: 'Code Quality',
            status: 'compliant' as const,
            score: 88,
            description: 'Meets quality standards'
          },
          {
            id: '4',
            name: 'Documentation',
            status: 'non-compliant' as const,
            score: 45,
            description: 'Missing required documentation'
          },
        ]
        setComplianceData(demoData)
        setOverallScore(76)
      }
    } catch (err) {
      console.error('Failed to fetch compliance status:', err)
      // Fallback demo data
      const demoData = [
        {
          id: '1',
          name: 'License Compliance',
          status: 'compliant' as const,
          score: 95,
          description: 'All dependencies use approved licenses'
        },
        {
          id: '2',
          name: 'Security Scanning',
          status: 'warning' as const,
          score: 78,
          description: '3 medium vulnerabilities found'
        },
        {
          id: '3',
          name: 'Code Quality',
          status: 'compliant' as const,
          score: 88,
          description: 'Meets quality standards'
        },
        {
          id: '4',
          name: 'Documentation',
          status: 'non-compliant' as const,
          score: 45,
          description: 'Missing required documentation'
        },
      ]
      setComplianceData(demoData)
      setOverallScore(76)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compliance Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Compliance Status</CardTitle>
          <CardDescription>
            Overall compliance score and detailed breakdown
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">{overallScore}%</div>
            <Progress value={overallScore} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">Overall Compliance Score</p>
          </div>
          
          <div className="space-y-4">
            {complianceData.map((item, index) => {
              const config = statusConfig[item.status]
              const Icon = config.icon
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-5 w-5 ${config.color}`} />
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{item.score}%</span>
                    <Badge variant={config.variant}>
                      {item.status.replace('-', ' ')}
                    </Badge>
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