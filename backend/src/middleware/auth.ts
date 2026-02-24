/**
 * Authentication Middleware
 * Extracts authentication check from resolvers to reduce boilerplate
 */

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '../services/auth.service';

const prisma = new PrismaClient();
const auth = new AuthService(prisma);

/**
 * Express middleware to authenticate requests using JWT
 * Attaches the authenticated user to req.context.user
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Get the token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        error: 'No token provided',
        message: 'Authentication required',
      });
      return;
    }

    // 2. Verify the token
    const user = await auth.verifyToken(token);
    if (!user) {
      res.status(401).json({
        error: 'Invalid token',
        message: 'Invalid or expired token',
      });
      return;
    }

    // 3. Attach user to request context
    req.context = req.context || {};
    req.context.user = user;

    // 4. Set user ID on request for easy access
    req.userId = user.id;

    next();
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === 'AuthenticationError') {
        res.status(401).json({
          error: 'Authentication failed',
          message: error.message,
        });
        return;
      }

      if (error.name === 'JsonWebTokenError') {
        res.status(401).json({
          error: 'Invalid token',
          message: 'Invalid or expired token',
        });
        return;
      }

      if (error.name === 'TokenExpiredError') {
        res.status(401).json({
          error: 'Token expired',
          message: 'Your session has expired. Please log in again.',
        });
        return;
      }

      if (error.name === 'SyntaxError') {
        res.status(401).json({
          error: 'Invalid token format',
          message: 'Token is not a valid JWT',
        });
        return;
      }

      // Log unexpected errors
      console.error('Auth middleware error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred during authentication',
      });
      return;
    }

    // Fallback for non-Error throws
    res.status(401).json({
      error: 'Authentication failed',
      message: 'An unexpected error occurred',
    });
  }
};

/**
 * Optional auth middleware - attaches user if token present but doesn't require it
 */
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (token) {
      const user = await auth.verifyToken(token);
      if (user) {
        req.context = req.context || {};
        req.context.user = user;
        req.userId = user.id;
      }
    }

    next();
  } catch {
    // Silently continue without user attached
    next();
  }
};

/**
 * Type augmentation for Express Request
 */
declare module 'express' {
  interface Request {
    context?: {
      user?: {
        id: string;
        email: string;
        name?: string | null;
      };
    };
    userId?: string;
  }
}
