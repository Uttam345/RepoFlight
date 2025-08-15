import { Request, Response, NextFunction } from 'express';
import { ApiResponse, HttpStatus, ErrorCode } from '@repoflight/shared';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export function errorHandler(
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
  });

  // Default error response
  let statusCode = error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
  let errorCode = error.code || ErrorCode.INTERNAL_ERROR;
  let message = error.message || 'Internal server error';

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = HttpStatus.BAD_REQUEST;
    errorCode = ErrorCode.VALIDATION_ERROR;
  } else if (error.name === 'UnauthorizedError') {
    statusCode = HttpStatus.UNAUTHORIZED;
    errorCode = ErrorCode.UNAUTHORIZED_ACCESS;
  } else if (error.name === 'ForbiddenError') {
    statusCode = HttpStatus.FORBIDDEN;
    errorCode = ErrorCode.FORBIDDEN_ACCESS;
  } else if (error.name === 'NotFoundError') {
    statusCode = HttpStatus.NOT_FOUND;
    errorCode = ErrorCode.RESOURCE_NOT_FOUND;
  }

  // Create error response
  const response: ApiResponse = {
    success: false,
    error: {
      code: errorCode,
      message,
      details: process.env.NODE_ENV === 'development' ? error.details : undefined,
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string || 'unknown',
      version: 'v1',
    },
  };

  res.status(statusCode).json(response);
}

export class ValidationError extends Error {
  public statusCode = HttpStatus.BAD_REQUEST;
  public code = ErrorCode.VALIDATION_ERROR;
  public details?: any;

  constructor(message: string, details?: any) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class UnauthorizedError extends Error {
  public statusCode = HttpStatus.UNAUTHORIZED;
  public code = ErrorCode.UNAUTHORIZED_ACCESS;

  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  public statusCode = HttpStatus.FORBIDDEN;
  public code = ErrorCode.FORBIDDEN_ACCESS;

  constructor(message: string = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends Error {
  public statusCode = HttpStatus.NOT_FOUND;
  public code = ErrorCode.RESOURCE_NOT_FOUND;

  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  public statusCode = HttpStatus.CONFLICT;
  public code = ErrorCode.RESOURCE_CONFLICT;

  constructor(message: string = 'Resource conflict') {
    super(message);
    this.name = 'ConflictError';
  }
}