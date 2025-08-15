'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { AlertTriangle, ExternalLink, GitBranch, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Finding {
  id: string
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  type: 'security' | 'compliance' | 'license' | 'quality'
  repository: string
  file?: string
  line?: number
  status: 'open' | 'resolved' | 'false-positive' | 'suppressed'
  createdAt: string
  updatedAt: string
  cve?: string
  cvssScore?: number
}

const severityConfig = {
  critical: { color: 'bg-red-100 text-red-800', variant: 'destructive' as const },
  high: { color: 'bg-orange-100 text-orange-800', variant: 'secondary' as const },
  medium: { color: 'bg-yellow-100 text-yellow-800', variant: 'secondary' as const },
  low: { color: 'bg-green-100 text-green-800', variant: 'outline' as const },
}

const typeConfig = {
  security: { color: 'bg-red-100 text-red-800', label: 'Security' },
  compliance: { color: 'bg-blue-100 text-blue-800', label: 'Compliance' },
  license: { color: 'bg-purple-100 text-purple-800', label: 'License' },
  quality: { color: 'bg-green-100 text-green-800', label: 'Quality' },
}

const statusConfig = {
  open: { variant: 'destructive' as const, label: 'Open' },
  resolved: { variant: 'default' as const, label: 'Resolved' },
  'false-positive': { variant: 'secondary' as const, label: 'False Positive' },
  suppressed: { variant: 'outline' as const, label: 'Suppressed' },
}

export function FindingsList() {
  const [findings, setFindings] = useState<Finding[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFindings()
  }, [])

  const fetchFindings = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/findings`)
      if (response.ok) {
        const result = await response.json()
        setFindings(result.data)
      } else {
        // Fallback demo data
        const demoData: Finding[] = [
          {
            id: '1',
            title: 'SQL Injection Vulnerability',
            description: 'Potential SQL injection in user authentication query. User input is not properly sanitized before being used in database queries.',
            severity: 'critical',
            type: 'security',
            repository: 'auth-service',
            file: 'src/auth/login.ts',
            line: 45,
            status: 'open',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            cve: 'CVE-2024-1234',
            cvssScore: 9.1
          },
          {
            id: '2',
            title: 'Outdated Dependency: lodash',
            description: 'Using lodash version 4.17.15 which has known security vulnerabilities. Update to version 4.17.21 or later.',
            severity: 'high',
            type: 'security',
            repository: 'user-service',
            file: 'package.json',
            line: 23,
            status: 'open',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
            cvssScore: 7.5
          },
          {
            id: '3',
            title: 'Missing License Information',
            description: 'Package @types/node does not specify a license. This may cause compliance issues.',
            severity: 'medium',
            type: 'license',
            repository: 'api-gateway',
            file: 'package.json',
            line: 15,
            status: 'open',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          },
          {
            id: '4',
            title: 'Hardcoded API Key',
            description: 'API key found hardcoded in source code. This should be moved to environment variables.',
            severity: 'high',
            type: 'security',
            repository: 'payment-service',
            file: 'src/config/api.ts',
            line: 12,
            status: 'resolved',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          },
        ]
        setFindings(demoData)
      }
    } catch (err) {
      console.error('Failed to fetch findings:', err)
      // Fallback demo data
      const demoData: Finding[] = [
        {
          id: '1',
          title: 'SQL Injection Vulnerability',
          description: 'Potential SQL injection in user authentication query.',
          severity: 'critical',
          type: 'security',
          repository: 'auth-service',
          file: 'src/auth/login.ts',
          line: 45,
          status: 'open',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          cve: 'CVE-2024-1234',
          cvssScore: 9.1
        },
      ]
      setFindings(demoData)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {findings.map((finding, index) => {
        const severityConf = severityConfig[finding.severity]
        const typeConf = typeConfig[finding.type]
        const statusConf = statusConfig[finding.status]
        
        return (
          <motion.div
            key={finding.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className={`h-5 w-5 ${
                        finding.severity === 'critical' ? 'text-red-600' :
                        finding.severity === 'high' ? 'text-orange-600' :
                        finding.severity === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`} />
                      <CardTitle className="text-lg">{finding.title}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={severityConf.color}>
                        {finding.severity.toUpperCase()}
                      </Badge>
                      <Badge className={typeConf.color}>
                        {typeConf.label}
                      </Badge>
                      <Badge variant={statusConf.variant}>
                        {statusConf.label}
                      </Badge>
                      {finding.cvssScore && (
                        <Badge variant="outline">
                          CVSS {finding.cvssScore}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    {finding.status === 'open' && (
                      <Button size="sm">
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <CardDescription className="text-base">
                  {finding.description}
                </CardDescription>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <GitBranch className="h-4 w-4" />
                      <span>{finding.repository}</span>
                    </div>
                    {finding.file && (
                      <div className="flex items-center space-x-1">
                        <span>{finding.file}</span>
                        {finding.line && <span>:{finding.line}</span>}
                      </div>
                    )}
                    {finding.cve && (
                      <div className="flex items-center space-x-1">
                        <ExternalLink className="h-4 w-4" />
                        <span>{finding.cve}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDistanceToNow(new Date(finding.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}