import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a demo repository
  const demoRepo = await prisma.repository.upsert({
    where: { githubId: 123456789 },
    update: {},
    create: {
      githubId: 123456789,
      name: 'demo-app',
      owner: 'repoflight-demo',
      fullName: 'repoflight-demo/demo-app',
      defaultBranch: 'main',
      isPrivate: false,
    },
  });

  console.log('✅ Created demo repository:', demoRepo.fullName);

  // Create a default policy for the demo repository
  const demoPolicy = await prisma.policy.upsert({
    where: { id: 'demo-policy' },
    update: {},
    create: {
      id: 'demo-policy',
      repositoryId: demoRepo.id,
      name: 'Default Security Policy',
      description: 'Default security and compliance policy for demo repository',
      forbiddenLicenses: ['GPL-2.0', 'GPL-3.0', 'AGPL-3.0', 'SSPL-1.0'],
      cvssThreshold: 7.0,
      requiredHeaders: ['Content-Security-Policy', 'X-Frame-Options', 'X-Content-Type-Options'],
      customRules: {
        maxDependencyAge: 365, // days
        requireSecurityHeaders: true,
        blockHighRiskLicenses: true,
      },
    },
  });

  console.log('✅ Created demo policy:', demoPolicy.name);

  // Create a demo scan with findings
  const demoScan = await prisma.scan.create({
    data: {
      repositoryId: demoRepo.id,
      commitSha: 'abc123def456',
      branch: 'main',
      scanType: 'FULL',
      status: 'COMPLETED',
      riskScore: 75.5,
      completedAt: new Date(),
    },
  });

  console.log('✅ Created demo scan:', demoScan.id);

  // Create demo findings
  const demoFindings = await prisma.finding.createMany({
    data: [
      {
        scanId: demoScan.id,
        type: 'LICENSE_VIOLATION',
        severity: 'HIGH',
        title: 'GPL-3.0 License Detected',
        description: 'Package "example-gpl-package" uses GPL-3.0 license which is forbidden by policy',
        filePath: 'package.json',
        metadata: {
          packageName: 'example-gpl-package',
          packageVersion: '1.2.3',
          licenseType: 'GPL-3.0',
        },
        status: 'OPEN',
      },
      {
        scanId: demoScan.id,
        type: 'VULNERABILITY',
        severity: 'CRITICAL',
        title: 'Cross-Site Scripting (XSS) Vulnerability',
        description: 'Potential XSS vulnerability detected in user input handling',
        filePath: 'src/components/UserProfile.tsx',
        lineNumber: 42,
        columnNumber: 15,
        cveId: 'CVE-2023-12345',
        cvssScore: 9.1,
        metadata: {
          category: 'xss',
          confidence: 'high',
          impact: 'high',
        },
        status: 'OPEN',
      },
      {
        scanId: demoScan.id,
        type: 'SECURITY_MISCONFIGURATION',
        severity: 'MEDIUM',
        title: 'Missing Security Headers',
        description: 'Content-Security-Policy header is not configured',
        filePath: 'next.config.js',
        metadata: {
          missingHeaders: ['Content-Security-Policy'],
          recommendation: 'Add CSP header to prevent XSS attacks',
        },
        status: 'OPEN',
      },
      {
        scanId: demoScan.id,
        type: 'DEPENDENCY_ISSUE',
        severity: 'HIGH',
        title: 'Outdated Dependency with Known Vulnerabilities',
        description: 'Package "lodash" version 4.17.15 has known security vulnerabilities',
        filePath: 'package.json',
        cveId: 'CVE-2021-23337',
        cvssScore: 7.2,
        metadata: {
          packageName: 'lodash',
          currentVersion: '4.17.15',
          recommendedVersion: '4.17.21',
          vulnerabilityCount: 3,
        },
        status: 'OPEN',
      },
      {
        scanId: demoScan.id,
        type: 'CODE_QUALITY',
        severity: 'LOW',
        title: 'Unused Import Statement',
        description: 'Import statement is declared but never used',
        filePath: 'src/utils/helpers.ts',
        lineNumber: 5,
        columnNumber: 1,
        metadata: {
          rule: 'no-unused-imports',
          suggestion: 'Remove unused import to improve code quality',
        },
        status: 'OPEN',
      },
    ],
  });

  console.log('✅ Created demo findings:', demoFindings.count);

  // Create audit log entries
  await prisma.auditLog.createMany({
    data: [
      {
        action: 'SCAN_CREATED',
        entityType: 'Scan',
        entityId: demoScan.id,
        userId: 'system',
        metadata: {
          repositoryId: demoRepo.id,
          scanType: 'FULL',
        },
      },
      {
        action: 'POLICY_CREATED',
        entityType: 'Policy',
        entityId: demoPolicy.id,
        userId: 'admin',
        metadata: {
          repositoryId: demoRepo.id,
          policyName: demoPolicy.name,
        },
      },
    ],
  });

  console.log('✅ Created audit log entries');
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });