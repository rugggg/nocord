import { Component, ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] Caught:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback(this.state.error);
      return (
        <div className="flex-1 flex flex-col items-center justify-center bg-parchment p-8 gap-4">
          <div className="paper-card p-6 max-w-lg w-full">
            <h2 className="text-lg font-extrabold text-mario-red mb-2">Something went wrong</h2>
            <pre className="text-xs text-pm-dark bg-parchment rounded p-3 overflow-auto whitespace-pre-wrap border-2 border-paper-border">
              {this.state.error.message}
              {"\n\n"}
              {this.state.error.stack}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
