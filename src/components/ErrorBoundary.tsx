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
      const isAdmin = window.location.pathname.startsWith('/admin') || window.location.hostname.startsWith('admin.');
      if (isAdmin) {
        return (
          <div className="corona-admin">
            <div className="d-flex align-items-center text-center error-page bg-info pt-5 pb-4 h-100">
              <div className="row flex-grow">
                <div className="col-lg-7 mx-auto text-white">
                  <div className="row align-items-center d-flex flex-row">
                    <div className="col-lg-6 text-lg-right pr-lg-4"><h1 className="display-1 mb-0">500</h1></div>
                    <div className="col-lg-6 error-page-divider text-lg-left pl-lg-4">
                      <h2>SORRY!</h2>
                      <h3 className="font-weight-light">The admin module could not be loaded.</h3>
                    </div>
                  </div>
                  <p className="mt-4">{this.state.message}</p>
                  <div className="row mt-5"><div className="col-12 text-center mt-xl-2">
                    <button type="button" className="btn btn-outline-light" onClick={() => window.location.assign('/admin#/dashboard')}>Back to dashboard</button>
                  </div></div>
                </div>
              </div>
            </div>
          </div>
        );
      }
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
