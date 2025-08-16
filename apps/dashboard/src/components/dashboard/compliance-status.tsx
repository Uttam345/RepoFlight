"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, AlertCircle, Shield, FileText, ExternalLink, Download } from "lucide-react"
import { apiClient, type ComplianceStatus as ComplianceStatusType } from "@/lib/api"

export function ComplianceStatus() {
  const [compliance, setCompliance] = useState<ComplianceStatusType | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchComplianceStatus()
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchComplianceStatus, 120000) // Update every 2 minutes
    return () => clearInterval(interval)
  }, [])

  const fetchComplianceStatus = async () => {
    try {
      const response = await apiClient.getComplianceStatus()
      if (response.success && response.data) {
        setCompliance(response.data)
      } else {
        throw new Error(response.error || 'Failed to fetch compliance status')
      }
    } catch (err) {
      console.error('Failed to fetch compliance status:', err)
      
      // Fallback data for demo
      setCompliance({
        frameworks: [
          {
            name: "OWASP Top 10",
            score: 85,
            controls: { total: 10, passing: 8, failing: 2 }
          },
          {
            name: "CIS Benchmarks",
            score: 92,
            controls: { total: 25, passing: 23, failing: 2 }
          },
          {
            name: "SOC 2",
            score: 78,
            controls: { total: 15, passing: 12, failing: 3 }
          }
        ],
        policies: [
          {
            name: "License Compliance",
            status: "compliant",
            violations: 0
          },
          {
            name: "Security Policies",
            status: "warning",
            violations: 3
          },
          {
            name: "Code Quality Standards",
            status: "compliant",
            violations: 0
          },
          {
            name: "Dependency Management",
            status: "non_compliant",
            violations: 8
          }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case "non_compliant":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "compliant":
        return "default"
      case "warning":
        return "secondary"
      case "non_compliant":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  if (loading || !compliance) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="h-12 w-20 bg-muted animate-pulse rounded mx-auto" />
          <div className="h-4 w-32 bg-muted animate-pulse rounded mx-auto" />
          <div className="h-2 w-full bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    )
  }

  const overallScore = Math.round(
    compliance.frameworks.reduce((acc, framework) => acc + framework.score, 0) / compliance.frameworks.length
  )

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overall Score */}
          <div className="text-center space-y-3 p-6 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border">
            <div className={`text-4xl font-bold ${getStatusColor(overallScore)}`}>
              {overallScore}%
            </div>
            <div className="text-sm text-muted-foreground">Overall Compliance Score</div>
            <Progress value={overallScore} className="w-full h-3" />
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              <span>Based on {compliance.frameworks.length} compliance frameworks</span>
            </div>
          </div>

          {/* Policy Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Policy Compliance</h4>
              <Button variant="outline" size="sm" className="gap-2">
                <FileText className="h-3 w-3" />
                View Policies
              </Button>
            </div>
            
            {compliance.policies.map((policy, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(policy.status)}
                  <div>
                    <div className="text-sm font-medium">{policy.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {policy.violations > 0 ? `${policy.violations} violations found` : "All checks passed"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {policy.violations > 0 && (
                    <span className="text-sm font-medium text-red-600">{policy.violations}</span>
                  )}
                  <Badge variant={getStatusVariant(policy.status) as any}>
                    {policy.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button size="sm" className="gap-2">
              <Download className="h-3 w-3" />
              Export Report
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="h-3 w-3" />
              View Details
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="frameworks" className="space-y-6">
          {/* Framework Scores */}
          <div className="grid gap-4">
            {compliance.frameworks.map((framework, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{framework.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {framework.controls.passing} of {framework.controls.total} controls passing
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getStatusColor(framework.score)}`}>
                      {framework.score}%
                    </div>
                  </div>
                </div>
                
                <Progress value={framework.score} className="h-2" />
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{framework.controls.passing} passing</span>
                  <span>{framework.controls.failing} failing</span>
                </div>
              </div>
            ))}
          </div>

          {/* Framework Details */}
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="font-medium mb-2">Compliance Framework Details</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• OWASP Top 10: Web application security risks</p>
              <p>• CIS Benchmarks: Configuration security standards</p>
              <p>• SOC 2: Service organization controls</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}