import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// Edge-compatible Prisma client with Accelerate
// Only use accelerate extension if DATABASE_URL contains prisma://
const shouldUseAccelerate = process.env.DATABASE_URL?.startsWith('prisma://');

export const edgePrisma = shouldUseAccelerate 
  ? new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    }).$extends(withAccelerate())
  : new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });

// Export types for edge environments
export * from '@prisma/client';