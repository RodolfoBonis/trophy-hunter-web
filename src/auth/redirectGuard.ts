/**
 * Trava de loop de login: no máximo um redirect para o Keycloak a cada 30s por aba. Se a API
 * continuar respondendo 401 logo depois de um login (ex.: papel/audience errados), mostramos a tela
 * de erro em vez de ficar quicando entre o app e o Keycloak.
 */
const KEY = "th:auth-redirect-at";
export const REDIRECT_WINDOW_MS = 30_000;

export function canRedirectToLogin(now: number = Date.now(), storage: Storage = window.sessionStorage): boolean {
  const last = Number(storage.getItem(KEY) ?? 0);
  return !last || now - last >= REDIRECT_WINDOW_MS;
}

export function markLoginRedirect(now: number = Date.now(), storage: Storage = window.sessionStorage): void {
  storage.setItem(KEY, String(now));
}

/** Zera a trava (logout explícito ou "Tentar de novo" na tela de erro). */
export function clearLoginRedirectMark(storage: Storage = window.sessionStorage): void {
  storage.removeItem(KEY);
}

/**
 * Deduplica uma operação assíncrona: chamadas concorrentes (várias queries tomando 401 juntas)
 * compartilham a mesma promise até ela terminar.
 */
export function singleFlight<T>(fn: () => Promise<T>): () => Promise<T> {
  let inflight: Promise<T> | null = null;
  return () => {
    inflight ??= fn().finally(() => {
      inflight = null;
    });
    return inflight;
  };
}

/** Erros do renew silencioso que significam "sessão do Keycloak acabou" (vale novo login). */
export function isSessionEndedError(error: unknown): boolean {
  const code = (error as { error?: unknown } | null)?.error;
  return code === "invalid_grant" || code === "login_required";
}
