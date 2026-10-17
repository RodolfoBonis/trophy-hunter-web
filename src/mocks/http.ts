import { delay, HttpResponse } from "msw";
import { hasScenario } from "./scenario";

/**
 * Utilitários dos handlers MSW. Os handlers casam qualquer origem (o prefixo coringa + /api/v1),
 * então servem tanto o modo mock do navegador quanto os testes (msw/node).
 */
export const API = "*/api/v1";

export const HOUR = 3_600_000;
export const DAY = 24 * HOUR;

/** ISO de `ms` atrás em relação a agora. */
export function ago(ms: number): string {
  return new Date(Date.now() - ms).toISOString();
}

/** Erro no formato RFC 7807 (problem+json), como a API Go responde. */
export function apiError(
  status: number,
  code: string,
  message: string,
  errors?: { field: string; code: string }[],
) {
  return HttpResponse.json(
    { type: `https://trophy.rb.lab/errors/${code}`, title: code, status, detail: message, ...(errors ? { errors } : {}) },
    { status, headers: { "Content-Type": "application/problem+json" } },
  );
}

/** Simula endpoint inexistente (chi: 404 em texto puro). */
export function routeNotFound() {
  return new HttpResponse("404 page not found", { status: 404, headers: { "Content-Type": "text/plain" } });
}

/**
 * Aplica os cenários genéricos de uma área: `<area>-loading` (nunca responde), `<area>-error` (503)
 * e `<area>-unsupported` (404 de rota). Devolve uma resposta para curto-circuitar, ou undefined.
 */
export async function scenarioGate(area: string) {
  if (hasScenario(`${area}-loading`)) {
    await delay("infinite");
  }
  if (hasScenario(`${area}-error`)) {
    return apiError(503, "upstream_timeout", "A API não respondeu a tempo.");
  }
  if (hasScenario(`${area}-unsupported`)) {
    return routeNotFound();
  }
  return undefined;
}
