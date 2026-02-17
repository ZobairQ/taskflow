/**
 * GlobalErrorFallback - Full-page error display for critical errors
 */

import React from 'react';

interface GlobalErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
}

export const GlobalErrorFallback: React.FC<GlobalErrorFallbackProps> = ({
  error,
  resetError,
}) => {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4"
    >
      <div className="max-w-md w-full text-center">
        {/* Error icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-rose-600 dark:text-rose-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error message */}
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Something went wrong
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          We're sorry, but something unexpected happened. Please try refreshing the page.
        </p>

        {/* Error details (development only) */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-left">
            <p className="text-sm font-mono text-rose-700 dark:text-rose-300 break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Refresh Page
          </button>
          {resetError && (
            <button
              onClick={resetError}
              className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              Try Again
            </button>
          )}
        </div>

        {/* Help text */}
        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
          If this problem persists, try clearing your browser data or{' '}
          <button
            onClick={() => localStorage.clear()}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            reset the app
          </button>
        </p>
      </div>
    </div>
  );
};

/**
 * useErrorHandler - Hook for consistent error handling
 */
export const useErrorHandler = () => {
  const handleError = (error: Error, context?: string) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${context || 'App'}] Error:`, error);
    }

    // In production, you would send to error tracking service
    // Example: Sentry.captureException(error, { tags: { context } });

    // Return user-friendly message
    return {
      message: error.message || 'An unexpected error occurred',
      recoverable: !error.message.includes('ChunkLoadError'),
    };
  };

  return { handleError };
};
