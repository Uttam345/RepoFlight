import { Finding, Severity } from '@prisma/client';

export interface RiskScore {
  overall: number;
  license: number;
  security: number;
  configuration: number;
  trend: 'improving' | 'stable' | 'degrading';
  lastUpdated: Date;
}

export interface RiskWeights {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
}

const DEFAULT_WEIGHTS: RiskWeights = {
  critical: 10,
  high: 7,
  medium: 4,
  low: 2,
  info: 1,
};

/**
 * Calculate risk score based on findings
 */
export function calculateRiskScore(
  findings: Finding[],
  weights: RiskWeights = DEFAULT_WEIGHTS
): RiskScore {
  const now = new Date();
  
  // Separate findings by type
  const licenseFindings = findings.filter(f => f.type === 'LICENSE_VIOLATION');
  const securityFindings = findings.filter(f => 
    f.type === 'VULNERABILITY' || f.type === 'SECURITY_MISCONFIGURATION'
  );
  const configFindings = findings.filter(f => f.type === 'DEPENDENCY_ISSUE');

  // Calculate scores for each category
  const licenseScore = calculateCategoryScore(licenseFindings, weights);
  const securityScore = calculateCategoryScore(securityFindings, weights);
  const configurationScore = calculateCategoryScore(configFindings, weights);

  // Calculate overall score (weighted average)
  const totalFindings = findings.length;
  const overall = totalFindings === 0 ? 0 : 
    Math.min(100, (licenseScore + securityScore + configurationScore) / 3);

  return {
    overall: Math.round(overall * 100) / 100,
    license: Math.round(licenseScore * 100) / 100,
    security: Math.round(securityScore * 100) / 100,
    configuration: Math.round(configurationScore * 100) / 100,
    trend: 'stable', // TODO: Calculate trend based on historical data
    lastUpdated: now,
  };
}

/**
 * Calculate score for a specific category of findings
 */
function calculateCategoryScore(
  findings: Finding[],
  weights: RiskWeights
): number {
  if (findings.length === 0) return 0;

  const totalWeight = findings.reduce((sum, finding) => {
    return sum + getSeverityWeight(finding.severity, weights);
  }, 0);

  // Normalize to 0-100 scale with logarithmic scaling for high counts
  const baseScore = Math.min(100, totalWeight * 2);
  const scaledScore = findings.length > 10 
    ? baseScore + Math.log10(findings.length) * 10
    : baseScore;

  return Math.min(100, scaledScore);
}

/**
 * Get weight for a severity level
 */
function getSeverityWeight(severity: Severity, weights: RiskWeights): number {
  switch (severity) {
    case 'CRITICAL':
      return weights.critical;
    case 'HIGH':
      return weights.high;
    case 'MEDIUM':
      return weights.medium;
    case 'LOW':
      return weights.low;
    case 'INFO':
      return weights.info;
    default:
      return weights.low;
  }
}

/**
 * Calculate CVSS-based risk score
 */
export function calculateCVSSRisk(cvssScore: number): Severity {
  if (cvssScore >= 9.0) return 'CRITICAL';
  if (cvssScore >= 7.0) return 'HIGH';
  if (cvssScore >= 4.0) return 'MEDIUM';
  if (cvssScore >= 0.1) return 'LOW';
  return 'INFO';
}