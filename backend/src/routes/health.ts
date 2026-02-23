/**
 * Health Check Routes
 * Endpoints for Kubernetes probes and monitoring
 */

import express, { Request, Response } from 'express';
import { prisma } from '../types/context';

const router = express.Router();

/**
 * GET /health
 * Basic health check - returns 200 if service is running
 */
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * GET /ready
 * Readiness probe - checks database connection
 */
router.get('/ready', async (_req: Request, res: Response) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'ok',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
});

/**
 * GET /live
 * Liveness probe - returns 200 if the process is alive
 */
router.get('/live', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

export default router;
