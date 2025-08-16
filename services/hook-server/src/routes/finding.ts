import { Router } from 'express';
import { validateRequest } from '@repoflight/shared';
import { CreateFindingSchema, UpdateFindingSchema, FindingFiltersSchema, PaginationSchema } from '@repoflight/shared';
import { FindingQueries, prisma } from '@repoflight/database';
import { NotFoundError } from '../middleware/error-handler';

const router = Router();

/**
 * Get all findings with filtering and pagination
 */
router.get('/', async (req, res) => {
  const { page = 1, limit = 50, repositoryId, scanId, severity, status, type } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);

  try {
    const where: any = {};
    
    if (repositoryId) {
      where.scan = { repositoryId: repositoryId as string };
    }
    
    if (scanId) {
      where.scanId = scanId as string;
    }
    
    if (severity) {
      where.severity = severity as string;
    }
    
    if (status) {
      where.status = status as string;
    }
    
    if (type) {
      where.type = type as string;
    }

    const findings = await (prisma.finding as any).findMany({
      where,
      take: limitNum,
      skip: (pageNum - 1) * limitNum,
      include: {
        scan: {
          include: {
            repository: true
          }
        }
      },
      orderBy: [
        { severity: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    const total = await (prisma.finding as any).count({ where });

    res.json({
      success: true,
      data: {
        findings,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching findings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch findings'
      }
    });
  }
});

/**
 * Get finding by ID
 */
router.get('/:findingId', async (req, res) => {
  const { findingId } = req.params;

  try {
    const finding = await (prisma.finding as any).findUnique({
      where: { id: findingId },
      include: {
        scan: {
          include: {
            repository: true
          }
        }
      }
    });

    if (!finding) {
      throw new NotFoundError('Finding not found');
    }

    res.json({
      success: true,
      data: finding,
    });
  } catch (error) {
    console.error('Error fetching finding:', error);
    throw error;
  }
});

/**
 * Create new finding
 */
router.post('/',
  validateRequest(CreateFindingSchema),
  async (req, res) => {
    const findingData = req.validated;

    try {
      const finding = await (prisma.finding as any).create({
        data: findingData,
        include: {
          scan: {
            include: {
              repository: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        data: finding,
        message: 'Finding created successfully',
      });
    } catch (error) {
      console.error('Error creating finding:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create finding'
        }
      });
    }
  }
);

/**
 * Update finding
 */
router.patch('/:findingId',
  validateRequest(UpdateFindingSchema),
  async (req, res) => {
    const { findingId } = req.params;
    const updateData = req.validated;

    try {
      // Check if finding exists
      const existingFinding = await (prisma.finding as any).findUnique({
        where: { id: findingId }
      });
      
      if (!existingFinding) {
        throw new NotFoundError('Finding not found');
      }

      // Update finding
      const updatedFinding = await (prisma.finding as any).update({
        where: { id: findingId },
        data: {
          ...updateData,
          ...(updateData.status === 'RESOLVED' && {
            resolvedAt: new Date(),
          }),
        },
        include: {
          scan: {
            include: {
              repository: true
            }
          }
        }
      });

      res.json({
        success: true,
        data: updatedFinding,
        message: 'Finding updated successfully',
      });
    } catch (error) {
      console.error('Error updating finding:', error);
      throw error;
    }
  }
);

/**
 * Bulk update findings
 */
router.post('/bulk-update', async (req, res) => {
  const { findingIds, status, notes } = req.body;

  if (!findingIds || !Array.isArray(findingIds) || findingIds.length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'findingIds must be a non-empty array'
      }
    });
  }

  try {
    const updateData: any = { status };
    
    if (status === 'RESOLVED') {
      updateData.resolvedAt = new Date();
    }

    const updatedFindings = await (prisma.finding as any).updateMany({
      where: {
        id: {
          in: findingIds
        }
      },
      data: updateData
    });

    res.json({
      success: true,
      data: { updatedCount: updatedFindings.count },
      message: `${updatedFindings.count} findings updated successfully`,
    });
  } catch (error) {
    console.error('Error bulk updating findings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to bulk update findings'
      }
    });
  }
});

/**
 * Generate fix for finding (placeholder for AI-powered fixes)
 */
router.post('/:findingId/generate-fix', async (req, res) => {
  const { findingId } = req.params;

  try {
    // Check if finding exists
    const finding = await (prisma.finding as any).findUnique({
      where: { id: findingId },
      include: {
        scan: {
          include: {
            repository: true
          }
        }
      }
    });

    if (!finding) {
      throw new NotFoundError('Finding not found');
    }

    // Mock fix generation (in a real app, this would use AI/ML)
    const mockFix = {
      fixDescription: `Automated fix suggestion for ${finding.title}`,
      confidence: 0.85,
      pullRequestUrl: null, // Would be generated after creating PR
    };

    res.json({
      success: true,
      data: mockFix,
      message: 'Fix generated successfully',
    });
  } catch (error) {
    console.error('Error generating fix:', error);
    throw error;
  }
});

export { router as findingRoutes };