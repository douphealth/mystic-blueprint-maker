import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Last line of defence.
 *
 * The blueprint app had no error boundary, so a single unexpected value during
 * render (for example a numerology number with no interpretation entry)
 * unmounted the entire tree and left the visitor staring at an empty dark
 * page with no explanation and no way back.
 *
 * This boundary turns any such failure into a readable message plus a working
 * "Start over" action, and logs the detail for debugging.
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled render error:", error, info.componentStack);
  }

  private reset = () => {
    this.setState({ error: null });
    // drop any query params so the user lands on a clean intake form
    window.history.replaceState({}, document.title, window.location.pathname);
    window.location.reload();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <div className="relative z-10 text-center max-w-md w-full bg-card/60 border border-primary/20 p-8 rounded-3xl shadow-xl">
          <div className="w-16 h-16 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-primary font-display text-2xl font-bold">✦</span>
          </div>
          <h2 className="font-display text-2xl text-gradient-gold mb-3">
            Something interrupted your reading
          </h2>
          <p className="font-body text-sm text-muted-foreground mb-6 leading-relaxed">
            We hit an unexpected problem while drawing your blueprint. Your details
            were not lost, and nothing was charged. Start again and it will
            recalculate.
          </p>
          <button
            onClick={this.reset}
            className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-display text-sm tracking-widest uppercase hover:bg-gold-light transition-all duration-300"
          >
            Start over
          </button>
          <details className="mt-5 text-left">
            <summary className="font-ui text-[10px] tracking-wider uppercase text-muted-foreground/60 cursor-pointer">
              Technical detail
            </summary>
            <pre className="mt-2 text-[10px] leading-relaxed text-muted-foreground/70 whitespace-pre-wrap break-words font-mono">
              {error.message}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
