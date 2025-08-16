/**
 * API client utilities for RepoFlight Dashboard
 * Provides type-safe API calls with error handling and caching
 */

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

export interface Repository {
  id: string
  githubId: number
  name: string
  owner: string
  fullName: string
  description?: string
  language?: string
  isPrivate: boolean
  defaultBranch: string
  lastScanAt?: string
  riskScore?: number
  complianceScore?: number
  status: 'active' | 'archived' | 'scanning'
  createdAt: string
  updatedAt: string
}

export interface Scan {
  id: string
  repositoryId: string
  commitSha: string
  scanType: 'license' | 'security' | 'config' | 'full'
  status: 'pending' | 'running' | 'completed' | 'failed'
  findings: Finding[]
  riskScore?: number
  startedAt: string
  completedAt?: string
  duration?: number
  repository: Repository
}

export interface Finding {
  id: string
  scanId: string
  type: 'license' | 'security' | 'config'
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  title: string
  description: string
  location?: {
    file: string
    line?: number
    column?: number
  }
  metadata?: Record<string, any>
  status: 'open' | 'resolved' | 'ignored' | 'false_positive'
  cvssScore?: number
  cveId?: string
  createdAt: string
  updatedAt: string
}

export interface DashboardStats {
  totalRepositories: number
  activeScans: number
  criticalFindings: number
  compliantRepos: number
  riskTrend: 'improving' | 'stable' | 'degrading'
  complianceTrend: 'improving' | 'stable' | 'degrading'
}

export interface SecurityMetrics {
  vulnerabilities: {
    critical: number
    high: number
    medium: number
    low: number
  }
  trends: {
    period: string
    critical: number[]
    high: number[]
    medium: number[]
    low: number[]
  }
  recentFindings: Finding[]
}

export interface ComplianceStatus {
  frameworks: {
    name: string
    score: number
    controls: {
      total: number
      passing: number
      failing: number
    }
  }[]
  policies: {
    name: string
    status: 'compliant' | 'non_compliant' | 'warning'
    violations: number
  }[]
}

class ApiClient {
  private baseUrl: string
  private defaultHeaders: HeadersInit

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  // Dashboard APIs
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request<DashboardStats>('/api/v1/dashboard/overview')
  }

  async getSecurityMetrics(): Promise<ApiResponse<SecurityMetrics>> {
    return this.request<SecurityMetrics>('/api/v1/dashboard/security-metrics')
  }

  async getComplianceStatus(): Promise<ApiResponse<ComplianceStatus>> {
    return this.request<ComplianceStatus>('/api/v1/dashboard/compliance-status')
  }

  // Repository APIs
  async getRepositories(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    language?: string
  }): Promise<ApiResponse<{ repositories: Repository[]; total: number; page: number; limit: number }>> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.search) searchParams.set('search', params.search)
    if (params?.status) searchParams.set('status', params.status)
    if (params?.language) searchParams.set('language', params.language)

    const query = searchParams.toString()
    return this.request<{ repositories: Repository[]; total: number; page: number; limit: number }>(
      `/api/v1/repositories${query ? `?${query}` : ''}`
    )
  }

  async getRepository(id: string): Promise<ApiResponse<Repository>> {
    return this.request<Repository>(`/api/v1/repositories/${id}`)
  }

  async connectRepository(data: {
    githubUrl: string
    accessToken?: string
  }): Promise<ApiResponse<Repository>> {
    return this.request<Repository>('/api/v1/repositories', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateRepository(id: string, data: Partial<Repository>): Promise<ApiResponse<Repository>> {
    return this.request<Repository>(`/api/v1/repositories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteRepository(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/v1/repositories/${id}`, {
      method: 'DELETE',
    })
  }

  // Scan APIs
  async getScans(params?: {
    repositoryId?: string
    page?: number
    limit?: number
    status?: string
    scanType?: string
  }): Promise<ApiResponse<{ scans: Scan[]; total: number; page: number; limit: number }>> {
    const searchParams = new URLSearchParams()
    if (params?.repositoryId) searchParams.set('repositoryId', params.repositoryId)
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.status) searchParams.set('status', params.status)
    if (params?.scanType) searchParams.set('scanType', params.scanType)

    const query = searchParams.toString()
    return this.request<{ scans: Scan[]; total: number; page: number; limit: number }>(
      `/api/v1/scans${query ? `?${query}` : ''}`
    )
  }

  async getScan(id: string): Promise<ApiResponse<Scan>> {
    return this.request<Scan>(`/api/v1/scans/${id}`)
  }

  async startScan(data: {
    repositoryId: string
    scanType: 'license' | 'security' | 'config' | 'full'
    commitSha?: string
  }): Promise<ApiResponse<Scan>> {
    return this.request<Scan>('/api/v1/scans', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async cancelScan(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/v1/scans/${id}/cancel`, {
      method: 'POST',
    })
  }

  // Findings APIs
  async getFindings(params?: {
    repositoryId?: string
    scanId?: string
    page?: number
    limit?: number
    severity?: string
    status?: string
    type?: string
  }): Promise<ApiResponse<{ findings: Finding[]; total: number; page: number; limit: number }>> {
    const searchParams = new URLSearchParams()
    if (params?.repositoryId) searchParams.set('repositoryId', params.repositoryId)
    if (params?.scanId) searchParams.set('scanId', params.scanId)
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.severity) searchParams.set('severity', params.severity)
    if (params?.status) searchParams.set('status', params.status)
    if (params?.type) searchParams.set('type', params.type)

    const query = searchParams.toString()
    return this.request<{ findings: Finding[]; total: number; page: number; limit: number }>(
      `/api/v1/findings${query ? `?${query}` : ''}`
    )
  }

  async getFinding(id: string): Promise<ApiResponse<Finding>> {
    return this.request<Finding>(`/api/v1/findings/${id}`)
  }

  async updateFinding(id: string, data: {
    status?: Finding['status']
    notes?: string
  }): Promise<ApiResponse<Finding>> {
    return this.request<Finding>(`/api/v1/findings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async bulkUpdateFindings(data: {
    findingIds: string[]
    status: Finding['status']
    notes?: string
  }): Promise<ApiResponse<void>> {
    return this.request<void>('/api/v1/findings/bulk-update', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Auto-fix APIs
  async generateFix(findingId: string): Promise<ApiResponse<{
    pullRequestUrl?: string
    fixDescription: string
    confidence: number
  }>> {
    return this.request<{
      pullRequestUrl?: string
      fixDescription: string
      confidence: number
    }>(`/api/v1/findings/${findingId}/generate-fix`, {
      method: 'POST',
    })
  }
}

// Create singleton instance
export const apiClient = new ApiClient()

// Utility functions for common operations
export const mockApiResponse = <T>(data: T, delay = 1000): Promise<ApiResponse<T>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data,
        success: true,
      })
    }, delay)
  })
}

export const formatSeverity = (severity: Finding['severity']): string => {
  return severity.charAt(0).toUpperCase() + severity.slice(1)
}

export const getSeverityColor = (severity: Finding['severity']): string => {
  switch (severity) {
    case 'critical':
      return 'text-red-600 bg-red-50 border-red-200'
    case 'high':
      return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'low':
      return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'info':
      return 'text-gray-600 bg-gray-50 border-gray-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export const getRiskScoreColor = (score?: number): string => {
  if (!score) return 'text-gray-500'
  if (score >= 80) return 'text-red-600'
  if (score >= 60) return 'text-orange-600'
  if (score >= 40) return 'text-yellow-600'
  return 'text-green-600'
}

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatDuration = (seconds?: number): string => {
  if (!seconds) return 'N/A'
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  }
  return `${remainingSeconds}s`
}