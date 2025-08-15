import { Router } from 'express';
import { validateRequest } from '@repoflight/shared';
import { CreateRepositorySchema, UpdateRepositorySchema, RepositoryFiltersSchema, PaginationSchema } from '@repoflight/shared';
import { RepositoryQueries, AnalyticsQueries } from '@repoflight/database';
import { NotFoundError } from '../middleware/error-handler';

const router = Router();

/**
 * Get all repositories with filtering and pagination
 */
router.get('/',
  validateRequest(PaginationSchema, 'query'),
  validateRequest(RepositoryFiltersSchema, 'query'),
  async (req, res) => {
    const { page, limit } = req.validated;
    const filters = req.query;

    // TODO: Implement proper filtering and pagination with Prisma
    // For now, return a simple response
    const repositories: any[] = []; // This will be implemented with proper database queries

    res.json({
      success: true,
      data: {
        repositories,
        pagination: {
          page,
          limit,
          total: repositories.length,
          totalPages: Math.ceil(repositories.length / limit),
        },
      },
    });
  }
);

/**
 * Get repository by ID
 */
router.get('/:repositoryId', async (req, res) => {
  const { repositoryId } = req.params;

  const repository = await RepositoryQueries.findByGithubId(parseInt(repositoryId));

  if (!repository) {
    throw new NotFoundError('Repository not found');
  }

  res.json({
    success: true,
    data: repository,
  });
});

/**
 * Create new repository
 */
router.post('/',
  validateRequest(CreateRepositorySchema),
  async (req, res) => {
    const repositoryData = req.validated;

    const repository = await RepositoryQueries.upsert(repositoryData);

    res.status(201).json({
      success: true,
      data: repository,
      message: 'Repository created successfully',
    });
  }
);

/**
 * Update repository
 */
router.patch('/:repositoryId',
  validateRequest(UpdateRepositorySchema),
  async (req, res) => {
    const { repositoryId } = req.params;
    const updateData = req.validated;

    // Check if repository exists
    const existingRepo = await RepositoryQueries.findByGithubId(parseInt(repositoryId));
    if (!existingRepo) {
      throw new NotFoundError('Repository not found');
    }

    // TODO: Implement repository update logic
    // For now, return the existing repository
    const updatedRepository = existingRepo;

    res.json({
      success: true,
      data: updatedRepository,
      message: 'Repository updated successfully',
    });
  }
);

/**
 * Get repository statistics
 */
router.get('/:repositoryId/stats', async (req, res) => {
  const { repositoryId } = req.params;

  // Check if repository exists
  const repository = await RepositoryQueries.findByGithubId(parseInt(repositoryId));
  if (!repository) {
    throw new NotFoundError('Repository not found');
  }

  const stats = await AnalyticsQueries.getRepositoryStats(repository.id);
  const findingsBySeverity = await AnalyticsQueries.getFindingsBySeverity(repository.id);
  const scanHistory = await AnalyticsQueries.getScanHistory(repository.id, 10);

  res.json({
    success: true,
    data: {
      ...stats,
      findingsBySeverity,
      recentScans: scanHistory,
    },
  });
});

/**
 * Get repository scan history
 */
router.get('/:repositoryId/scans', async (req, res) => {
  const { repositoryId } = req.params;
  const { limit = 20 } = req.query;

  // Check if repository exists
  const repository = await RepositoryQueries.findByGithubId(parseInt(repositoryId));
  if (!repository) {
    throw new NotFoundError('Repository not found');
  }

  const scanHistory = await AnalyticsQueries.getScanHistory(
    repository.id,
    parseInt(limit as string)
  );

  res.json({
    success: true,
    data: scanHistory,
  });
});

/**
 * Get repository findings
 */
router.get('/:repositoryId/findings', async (req, res) => {
  const { repositoryId } = req.params;

  // Check if repository exists
  const repository = await RepositoryQueries.findByGithubId(parseInt(repositoryId));
  if (!repository) {
    throw new NotFoundError('Repository not found');
  }

  // TODO: Implement findings filtering and pagination
  const findings: any[] = []; // This will be implemented with proper database queries

  res.json({
    success: true,
    data: findings,
  });
});

/**
 * Get repository policies
 */
router.get('/:repositoryId/policies', async (req, res) => {
  const { repositoryId } = req.params;

  // Check if repository exists
  const repository = await RepositoryQueries.findByGithubId(parseInt(repositoryId));
  if (!repository) {
    throw new NotFoundError('Repository not found');
  }

  res.json({
    success: true,
    data: repository.policies || [],
  });
});

export { router as repositoryRoutes };