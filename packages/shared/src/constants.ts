/**
 * Application constants
 */

// API Configuration
export const API_CONFIG = {
  VERSION: 'v1',
  BASE_PATH: '/api/v1',
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  REQUEST_TIMEOUT: 30000, // 30 seconds
} as const;

// Scan Configuration
export const SCAN_CONFIG = {
  MAX_SCAN_DURATION: 120000, // 2 minutes in milliseconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 5000, // 5 seconds
  PARALLEL_SCANS: 5,
  SCAN_QUEUE_SIZE: 100,
} as const;

// Risk Scoring
export const RISK_SCORING = {
  WEIGHTS: {
    CRITICAL: 10,
    HIGH: 7,
    MEDIUM: 4,
    LOW: 2,
    INFO: 1,
  },
  THRESHOLDS: {
    HIGH_RISK: 70,
    MEDIUM_RISK: 40,
    LOW_RISK: 20,
  },
} as const;

// License Configuration
export const LICENSE_CONFIG = {
  FORBIDDEN_LICENSES: [
    'GPL-1.0',
    'GPL-1.0+',
    'GPL-2.0',
    'GPL-2.0+',
    'GPL-3.0',
    'GPL-3.0+',
    'AGPL-1.0',
    'AGPL-3.0',
    'SSPL-1.0',
    'OSL-1.0',
    'OSL-1.1',
    'OSL-2.0',
    'OSL-2.1',
    'OSL-3.0',
  ],
  APPROVED_LICENSES: [
    'MIT',
    'Apache-2.0',
    'BSD-2-Clause',
    'BSD-3-Clause',
    'ISC',
    'MPL-2.0',
    'LGPL-2.1',
    'LGPL-3.0',
  ],
} as const;

// Security Configuration
export const SECURITY_CONFIG = {
  CVSS_THRESHOLDS: {
    CRITICAL: 9.0,
    HIGH: 7.0,
    MEDIUM: 4.0,
    LOW: 0.1,
  },
  REQUIRED_HEADERS: [
    'Content-Security-Policy',
    'X-Frame-Options',
    'X-Content-Type-Options',
    'Strict-Transport-Security',
    'Referrer-Policy',
  ],
  OWASP_ZAP_CONFIG: {
    SPIDER_MAX_DEPTH: 5,
    SPIDER_MAX_CHILDREN: 10,
    ACTIVE_SCAN_POLICY: 'Default Policy',
    MAX_SCAN_DURATION: 300, // 5 minutes
  },
} as const;

// GitHub Configuration
export const GITHUB_CONFIG = {
  API_BASE_URL: 'https://api.github.com',
  WEBHOOK_EVENTS: [
    'push',
    'pull_request',
    'release',
    'issues',
  ],
  CHECK_RUN_NAME: 'RepoFlight Security Scan',
  APP_NAME: 'RepoFlight',
} as const;

// File Patterns
export const FILE_PATTERNS = {
  PACKAGE_FILES: [
    'package.json',
    'package-lock.json',
    'yarn.lock',
    'requirements.txt',
    'Pipfile',
    'Pipfile.lock',
    'go.mod',
    'go.sum',
    'Cargo.toml',
    'Cargo.lock',
    'pom.xml',
    'build.gradle',
    'composer.json',
    'composer.lock',
  ],
  CONFIG_FILES: [
    'Dockerfile',
    'docker-compose.yml',
    'docker-compose.yaml',
    '.env',
    '.env.example',
    'next.config.js',
    'webpack.config.js',
    'tsconfig.json',
  ],
  IGNORE_PATTERNS: [
    'node_modules/**',
    '.git/**',
    'dist/**',
    'build/**',
    '.next/**',
    'coverage/**',
    '*.log',
    '*.tmp',
  ],
} as const;

// Compliance Frameworks
export const COMPLIANCE_FRAMEWORKS = {
  OWASP_TOP_10: {
    name: 'OWASP Top 10',
    version: '2021',
    controls: [
      'A01:2021 – Broken Access Control',
      'A02:2021 – Cryptographic Failures',
      'A03:2021 – Injection',
      'A04:2021 – Insecure Design',
      'A05:2021 – Security Misconfiguration',
      'A06:2021 – Vulnerable and Outdated Components',
      'A07:2021 – Identification and Authentication Failures',
      'A08:2021 – Software and Data Integrity Failures',
      'A09:2021 – Security Logging and Monitoring Failures',
      'A10:2021 – Server-Side Request Forgery',
    ],
  },
  CIS_BENCHMARKS: {
    name: 'CIS Controls',
    version: '8.0',
    categories: [
      'Inventory and Control of Enterprise Assets',
      'Inventory and Control of Software Assets',
      'Data Protection',
      'Secure Configuration of Enterprise Assets and Software',
      'Account Management',
      'Access Control Management',
    ],
  },
  SOC_2: {
    name: 'SOC 2',
    type: 'Type II',
    criteria: [
      'Security',
      'Availability',
      'Processing Integrity',
      'Confidentiality',
      'Privacy',
    ],
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  VALIDATION_FAILED: 'Request validation failed',
  RESOURCE_NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  INTERNAL_ERROR: 'Internal server error',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
  WEBHOOK_VALIDATION_FAILED: 'Webhook signature validation failed',
  SCAN_FAILED: 'Scan execution failed',
  GITHUB_API_ERROR: 'GitHub API error',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  SCAN_STARTED: 'Scan started successfully',
  SCAN_COMPLETED: 'Scan completed successfully',
  REPOSITORY_CREATED: 'Repository created successfully',
  REPOSITORY_UPDATED: 'Repository updated successfully',
  POLICY_CREATED: 'Policy created successfully',
  POLICY_UPDATED: 'Policy updated successfully',
  FINDING_RESOLVED: 'Finding marked as resolved',
} as const;

// Regular Expressions
export const REGEX_PATTERNS = {
  GITHUB_REPO: /^[a-zA-Z0-9\-_\.]+\/[a-zA-Z0-9\-_\.]+$/,
  COMMIT_SHA: /^[a-f0-9]{40}$/i,
  SEMVER: /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  CVE_ID: /^CVE-\d{4}-\d{4,}$/,
  SPDX_LICENSE: /^[A-Za-z0-9\-\+\.]+$/,
} as const;