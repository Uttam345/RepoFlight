import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  // Generate unique request ID
  const requestId = uuidv4();
  req.headers['x-request-id'] = requestId;

  // Track request timing
  const startTime = Date.now();

  // Override res.json to track response timing
  const originalJson = res.json;
  res.json = function(body: any) {
    const duration = Date.now() - startTime;
    // Log response metrics if needed for debugging
    return originalJson.call(this, body);
  };

  next();
}