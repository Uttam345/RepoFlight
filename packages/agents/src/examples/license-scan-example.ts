#!/usr/bin/env node

/**
 * Example usage of the License Agent
 * This demonstrates how to use the LicenseAgent to scan a repository for license compliance
 */

import { LicenseAgent, LicensePolicy } from '../license-agent'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

async function runLicenseScanExample() {
  console.log('🔍 RepoFlight License Agent Example\n')

  // Create a temporary test repository
  const testRepoPath = join(__dirname, '../../temp-test-repo')
  
  if (!existsSync(testRepoPath)) {
    mkdirSync(testRepoPath, { recursive: true })
  }

  // Create sample package.json with dependencies
  const packageJson = {
    name: 'test-project',
    version: '1.0.0',
    license: 'MIT',
    dependencies: {
      express: '^4.18.0',
      lodash: '^4.17.21',
    },
    devDependencies: {
      jest: '^29.0.0',
      typescript: '^5.0.0',
    },
  }

  writeFileSync(
    join(testRepoPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  )

  // Create sample LICENSE file
  const mitLicense = `MIT License

Copyright (c) 2023 Test Project

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`

  writeFileSync(join(testRepoPath, 'LICENSE'), mitLicense)

  // Create sample requirements.txt for Python dependencies
  const requirementsTxt = `django>=3.2.0
requests==2.28.1
numpy>=1.21.0
# Development dependencies
pytest>=7.0.0`

  writeFileSync(join(testRepoPath, 'requirements.txt'), requirementsTxt)

  // Create sample go.mod for Go dependencies
  const goMod = `module example.com/test-project

go 1.19

require (
    github.com/gin-gonic/gin v1.9.1
    github.com/stretchr/testify v1.8.4
)

require github.com/gorilla/mux v1.8.0`

  writeFileSync(join(testRepoPath, 'go.mod'), goMod)

  // Initialize the License Agent
  const licenseAgent = new LicenseAgent()

  console.log('📋 Default License Policy:')
  const defaultPolicy = licenseAgent.getLicensePolicy()
  console.log(`  Forbidden Licenses: ${defaultPolicy.forbiddenLicenses.slice(0, 5).join(', ')}...`)
  console.log(`  Approved Licenses: ${defaultPolicy.approvedLicenses.join(', ')}`)
  console.log(`  Require License File: ${defaultPolicy.requireLicenseFile}`)
  console.log(`  Allow Unknown Licenses: ${defaultPolicy.allowUnknownLicenses}\n`)

  // Run the license scan
  console.log('🔍 Running license compliance scan...\n')
  
  try {
    const scanResult = await licenseAgent.scan(testRepoPath)

    console.log('📊 Scan Results:')
    console.log(`  Risk Score: ${scanResult.riskScore.toFixed(2)}/10`)
    console.log(`  Total Findings: ${scanResult.findings.length}`)
    console.log(`  Total Dependencies: ${scanResult.metadata?.totalDependencies || 0}`)
    console.log(`  Scanned Ecosystems: ${scanResult.metadata?.scannedEcosystems?.join(', ') || 'none'}\n`)

    if (scanResult.findings.length > 0) {
      console.log('⚠️  License Violations Found:')
      scanResult.findings.forEach((finding, index) => {
        console.log(`  ${index + 1}. ${finding.title}`)
        console.log(`     Severity: ${finding.severity}`)
        console.log(`     File: ${finding.filePath}`)
        console.log(`     Description: ${finding.description}\n`)
      })
    } else {
      console.log('✅ No license violations found!\n')
    }

    // Generate and export SPDX report
    if (scanResult.metadata?.spdxReport) {
      const spdxOutputPath = join(testRepoPath, 'spdx-report.json')
      await licenseAgent.exportSPDXReport(scanResult.metadata.spdxReport, spdxOutputPath)
      console.log(`📄 SPDX report exported to: ${spdxOutputPath}`)
      
      console.log('\n📋 SPDX Report Summary:')
      console.log(`  SPDX Version: ${scanResult.metadata.spdxReport.spdxVersion}`)
      console.log(`  Document Name: ${scanResult.metadata.spdxReport.name}`)
      console.log(`  Packages: ${scanResult.metadata.spdxReport.packages.length}`)
      console.log(`  Created: ${scanResult.metadata.spdxReport.creationInfo.created}`)
    }

    // Demonstrate custom policy
    console.log('\n🔧 Testing Custom Policy (Stricter):')
    const customPolicy: Partial<LicensePolicy> = {
      forbiddenLicenses: ['GPL-2.0', 'GPL-3.0', 'AGPL-3.0', 'LGPL-2.1', 'LGPL-3.0'],
      allowUnknownLicenses: false,
      requireLicenseFile: true,
    }

    const customScanResult = await licenseAgent.scan(testRepoPath, { policy: customPolicy })
    console.log(`  Custom Policy Risk Score: ${customScanResult.riskScore.toFixed(2)}/10`)
    console.log(`  Custom Policy Findings: ${customScanResult.findings.length}`)

    if (customScanResult.findings.length > 0) {
      console.log('  Additional violations with stricter policy:')
      customScanResult.findings.forEach((finding, index) => {
        if (!scanResult.findings.some(f => f.title === finding.title)) {
          console.log(`    - ${finding.title} (${finding.severity})`)
        }
      })
    }

  } catch (error) {
    console.error('❌ License scan failed:', error)
  }

  console.log('\n✨ License scan example completed!')
  console.log(`📁 Test repository created at: ${testRepoPath}`)
  console.log('   You can examine the generated files and SPDX report.')
}

// Run the example if this file is executed directly
if (require.main === module) {
  runLicenseScanExample().catch(console.error)
}

export { runLicenseScanExample }