import type { Metric } from "web-vitals";

/**
 * Web Vitals dos usuários de verdade → POST /client-vitals (vira histograma no Prometheus/Grafana).
 * Junta as medidas e manda num sendBeacon só quando a aba é escondida (é quando o web-vitals fecha
 * LCP/CLS/INP). Corpo text/plain: o beacon não faz preflight de CORS. Nada pessoal: só nome, valor,
 * grupo da tela e se é celular.
 */

/** Grupo da tela (baixa cardinalidade; a API aceita só estes). */
export function routeGroup(pathname: string): string {
  const rules: [RegExp, string][] = [
    [/^\/$/, "home"],
    [/^\/library/, "library"],
    [/^\/games\/[^/]+\/hunt/, "hunt"],
    [/^\/games\//, "game"],
    [/^\/next/, "next"],
    [/^\/timeline/, "timeline"],
    [/^\/friends\/challenges/, "challenge"],
    [/^\/friends\/[^/]+/, "friend"],
    [/^\/friends/, "friends"],
    [/^\/recap/, "recap"],
    [/^\/badges/, "badges"],
    [/^\/settings/, "settings"],
    [/^\/(perfil|u)\//, "public"],
    [/^\/convite\//, "invite"],
  ];
  return rules.find(([re]) => re.test(pathname))?.[1] ?? "other";
}

export function startVitals(endpoint: string): void {
  const queue: { name: string; value: number; route: string }[] = [];
  const device = window.matchMedia("(max-width: 900px)").matches ? "mobile" : "desktop";
  const add = (m: Metric) => queue.push({ name: m.name, value: Math.round(m.value * 1000) / 1000, route: routeGroup(window.location.pathname) });
  const flush = () => {
    if (queue.length === 0) return;
    const items = queue.splice(0, 10);
    navigator.sendBeacon?.(endpoint, JSON.stringify({ device, items }));
  };
  void import("web-vitals").then(({ onLCP, onINP, onCLS, onFCP, onTTFB }) => {
    onLCP(add);
    onINP(add);
    onCLS(add);
    onFCP(add);
    onTTFB(add);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
  window.addEventListener("pagehide", flush);
}
