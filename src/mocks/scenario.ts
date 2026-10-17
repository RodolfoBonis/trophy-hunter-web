/**
 * Cenários do modo mock (dev/e2e): reproduzem estados (carregando, erro, vazio, sem acesso…).
 * Definidos por `?scenario=a,b` na URL (persistido) ou `localStorage["mock:scenario"]`.
 *
 * Exemplos: `integrations-needs-reconnect`, `library-empty`, `no-access`.
 */
const KEY = "mock:scenario";

export function currentScenarios(): string[] {
  if (typeof window === "undefined") return [];
  const fromUrl = new URLSearchParams(window.location.search).get("scenario");
  if (fromUrl !== null) {
    window.localStorage.setItem(KEY, fromUrl);
  }
  const raw = fromUrl ?? window.localStorage.getItem(KEY) ?? "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function hasScenario(name: string): boolean {
  return currentScenarios().includes(name);
}
