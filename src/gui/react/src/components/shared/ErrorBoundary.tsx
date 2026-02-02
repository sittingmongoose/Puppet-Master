import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary component for graceful error handling
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-paper-cream dark:bg-paper-dark">
          <div className="panel p-xl max-w-lg text-center">
            <h1 className="font-display text-2xl text-hot-magenta mb-md">
              Something went wrong
            </h1>
            <p className="text-ink-faded dark:text-ink-faded-dark mb-lg">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="flex gap-md justify-center">
              <button
                type="button"
                onClick={this.handleRetry}
                className="
                  px-lg py-sm
                  bg-electric-blue text-paper-cream
                  border-thick border-ink-black
                  font-ui font-semibold uppercase tracking-wide
                  cursor-pointer
                  transition-all duration-200
                  hover:-translate-y-px
                  shadow-panel
                "
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="
                  px-lg py-sm
                  bg-paper-cream dark:bg-paper-dark
                  text-ink-black dark:text-ink-light
                  border-thick border-ink-black dark:border-ink-light
                  font-ui font-semibold uppercase tracking-wide
                  cursor-pointer
                  transition-all duration-200
                  hover:-translate-y-px
                  shadow-panel dark:shadow-panel-dark
                "
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
