import { readFileSync, existsSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { execSync } from 'child_process'
import * as licenseChecker from 'license-checker'
import { ScanType, FindingType, Severity, LICENSE_CONFIG } from '@repoflight/shared'
import { BaseAgent, ScanResult, Finding } from './base-agent'

export interface LicensePolicy {
  forbiddenLicenses: string[]
  approvedLicenses: string[]
  requireLicenseFile: boolean
  allowUnknownLicenses: boolean
}

export interface DependencyLicense {
  name: string
  version: string
  license: string
  licenseFile?: string
  repository?: string
  path?: string
}

export interface SPDXDocument {
  spdxVersion: string
  dataLicense: string
  SPDXID: string
  name: string
  documentNamespace: string
  creationInfo: {
    created: string
    creators: string[]
  }
  packages: SPDXPackage[]
}

export interface SPDXPackage {
  SPDXID: string
  name: string
  downloadLocation: string
  filesAnalyzed: boolean
  licenseConcluded: string
  licenseDeclared: string
  copyrightText: string
  versionInfo?: string
  supplier?: string
  homepage?: string
}

export class LicenseAgent extends BaseAgent {
  scanType = ScanType.LICENSE
  name = 'License Compliance Agent'

  private defaultPolicy: LicensePolicy = {
    forbiddenLicenses: [...LICENSE_CONFIG.FORBIDDEN_LICENSES],
    approvedLicenses: [...LICENSE_CONFIG.APPROVED_LICENSES],
    requireLicenseFile: true,
    allowUnknownLicenses: false,
  }

  async scan(repositoryPath: string, options?: { policy?: Partial<LicensePolicy> }): Promise<ScanResult> {
    const policy = { ...this.defaultPolicy, ...options?.policy }
    const findings: Finding[] = []
    const dependencies: DependencyLicense[] = []

    try {
      // Scan Node.js dependencies
      const nodeFindings = await this.scanNodeDependencies(repositoryPath, policy)
      findings.push(...nodeFindings.findings)
      dependencies.push(...nodeFindings.dependencies)

      // Scan Python dependencies
      const pythonFindings = await this.scanPythonDependencies(repositoryPath, policy)
      findings.push(...pythonFindings.findings)
      dependencies.push(...pythonFindings.dependencies)

      // Scan Go dependencies
      const goFindings = await this.scanGoDependencies(repositoryPath, policy)
      findings.push(...goFindings.findings)
      dependencies.push(...goFindings.dependencies)

      // Check repository license file
      const licenseFindings = await this.scanRepositoryLicense(repositoryPath, policy)
      findings.push(...licenseFindings)

      // Generate SPDX report
      const spdxReport = this.generateSPDXReport(repositoryPath, dependencies)

      const riskScore = this.calculateRiskScore(findings)

      return {
        findings,
        riskScore,
        metadata: {
          totalDependencies: dependencies.length,
          scannedEcosystems: ['npm', 'python', 'go'],
          policy,
          spdxReport,
          dependencies,
        },
      }
    } catch (error) {
      findings.push({
        type: FindingType.LICENSE_VIOLATION,
        severity: Severity.HIGH,
        title: 'License scan failed',
        description: `Failed to complete license scan: ${error instanceof Error ? error.message : String(error)}`,
        filePath: repositoryPath,
      })

      return {
        findings,
        riskScore: 8.0, // High risk for scan failure
        metadata: {
          error: error instanceof Error ? error.message : String(error),
          policy,
        },
      }
    }
  }

  private async scanNodeDependencies(
    repositoryPath: string,
    policy: LicensePolicy
  ): Promise<{ findings: Finding[]; dependencies: DependencyLicense[] }> {
    const findings: Finding[] = []
    const dependencies: DependencyLicense[] = []

    const packageJsonPath = join(repositoryPath, 'package.json')
    if (!existsSync(packageJsonPath)) {
      return { findings, dependencies }
    }

    try {
      // Use license-checker to scan npm dependencies
      const licenseData = await new Promise<any>((resolve, reject) => {
        licenseChecker.init(
          {
            start: repositoryPath,
            production: true,
            development: true,
            unknown: true,
            onlyAllow: '',
            excludePrivatePackages: true,
          },
          (err, packages) => {
            if (err) {
              reject(err)
            } else {
              resolve(packages)
            }
          }
        )
      })

      // Process each package
      for (const [packageName, packageInfo] of Object.entries(licenseData)) {
        const info = packageInfo as any
        const dependency: DependencyLicense = {
          name: packageName,
          version: info.version || 'unknown',
          license: info.licenses || 'UNKNOWN',
          licenseFile: info.licenseFile,
          repository: info.repository,
          path: info.path,
        }

        dependencies.push(dependency)

        // Check for license violations
        const violation = this.evaluateLicensePolicy(dependency, policy)
        if (violation) {
          findings.push(violation)
        }
      }

      // Also check package.json license field
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
      if (packageJson.license) {
        const projectLicense: DependencyLicense = {
          name: packageJson.name || 'project',
          version: packageJson.version || '1.0.0',
          license: packageJson.license,
          path: 'package.json',
        }

        const violation = this.evaluateLicensePolicy(projectLicense, policy)
        if (violation) {
          findings.push(violation)
        }
      }
    } catch (error) {
      findings.push({
        type: FindingType.LICENSE_VIOLATION,
        severity: Severity.MEDIUM,
        title: 'Failed to scan Node.js dependencies',
        description: `Error scanning npm packages: ${error instanceof Error ? error.message : String(error)}`,
        filePath: 'package.json',
      })
    }

    return { findings, dependencies }
  }

  private async scanPythonDependencies(
    repositoryPath: string,
    policy: LicensePolicy
  ): Promise<{ findings: Finding[]; dependencies: DependencyLicense[] }> {
    const findings: Finding[] = []
    const dependencies: DependencyLicense[] = []

    const requirementsPath = join(repositoryPath, 'requirements.txt')
    const pipfilePath = join(repositoryPath, 'Pipfile')

    if (!existsSync(requirementsPath) && !existsSync(pipfilePath)) {
      return { findings, dependencies }
    }

    try {
      // Try to use pip-licenses if available
      let licenseOutput: string
      try {
        licenseOutput = execSync('pip-licenses --format=json --with-urls --with-license-file', {
          cwd: repositoryPath,
          encoding: 'utf-8',
          timeout: 30000,
        })
      } catch (error) {
        // Fallback to parsing requirements.txt manually
        return this.parseRequirementsTxt(repositoryPath, policy)
      }

      const licenseData = JSON.parse(licenseOutput)

      for (const pkg of licenseData) {
        const dependency: DependencyLicense = {
          name: pkg.Name,
          version: pkg.Version,
          license: pkg.License || 'UNKNOWN',
          licenseFile: pkg.LicenseFile,
          repository: pkg.URL,
        }

        dependencies.push(dependency)

        const violation = this.evaluateLicensePolicy(dependency, policy)
        if (violation) {
          findings.push(violation)
        }
      }
    } catch (error) {
      findings.push({
        type: FindingType.LICENSE_VIOLATION,
        severity: Severity.MEDIUM,
        title: 'Failed to scan Python dependencies',
        description: `Error scanning Python packages: ${error instanceof Error ? error.message : String(error)}`,
        filePath: existsSync(requirementsPath) ? 'requirements.txt' : 'Pipfile',
      })
    }

    return { findings, dependencies }
  }

  private parseRequirementsTxt(
    repositoryPath: string,
    policy: LicensePolicy
  ): { findings: Finding[]; dependencies: DependencyLicense[] } {
    const findings: Finding[] = []
    const dependencies: DependencyLicense[] = []

    const requirementsPath = join(repositoryPath, 'requirements.txt')
    if (!existsSync(requirementsPath)) {
      return { findings, dependencies }
    }

    try {
      const content = readFileSync(requirementsPath, 'utf-8')
      const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'))

      for (const line of lines) {
        const match = line.match(/^([a-zA-Z0-9\-_\.]+)([>=<~!]+.*)?$/)
        if (match) {
          const dependency: DependencyLicense = {
            name: match[1],
            version: match[2] || 'unknown',
            license: 'UNKNOWN', // Cannot determine without pip-licenses
          }

          dependencies.push(dependency)

          // Only flag unknown licenses if policy doesn't allow them
          if (!policy.allowUnknownLicenses) {
            findings.push({
              type: FindingType.LICENSE_VIOLATION,
              severity: Severity.LOW,
              title: `Unknown license for Python package: ${dependency.name}`,
              description: `Cannot determine license for Python package ${dependency.name}. Install pip-licenses for detailed scanning.`,
              filePath: 'requirements.txt',
              metadata: {
                package: dependency.name,
                version: dependency.version,
                license: 'UNKNOWN',
              },
            })
          }
        }
      }
    } catch (error) {
      findings.push({
        type: FindingType.LICENSE_VIOLATION,
        severity: Severity.MEDIUM,
        title: 'Failed to parse requirements.txt',
        description: `Error parsing requirements.txt: ${error instanceof Error ? error.message : String(error)}`,
        filePath: 'requirements.txt',
      })
    }

    return { findings, dependencies }
  }

  private async scanGoDependencies(
    repositoryPath: string,
    policy: LicensePolicy
  ): Promise<{ findings: Finding[]; dependencies: DependencyLicense[] }> {
    const findings: Finding[] = []
    const dependencies: DependencyLicense[] = []

    const goModPath = join(repositoryPath, 'go.mod')
    if (!existsSync(goModPath)) {
      return { findings, dependencies }
    }

    try {
      const content = readFileSync(goModPath, 'utf-8')
      const lines = content.split('\n')

      let inRequireBlock = false
      for (const line of lines) {
        const trimmed = line.trim()

        if (trimmed === 'require (') {
          inRequireBlock = true
          continue
        }

        if (inRequireBlock && trimmed === ')') {
          inRequireBlock = false
          continue
        }

        if (inRequireBlock || trimmed.startsWith('require ')) {
          const match = trimmed.match(/([^\s]+)\s+([^\s]+)/)
          if (match) {
            const dependency: DependencyLicense = {
              name: match[1],
              version: match[2],
              license: 'UNKNOWN', // Go modules don't include license info in go.mod
            }

            dependencies.push(dependency)

            // Only flag unknown licenses if policy doesn't allow them
            if (!policy.allowUnknownLicenses) {
              findings.push({
                type: FindingType.LICENSE_VIOLATION,
                severity: Severity.LOW,
                title: `Unknown license for Go module: ${dependency.name}`,
                description: `Cannot determine license for Go module ${dependency.name}. Manual verification required.`,
                filePath: 'go.mod',
                metadata: {
                  package: dependency.name,
                  version: dependency.version,
                  license: 'UNKNOWN',
                },
              })
            }
          }
        }
      }
    } catch (error) {
      findings.push({
        type: FindingType.LICENSE_VIOLATION,
        severity: Severity.MEDIUM,
        title: 'Failed to scan Go dependencies',
        description: `Error scanning go.mod: ${error instanceof Error ? error.message : String(error)}`,
        filePath: 'go.mod',
      })
    }

    return { findings, dependencies }
  }

  private async scanRepositoryLicense(repositoryPath: string, policy: LicensePolicy): Promise<Finding[]> {
    const findings: Finding[] = []
    const licenseFiles = ['LICENSE', 'LICENSE.txt', 'LICENSE.md', 'COPYING', 'LICENCE']

    let licenseFound = false
    for (const fileName of licenseFiles) {
      const filePath = join(repositoryPath, fileName)
      if (existsSync(filePath)) {
        licenseFound = true
        try {
          const content = readFileSync(filePath, 'utf-8')
          const detectedLicense = this.detectLicenseFromContent(content)

          if (detectedLicense && policy.forbiddenLicenses.includes(detectedLicense)) {
            findings.push({
              type: FindingType.LICENSE_VIOLATION,
              severity: Severity.CRITICAL,
              title: `Repository uses forbidden license: ${detectedLicense}`,
              description: `The ${fileName} file indicates the repository uses forbidden license: ${detectedLicense}`,
              filePath: fileName,
              metadata: {
                license: detectedLicense,
                detectedIn: fileName,
              },
            })
          }
        } catch (error) {
          findings.push({
            type: FindingType.LICENSE_VIOLATION,
            severity: Severity.LOW,
            title: `Unable to read ${fileName}`,
            description: `Failed to read license file ${fileName}: ${error}`,
            filePath: fileName,
          })
        }
        break // Only check the first license file found
      }
    }

    if (!licenseFound && policy.requireLicenseFile) {
      findings.push({
        type: FindingType.LICENSE_VIOLATION,
        severity: Severity.MEDIUM,
        title: 'No license file found',
        description: 'Repository does not contain a LICENSE file. This may cause legal compliance issues.',
        filePath: repositoryPath,
        metadata: {
          expectedFiles: licenseFiles,
        },
      })
    }

    return findings
  }

  private evaluateLicensePolicy(dependency: DependencyLicense, policy: LicensePolicy): Finding | null {
    const { license, name, version } = dependency

    // Check for forbidden licenses
    if (policy.forbiddenLicenses.some(forbidden => this.licenseMatches(license, forbidden))) {
      return {
        type: FindingType.LICENSE_VIOLATION,
        severity: Severity.HIGH,
        title: `Forbidden license detected: ${license}`,
        description: `Package ${name}@${version} uses forbidden license: ${license}`,
        filePath: dependency.path || 'dependencies',
        metadata: {
          package: name,
          version,
          license,
          repository: dependency.repository,
        },
      }
    }

    // Check for unknown licenses
    if (license === 'UNKNOWN' && !policy.allowUnknownLicenses) {
      return {
        type: FindingType.LICENSE_VIOLATION,
        severity: Severity.MEDIUM,
        title: `Unknown license for package: ${name}`,
        description: `Package ${name}@${version} has unknown or unspecified license`,
        filePath: dependency.path || 'dependencies',
        metadata: {
          package: name,
          version,
          license,
          repository: dependency.repository,
        },
      }
    }

    return null
  }

  private licenseMatches(license: string, pattern: string): boolean {
    // Normalize license strings for comparison
    const normalizedLicense = license.toLowerCase().replace(/[^a-z0-9]/g, '')
    const normalizedPattern = pattern.toLowerCase().replace(/[^a-z0-9]/g, '')

    return normalizedLicense.includes(normalizedPattern) || normalizedPattern.includes(normalizedLicense)
  }

  private detectLicenseFromContent(content: string): string | null {
    const licensePatterns: Record<string, RegExp[]> = {
      'MIT': [
        /MIT License/i,
        /Permission is hereby granted, free of charge/i,
      ],
      'Apache-2.0': [
        /Apache License\s+Version 2\.0/i,
        /Licensed under the Apache License, Version 2\.0/i,
      ],
      'GPL-2.0': [
        /GNU GENERAL PUBLIC LICENSE\s+Version 2/i,
        /GPL-2\.0/i,
      ],
      'GPL-3.0': [
        /GNU GENERAL PUBLIC LICENSE\s+Version 3/i,
        /GPL-3\.0/i,
      ],
      'AGPL-3.0': [
        /GNU AFFERO GENERAL PUBLIC LICENSE\s+Version 3/i,
        /AGPL-3\.0/i,
      ],
      'BSD-2-Clause': [
        /BSD 2-Clause License/i,
        /Redistribution and use in source and binary forms/i,
      ],
      'BSD-3-Clause': [
        /BSD 3-Clause License/i,
        /Neither the name of.*nor the names of its contributors/i,
      ],
    }

    for (const [license, patterns] of Object.entries(licensePatterns)) {
      if (patterns.some(pattern => pattern.test(content))) {
        return license
      }
    }

    return null
  }

  private generateSPDXReport(repositoryPath: string, dependencies: DependencyLicense[]): SPDXDocument {
    const timestamp = new Date().toISOString()
    const repoName = repositoryPath.split('/').pop() || 'unknown-repository'

    const spdxPackages: SPDXPackage[] = dependencies.map((dep, index) => ({
      SPDXID: `SPDXRef-Package-${index + 1}`,
      name: dep.name,
      downloadLocation: dep.repository || 'NOASSERTION',
      filesAnalyzed: false,
      licenseConcluded: dep.license || 'NOASSERTION',
      licenseDeclared: dep.license || 'NOASSERTION',
      copyrightText: 'NOASSERTION',
      versionInfo: dep.version,
      supplier: 'NOASSERTION',
      homepage: dep.repository,
    }))

    return {
      spdxVersion: 'SPDX-2.3',
      dataLicense: 'CC0-1.0',
      SPDXID: 'SPDXRef-DOCUMENT',
      name: `${repoName}-license-report`,
      documentNamespace: `https://repoflight.com/spdx/${repoName}-${Date.now()}`,
      creationInfo: {
        created: timestamp,
        creators: ['Tool: RepoFlight License Agent'],
      },
      packages: spdxPackages,
    }
  }

  /**
   * Export SPDX report to file
   */
  async exportSPDXReport(spdxReport: SPDXDocument, outputPath: string): Promise<void> {
    try {
      const spdxJson = JSON.stringify(spdxReport, null, 2)
      writeFileSync(outputPath, spdxJson, 'utf-8')
    } catch (error) {
      throw new Error(`Failed to export SPDX report: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Get license policy configuration
   */
  getLicensePolicy(): LicensePolicy {
    return { ...this.defaultPolicy }
  }

  /**
   * Update license policy configuration
   */
  updateLicensePolicy(policy: Partial<LicensePolicy>): void {
    this.defaultPolicy = { ...this.defaultPolicy, ...policy }
  }
}