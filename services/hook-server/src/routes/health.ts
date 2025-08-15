import { Router } from 'express';
import { prisma } from '@repoflight/database';

const router = Router();

/**
 * Health check endpoint
 */
router.get('/', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'healthy',
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        },
      },
    };

    res.json({
      success: true,
      data: health,
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    res.status(503).json({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Service health check failed',
      },
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'unhealthy',
        },
      },
    });
  }
});

/**
 * Readiness check endpoint
 */
router.get('/ready', async (req, res) => {
  try {
    // Check if all required services are ready
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      success: true,
      data: {
        status: 'ready',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Service not ready',
      },
    });
  }
});

/**
 * Liveness check endpoint
 */
router.get('/live', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'alive',
      timestamp: new Date().toISOString(),
    },
  });
});

export { router as healthRoutes };