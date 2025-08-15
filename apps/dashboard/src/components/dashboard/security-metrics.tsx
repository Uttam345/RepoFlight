'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface SecurityData {
  vulnerabilities: Array<{
    severity: string
    count: number
  }>
  trends: Array<{
    date: string
    critical: number
    high: number
    medium: number
    low: number
  }>
}

const COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
}

export function SecurityMetrics() {
  const [data, setData] = useState<SecurityData>({
    vulnerabilities: [],
    trends: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSecurityMetrics()
  }, [])

  const fetchSecurityMetrics = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/security/metrics`)
      if (response.ok) {
        const result = await response.json()
        setData(result.data)
      } else {
        // Fallback demo data
        setData({
          vulnerabilities: [
            { severity: 'Critical', count: 7 },
            { severity: 'High', count: 23 },
            { severity: 'Medium', count: 45 },
            { severity: 'Low', count: 12 },
          ],
          trends: [
            { date: '2024-01', critical: 5, high: 18, medium: 32, low: 8 },
            { date: '2024-02', critical: 3, high: 21, medium: 38, low: 10 },
            { date: '2024-03', critical: 7, high: 23, medium: 45, low: 12 },
          ]
        })
      }
    } catch (err) {
      console.error('Failed to fetch security metrics:', err)
      // Fallback demo data
      setData({
        vulnerabilities: [
          { severity: 'Critical', count: 7 },
          { severity: 'High', count: 23 },
          { severity: 'Medium', count: 45 },
          { severity: 'Low', count: 12 },
        ],
        trends: [
          { date: '2024-01', critical: 5, high: 18, medium: 32, low: 8 },
          { date: '2024-02', critical: 3, high: 21, medium: 38, low: 10 },
          { date: '2024-03', critical: 7, high: 23, medium: 45, low: 12 },
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Security Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Security Metrics</CardTitle>
          <CardDescription>
            Vulnerability distribution and trends across your repositories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="distribution" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="distribution">Distribution</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>
            
            <TabsContent value="distribution" className="space-y-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data.vulnerabilities}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ severity, count }) => `${severity}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {data.vulnerabilities.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[entry.severity.toLowerCase() as keyof typeof COLORS]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="trends" className="space-y-4">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="critical" stackId="a" fill={COLORS.critical} />
                  <Bar dataKey="high" stackId="a" fill={COLORS.high} />
                  <Bar dataKey="medium" stackId="a" fill={COLORS.medium} />
                  <Bar dataKey="low" stackId="a" fill={COLORS.low} />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  )
}