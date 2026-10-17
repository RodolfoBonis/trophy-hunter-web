import { Component, type ErrorInfo, type ReactNode } from "react";
import { reportError } from "@/lib/observability";

interface Props {
  fallback: (reset: () => void) => ReactNode;
  children: ReactNode;
}
interface State {
  error: Error | null;
}

/**
 * Captura erros não tratados na árvore React (substitui o Sentry.ErrorBoundary do template — este
 * projeto não usa Sentry). Reporta pelo módulo de observabilidade e mostra o fallback com retry.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    reportError(error, { componentStack: info.componentStack });
  }

  private reset = () => this.setState({ error: null });

  override render(): ReactNode {
    if (this.state.error) return this.props.fallback(this.reset);
    return this.props.children;
  }
}
