import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { ScanType, FindingType, Severity } from '@repoflight/shared'
import { BaseAgent, ScanResult, Finding } from './base-agent'

export class LicenseAgent extends BaseAgent {
  scanType = ScanType.LICENSE
  name = 'License Compliance Agent'

  private forbiddenLicenses = [
    'GPL-2.0',
    'GPL-3.0',
    'AGPL-3.0',
    'SSPL-1.0',
    'OSL-3.0',
    'EUPL-1.2'
  ]

  async scan(repositoryPath: string, options?: { forbiddenLicenses?: string[] }): Promise<ScanResult> {
    const findings: Finding[] = []
    const forbiddenLicenses = options?.forbiddenLicenses || this.forbiddenLicenses

    // Check package.json for license violations
    const packageJsonPath = join(repositoryPath, 'package.json')
    if (existsSync(packageJsonPath)) {
      const packageJsonFindings = await this.scanPackageJson(packageJsonPath, forbiddenLicenses)
      findings.push(...packageJsonFindings)
    }

    // Check package-lock.json for dependency licenses
    const packageLockPath = join(repositoryPath, 'package-lock.json')
    if (existsSync(packageLockPath)) {
      const packageLockFindings = await this.scanPackageLock(packageLockPath, forbiddenLicenses)
      findings.push(...packageLockFindings)
    }

    // Check for LICENSE file
    const licenseFindings = await this.scanLicenseFile(repositoryPath, forbiddenLicenses)
    findings.push(...licenseFindings)

    const riskScore = this.calculateRiskScore(findings)

    return {
      findings,
      riskScore,
      metadata: {
        scannedFiles: ['package.json', 'package-lock.json', 'LICENSE'],
        forbiddenLicenses,
      },
    }
  }

  private async scanPackageJson(filePath: string, forbiddenLicenses: string[]): Promise<Finding[]> {
    const findings: Finding[] = []

    try {
      const content = readFileSync(filePath, 'utf-8')
      const packageJson = JSON.parse(content)

      if (packageJson.license) {
        const license = packageJson.license
        if (forbiddenLicenses.includes(license)) {
          findings.push({
            type: FindingType.LICENSE_VIOLATION,
            severity: Severity.HIGH,
            title: `Forbidden license detected: ${license}`,
            description: `The package.json file specifies a forbidden license: ${license}`,
            filePath: 'package.json',
            metadata: {
              license,
              field: 'license',
            },
          })
        }
      }
    } catch (error) {
      findings.push({
        type: FindingType.LICENSE_VIOLATION,
        severity: Severity.MEDIUM,
        title: 'Unable to parse package.json',
        description: `Failed to parse package.json for license information: ${error}`,
        filePath: 'package.json',
      })
    }

    return findings
  }

  private async scanPackageLock(filePath: string, forbiddenLicenses: string[]): Promise<Finding[]> {
    const findings: Finding[] = []

    try {
      const content = readFileSync(filePath, 'utf-8')
      const packageLock = JSON.parse(content)

      if (packageLock.packages) {
        for (const [packagePath, packageInfo] of Object.entries(packageLock.packages)) {
          const pkg = packageInfo as any
          if (pkg.license && forbiddenLicenses.includes(pkg.license)) {
            findings.push({
              type: FindingType.LICENSE_VIOLATION,
              severity: Severity.HIGH,
              title: `Dependency with forbidden license: ${pkg.license}`,
              description: `Dependency ${packagePath} uses forbidden license: ${pkg.license}`,
              filePath: 'package-lock.json',
              metadata: {
                license: pkg.license,
                package: packagePath,
                version: pkg.version,
              },
            })
          }
        }
      }
    } catch (error) {
      findings.push({
        type: FindingType.LICENSE_VIOLATION,
        severity: Severity.MEDIUM,
        title: 'Unable to parse package-lock.json',
        description: `Failed to parse package-lock.json for license information: ${error}`,
        filePath: 'package-lock.json',
      })
    }

    return findings
  }

  private async scanLicenseFile(repositoryPath: string, forbiddenLicenses: string[]): Promise<Finding[]> {
    const findings: Finding[] = []
    const licenseFiles = ['LICENSE', 'LICENSE.txt', 'LICENSE.md', 'COPYING']

    for (const fileName of licenseFiles) {
      const filePath = join(repositoryPath, fileName)
      if (existsSync(filePath)) {
        try {
          const content = readFileSync(filePath, 'utf-8')
          
          // Simple license detection based on content
          for (const license of forbiddenLicenses) {
            if (content.includes(license) || this.detectLicenseByContent(content, license)) {
              findings.push({
                type: FindingType.LICENSE_VIOLATION,
                severity: Severity.CRITICAL,
                title: `Repository uses forbidden license: ${license}`,
                description: `The ${fileName} file indicates the repository uses forbidden license: ${license}`,
                filePath: fileName,
                metadata: {
                  license,
                  detectedIn: fileName,
                },
              })
            }
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

    return findings
  }

  private detectLicenseByContent(content: string, license: string): boolean {
    const licensePatterns: Record<string, RegExp[]> = {
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
    }

    const patterns = licensePatterns[license]
    if (!patterns) return false

    return patterns.some(pattern => pattern.test(content))
  }
}