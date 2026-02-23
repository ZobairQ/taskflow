/**
 * Request Logger Middleware
 * Logs HTTP requests with timing and details
 */

import express from 'express';
import { createLogger } from './logger';

const logger = createLogger('HTTP');

export const requestLogger: express.RequestHandler = (req, res, next) => {
  const start = Date.now();

  // Log request
  logger.info(`--> ${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warn' : 'info';

    logger.log(level, `<-- ${req.method} ${req.path} ${res.statusCode}`, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};

/**
 * Error logging middleware
 */
export const errorLogger: express.ErrorRequestHandler = (err, _req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
  });

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });

  next(err);
};
