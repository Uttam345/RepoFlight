'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { 
  AlertTriangle, 
  ExternalLink, 
  GitBranch, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Zap,
  MoreHorizontal,
  FileText,
  Shield,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  apiClient, 
  type Finding, 
  formatDate, 
  getSeverityColor, 
  formatSeverity 
} from '@/lib/api'

const typeConfig = {
  security: { color: 'bg-red-100 text-red-800', label: 'Security', icon: Shield },
  license: { color: 'bg-purple-100 text-purple-800', label: 'License', icon: FileText },
  config: { color: 'bg-blue-100 text-blue-800', label: 'Config', icon: AlertCircle },
}

const statusConfig = {
  open: { variant: 'destructive' as const, label: 'Open', icon: AlertTriangle },
  resolved: { variant: 'default' as const, label: 'Resolved', icon: CheckCircle },
  ignored: { variant: 'secondary' as const, label: 'Ignored', icon: XCircle },
  false_positive: { variant: 'outline' as const, label: 'False Positive', icon: XCircle },
}

export function FindingsList() {
  const [findings, setFindings] = useState<Finding[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFindings, setSelectedFindings] = useState<Set<string>>(new Set())
  const [updatingFindings, setUpdatingFindings] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchFindings()
  }, [])

  const fetchFindings = async () => {
    try {
      const response = await apiClient.getFindings({ limit: 50 })
      if (response.success && response.data) {
        setFindings(response.data.findings)
      } else {
        throw new Error(response.error || 'Failed to fetch findings')
      }
    } catch (err) {
      console.error('Failed to fetch findings:', err)
      
      // Fallback demo data
      const demoData: Finding[] = [
        {
          id: '1',
          scanId: 'scan-1',
          type: 'security',
          severity: 'critical',
          title: 'SQL Injection Vulnerability',
          description: 'Potential SQL injection in user authentication query. User input is not properly sanitized before being used in database queries, allowing attackers to execute arbitrary SQL commands.',
          location: {
            file: 'src/auth/login.ts',
            line: 45,
            column: 12
          },
          metadata: {
            cwe: 'CWE-89',
            owasp: 'A03:2021 – Injection'
          },
          status: 'open',
          cvssScore: 9.1,
          cveId: 'CVE-2024-1234',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        },
        {
          id: '2',
          scanId: 'scan-2',
          type: 'security',
          severity: 'high',
          title: 'Outdated Dependency: lodash',
          description: 'Using lodash version 4.17.15 which has known security vulnerabilities. Update to version 4.17.21 or later to fix prototype pollution issues.',
          location: {
            file: 'package.json',
            line: 23
          },
          metadata: {
            package: 'lodash',
            currentVersion: '4.17.15',
            fixedVersion: '4.17.21'
          },
          status: 'open',
          cvssScore: 7.5,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        },
        {
          id: '3',
          scanId: 'scan-3',
          type: 'license',
          severity: 'medium',
          title: 'GPL License Detected',
          description: 'Package "some-gpl-package" uses GPL-3.0 license which may not be compatible with your project\'s license policy.',
          location: {
            file: 'package.json',
            line: 15
          },
          metadata: {
            package: 'some-gpl-package',
            license: 'GPL-3.0',
            policy: 'forbidden'
          },
          status: 'open',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        },
        {
          id: '4',
          scanId: 'scan-4',
          type: 'security',
          severity: 'high',
          title: 'Hardcoded API Key',
          description: 'API key found hardcoded in source code. This should be moved to environment variables to prevent credential exposure.',
          location: {
            file: 'src/config/api.ts',
            line: 12,
            column: 25
          },
          metadata: {
            keyType: 'API_KEY',
            pattern: 'sk-[a-zA-Z0-9]{32}'
          },
          status: 'resolved',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        },
        {
          id: '5',
          scanId: 'scan-5',
          type: 'config',
          severity: 'low',
          title: 'Insecure HTTP Configuration',
          description: 'Server is configured to accept HTTP connections. Consider enforcing HTTPS for all connections.',
          location: {
            file: 'src/server.ts',
            line: 8
          },
          metadata: {
            protocol: 'http',
            recommendation: 'https'
          },
          status: 'ignored',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        },
      ]
      setFindings(demoData)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateFinding = async (findingId: string, status: Finding['status']) => {
    setUpdatingFindings(prev => new Set(prev).add(findingId))
    
    try {
      await apiClient.updateFinding(findingId, { status })
      
      setFindings(prev => prev.map(finding => 
        finding.id === findingId 
          ? { ...finding, status, updatedAt: new Date().toISOString() }
          : finding
      ))
    } catch (err) {
      console.error('Failed to update finding:', err)
    } finally {
      setUpdatingFindings(prev => {
        const newSet = new Set(prev)
        newSet.delete(findingId)
        return newSet
      })
    }
  }

  const handleGenerateFix = async (findingId: string) => {
    try {
      const response = await apiClient.generateFix(findingId)
      if (response.success && response.data.pullRequestUrl) {
        window.open(response.data.pullRequestUrl, '_blank')
      }
    } catch (err) {
      console.error('Failed to generate fix:', err)
    }
  }

  const handleSelectFinding = (findingId: string, selected: boolean) => {
    setSelectedFindings(prev => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(findingId)
      } else {
        newSet.delete(findingId)
      }
      return newSet
    })
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedFindings(new Set(findings.map(f => f.id)))
    } else {
      setSelectedFindings(new Set())
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (findings.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
        <h3 className="text-lg font-medium mb-2">No security findings</h3>
        <p className="text-muted-foreground mb-4">
          Great! No security issues were found in your repositories.
        </p>
        <Button>Run New Scan</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedFindings.size > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedFindings.size === findings.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">
                  {selectedFindings.size} finding{selectedFindings.size !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Mark as Resolved
                </Button>
                <Button variant="outline" size="sm">
                  Mark as Ignored
                </Button>
                <Button size="sm" className="gap-2">
                  <Zap className="h-3 w-3" />
                  Generate Fixes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Findings List */}
      {findings.map((finding, index) => {
        const typeConf = typeConfig[finding.type]
        const statusConf = statusConfig[finding.status]
        const isUpdating = updatingFindings.has(finding.id)
        const isSelected = selectedFindings.has(finding.id)
        
        return (
          <motion.div
            key={finding.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className={`hover:shadow-lg transition-all duration-200 ${
              isSelected ? 'ring-2 ring-primary/20 bg-primary/5' : ''
            } ${finding.status === 'resolved' ? 'opacity-75' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleSelectFinding(finding.id, checked as boolean)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <typeConf.icon className={`h-4 w-4 flex-shrink-0 ${
                            finding.severity === 'critical' ? 'text-red-600' :
                            finding.severity === 'high' ? 'text-orange-600' :
                            finding.severity === 'medium' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`} />
                          <CardTitle className="text-lg truncate">{finding.title}</CardTitle>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getSeverityColor(finding.severity)}>
                            {formatSeverity(finding.severity)}
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
                          {finding.cveId && (
                            <Badge variant="outline" className="gap-1">
                              <ExternalLink className="h-3 w-3" />
                              {finding.cveId}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="h-3 w-3" />
                          Details
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {finding.status === 'open' && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateFinding(finding.id, 'resolved')}
                                  disabled={isUpdating}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark as Resolved
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateFinding(finding.id, 'ignored')}
                                  disabled={isUpdating}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Mark as Ignored
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateFinding(finding.id, 'false_positive')}
                                  disabled={isUpdating}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  False Positive
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleGenerateFix(finding.id)}
                                  className="text-primary"
                                >
                                  <Zap className="h-4 w-4 mr-2" />
                                  Generate Fix
                                </DropdownMenuItem>
                              </>
                            )}
                            {finding.status !== 'open' && (
                              <DropdownMenuItem 
                                onClick={() => handleUpdateFinding(finding.id, 'open')}
                                disabled={isUpdating}
                              >
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Reopen
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <CardDescription className="text-sm leading-relaxed">
                  {finding.description}
                </CardDescription>
                
                {/* Location and Metadata */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4 flex-wrap">
                    {finding.location && (
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <span className="font-mono text-xs">
                          {finding.location.file}
                          {finding.location.line && `:${finding.location.line}`}
                          {finding.location.column && `:${finding.location.column}`}
                        </span>
                      </div>
                    )}
                    
                    {finding.metadata?.cwe && (
                      <Badge variant="outline" className="text-xs">
                        {finding.metadata.cwe}
                      </Badge>
                    )}
                    
                    {finding.metadata?.owasp && (
                      <Badge variant="outline" className="text-xs">
                        {finding.metadata.owasp}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span className="text-xs">
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