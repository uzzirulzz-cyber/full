import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let msg = error.message || 'An unexpected error occurred.';
    try {
      const parsed = JSON.parse(error.message);
      if (parsed && typeof parsed.error === 'string') {
        msg = `Database request blocked (${parsed.operationType || 'operation'}): ${parsed.error}`;
      }
    } catch {
      // plain error message
    }
    return { hasError: true, message: msg };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="edge-solid rounded-2xl p-6 max-w-md w-full text-center space-y-3">
            <h2 className="text-lg font-extrabold text-[#ffd958]">Something went wrong</h2>
            <p className="text-xs text-[#c8d3ea] leading-relaxed">{this.state.message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="yb rounded-full px-6 h-9 text-xs font-bold"
            >
              Reload Playbeat Digital
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
