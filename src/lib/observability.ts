/**
 * Observabilidade do front. Decisão do projeto: **sem Sentry** — a stack do rblab é só
 * Prometheus/Grafana. Erros acionáveis vão para o `console.error` (DevTools) e, em produção, para a
 * API (`POST <apiBase>/v1/client-errors`), que vira log + métrica `client_errors_total` com alerta no
 * Telegram — assim erro na máquina de um amigo não passa despercebido. Breadcrumbs ficam em memória
 * para dar contexto ao próximo erro, sem ruído.
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
  send(error, context);
}

/* ── Envio para a API ───────────────────────────────────────────────────────────────────── */

export type ClientErrorKind = "render" | "unhandled" | "api_contract" | "network" | "other";

interface Reporting {
  endpoint: string;
  release: string;
}

let reporting: Reporting | null = null;
const MAX_PER_SESSION = 20;
const DEDUPE_MS = 60_000;
let sentCount = 0;
const lastSent = new Map<string, number>();

/** Liga o envio (só no boot real — testes e modo mock não enviam nada). */
export function configureErrorReporting(config: Reporting | null): void {
  reporting = config;
  sentCount = 0;
  lastSent.clear();
}

function kindOf(context?: Record<string, unknown>): ClientErrorKind {
  if (!context) return "other";
  if ("boundary" in context || "componentStack" in context) return "render";
  if ("api_path" in context) return "api_contract";
  if ("global" in context) return "unhandled";
  return "other";
}

function messageOf(error: unknown): { message: string; stack: string } {
  if (error instanceof Error) return { message: `${error.name}: ${error.message}`, stack: error.stack ?? "" };
  try {
    return { message: typeof error === "string" ? error : JSON.stringify(error), stack: "" };
  } catch {
    return { message: String(error), stack: "" };
  }
}

/** Manda o erro para a API sem atrapalhar a página (keepalive, dedupe 1×/min, teto por sessão). */
function send(error: unknown, context?: Record<string, unknown>): void {
  if (!reporting || sentCount >= MAX_PER_SESSION) return;
  const { message, stack } = messageOf(error);
  const now = Date.now();
  const key = message.slice(0, 200);
  if (now - (lastSent.get(key) ?? 0) < DEDUPE_MS) return;
  lastSent.set(key, now);
  sentCount++;
  const extra = context?.componentStack ? `\n--- componentes ---${String(context.componentStack)}` : "";
  const body = JSON.stringify({
    kind: kindOf(context),
    message: message.slice(0, 500),
    stack: (stack + extra).slice(0, 4000),
    route: window.location.pathname,
    release: reporting.release,
    user_agent: navigator.userAgent,
  });
  void fetch(reporting.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
    credentials: "omit",
  }).catch(() => {
    // Sem rede: o erro já foi para o console; não vamos gerar outro erro por isso.
  });
}

/** Erros fora do React (event handlers, promises soltas) também contam. */
export function installGlobalErrorHandlers(isIgnorable: (error: unknown) => boolean): void {
  window.addEventListener("error", (e) => {
    if (!isIgnorable(e.error)) reportError(e.error ?? e.message, { global: "error" });
  });
  window.addEventListener("unhandledrejection", (e) => {
    const reason: unknown = e.reason;
    if (reason instanceof DOMException && reason.name === "AbortError") return;
    if (!isIgnorable(reason)) reportError(reason, { global: "unhandledrejection" });
  });
}
