import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/** Last-resort fallback for a render-time exception anywhere in the tree — without this,
 *  React unmounts the whole app and the user sees a blank page with nothing logged for them. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Unhandled error in component tree:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="auth-container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2rem" }}>
          <div>
            <h1 className="auth-title">Something went wrong.</h1>
            <p className="auth-sub">Please refresh the page. If this keeps happening, contact support.</p>
            <button className="btn btn-success" onClick={() => window.location.reload()}>
              Refresh
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
