import { Router } from 'express';
import { validateRequest } from '@repoflight/shared';
import { CreateScanSchema, UpdateScanSchema, ScanFiltersSchema, PaginationSchema } from '@repoflight/shared';
import { ScanQueries, FindingQueries, prisma } from '@repoflight/database';
import { NotFoundError } from '../middleware/error-handler';

const router = Router();

/**
 * Get scan statistics (global)
 */
router.get('/stats', async (req, res) => {
  try {
    const [totalScans, completedScans, failedScans, pendingScans] = await Promise.all([
      (prisma.scan as any).count(),
      (prisma.scan as any).count({ where: { status: 'COMPLETED' } }),
      (prisma.scan as any).count({ where: { status: 'FAILED' } }),
      (prisma.scan as any).count({ where: { status: 'PENDING' } })
    ]);

    const stats = {
      total: totalScans,
      completed: completedScans,
      failed: failedScans,
      pending: pendingScans,
      successRate: totalScans > 0 ? (completedScans / totalScans) * 100 : 0
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching scan stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch scan statistics'
      }
    });
  }
});

/**
 * Get all scans with filtering and pagination
 */
router.get('/', async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);

  try {
    const scans = await (prisma.scan as any).findMany({
      take: limitNum,
      skip: (pageNum - 1) * limitNum,
      include: {
        repository: true,
        _count: {
          select: {
            findings: true
          }
        }
      },
      orderBy: { startedAt: 'desc' }
    });

    const total = await (prisma.scan as any).count();

    res.json({
      success: true,
      data: {
        scans,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching scans:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch scans'
      }
    });
  }
});

/**
 * Get scan by ID
 */
router.get('/:scanId', async (req, res) => {
  const { scanId } = req.params;

  try {
    const scan = await ScanQueries.getById(scanId);
    
    if (!scan) {
      throw new NotFoundError('Scan not found');
    }

    res.json({
      success: true,
      data: scan,
    });
  } catch (error) {
    console.error('Error fetching scan:', error);
    throw error;
  }
});

/**
 * Create new scan
 */
router.post('/', 
  validateRequest(CreateScanSchema),
  async (req, res) => {
    const scanData = req.validated;

    const scan = await ScanQueries.create(scanData);

    res.status(201).json({
      success: true,
      data: scan,
      message: 'Scan created successfully',
    });
  }
);

/**
 * Update scan
 */
router.patch('/:scanId',
  validateRequest(UpdateScanSchema),
  async (req, res) => {
    const { scanId } = req.params;
    const updateData = req.validated;

    try {
      // Check if scan exists
      const existingScan = await ScanQueries.getById(scanId);
      if (!existingScan) {
        throw new NotFoundError('Scan not found');
      }

      // Update scan status if provided
      if (updateData.status) {
        await ScanQueries.updateStatus(scanId, updateData.status, updateData.errorMessage);
      }

      // Get updated scan
      const updatedScan = await ScanQueries.getById(scanId);

      res.json({
        success: true,
        data: updatedScan,
        message: 'Scan updated successfully',
      });
    } catch (error) {
      console.error('Error updating scan:', error);
      throw error;
    }
  }
);

/**
 * Get scan findings
 */
router.get('/:scanId/findings', async (req, res) => {
  const { scanId } = req.params;

  try {
    // Check if scan exists
    const scan = await ScanQueries.getById(scanId);
    if (!scan) {
      throw new NotFoundError('Scan not found');
    }

    const findings = await FindingQueries.getByScanId(scanId);

    res.json({
      success: true,
      data: findings,
    });
  } catch (error) {
    console.error('Error fetching scan findings:', error);
    throw error;
  }
});

/**
 * Get scan statistics
 */
router.get('/:scanId/stats', async (req, res) => {
  const { scanId } = req.params;

  try {
    // Check if scan exists
    const scan = await ScanQueries.getById(scanId);
    if (!scan) {
      throw new NotFoundError('Scan not found');
    }

    const findings = await FindingQueries.getByScanId(scanId);

    // Calculate statistics
    const stats = {
      total: findings.length,
      critical: findings.filter(f => f.severity === 'CRITICAL').length,
      high: findings.filter(f => f.severity === 'HIGH').length,
      medium: findings.filter(f => f.severity === 'MEDIUM').length,
      low: findings.filter(f => f.severity === 'LOW').length,
      info: findings.filter(f => f.severity === 'INFO').length,
      byType: {
        license: findings.filter(f => f.type === 'LICENSE_VIOLATION').length,
        vulnerability: findings.filter(f => f.type === 'VULNERABILITY').length,
        misconfiguration: findings.filter(f => f.type === 'SECURITY_MISCONFIGURATION').length,
        dependency: findings.filter(f => f.type === 'DEPENDENCY_ISSUE').length,
        quality: findings.filter(f => f.type === 'CODE_QUALITY').length,
      },
      byStatus: {
        open: findings.filter(f => f.status === 'OPEN').length,
        resolved: findings.filter(f => f.status === 'RESOLVED').length,
        ignored: findings.filter(f => f.status === 'IGNORED').length,
        falsePositive: findings.filter(f => f.status === 'FALSE_POSITIVE').length,
      },
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching scan stats:', error);
    throw error;
  }
});

export { router as scanRoutes };