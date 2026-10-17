/**
 * Destino pós-login vindo do `state` do OIDC. Só aceitamos o mesmo origin (evita open redirect com
 * `//evil.com`, `https://evil.com` ou `javascript:`); devolvemos path + search + hash.
 */
export function safeReturnTo(returnTo: unknown, origin: string = window.location.origin): string {
  if (typeof returnTo !== "string" || returnTo === "") return "/";
  try {
    const url = new URL(returnTo, origin);
    if (url.origin !== origin) return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}

/** Rota atual, para mandar como `returnTo` no state do login. */
export function currentReturnTo(): string {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}
