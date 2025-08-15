import { ScanType, FindingType, Severity } from '@repoflight/shared'

export interface ScanResult {
  findings: Finding[]
  riskScore: number
  metadata?: Record<string, any>
}

export interface Finding {
  type: FindingType
  severity: Severity
  title: string
  description: string
  filePath?: string
  lineNumber?: number
  columnNumber?: number
  metadata?: Record<string, any>
  cveId?: string
  cvssScore?: number
}

export abstract class BaseAgent {
  abstract scanType: ScanType
  abstract name: string

  abstract scan(repositoryPath: string, options?: any): Promise<ScanResult>

  protected calculateRiskScore(findings: Finding[]): number {
    if (findings.length === 0) return 0

    const severityWeights = {
      [Severity.CRITICAL]: 10,
      [Severity.HIGH]: 7,
      [Severity.MEDIUM]: 4,
      [Severity.LOW]: 1,
      [Severity.INFO]: 0.5,
    }

    const totalWeight = findings.reduce((sum, finding) => {
      return sum + severityWeights[finding.severity]
    }, 0)

    // Normalize to 0-10 scale
    return Math.min(10, totalWeight / findings.length)
  }
}