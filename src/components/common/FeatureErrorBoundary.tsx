/**
 * FeatureErrorBoundary - Error boundary for individual features
 * Catches errors in feature components and displays a fallback UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  featureName: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class FeatureErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(`[${this.props.featureName}] Error:`, error, errorInfo);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to error tracking service if available
    if (typeof window !== 'undefined' && (window as any).trackError) {
      (window as any).trackError(error, {
        feature: this.props.featureName,
        componentStack: errorInfo.componentStack,
      });
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 rounded-lg border border-rose-200 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-800">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-100 dark:bg-rose-800 rounded-lg">
              <svg
                className="w-5 h-5 text-rose-600 dark:text-rose-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-rose-800 dark:text-rose-200">
                {this.props.featureName} Error
              </h3>
              <p className="text-sm text-rose-600 dark:text-rose-300 mt-1">
                Something went wrong in this section. The rest of the app is still working.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <pre className="mt-2 p-2 bg-rose-100 dark:bg-rose-900 rounded text-xs text-rose-700 dark:text-rose-300 overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              )}
              <button
                onClick={this.handleRetry}
                className="mt-3 px-3 py-1.5 text-sm font-medium bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap a component with an error boundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  featureName: string,
  fallback?: ReactNode
): React.FC<P> {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <FeatureErrorBoundary featureName={featureName} fallback={fallback}>
        <WrappedComponent {...props} />
      </FeatureErrorBoundary>
    );
  };
}
