import { defineConfig, devices } from "@playwright/test";

/**
 * E2E com API mockada (MSW no navegador) e sessão fake: builda o bundle `--mode mock` e serve com
 * `vite preview`. Smoke de teclado/navegação em mock mode (ver tests/e2e/smoke.spec.ts).
 */
const PORT = 4173;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    colorScheme: "dark",
    trace: "retain-on-failure",
  },
  expect: { toHaveScreenshot: { threshold: 0.2 } },
  // Prints de referência sem sufixo de SO: só existem os do Linux (CI), ver tests/e2e/visual.spec.ts.
  snapshotPathTemplate: "{testDir}/__screenshots__/{projectName}/{arg}{ext}",
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1024 } } },
    // iPhone 13 no Chromium (o padrão do device é WebKit): mesmo motor dos prints, viewport/toque de celular.
    { name: "mobile", use: { ...devices["iPhone 13"], browserName: "chromium" } },
  ],
  webServer: {
    command: `pnpm build:e2e && pnpm exec vite preview --outDir dist-e2e --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
