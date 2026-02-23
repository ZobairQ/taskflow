/**
 * Sentry Integration for Frontend
 * Error monitoring and performance tracking
 */

import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry for the frontend
 * Only initializes if REACT_APP_SENTRY_DSN is configured
 */
export function initSentry(): void {
  const dsn = process.env.REACT_APP_SENTRY_DSN;

  if (dsn) {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV,
      // Set tracesSampleRate to capture transactions for performance monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

      // Replay configuration for session replay
      replaysSessionSampleRate: 0.1, // Sample 10% of sessions
      replaysOnErrorSampleRate: 1.0, // Capture 100% of errors with replay

      // Ignore common errors
      ignoreErrors: [
        // Browser extension errors
        'Non-Error promise rejection captured',
        // Network errors
        'NetworkError',
        'Network request failed',
        // Random browser errors
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications',
      ],
    });

    console.log('Sentry initialized for frontend error monitoring');
  }
}

/**
 * Capture an exception in Sentry
 */
export function captureException(error: Error | unknown, context?: Record<string, any>): void {
  if (process.env.REACT_APP_SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context,
    });
  }
}

/**
 * Capture a message in Sentry
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info'
): void {
  if (process.env.REACT_APP_SENTRY_DSN) {
    Sentry.captureMessage(message, level);
  }
}

/**
 * Set user context in Sentry
 */
export function setUser(user: { id: string; email?: string; username?: string } | null): void {
  if (process.env.REACT_APP_SENTRY_DSN) {
    Sentry.setUser(user);
  }
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(breadcrumb: {
  category: string;
  message: string;
  level?: 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}): void {
  if (process.env.REACT_APP_SENTRY_DSN) {
    Sentry.addBreadcrumb({
      category: breadcrumb.category,
      message: breadcrumb.message,
      level: breadcrumb.level || 'info',
      data: breadcrumb.data,
    });
  }
}

/**
 * Error Boundary component wrapper
 */
export const ErrorBoundary = Sentry.ErrorBoundary;

// Export Sentry for direct access
export { Sentry };
