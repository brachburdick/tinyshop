"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * App-level React error boundary.
 * Catches unhandled rendering errors and displays a fallback UI instead of
 * a blank white screen.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Log to console for local debugging; no remote reporting in this app.
    console.error("[ErrorBoundary] Caught rendering error:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-ts-bg px-8">
          <div className="max-w-md w-full bg-ts-surface border border-ts-error/30 rounded-xl p-8 shadow-md">
            <h1 className="text-lg font-semibold text-ts-text mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-ts-text-muted mb-4">
              An unexpected error occurred while rendering this page. You can
              try refreshing or returning to the Workshop.
            </p>
            {this.state.error && (
              <pre className="text-xs text-ts-error bg-ts-error/10 rounded-lg p-3 overflow-x-auto mb-5 whitespace-pre-wrap break-all">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 rounded-lg bg-ts-accent text-white text-sm font-medium hover:bg-ts-accent-hover transition-colors"
              >
                Try again
              </button>
              <a
                href="/workshop"
                className="px-4 py-2 rounded-lg border border-ts-border text-sm text-ts-text hover:bg-ts-surface-alt transition-colors"
              >
                Go to Workshop
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
