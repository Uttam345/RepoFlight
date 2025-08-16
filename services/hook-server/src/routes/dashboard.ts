import { Router } from 'express';
import { AnalyticsQueries, prisma } from '@repoflight/database';

const router = Router();

/**
 * Get dashboard overview statistics
 */
router.get('/overview', async (req, res) => {
  try {
    const [totalRepositories, activeScans, totalFindings, criticalFindings] = await Promise.all([
      (prisma.repository as any).count(),
      (prisma.scan as any).count({ where: { status: 'RUNNING' } }),
      (prisma.finding as any).count({ where: { status: 'OPEN' } }),
      (prisma.finding as any).count({ 
        where: { 
          status: 'OPEN',
          severity: 'CRITICAL'
        } 
      })
    ]);

    // Calculate compliance score (simplified)
    const compliantRepos = Math.floor(totalRepositories * 0.75); // Mock calculation

    const stats = {
      totalRepositories,
      activeScans,
      criticalFindings,
      compliantRepos,
      riskTrend: 'stable' as const,
      complianceTrend: 'improving' as const,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch dashboard overview'
      }
    });
  }
});

/**
 * Get security metrics
 */
router.get('/security-metrics', async (req, res) => {
  try {
    const [critical, high, medium, low] = await Promise.all([
      (prisma.finding as any).count({ 
        where: { 
          status: 'OPEN',
          severity: 'CRITICAL'
        } 
      }),
      (prisma.finding as any).count({ 
        where: { 
          status: 'OPEN',
          severity: 'HIGH'
        } 
      }),
      (prisma.finding as any).count({ 
        where: { 
          status: 'OPEN',
          severity: 'MEDIUM'
        } 
      }),
      (prisma.finding as any).count({ 
        where: { 
          status: 'OPEN',
          severity: 'LOW'
        } 
      })
    ]);

    // Get recent findings
    const recentFindings = await (prisma.finding as any).findMany({
      where: { status: 'OPEN' },
      include: {
        scan: {
          include: {
            repository: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Mock trend data (in a real app, this would come from historical data)
    const trends = {
      period: 'last_30_days',
      critical: [2, 3, 1, 4, 2, 1, 3],
      high: [5, 7, 4, 8, 6, 5, 7],
      medium: [12, 15, 10, 18, 14, 12, 16],
      low: [8, 10, 6, 12, 9, 8, 11],
    };

    const metrics = {
      vulnerabilities: {
        critical,
        high,
        medium,
        low,
      },
      trends,
      recentFindings,
    };

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Error fetching security metrics:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch security metrics'
      }
    });
  }
});

/**
 * Get compliance status
 */
router.get('/compliance-status', async (req, res) => {
  try {
    // Mock compliance data (in a real app, this would be calculated from policies and findings)
    const frameworks = [
      {
        name: 'SOC 2',
        score: 85,
        controls: {
          total: 64,
          passing: 54,
          failing: 10,
        },
      },
      {
        name: 'ISO 27001',
        score: 78,
        controls: {
          total: 114,
          passing: 89,
          failing: 25,
        },
      },
      {
        name: 'NIST',
        score: 92,
        controls: {
          total: 108,
          passing: 99,
          failing: 9,
        },
      },
    ];

    // Get policy violations
    const policies = await (prisma.policy as any).findMany({
      include: {
        repository: true,
      },
    });

    const policyStatus = policies.map((policy: any) => ({
      name: policy.name,
      status: 'compliant' as const, // This would be calculated based on findings
      violations: 0, // This would be calculated based on findings
    }));

    const complianceStatus = {
      frameworks,
      policies: policyStatus,
    };

    res.json({
      success: true,
      data: complianceStatus,
    });
  } catch (error) {
    console.error('Error fetching compliance status:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch compliance status'
      }
    });
  }
});

export { router as dashboardRoutes };