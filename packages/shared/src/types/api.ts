import { z } from 'zod';

// API Response wrapper
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }).optional(),
  meta: z.object({
    timestamp: z.string(),
    requestId: z.string(),
    version: z.string(),
  }).optional(),
});

// Pagination schema
export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Repository API schemas
export const CreateRepositorySchema = z.object({
  githubId: z.number(),
  name: z.string(),
  owner: z.string(),
  fullName: z.string(),
  defaultBranch: z.string().default('main'),
  isPrivate: z.boolean().default(false),
});

export const UpdateRepositorySchema = z.object({
  name: z.string().optional(),
  defaultBranch: z.string().optional(),
  isPrivate: z.boolean().optional(),
});

// Scan API schemas
export const CreateScanSchema = z.object({
  repositoryId: z.string(),
  commitSha: z.string(),
  branch: z.string().default('main'),
  scanType: z.enum(['LICENSE', 'SECURITY', 'CONTAINER', 'FULL']),
});

export const UpdateScanSchema = z.object({
  status: z.enum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
  riskScore: z.number().min(0).max(100).optional(),
  errorMessage: z.string().optional(),
});

// Finding API schemas
export const CreateFindingSchema = z.object({
  scanId: z.string(),
  type: z.enum(['LICENSE_VIOLATION', 'VULNERABILITY', 'SECURITY_MISCONFIGURATION', 'DEPENDENCY_ISSUE', 'CODE_QUALITY']),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']),
  title: z.string(),
  description: z.string(),
  filePath: z.string().optional(),
  lineNumber: z.number().optional(),
  columnNumber: z.number().optional(),
  metadata: z.record(z.any()).optional(),
  cveId: z.string().optional(),
  cvssScore: z.number().min(0).max(10).optional(),
});

export const UpdateFindingSchema = z.object({
  status: z.enum(['OPEN', 'RESOLVED', 'IGNORED', 'FALSE_POSITIVE']).optional(),
  resolvedBy: z.string().optional(),
});

// Policy API schemas
export const CreatePolicySchema = z.object({
  repositoryId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  forbiddenLicenses: z.array(z.string()).default([]),
  cvssThreshold: z.number().min(0).max(10).default(7.0),
  requiredHeaders: z.array(z.string()).default([]),
  customRules: z.record(z.any()).optional(),
  isActive: z.boolean().default(true),
});

export const UpdatePolicySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  forbiddenLicenses: z.array(z.string()).optional(),
  cvssThreshold: z.number().min(0).max(10).optional(),
  requiredHeaders: z.array(z.string()).optional(),
  customRules: z.record(z.any()).optional(),
  isActive: z.boolean().optional(),
});

// Query filters
export const RepositoryFiltersSchema = z.object({
  owner: z.string().optional(),
  isPrivate: z.boolean().optional(),
  hasActiveScans: z.boolean().optional(),
});

export const ScanFiltersSchema = z.object({
  repositoryId: z.string().optional(),
  status: z.enum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
  scanType: z.enum(['LICENSE', 'SECURITY', 'CONTAINER', 'FULL']).optional(),
  branch: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const FindingFiltersSchema = z.object({
  repositoryId: z.string().optional(),
  scanId: z.string().optional(),
  type: z.enum(['LICENSE_VIOLATION', 'VULNERABILITY', 'SECURITY_MISCONFIGURATION', 'DEPENDENCY_ISSUE', 'CODE_QUALITY']).optional(),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']).optional(),
  status: z.enum(['OPEN', 'RESOLVED', 'IGNORED', 'FALSE_POSITIVE']).optional(),
  cveId: z.string().optional(),
});

// Type exports
export type ApiResponse<T = any> = z.infer<typeof ApiResponseSchema> & { data?: T };
export type Pagination = z.infer<typeof PaginationSchema>;
export type CreateRepository = z.infer<typeof CreateRepositorySchema>;
export type UpdateRepository = z.infer<typeof UpdateRepositorySchema>;
export type CreateScan = z.infer<typeof CreateScanSchema>;
export type UpdateScan = z.infer<typeof UpdateScanSchema>;
export type CreateFinding = z.infer<typeof CreateFindingSchema>;
export type UpdateFinding = z.infer<typeof UpdateFindingSchema>;
export type CreatePolicy = z.infer<typeof CreatePolicySchema>;
export type UpdatePolicy = z.infer<typeof UpdatePolicySchema>;
export type RepositoryFilters = z.infer<typeof RepositoryFiltersSchema>;
export type ScanFilters = z.infer<typeof ScanFiltersSchema>;
export type FindingFilters = z.infer<typeof FindingFiltersSchema>;

// HTTP status codes
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

// Error codes
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  FORBIDDEN_ACCESS = 'FORBIDDEN_ACCESS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  WEBHOOK_VALIDATION_FAILED = 'WEBHOOK_VALIDATION_FAILED',
  SCAN_FAILED = 'SCAN_FAILED',
  GITHUB_API_ERROR = 'GITHUB_API_ERROR',
}