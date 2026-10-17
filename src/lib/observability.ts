/**
 * Observabilidade do front. Decisão do projeto: **sem Sentry** — a stack do rblab é só
 * Prometheus/Grafana. Este módulo concentra o reporte de erros num único ponto para que, quando
 * quisermos, seja trivial empurrar métricas/erros para um endpoint próprio (ex.: POST /api/v1/client-errors
 * exportado como contador no Prometheus). Por ora: `console.error` (visível no DevTools) para erros
 * acionáveis e um breadcrumb em memória para dar contexto ao próximo erro, sem ruído.
 */

export interface Breadcrumb {
  category: string;
  message: string;
  level?: "info" | "warning" | "error";
  at: number;
}

const MAX_BREADCRUMBS = 30;
const breadcrumbs: Breadcrumb[] = [];

export function addBreadcrumb(crumb: Omit<Breadcrumb, "at">): void {
  breadcrumbs.push({ ...crumb, at: Date.now() });
  if (breadcrumbs.length > MAX_BREADCRUMBS) breadcrumbs.shift();
}

export function recentBreadcrumbs(): readonly Breadcrumb[] {
  return breadcrumbs;
}

/** Erro acionável (bug de código, resposta fora do contrato). Context extra vira log estruturado. */
export function reportError(error: unknown, context?: Record<string, unknown>): void {
  console.error("[trophy-hunter] erro:", error, context ?? {}, { breadcrumbs: recentBreadcrumbs() });
}
