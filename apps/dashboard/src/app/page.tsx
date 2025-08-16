import { Suspense } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { ContentSection } from "@/components/layout/content-section"
import { DashboardOverview } from "@/components/dashboard/overview"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { SecurityMetrics } from "@/components/dashboard/security-metrics"
import { ComplianceStatus } from "@/components/dashboard/compliance-status"
import { RiskTrendsChart } from "@/components/dashboard/risk-trends-chart"
import { VulnerabilityHeatmap } from "@/components/dashboard/vulnerability-heatmap"
import { Shield, TrendingUp, Zap } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 p-8 md:p-12">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                  Welcome Back
                </h1>
                <p className="text-lg text-muted-foreground">Monitor your security posture at a glance</p>
              </div>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Your repositories are being continuously monitored for security vulnerabilities and compliance issues.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Button size="lg" className="gap-2">
                <Zap className="h-4 w-4" />
                Start New Scan
              </Button>
              <Button variant="outline" size="lg" className="gap-2 bg-transparent">
                <TrendingUp className="h-4 w-4" />
                View All Reports
              </Button>
            </div>
          </div>
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        </div>

        <ContentSection title="Overview" description="Key metrics and status at a glance">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Suspense
              fallback={
                <Card className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              }
            >
              <DashboardOverview />
            </Suspense>
          </div>
        </ContentSection>

        <div className="grid gap-8 lg:grid-cols-2">
          <ContentSection variant="card" title="Security Metrics" description="Current security status and trends">
            <Suspense
              fallback={
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                  <div className="h-4 bg-muted rounded w-4/6" />
                </div>
              }
            >
              <SecurityMetrics />
            </Suspense>
          </ContentSection>

          <ContentSection variant="card" title="Compliance Status" description="Policy adherence and recommendations">
            <Suspense
              fallback={
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                  <div className="h-4 bg-muted rounded w-4/6" />
                </div>
              }
            >
              <ComplianceStatus />
            </Suspense>
          </ContentSection>
        </div>

        <ContentSection title="Risk & Compliance Trends" description="Track security posture over time">
          <Suspense
            fallback={<div className="h-96 bg-muted animate-pulse rounded-lg" />}
          >
            <RiskTrendsChart />
          </Suspense>
        </ContentSection>

        <ContentSection title="Vulnerability Heatmap" description="Visual overview of security risks across repositories">
          <Suspense
            fallback={<div className="h-80 bg-muted animate-pulse rounded-lg" />}
          >
            <VulnerabilityHeatmap />
          </Suspense>
        </ContentSection>

        <ContentSection variant="card" title="Recent Activity" description="Latest scans, findings, and actions">
          <Suspense
            fallback={
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            }
          >
            <RecentActivity />
          </Suspense>
        </ContentSection>
      </div>
    </MainLayout>
  )
}