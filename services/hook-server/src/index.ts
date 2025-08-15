import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';

import { errorHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/request-logger';
import { webhookRoutes } from './routes/webhook';
import { scanRoutes } from './routes/scan';
import { repositoryRoutes } from './routes/repository';
import { findingRoutes } from './routes/finding';
import { healthRoutes } from './routes/health';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// Request logging
app.use(morgan('combined'));
app.use(requestLogger);

// Body parsing middleware
app.use('/webhook', express.raw({ type: 'application/json' })); // Raw for webhook signature validation
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/health', healthRoutes);
app.use('/webhook', webhookRoutes);
app.use('/api/v1/scans', scanRoutes);
app.use('/api/v1/repositories', repositoryRoutes);
app.use('/api/v1/findings', findingRoutes);

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

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 RepoFlight Hook Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Webhook endpoint: http://localhost:${PORT}/webhook`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

export { app, server };