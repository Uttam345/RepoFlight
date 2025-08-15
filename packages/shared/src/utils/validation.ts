import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse, HttpStatus, ErrorCode } from '../types/api';

/**
 * Middleware factory for validating request data using Zod schemas
 */
export function validateRequest<T extends z.ZodType>(
  schema: T,
  source: 'body' | 'query' | 'params' = 'body'
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[source];
      const result = schema.safeParse(data);

      if (!result.success) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: 'Validation failed',
            details: result.error.issues,
          },
        };

        return res.status(HttpStatus.BAD_REQUEST).json(response);
      }

      // Attach validated data to request
      req.validated = result.data;
      next();
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Internal validation error',
        },
      };

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
  };
}

/**
 * Validate GitHub webhook signature
 */
export function validateGitHubSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require('crypto');
  const expectedSignature = `sha256=${crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')}`;

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Validate CVSS score
 */
export function validateCVSSScore(score: number): boolean {
  return score >= 0 && score <= 10;
}

/**
 * Validate SPDX license identifier
 */
export function validateSPDXLicense(license: string): boolean {
  // Basic SPDX license validation
  const spdxPattern = /^[A-Za-z0-9\-\+\.]+$/;
  return spdxPattern.test(license) && license.length > 0;
}

/**
 * Validate GitHub repository full name (owner/repo)
 */
export function validateGitHubRepoName(fullName: string): boolean {
  const repoPattern = /^[a-zA-Z0-9\-_\.]+\/[a-zA-Z0-9\-_\.]+$/;
  return repoPattern.test(fullName);
}

/**
 * Validate commit SHA
 */
export function validateCommitSHA(sha: string): boolean {
  const shaPattern = /^[a-f0-9]{40}$/i;
  return shaPattern.test(sha);
}

/**
 * Validate file path
 */
export function validateFilePath(path: string): boolean {
  // Basic file path validation - no absolute paths or dangerous patterns
  if (path.startsWith('/') || path.includes('..') || path.includes('\\')) {
    return false;
  }
  return path.length > 0 && path.length <= 1000;
}

/**
 * Sanitize user input
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .trim()
    .substring(0, 1000); // Limit length
}

/**
 * Validate email address
 */
export function validateEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

/**
 * Validate URL
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Custom validation error class
 */
export class ValidationError extends Error {
  public code: string;
  public details?: any;

  constructor(message: string, code: string = ErrorCode.VALIDATION_ERROR, details?: any) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    this.details = details;
  }
}

// Extend Express Request type to include validated data
declare global {
  namespace Express {
    interface Request {
      validated?: any;
    }
  }
}