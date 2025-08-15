import { z } from 'zod';

// Scan request schema
export const ScanRequestSchema = z.object({
  repositoryId: z.string(),
  commitSha: z.string(),
  branch: z.string().default('main'),
  scanTypes: z.array(z.enum(['license', 'security', 'config', 'full'])),
  priority: z.enum(['high', 'normal', 'low']).default('normal'),
  metadata: z.record(z.any()).optional(),
});

// Scan result schema
export const ScanResultSchema = z.object({
  scanId: z.string(),
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']),
  findings: z.array(z.object({
    type: z.enum(['license_violation', 'vulnerability', 'security_misconfiguration', 'dependency_issue', 'code_quality']),
    severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
    title: z.string(),
    description: z.string(),
    filePath: z.string().optional(),
    lineNumber: z.number().optional(),
    columnNumber: z.number().optional(),
    metadata: z.record(z.any()).optional(),
    cveId: z.string().optional(),
    cvssScore: z.number().optional(),
  })),
  riskScore: z.number().optional(),
  startedAt: z.date(),
  completedAt: z.date().optional(),
  errorMessage: z.string().optional(),
});

// License finding schema
export const LicenseFindingSchema = z.object({
  packageName: z.string(),
  packageVersion: z.string(),
  licenseType: z.string(),
  licenseFile: z.string().optional(),
  repository: z.string().optional(),
  isViolation: z.boolean(),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
});

// Security finding schema
export const SecurityFindingSchema = z.object({
  ruleId: z.string(),
  category: z.string(),
  title: z.string(),
  description: z.string(),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
  confidence: z.enum(['high', 'medium', 'low']),
  filePath: z.string(),
  lineNumber: z.number().optional(),
  columnNumber: z.number().optional(),
  cveId: z.string().optional(),
  cvssScore: z.number().optional(),
  references: z.array(z.string()).optional(),
});

// Container finding schema
export const ContainerFindingSchema = z.object({
  vulnerabilityId: z.string(),
  packageName: z.string(),
  installedVersion: z.string(),
  fixedVersion: z.string().optional(),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
  title: z.string(),
  description: z.string(),
  references: z.array(z.string()).optional(),
  cvssScore: z.number().optional(),
});

// SARIF report schema (simplified)
export const SARIFReportSchema = z.object({
  version: z.string(),
  runs: z.array(z.object({
    tool: z.object({
      driver: z.object({
        name: z.string(),
        version: z.string().optional(),
      }),
    }),
    results: z.array(z.object({
      ruleId: z.string(),
      message: z.object({
        text: z.string(),
      }),
      level: z.enum(['error', 'warning', 'note', 'info']),
      locations: z.array(z.object({
        physicalLocation: z.object({
          artifactLocation: z.object({
            uri: z.string(),
          }),
          region: z.object({
            startLine: z.number(),
            startColumn: z.number().optional(),
          }).optional(),
        }),
      })).optional(),
    })),
  })),
});

// Type exports
export type ScanRequest = z.infer<typeof ScanRequestSchema>;
export type ScanResult = z.infer<typeof ScanResultSchema>;
export type LicenseFinding = z.infer<typeof LicenseFindingSchema>;
export type SecurityFinding = z.infer<typeof SecurityFindingSchema>;
export type ContainerFinding = z.infer<typeof ContainerFindingSchema>;
export type SARIFReport = z.infer<typeof SARIFReportSchema>;

// Scan type enum
export enum ScanType {
  LICENSE = 'LICENSE',
  SECURITY = 'SECURITY',
  CONTAINER = 'CONTAINER',
  FULL = 'FULL',
}

// Finding type enum
export enum FindingType {
  LICENSE_VIOLATION = 'LICENSE_VIOLATION',
  VULNERABILITY = 'VULNERABILITY',
  SECURITY_MISCONFIGURATION = 'SECURITY_MISCONFIGURATION',
  DEPENDENCY_ISSUE = 'DEPENDENCY_ISSUE',
  CODE_QUALITY = 'CODE_QUALITY',
}

// Severity enum
export enum Severity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO',
}

// Scan status enum
export enum ScanStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

// Finding severity enum (alias for backward compatibility)
export enum FindingSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO',
}