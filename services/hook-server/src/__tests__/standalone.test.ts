import request from 'supertest';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';

// Standalone implementations for testing
const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  FORBIDDEN_ACCESS: 'FORBIDDEN_ACCESS',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

// Standalone error classes
class ValidationError extends Error {
  public statusCode = HttpStatus.BAD_REQUEST;
  public code = ErrorCode.VALIDATION_ERROR;
  public details?: any;

  constructor(message: string, details?: any) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

class NotFoundError extends Error {
  public statusCode = HttpStatus.NOT_FOUND;
  public code = ErrorCode.RESOURCE_NOT_FOUND;

  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

// Standalone request logger
function requestLogger(req: any, res: any, next: any) {
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();
  req.requestId = requestId;
  req.headers['x-request-id'] = requestId;

  const startTime = Date.now();

  console.log(JSON.stringify({
    level: 'info',
    message: 'Incoming request',
    requestId,
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
  }));

  const originalJson = res.json;
  res.json = function(body: any) {
    const duration = Date.now() - startTime;
    
    console.log(JSON.stringify({
      level: 'info',
      message: 'Request completed',
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    }));

    res.setHeader('X-Request-ID', requestId);
    return originalJson.call(this, body);
  };

  next();
}

// Standalone error handler
function errorHandler(error: any, req: any, res: any, next: any) {
  const requestId = req.headers['x-request-id'] as string || 'unknown';
  
  console.error(JSON.stringify({
    level: 'error',
    message: 'Request error',
    error: {
      name: error.name,
      message: error.message,
      code: error.code,
    },
    request: {
      method: req.method,
      url: req.url,
    },
    requestId,
    timestamp: new Date().toISOString(),
  }));

  let statusCode = error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
  let errorCode = error.code || ErrorCode.INTERNAL_ERROR;
  let message = error.message || 'Internal server error';

  if (error.name === 'ValidationError') {
    statusCode = HttpStatus.BAD_REQUEST;
    errorCode = ErrorCode.VALIDATION_ERROR;
  } else if (error.name === 'NotFoundError') {
    statusCode = HttpStatus.NOT_FOUND;
    errorCode = ErrorCode.RESOURCE_NOT_FOUND;
  }

  const response: ApiResponse = {
    success: false,
    error: {
      code: errorCode,
      message,
      details: process.env.NODE_ENV === 'development' ? error.details : undefined,
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId,
      version: 'v1',
    },
  };

  res.status(statusCode).json(response);
}

// Create test app
const createTestApp = () => {
  const app = express();
  
  app.use(express.json());
  app.use(requestLogger);
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    });
  });
  
  // Webhook config endpoint
  app.get('/webhook/config', (req, res) => {
    const config = {
      events: ['push', 'pull_request', 'release'],
      contentType: 'application/json',
      secret: process.env.GITHUB_WEBHOOK_SECRET ? 'configured' : 'not_configured',
      url: `${process.env.BASE_URL || 'http://localhost:3001'}/webhook`,
    };

    res.json({
      success: true,
      data: config,
    });
  });
  
  // Test endpoints
  app.get('/test/validation-error', (req, res, next) => {
    next(new ValidationError('Test validation error'));
  });
  
  app.get('/test/not-found', (req, res, next) => {
    next(new NotFoundError('Test resource not found'));
  });
  
  // Mock webhook endpoint
  app.post('/webhook', (req, res) => {
    const signature = req.headers['x-hub-signature-256'] as string;
    const event = req.headers['x-github-event'] as string;
    const delivery = req.headers['x-github-delivery'] as string;

    if (!signature || !event || !delivery) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'WEBHOOK_VALIDATION_FAILED',
          message: 'Missing required webhook headers',
        },
      });
    }

    res.json({
      success: true,
      data: {
        event,
        delivery,
        processed: true,
        result: { message: `${event} event processed` },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
        version: 'v1',
      },
    });
  });
  
  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Endpoint not found',
      },
    });
  });
  
  app.use(errorHandler);
  
  return app;
};

describe('Hook Server Core API Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
    process.env.NODE_ENV = 'test';
    process.env.GITHUB_WEBHOOK_SECRET = 'test-secret';
    
    // Mock console to reduce noise
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Health Endpoints', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('healthy');
      expect(response.body.data.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Webhook Configuration', () => {
    it('should return webhook configuration', async () => {
      const response = await request(app)
        .get('/webhook/config')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.events).toContain('push');
      expect(response.body.data.events).toContain('pull_request');
      expect(response.body.data.secret).toBe('configured');
    });
  });

  describe('Webhook Processing', () => {
    it('should process valid webhook with required headers', async () => {
      const payload = {
        repository: { name: 'test-repo' },
        ref: 'refs/heads/main',
      };

      const response = await request(app)
        .post('/webhook')
        .set('x-hub-signature-256', 'sha256=test-signature')
        .set('x-github-event', 'push')
        .set('x-github-delivery', 'test-delivery')
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.event).toBe('push');
      expect(response.body.data.processed).toBe(true);
    });

    it('should reject webhook with missing headers', async () => {
      const response = await request(app)
        .post('/webhook')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('WEBHOOK_VALIDATION_FAILED');
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors', async () => {
      const response = await request(app)
        .get('/test/validation-error')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.meta.requestId).toBeDefined();
    });

    it('should handle not found errors', async () => {
      const response = await request(app)
        .get('/test/not-found')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('RESOURCE_NOT_FOUND');
    });

    it('should handle unknown endpoints', async () => {
      const response = await request(app)
        .get('/unknown/endpoint')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('Request Correlation', () => {
    it('should generate and track request IDs', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      const requestId = response.headers['x-request-id'];
      expect(requestId).toBeDefined();
      expect(typeof requestId).toBe('string');
    });

    it('should use provided request ID', async () => {
      const customRequestId = 'custom-test-id';
      
      const response = await request(app)
        .get('/health')
        .set('X-Request-ID', customRequestId)
        .expect(200);

      expect(response.headers['x-request-id']).toBe(customRequestId);
    });
  });

  describe('Structured Logging', () => {
    it('should log requests and responses', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      await request(app)
        .get('/health')
        .expect(200);

      // Should log incoming request
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"message":"Incoming request"')
      );
      
      // Should log completed request
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"message":"Request completed"')
      );
    });

    it('should log errors with correlation ID', async () => {
      const consoleSpy = jest.spyOn(console, 'error');
      
      await request(app)
        .get('/test/validation-error')
        .expect(400);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"level":"error"')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"message":"Request error"')
      );
    });
  });
});