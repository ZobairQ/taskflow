/**
 * Sentry Integration
 * Error monitoring and performance tracking
 */

import * as Sentry from '@sentry/node';
import { env } from '../config';

/**
 * Initialize Sentry
 * Only initializes if SENTRY_DSN is configured
 */
export function initSentry(): void {
  if (env.SENTRY_DSN) {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: env.NODE_ENV,
      // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
      // We recommend adjusting this value in production
      tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,

      // Ignore common errors that we don't want to track
      ignoreErrors: [
        // Network errors
        'ECONNREFUSED',
        'ECONNRESET',
        'ETIMEDOUT',
        // GraphQL errors
        'GRAPHQL_VALIDATION_FAILED',
        'UNAUTHENTICATED',
        'FORBIDDEN',
        // User input errors
        'UserInputError',
      ],
    });

    console.log('Sentry initialized for error monitoring');
  } else {
    console.log('Sentry not configured (SENTRY_DSN not set)');
  }
}

/**
 * Capture an exception in Sentry
 * Safe to call even if Sentry is not initialized
 */
export function captureException(error: Error | unknown, context?: Record<string, any>): void {
  if (env.SENTRY_DSN) {
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
  if (env.SENTRY_DSN) {
    Sentry.captureMessage(message, level);
  }
}

/**
 * Add user context to Sentry
 */
export function setUser(user: { id: string; email?: string; name?: string }): void {
  if (env.SENTRY_DSN) {
    Sentry.setUser(user);
  }
}

/**
 * Clear user context from Sentry
 */
export function clearUser(): void {
  if (env.SENTRY_DSN) {
    Sentry.setUser(null);
  }
}

/**
 * Add custom context to Sentry
 */
export function setContext(name: string, context: Record<string, any>): void {
  if (env.SENTRY_DSN) {
    Sentry.setContext(name, context);
  }
}

/**
 * Start a span for performance monitoring
 */
export function startSpan(name: string, op: string): void {
  if (env.SENTRY_DSN) {
    Sentry.startSpan({ name, op }, () => {
      // Span callback - can be used for timing operations
    });
  }
}

// Export Sentry for direct access if needed
export { Sentry };
