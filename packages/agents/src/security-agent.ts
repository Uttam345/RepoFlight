import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { ScanType, FindingType, Severity } from '@repoflight/shared'
import { BaseAgent, ScanResult, Finding } from './base-agent'

export class SecurityAgent extends BaseAgent {
  scanType = ScanType.SECURITY
  name = 'Security Vulnerability Agent'

  async scan(repositoryPath: string, options?: { cvssThreshold?: number }): Promise<ScanResult> {
    const findings: Finding[] = []
    const cvssThreshold = options?.cvssThreshold || 7.0

    // Check for known vulnerable dependencies
    const dependencyFindings = await this.scanDependencies(repositoryPath, cvssThreshold)
    findings.push(...dependencyFindings)

    // Check for security misconfigurations
    const configFindings = await this.scanConfigurations(repositoryPath)
    findings.push(...configFindings)

    // Check for hardcoded secrets
    const secretFindings = await this.scanSecrets(repositoryPath)
    findings.push(...secretFindings)

    const riskScore = this.calculateRiskScore(findings)

    return {
      findings,
      riskScore,
      metadata: {
        cvssThreshold,
        scannedAreas: ['dependencies', 'configurations', 'secrets'],
      },
    }
  }

  private async scanDependencies(repositoryPath: string, cvssThreshold: number): Promise<Finding[]> {
    const findings: Finding[] = []

    // This is a simplified implementation
    // In a real scenario, you would integrate with vulnerability databases
    const packageJsonPath = join(repositoryPath, 'package.json')
    if (existsSync(packageJsonPath)) {
      try {
        const content = readFileSync(packageJsonPath, 'utf-8')
        const packageJson = JSON.parse(content)

        // Check for known vulnerable packages (simplified example)
        const vulnerablePackages = this.getKnownVulnerablePackages()
        
        const allDependencies = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
        }

        for (const [packageName, version] of Object.entries(allDependencies)) {
          const vulnerability = vulnerablePackages[packageName]
          if (vulnerability && this.isVersionVulnerable(version as string, vulnerability.affectedVersions)) {
            findings.push({
              type: FindingType.VULNERABILITY,
              severity: this.cvssToSeverity(vulnerability.cvssScore),
              title: `Vulnerable dependency: ${packageName}`,
              description: vulnerability.description,
              filePath: 'package.json',
              cveId: vulnerability.cveId,
              cvssScore: vulnerability.cvssScore,
              metadata: {
                package: packageName,
                version,
                fixedVersion: vulnerability.fixedVersion,
              },
            })
          }
        }
      } catch (error) {
        findings.push({
          type: FindingType.VULNERABILITY,
          severity: Severity.MEDIUM,
          title: 'Unable to scan dependencies',
          description: `Failed to parse package.json for vulnerability scanning: ${error}`,
          filePath: 'package.json',
        })
      }
    }

    return findings
  }

  private async scanConfigurations(repositoryPath: string): Promise<Finding[]> {
    const findings: Finding[] = []

    // Check Docker configurations
    const dockerfilePath = join(repositoryPath, 'Dockerfile')
    if (existsSync(dockerfilePath)) {
      const dockerFindings = await this.scanDockerfile(dockerfilePath)
      findings.push(...dockerFindings)
    }

    // Check for insecure configurations in common files
    const configFiles = [
      '.env.example',
      'config.json',
      'app.config.js',
      'next.config.js',
    ]

    for (const configFile of configFiles) {
      const filePath = join(repositoryPath, configFile)
      if (existsSync(filePath)) {
        const configFindings = await this.scanConfigFile(filePath)
        findings.push(...configFindings)
      }
    }

    return findings
  }

  private async scanDockerfile(filePath: string): Promise<Finding[]> {
    const findings: Finding[] = []

    try {
      const content = readFileSync(filePath, 'utf-8')
      const lines = content.split('\n')

      lines.forEach((line, index) => {
        const lineNumber = index + 1
        
        // Check for running as root
        if (line.trim().startsWith('USER root')) {
          findings.push({
            type: FindingType.SECURITY_MISCONFIGURATION,
            severity: Severity.HIGH,
            title: 'Container running as root user',
            description: 'Running containers as root poses security risks',
            filePath: 'Dockerfile',
            lineNumber,
            metadata: {
              recommendation: 'Create and use a non-root user',
            },
          })
        }

        // Check for latest tag usage
        if (line.includes(':latest')) {
          findings.push({
            type: FindingType.SECURITY_MISCONFIGURATION,
            severity: Severity.MEDIUM,
            title: 'Using latest tag in Docker image',
            description: 'Using latest tag can lead to unpredictable builds',
            filePath: 'Dockerfile',
            lineNumber,
            metadata: {
              recommendation: 'Use specific version tags',
            },
          })
        }
      })
    } catch (error) {
      findings.push({
        type: FindingType.SECURITY_MISCONFIGURATION,
        severity: Severity.LOW,
        title: 'Unable to scan Dockerfile',
        description: `Failed to scan Dockerfile: ${error}`,
        filePath: 'Dockerfile',
      })
    }

    return findings
  }

  private async scanConfigFile(filePath: string): Promise<Finding[]> {
    const findings: Finding[] = []

    try {
      const content = readFileSync(filePath, 'utf-8')
      
      // Check for insecure configurations
      const insecurePatterns = [
        { pattern: /ssl:\s*false/i, message: 'SSL disabled' },
        { pattern: /secure:\s*false/i, message: 'Secure flag disabled' },
        { pattern: /verify:\s*false/i, message: 'Verification disabled' },
        { pattern: /debug:\s*true/i, message: 'Debug mode enabled' },
      ]

      const lines = content.split('\n')
      lines.forEach((line, index) => {
        const lineNumber = index + 1
        
        insecurePatterns.forEach(({ pattern, message }) => {
          if (pattern.test(line)) {
            findings.push({
              type: FindingType.SECURITY_MISCONFIGURATION,
              severity: Severity.MEDIUM,
              title: `Insecure configuration: ${message}`,
              description: `Configuration file contains insecure setting: ${message}`,
              filePath: filePath.split('/').pop() || filePath,
              lineNumber,
            })
          }
        })
      })
    } catch (error) {
      // Ignore files that can't be read
    }

    return findings
  }

  private async scanSecrets(repositoryPath: string): Promise<Finding[]> {
    const findings: Finding[] = []

    const secretPatterns = [
      { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/ },
      { name: 'GitHub Token', pattern: /ghp_[a-zA-Z0-9]{36}/ },
      { name: 'Private Key', pattern: /-----BEGIN (RSA )?PRIVATE KEY-----/ },
      { name: 'API Key', pattern: /api[_-]?key['"]\s*[:=]\s*['"][a-zA-Z0-9]{20,}['"]/ },
      { name: 'Password', pattern: /password['"]\s*[:=]\s*['"][^'"]{8,}['"]/ },
    ]

    // Scan common files for secrets
    const filesToScan = [
      '.env',
      '.env.local',
      'config.json',
      'app.config.js',
    ]

    for (const fileName of filesToScan) {
      const filePath = join(repositoryPath, fileName)
      if (existsSync(filePath)) {
        try {
          const content = readFileSync(filePath, 'utf-8')
          const lines = content.split('\n')

          lines.forEach((line, index) => {
            const lineNumber = index + 1
            
            secretPatterns.forEach(({ name, pattern }) => {
              if (pattern.test(line)) {
                findings.push({
                  type: FindingType.SECURITY_MISCONFIGURATION,
                  severity: Severity.CRITICAL,
                  title: `Potential ${name} exposed`,
                  description: `Potential ${name} found in configuration file`,
                  filePath: fileName,
                  lineNumber,
                  metadata: {
                    secretType: name,
                    recommendation: 'Use environment variables or secure secret management',
                  },
                })
              }
            })
          })
        } catch (error) {
          // Ignore files that can't be read
        }
      }
    }

    return findings
  }

  private getKnownVulnerablePackages(): Record<string, any> {
    // This would typically come from a vulnerability database
    return {
      'lodash': {
        cveId: 'CVE-2021-23337',
        cvssScore: 7.2,
        description: 'Command injection vulnerability in lodash',
        affectedVersions: '<4.17.21',
        fixedVersion: '4.17.21',
      },
      'axios': {
        cveId: 'CVE-2021-3749',
        cvssScore: 6.5,
        description: 'Regular expression denial of service in axios',
        affectedVersions: '<0.21.2',
        fixedVersion: '0.21.2',
      },
    }
  }

  private isVersionVulnerable(version: string, affectedVersions: string): boolean {
    // Simplified version comparison
    // In a real implementation, you would use semver for proper comparison
    return version.includes(affectedVersions.replace('<', ''))
  }

  private cvssToSeverity(cvssScore: number): Severity {
    if (cvssScore >= 9.0) return Severity.CRITICAL
    if (cvssScore >= 7.0) return Severity.HIGH
    if (cvssScore >= 4.0) return Severity.MEDIUM
    if (cvssScore >= 0.1) return Severity.LOW
    return Severity.INFO
  }
}