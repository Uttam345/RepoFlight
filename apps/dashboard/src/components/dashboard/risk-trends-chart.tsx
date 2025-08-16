"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts'
import { TrendingUp, TrendingDown, Calendar, Download } from 'lucide-react'

interface RiskTrendData {
  date: string
  riskScore: number
  criticalFindings: number
  highFindings: number
  mediumFindings: number
  lowFindings: number
  complianceScore: number
}

export function RiskTrendsChart() {
  const [data, setData] = useState<RiskTrendData[]>([])
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrendData()
  }, [timeRange])

  const fetchTrendData = async () => {
    setLoading(true)
    try {
      // Simulate API call - replace with actual API
      const mockData: RiskTrendData[] = Array.from({ length: timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        
        return {
          date: date.toISOString().split('T')[0],
          riskScore: Math.floor(Math.random() * 40) + 30 + (i * 0.5), // Trending upward
          criticalFindings: Math.floor(Math.random() * 5),
          highFindings: Math.floor(Math.random() * 10) + 2,
          mediumFindings: Math.floor(Math.random() * 15) + 5,
          lowFindings: Math.floor(Math.random() * 20) + 8,
          complianceScore: Math.floor(Math.random() * 20) + 70 - (i * 0.3), // Trending downward
        }
      }).reverse()
      
      setData(mockData)
    } catch (err) {
      console.error('Failed to fetch trend data:', err)
    } finally {
      setLoading(false)
    }
  }

  const calculateTrend = (values: number[]) => {
    if (values.length < 2) return 0
    const recent = values.slice(-7).reduce((a, b) => a + b, 0) / 7
    const previous = values.slice(-14, -7).reduce((a, b) => a + b, 0) / 7
    return ((recent - previous) / previous) * 100
  }

  const riskTrend = calculateTrend(data.map(d => d.riskScore))
  const complianceTrend = calculateTrend(data.map(d => d.complianceScore))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium">{new Date(label).toLocaleDateString()}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
              {entry.name.includes('Score') && '%'}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted animate-pulse rounded w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Risk & Compliance Trends</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Track security posture over time
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="7d">7D</TabsTrigger>
                <TabsTrigger value="30d">30D</TabsTrigger>
                <TabsTrigger value="90d">90D</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-3 w-3" />
              Export
            </Button>
          </div>
        </div>
        
        {/* Trend Indicators */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            {riskTrend > 0 ? (
              <TrendingUp className="h-4 w-4 text-red-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-600" />
            )}
            <span className="text-sm">
              Risk Score: 
              <span className={riskTrend > 0 ? 'text-red-600' : 'text-green-600'}>
                {riskTrend > 0 ? '+' : ''}{riskTrend.toFixed(1)}%
              </span>
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {complianceTrend > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className="text-sm">
              Compliance: 
              <span className={complianceTrend > 0 ? 'text-green-600' : 'text-red-600'}>
                {complianceTrend > 0 ? '+' : ''}{complianceTrend.toFixed(1)}%
              </span>
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="findings">Findings</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="riskScore" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Risk Score"
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="complianceScore" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    name="Compliance Score"
                    dot={{ r: 4 }}
                  />
                  <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="5 5" label="Target" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="findings" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="criticalFindings"
                    stackId="1"
                    stroke="#dc2626"
                    fill="#dc2626"
                    name="Critical"
                  />
                  <Area
                    type="monotone"
                    dataKey="highFindings"
                    stackId="1"
                    stroke="#ea580c"
                    fill="#ea580c"
                    name="High"
                  />
                  <Area
                    type="monotone"
                    dataKey="mediumFindings"
                    stackId="1"
                    stroke="#d97706"
                    fill="#d97706"
                    name="Medium"
                  />
                  <Area
                    type="monotone"
                    dataKey="lowFindings"
                    stackId="1"
                    stroke="#2563eb"
                    fill="#2563eb"
                    name="Low"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="compliance" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    className="text-xs"
                  />
                  <YAxis domain={[0, 100]} className="text-xs" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="complianceScore"
                    stroke="#22c55e"
                    fill="url(#complianceGradient)"
                    name="Compliance Score"
                  />
                  <ReferenceLine y={90} stroke="#22c55e" strokeDasharray="5 5" label="Excellent" />
                  <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="5 5" label="Good" />
                  <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="5 5" label="Poor" />
                  <defs>
                    <linearGradient id="complianceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}