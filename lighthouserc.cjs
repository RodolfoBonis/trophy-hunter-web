/**
 * Lighthouse CI contra o build em modo mock (MSW + sessão fake; nada de rede externa).
 * Celular com throttling simulado (padrão do Lighthouse). CLS barra o CI. LCP e nota ficam como
 * AVISO: no modo mock a tela espera o MSW (~160 KB que não existe em produção) subir antes de
 * renderizar, então o LCP daqui é pior que o real — serve para ver tendência, não como portão.
 * O portão de peso é o `pnpm check:bundle` (determinístico). Ver job "lighthouse" no ci.yaml.
 */
module.exports = {
  ci: {
    collect: {
      startServerCommand: "pnpm exec vite preview --outDir dist-e2e --port 4174 --strictPort",
      startServerReadyPattern: "4174",
      url: ["http://localhost:4174/", "http://localhost:4174/library"],
      numberOfRuns: 3,
      settings: { preset: "perf", chromeFlags: "--no-sandbox", blockedUrlPatterns: ["*steamstatic*", "*playstation*"] },
    },
    assert: {
      assertions: {
        "largest-contentful-paint": ["warn", { maxNumericValue: 2500, aggregationMethod: "median" }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.05, aggregationMethod: "median" }],
        "total-blocking-time": ["warn", { maxNumericValue: 300, aggregationMethod: "median" }],
        "categories:performance": ["warn", { minScore: 0.85, aggregationMethod: "median" }],
      },
    },
    upload: { target: "filesystem", outputDir: "lighthouse-report" },
  },
};
