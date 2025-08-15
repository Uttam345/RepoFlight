import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// Global variable to store the Prisma client instance
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Create a singleton Prisma client with optional Accelerate extension
function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  // Add Accelerate extension if DATABASE_URL contains accelerate
  if (process.env.DATABASE_URL?.includes('accelerate')) {
    return client.$extends(withAccelerate());
  }

  return client;
}

export const prisma = globalThis.__prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Export types
export * from '@prisma/client';

// Export edge client
export { edgePrisma } from './edge';

// Export utility functions
export * from './utils/risk-calculator';
export * from './utils/compliance-mapper';
export * from './utils/query-helpers';