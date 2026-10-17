#!/usr/bin/env node
/**
 * Captura screenshots do app em modo mock para revisão do style tile. Requer o preview do build e2e
 * no ar (ver scripts/README ou o comando no package): serve dist-e2e em http://localhost:4173.
 *   pnpm build:e2e && pnpm exec vite preview --outDir dist-e2e --port 4173 --strictPort &
 *   node scripts/screens.mjs
 * Saída: design/screens/{library,game}-{desktop,mobile}.png
 */
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "design/screens");
mkdirSync(outDir, { recursive: true });

const BASE = process.env.SCREENS_BASE ?? "http://localhost:4173";
const GAME = "11111111-1111-1111-1111-111111111111"; // ELDEN RING (fixture)

const viewports = [
  { name: "desktop", width: 1440, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];
const pages = [
  { name: "library", path: "/library", ready: "text=ELDEN RING" },
  { name: "game", path: `/games/${GAME}`, ready: "text=Lorde Éldero" },
  { name: "integrations", path: "/settings/integrations", ready: "text=Conectar Steam" },
  { name: "sync", path: "/sync", ready: "text=Incremental" },
];

const browser = await chromium.launch();
for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
    colorScheme: "dark",
    locale: "pt-BR",
  });
  const page = await context.newPage();
  for (const p of pages) {
    await page.goto(`${BASE}${p.path}`, { waitUntil: "networkidle" });
    await page.waitForSelector(p.ready, { timeout: 15000 });
    // deixa o anel de progresso terminar o count-up
    await page.waitForTimeout(1200);
    const file = resolve(outDir, `${p.name}-${vp.name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(`→ ${file}`);
  }
  await context.close();
}
await browser.close();
