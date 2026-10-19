#!/usr/bin/env node
/**
 * Smoke do build de PRODUÇÃO (o e2e roda em modo mock e não pega erro de boot do caminho real — foi
 * assim que a 0.25.0 quebrou em produção com "e is not a function" na ordem dos chunks).
 * Abre o container de verdade no Chromium e exige: nenhum erro de JS na página e o app chegando no
 * login (pedido ao Keycloak) / na API pública (perfil público).
 *
 *   node tests/smoke/boot-prod.mjs http://localhost:8080 https://auth.example.test https://api.example.test/trophy
 */
import { chromium } from "@playwright/test";

const [base = "http://localhost:8080", authOrigin, apiBase] = process.argv.slice(2);
if (!authOrigin || !apiBase) {
  console.error("uso: boot-prod.mjs <base> <origem do keycloak> <api base>");
  process.exit(2);
}

const checks = [
  { path: "/library", expect: (u) => u.startsWith(authOrigin), what: "pedido ao Keycloak (login/discovery)" },
  { path: "/perfil/smoke-teste", expect: (u) => u.startsWith(`${apiBase}/v1/public/profiles/smoke-teste`), what: "pedido à API do perfil público" },
];

const browser = await chromium.launch();
let failed = false;
for (const c of checks) {
  const page = await (await browser.newContext()).newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const reached = page.waitForRequest((r) => c.expect(r.url()), { timeout: 15_000 }).then(() => true, () => false);
  await page.goto(base + c.path).catch(() => {});
  const ok = await reached;
  await page.waitForTimeout(500);
  const line = `${c.path}: ${ok ? "ok" : "FALHOU"} (${c.what})${errors.length ? ` — erros de JS: ${errors.join(" | ")}` : ""}`;
  console.log(line);
  if (!ok || errors.length) failed = true;
}
await browser.close();
process.exit(failed ? 1 : 0);
