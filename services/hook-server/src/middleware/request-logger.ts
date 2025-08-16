import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface RequestWithId extends Request {
  requestId: string;
}

export function requestLogger(req: RequestWithId, res: Response, next: NextFunction) {
  // Generate unique request ID if not provided
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();
  req.requestId = requestId;
  req.headers['x-request-id'] = requestId;

  // Track request timing
  const startTime = Date.now();

  // Log incoming request
  console.log(JSON.stringify({
    level: 'info',
    message: 'Incoming request',
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'],
    ip: req.ip || req.connection.remoteAddress,
    timestamp: new Date().toISOString(),
  }));

  // Override res.json to track response timing and log response
  const originalJson = res.json;
  res.json = function(body: any) {
    const duration = Date.now() - startTime;
    
    // Log response
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

    // Add correlation ID to response headers
    res.setHeader('X-Request-ID', requestId);
    
    return originalJson.call(this, body);
  };

  next();
}