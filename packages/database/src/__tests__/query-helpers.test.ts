// Mock the prisma client first
jest.mock('../index', () => ({
  prisma: {
    scan: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    finding: {
      count: jest.fn(),
      groupBy: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

import { AnalyticsQueries } from '../utils/query-helpers';

// Get the mocked prisma after import
const { prisma: mockPrisma } = require('../index');

describe('Analytics Query Helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRepositoryStats', () => {
    it('should return comprehensive repository statistics', async () => {
      // Mock the parallel queries
      mockPrisma.scan.count.mockResolvedValue(25);
      mockPrisma.finding.count
        .mockResolvedValueOnce(100) // totalFindings
        .mockResolvedValueOnce(30)  // openFindings
        .mockResolvedValueOnce(70); // resolvedFindings

      const result = await AnalyticsQueries.getRepositoryStats('repo-1');

      expect(result).toEqual({
        totalScans: 25,
        totalFindings: 100,
        openFindings: 30,
        resolvedFindings: 70,
        resolutionRate: 70,
      });

      // Verify all queries were called with correct parameters
      expect(mockPrisma.scan.count).toHaveBeenCalledWith({
        where: { repositoryId: 'repo-1' }
      });

      expect(mockPrisma.finding.count).toHaveBeenCalledTimes(3);
      expect(mockPrisma.finding.count).toHaveBeenNthCalledWith(1, {
        where: { scan: { repositoryId: 'repo-1' } }
      });
      expect(mockPrisma.finding.count).toHaveBeenNthCalledWith(2, {
        where: { scan: { repositoryId: 'repo-1' }, status: 'OPEN' }
      });
      expect(mockPrisma.finding.count).toHaveBeenNthCalledWith(3, {
        where: { scan: { repositoryId: 'repo-1' }, status: 'RESOLVED' }
      });
    });

    it('should handle zero findings correctly', async () => {
      mockPrisma.scan.count.mockResolvedValue(5);
      mockPrisma.finding.count
        .mockResolvedValueOnce(0) // totalFindings
        .mockResolvedValueOnce(0) // openFindings
        .mockResolvedValueOnce(0); // resolvedFindings

      const result = await AnalyticsQueries.getRepositoryStats('repo-1');

      expect(result).toEqual({
        totalScans: 5,
        totalFindings: 0,
        openFindings: 0,
        resolvedFindings: 0,
        resolutionRate: 0,
      });
    });

    it('should calculate resolution rate correctly', async () => {
      mockPrisma.scan.count.mockResolvedValue(10);
      mockPrisma.finding.count
        .mockResolvedValueOnce(50) // totalFindings
        .mockResolvedValueOnce(15) // openFindings
        .mockResolvedValueOnce(35); // resolvedFindings

      const result = await AnalyticsQueries.getRepositoryStats('repo-1');

      expect(result.resolutionRate).toBe(70); // 35/50 * 100
    });
  });

  describe('getFindingsBySeverity', () => {
    it('should group findings by severity correctly', async () => {
      const mockGroupByResult = [
        { severity: 'CRITICAL', _count: { severity: 5 } },
        { severity: 'HIGH', _count: { severity: 12 } },
        { severity: 'MEDIUM', _count: { severity: 8 } },
        { severity: 'LOW', _count: { severity: 3 } },
      ];

      mockPrisma.finding.groupBy.mockResolvedValue(mockGroupByResult);

      const result = await AnalyticsQueries.getFindingsBySeverity('repo-1');

      expect(result).toEqual({
        critical: 5,
        high: 12,
        medium: 8,
        low: 3,
      });

      expect(mockPrisma.finding.groupBy).toHaveBeenCalledWith({
        by: ['severity'],
        where: {
          scan: { repositoryId: 'repo-1' },
          status: 'OPEN'
        },
        _count: {
          severity: true
        }
      });
    });

    it('should handle empty results', async () => {
      mockPrisma.finding.groupBy.mockResolvedValue([]);

      const result = await AnalyticsQueries.getFindingsBySeverity('repo-1');

      expect(result).toEqual({});
    });

    it('should handle partial severity data', async () => {
      const mockGroupByResult = [
        { severity: 'HIGH', _count: { severity: 7 } },
        { severity: 'LOW', _count: { severity: 2 } },
      ];

      mockPrisma.finding.groupBy.mockResolvedValue(mockGroupByResult);

      const result = await AnalyticsQueries.getFindingsBySeverity('repo-1');

      expect(result).toEqual({
        high: 7,
        low: 2,
      });
    });
  });

  describe('getScanHistory', () => {
    it('should return scan history with finding counts', async () => {
      const mockScans = [
        {
          id: 'scan-1',
          repositoryId: 'repo-1',
          commitSha: 'abc123',
          status: 'COMPLETED',
          startedAt: new Date('2023-12-01'),
          _count: { findings: 15 }
        },
        {
          id: 'scan-2',
          repositoryId: 'repo-1',
          commitSha: 'def456',
          status: 'COMPLETED',
          startedAt: new Date('2023-11-30'),
          _count: { findings: 8 }
        },
      ];

      mockPrisma.scan.findMany.mockResolvedValue(mockScans);

      const result = await AnalyticsQueries.getScanHistory('repo-1', 10);

      expect(result).toEqual(mockScans);

      expect(mockPrisma.scan.findMany).toHaveBeenCalledWith({
        where: { repositoryId: 'repo-1' },
        orderBy: { startedAt: 'desc' },
        take: 10,
        include: {
          _count: {
            select: {
              findings: true
            }
          }
        }
      });
    });

    it('should use default limit when not specified', async () => {
      mockPrisma.scan.findMany.mockResolvedValue([]);

      await AnalyticsQueries.getScanHistory('repo-1');

      expect(mockPrisma.scan.findMany).toHaveBeenCalledWith({
        where: { repositoryId: 'repo-1' },
        orderBy: { startedAt: 'desc' },
        take: 30, // default limit
        include: {
          _count: {
            select: {
              findings: true
            }
          }
        }
      });
    });

    it('should handle custom limit', async () => {
      mockPrisma.scan.findMany.mockResolvedValue([]);

      await AnalyticsQueries.getScanHistory('repo-1', 50);

      expect(mockPrisma.scan.findMany).toHaveBeenCalledWith({
        where: { repositoryId: 'repo-1' },
        orderBy: { startedAt: 'desc' },
        take: 50,
        include: {
          _count: {
            select: {
              findings: true
            }
          }
        }
      });
    });

    it('should return empty array when no scans exist', async () => {
      mockPrisma.scan.findMany.mockResolvedValue([]);

      const result = await AnalyticsQueries.getScanHistory('repo-1');

      expect(result).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully in getRepositoryStats', async () => {
      mockPrisma.scan.count.mockRejectedValue(new Error('Database connection failed'));

      await expect(AnalyticsQueries.getRepositoryStats('repo-1'))
        .rejects.toThrow('Database connection failed');
    });

    it('should handle database errors gracefully in getFindingsBySeverity', async () => {
      mockPrisma.finding.groupBy.mockRejectedValue(new Error('Query timeout'));

      await expect(AnalyticsQueries.getFindingsBySeverity('repo-1'))
        .rejects.toThrow('Query timeout');
    });

    it('should handle database errors gracefully in getScanHistory', async () => {
      mockPrisma.scan.findMany.mockRejectedValue(new Error('Invalid query'));

      await expect(AnalyticsQueries.getScanHistory('repo-1'))
        .rejects.toThrow('Invalid query');
    });
  });
});