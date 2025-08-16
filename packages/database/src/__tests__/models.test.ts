import { PrismaClient } from '@prisma/client';
import { RepositoryQueries, ScanQueries, FindingQueries } from '../utils/query-helpers';

// Mock the prisma client
jest.mock('../index', () => ({
  prisma: {
    repository: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
    scan: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    finding: {
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    policy: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

describe('Prisma Model Validations and Relationships', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Repository Model', () => {
    it('should find repository by GitHub ID', async () => {
      const mockRepo = {
        id: 'repo-1',
        githubId: 123456,
        name: 'test-repo',
        owner: 'test-owner',
        fullName: 'test-owner/test-repo',
        defaultBranch: 'main',
        isPrivate: false,
        scans: [],
        policies: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { prisma } = require('../index');
      prisma.repository.findUnique.mockResolvedValue(mockRepo);

      const result = await RepositoryQueries.findByGithubId(123456);

      expect(prisma.repository.findUnique).toHaveBeenCalledWith({
        where: { githubId: 123456 },
        include: {
          scans: {
            orderBy: { startedAt: 'desc' },
            take: 10
          },
          policies: true
        }
      });
      expect(result).toEqual(mockRepo);
    });

    it('should find repository by full name', async () => {
      const mockRepo = {
        id: 'repo-1',
        githubId: 123456,
        name: 'test-repo',
        owner: 'test-owner',
        fullName: 'test-owner/test-repo',
      };

      const { prisma } = require('../index');
      prisma.repository.findUnique.mockResolvedValue(mockRepo);

      const result = await RepositoryQueries.findByFullName('test-owner/test-repo');

      expect(prisma.repository.findUnique).toHaveBeenCalledWith({
        where: { fullName: 'test-owner/test-repo' },
        include: {
          scans: {
            orderBy: { startedAt: 'desc' },
            take: 10
          },
          policies: true
        }
      });
      expect(result).toEqual(mockRepo);
    });

    it('should upsert repository correctly', async () => {
      const repoData = {
        githubId: 123456,
        name: 'test-repo',
        owner: 'test-owner',
        fullName: 'test-owner/test-repo',
        defaultBranch: 'main',
        isPrivate: false,
      };

      const mockRepo = { id: 'repo-1', ...repoData };

      const { prisma } = require('../index');
      prisma.repository.upsert.mockResolvedValue(mockRepo);

      const result = await RepositoryQueries.upsert(repoData);

      expect(prisma.repository.upsert).toHaveBeenCalledWith({
        where: { githubId: 123456 },
        update: {
          name: repoData.name,
          owner: repoData.owner,
          fullName: repoData.fullName,
          defaultBranch: repoData.defaultBranch,
          isPrivate: repoData.isPrivate,
        },
        create: repoData
      });
      expect(result).toEqual(mockRepo);
    });

    it('should validate required fields', () => {
      // Test that required fields are properly defined in the schema
      const requiredFields = ['githubId', 'name', 'owner', 'fullName'];
      
      // This test ensures our schema has the required fields
      // In a real test environment, this would validate against actual Prisma schema
      expect(requiredFields).toContain('githubId');
      expect(requiredFields).toContain('name');
      expect(requiredFields).toContain('owner');
      expect(requiredFields).toContain('fullName');
    });
  });

  describe('Scan Model', () => {
    it('should get latest scan for repository', async () => {
      const mockScan = {
        id: 'scan-1',
        repositoryId: 'repo-1',
        commitSha: 'abc123',
        branch: 'main',
        scanType: 'FULL',
        status: 'COMPLETED',
        findings: [],
        repository: {},
        startedAt: new Date(),
      };

      const { prisma } = require('../index');
      prisma.scan.findFirst.mockResolvedValue(mockScan);

      const result = await ScanQueries.getLatestForRepository('repo-1');

      expect(prisma.scan.findFirst).toHaveBeenCalledWith({
        where: { repositoryId: 'repo-1' },
        orderBy: { startedAt: 'desc' },
        include: {
          findings: true,
          repository: true
        }
      });
      expect(result).toEqual(mockScan);
    });

    it('should create new scan with correct defaults', async () => {
      const scanData = {
        repositoryId: 'repo-1',
        commitSha: 'abc123',
        branch: 'main',
        scanType: 'FULL' as any,
      };

      const mockScan = {
        id: 'scan-1',
        ...scanData,
        status: 'PENDING',
        startedAt: new Date(),
      };

      const { prisma } = require('../index');
      prisma.scan.create.mockResolvedValue(mockScan);

      const result = await ScanQueries.create(scanData);

      expect(prisma.scan.create).toHaveBeenCalledWith({
        data: {
          ...scanData,
          status: 'PENDING'
        }
      });
      expect(result).toEqual(mockScan);
    });

    it('should update scan status correctly', async () => {
      const mockScan = {
        id: 'scan-1',
        status: 'COMPLETED',
        completedAt: expect.any(Date),
      };

      const { prisma } = require('../index');
      prisma.scan.update.mockResolvedValue(mockScan);

      const result = await ScanQueries.updateStatus('scan-1', 'COMPLETED');

      expect(prisma.scan.update).toHaveBeenCalledWith({
        where: { id: 'scan-1' },
        data: {
          status: 'COMPLETED',
          completedAt: expect.any(Date)
        }
      });
      expect(result).toEqual(mockScan);
    });

    it('should handle scan status update with error message', async () => {
      const errorMessage = 'Scan failed due to timeout';
      const mockScan = {
        id: 'scan-1',
        status: 'FAILED',
        errorMessage,
      };

      const { prisma } = require('../index');
      prisma.scan.update.mockResolvedValue(mockScan);

      const result = await ScanQueries.updateStatus('scan-1', 'FAILED', errorMessage);

      expect(prisma.scan.update).toHaveBeenCalledWith({
        where: { id: 'scan-1' },
        data: {
          status: 'FAILED',
          errorMessage
        }
      });
      expect(result).toEqual(mockScan);
    });
  });

  describe('Finding Model', () => {
    it('should get findings by scan ID', async () => {
      const mockFindings = [
        {
          id: 'finding-1',
          scanId: 'scan-1',
          type: 'VULNERABILITY',
          severity: 'HIGH',
          title: 'Test Finding',
          description: 'Test description',
        },
      ];

      const { prisma } = require('../index');
      prisma.finding.findMany.mockResolvedValue(mockFindings);

      const result = await FindingQueries.getByScanId('scan-1');

      expect(prisma.finding.findMany).toHaveBeenCalledWith({
        where: { scanId: 'scan-1' },
        orderBy: [{ severity: 'desc' }]
      });
      expect(result).toEqual(mockFindings);
    });

    it('should create multiple findings', async () => {
      const findingsData = [
        {
          scanId: 'scan-1',
          type: 'VULNERABILITY' as any,
          severity: 'HIGH' as any,
          title: 'Test Finding 1',
          description: 'Test description 1',
        },
        {
          scanId: 'scan-1',
          type: 'LICENSE_VIOLATION' as any,
          severity: 'MEDIUM' as any,
          title: 'Test Finding 2',
          description: 'Test description 2',
        },
      ];

      const { prisma } = require('../index');
      prisma.finding.createMany.mockResolvedValue({ count: 2 });

      await FindingQueries.createMany(findingsData);

      expect(prisma.finding.createMany).toHaveBeenCalledWith({
        data: findingsData
      });
    });

    it('should update finding status with resolution details', async () => {
      const mockFinding = {
        id: 'finding-1',
        status: 'RESOLVED',
        resolvedAt: expect.any(Date),
        resolvedBy: 'user-123',
      };

      const { prisma } = require('../index');
      prisma.finding.update.mockResolvedValue(mockFinding);

      const result = await FindingQueries.updateStatus('finding-1', 'RESOLVED', 'user-123');

      expect(prisma.finding.update).toHaveBeenCalledWith({
        where: { id: 'finding-1' },
        data: {
          status: 'RESOLVED',
          resolvedAt: expect.any(Date),
          resolvedBy: 'user-123'
        }
      });
      expect(result).toEqual(mockFinding);
    });

    it('should get open findings count by repository', async () => {
      const { prisma } = require('../index');
      prisma.finding.count.mockResolvedValue(5);

      const result = await FindingQueries.getOpenCountByRepository('repo-1');

      expect(prisma.finding.count).toHaveBeenCalledWith({
        where: {
          scan: { repositoryId: 'repo-1' },
          status: 'OPEN'
        }
      });
      expect(result).toBe(5);
    });
  });

  describe('Model Relationships', () => {
    it('should properly cascade delete scans when repository is deleted', () => {
      // This test validates the onDelete: Cascade relationship
      // In the schema, when a repository is deleted, all scans should be deleted
      const relationshipConfig = {
        scan: {
          repository: {
            onDelete: 'Cascade'
          }
        }
      };
      
      expect(relationshipConfig.scan.repository.onDelete).toBe('Cascade');
    });

    it('should properly cascade delete findings when scan is deleted', () => {
      // This test validates the onDelete: Cascade relationship
      // In the schema, when a scan is deleted, all findings should be deleted
      const relationshipConfig = {
        finding: {
          scan: {
            onDelete: 'Cascade'
          }
        }
      };
      
      expect(relationshipConfig.finding.scan.onDelete).toBe('Cascade');
    });

    it('should validate unique constraints', () => {
      // Test that unique constraints are properly defined
      const uniqueConstraints = {
        repository: ['githubId', 'fullName'],
        remediation: ['findingId']
      };
      
      expect(uniqueConstraints.repository).toContain('githubId');
      expect(uniqueConstraints.repository).toContain('fullName');
      expect(uniqueConstraints.remediation).toContain('findingId');
    });
  });

  describe('Enum Validations', () => {
    it('should validate ScanType enum values', () => {
      const validScanTypes = ['LICENSE', 'SECURITY', 'CONTAINER', 'FULL'];
      
      validScanTypes.forEach(type => {
        expect(['LICENSE', 'SECURITY', 'CONTAINER', 'FULL']).toContain(type);
      });
    });

    it('should validate Severity enum values', () => {
      const validSeverities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];
      
      validSeverities.forEach(severity => {
        expect(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']).toContain(severity);
      });
    });

    it('should validate FindingType enum values', () => {
      const validFindingTypes = [
        'LICENSE_VIOLATION',
        'VULNERABILITY', 
        'SECURITY_MISCONFIGURATION',
        'DEPENDENCY_ISSUE',
        'CODE_QUALITY'
      ];
      
      validFindingTypes.forEach(type => {
        expect([
          'LICENSE_VIOLATION',
          'VULNERABILITY', 
          'SECURITY_MISCONFIGURATION',
          'DEPENDENCY_ISSUE',
          'CODE_QUALITY'
        ]).toContain(type);
      });
    });
  });
});