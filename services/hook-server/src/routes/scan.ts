import { Router } from 'express';
import { validateRequest } from '@repoflight/shared';
import { CreateScanSchema, UpdateScanSchema, ScanFiltersSchema, PaginationSchema } from '@repoflight/shared';
import { ScanQueries, FindingQueries } from '@repoflight/database';
import { NotFoundError } from '../middleware/error-handler';

const router = Router();

/**
 * Get all scans with filtering and pagination
 */
router.get('/', 
  validateRequest(PaginationSchema, 'query'),
  validateRequest(ScanFiltersSchema, 'query'),
  async (req, res) => {
    const { page, limit, sortBy, sortOrder } = req.validated;
    const filters = req.query;

    // TODO: Implement proper filtering and pagination
    const scans = await ScanQueries.getByStatus('COMPLETED');

    res.json({
      success: true,
      data: {
        scans,
        pagination: {
          page,
          limit,
          total: scans.length,
          totalPages: Math.ceil(scans.length / limit),
        },
      },
    });
  }
);

/**
 * Get scan by ID
 */
router.get('/:scanId', async (req, res) => {
  const { scanId } = req.params;

  // Get scan with findings
  const scan = await ScanQueries.getLatestForRepository(scanId);
  
  if (!scan) {
    throw new NotFoundError('Scan not found');
  }

  const findings = await FindingQueries.getByScanId(scanId);

  res.json({
    success: true,
    data: {
      ...scan,
      findings,
    },
  });
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

    // Check if scan exists
    const existingScan = await ScanQueries.getLatestForRepository(scanId);
    if (!existingScan) {
      throw new NotFoundError('Scan not found');
    }

    // Update scan status if provided
    if (updateData.status) {
      await ScanQueries.updateStatus(scanId, updateData.status, updateData.errorMessage);
    }

    // Get updated scan
    const updatedScan = await ScanQueries.getLatestForRepository(scanId);

    res.json({
      success: true,
      data: updatedScan,
      message: 'Scan updated successfully',
    });
  }
);

/**
 * Get scan findings
 */
router.get('/:scanId/findings', async (req, res) => {
  const { scanId } = req.params;

  // Check if scan exists
  const scan = await ScanQueries.getLatestForRepository(scanId);
  if (!scan) {
    throw new NotFoundError('Scan not found');
  }

  const findings = await FindingQueries.getByScanId(scanId);

  res.json({
    success: true,
    data: findings,
  });
});

/**
 * Get scan statistics
 */
router.get('/:scanId/stats', async (req, res) => {
  const { scanId } = req.params;

  // Check if scan exists
  const scan = await ScanQueries.getLatestForRepository(scanId);
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
});

export { router as scanRoutes };