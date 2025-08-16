import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

export interface ConnectionConfig {
  maxConnections?: number;
  connectionTimeout?: number;
  queryTimeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface DatabaseMetrics {
  activeConnections: number;
  totalQueries: number;
  failedQueries: number;
  averageQueryTime: number;
  lastError?: Error;
}

/**
 * Enhanced database connection manager with pooling and error handling
 */
export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private prismaClient: PrismaClient;
  private metrics: DatabaseMetrics;
  private config: Required<ConnectionConfig>;
  private isConnected: boolean = false;
  private connectionAttempts: number = 0;

  private constructor(config: ConnectionConfig = {}) {
    this.config = {
      maxConnections: config.maxConnections || 10,
      connectionTimeout: config.connectionTimeout || 30000, // 30 seconds
      queryTimeout: config.queryTimeout || 10000, // 10 seconds
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000, // 1 second
    };

    this.metrics = {
      activeConnections: 0,
      totalQueries: 0,
      failedQueries: 0,
      averageQueryTime: 0,
    };

    this.prismaClient = this.createPrismaClient();
  }

  /**
   * Get singleton instance of DatabaseConnection
   */
  public static getInstance(config?: ConnectionConfig): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection(config);
    }
    return DatabaseConnection.instance;
  }

  /**
   * Create Prisma client with optimized configuration
   */
  private createPrismaClient(): PrismaClient {
    const client = new PrismaClient({
      log: this.getLogLevel(),
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    } as any);

    // Add Accelerate extension if available
    if (process.env.DATABASE_URL?.includes('accelerate') || process.env.DATABASE_URL?.startsWith('prisma://')) {
      return client.$extends(withAccelerate()) as any;
    }

    return client;
  }

  /**
   * Get appropriate log level based on environment
   */
  private getLogLevel(): ('query' | 'info' | 'warn' | 'error')[] {
    if (process.env.NODE_ENV === 'development') {
      return ['query', 'info', 'warn', 'error'];
    } else if (process.env.NODE_ENV === 'test') {
      return ['error'];
    } else {
      return ['warn', 'error'];
    }
  }

  /**
   * Connect to database with retry logic
   */
  public async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        this.connectionAttempts++;
        
        // Test connection
        await Promise.race([
          this.prismaClient.$connect(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), this.config.connectionTimeout)
          ),
        ]);

        this.isConnected = true;
        console.log(`✅ Database connected successfully (attempt ${attempt})`);
        return;

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Database connection failed (attempt ${attempt}/${this.config.retryAttempts}): ${errorMessage}`);
        
        this.metrics.lastError = error instanceof Error ? error : new Error(errorMessage);

        if (attempt === this.config.retryAttempts) {
          throw new Error(`Failed to connect to database after ${this.config.retryAttempts} attempts: ${errorMessage}`);
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * attempt));
      }
    }
  }

  /**
   * Disconnect from database
   */
  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.prismaClient.$disconnect();
      this.isConnected = false;
      console.log('✅ Database disconnected successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Error disconnecting from database: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Get Prisma client instance
   */
  public getClient(): PrismaClient {
    if (!this.isConnected) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.prismaClient;
  }

  /**
   * Execute query with error handling and metrics tracking
   */
  public async executeQuery<T>(
    queryFn: (client: PrismaClient) => Promise<T>,
    operation: string = 'unknown'
  ): Promise<T> {
    const startTime = Date.now();
    this.metrics.activeConnections++;
    this.metrics.totalQueries++;

    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const result = await Promise.race([
        queryFn(this.prismaClient),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error(`Query timeout for operation: ${operation}`)), this.config.queryTimeout)
        ),
      ]);

      const queryTime = Date.now() - startTime;
      this.updateAverageQueryTime(queryTime);

      return result;

    } catch (error) {
      this.metrics.failedQueries++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error(`❌ Database query failed [${operation}]: ${errorMessage}`);
      
      // Store last error for monitoring
      this.metrics.lastError = error instanceof Error ? error : new Error(errorMessage);

      // Re-throw with additional context
      throw new Error(`Database operation failed [${operation}]: ${errorMessage}`);

    } finally {
      this.metrics.activeConnections--;
    }
  }

  /**
   * Update average query time metric
   */
  private updateAverageQueryTime(queryTime: number): void {
    const totalTime = this.metrics.averageQueryTime * (this.metrics.totalQueries - 1);
    this.metrics.averageQueryTime = (totalTime + queryTime) / this.metrics.totalQueries;
  }

  /**
   * Health check for database connection
   */
  public async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    latency: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      // Simple query to test connection
      await this.prismaClient.$queryRaw`SELECT 1`;
      
      const latency = Date.now() - startTime;
      
      return {
        status: 'healthy',
        latency,
      };

    } catch (error) {
      const latency = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        status: 'unhealthy',
        latency,
        error: errorMessage,
      };
    }
  }

  /**
   * Get current database metrics
   */
  public getMetrics(): DatabaseMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics (useful for testing)
   */
  public resetMetrics(): void {
    this.metrics = {
      activeConnections: 0,
      totalQueries: 0,
      failedQueries: 0,
      averageQueryTime: 0,
    };
  }

  /**
   * Get connection status
   */
  public isHealthy(): boolean {
    return this.isConnected && this.metrics.activeConnections < this.config.maxConnections;
  }

  /**
   * Force reconnection (useful for handling connection drops)
   */
  public async reconnect(): Promise<void> {
    console.log('🔄 Forcing database reconnection...');
    
    try {
      await this.disconnect();
    } catch (error) {
      // Ignore disconnect errors during reconnection
      console.warn('Warning during disconnect:', error);
    }

    this.isConnected = false;
    await this.connect();
  }
}

/**
 * Global database connection instance
 */
export const dbConnection = DatabaseConnection.getInstance({
  maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
  connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
  queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT || '10000'),
  retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '3'),
  retryDelay: parseInt(process.env.DB_RETRY_DELAY || '1000'),
});

/**
 * Utility function to execute database operations with error handling
 */
export async function withDatabase<T>(
  operation: (client: PrismaClient) => Promise<T>,
  operationName: string = 'database_operation'
): Promise<T> {
  return dbConnection.executeQuery(operation, operationName);
}

/**
 * Initialize database connection on module load
 */
export async function initializeDatabase(): Promise<void> {
  try {
    await dbConnection.connect();
    console.log('🚀 Database initialization completed');
  } catch (error) {
    console.error('💥 Database initialization failed:', error);
    throw error;
  }
}

/**
 * Graceful shutdown handler
 */
export async function shutdownDatabase(): Promise<void> {
  try {
    await dbConnection.disconnect();
    console.log('👋 Database shutdown completed');
  } catch (error) {
    console.error('💥 Database shutdown failed:', error);
    throw error;
  }
}

// Handle process termination
if (typeof process !== 'undefined') {
  process.on('SIGINT', shutdownDatabase);
  process.on('SIGTERM', shutdownDatabase);
  process.on('beforeExit', shutdownDatabase);
}