import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

/**
 * Trophy Hunter — PWA (Vite 8 + React 19). Uma imagem serve qualquer ambiente: a configuração de
 * runtime chega por `/config.js` (window.__APP_CONFIG__); em dev caímos nos `VITE_*`.
 *
 * O Service Worker é próprio (`src/sw/service-worker.ts`, estratégia `injectManifest`): precache dos
 * assets + cache de imagens de jogos e stub de push (push real é a Fase 5). Em dev o SW fica
 * desligado (`devOptions.enabled: false`) e no modo mock a gente nem registra — quem controla o
 * cache ali é o MSW.
 */
export default defineConfig(({ mode }) => {
  const isMock = mode === "mock";
  // Em dev (sem nginx) o `/api` precisa de um proxy para a API Go local. No modo mock o MSW
  // intercepta antes, então o proxy não é usado.
  const apiProxyTarget = process.env.VITE_API_PROXY ?? "http://localhost:8080";

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        strategies: "injectManifest",
        srcDir: "src/sw",
        filename: "service-worker.ts",
        registerType: "prompt",
        // Registramos o SW manualmente (src/app/pwa.ts) só fora do modo mock — ver comentário acima.
        injectRegister: null,
        injectManifest: {
          globPatterns: ["**/*.{js,css,html,svg,woff2,png}"],
        },
        manifest: false, // servimos um manifest.webmanifest estático de public/.
        devOptions: { enabled: false },
      }),
    ],
    resolve: {
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
    server: {
      port: 5173,
      strictPort: true,
      proxy: isMock
        ? undefined
        : {
            "/api": {
              target: apiProxyTarget,
              changeOrigin: true,
              // SSE: sem buffer e timeout longo (mesma intenção do nginx em produção).
              configure: (proxy) => {
                proxy.on("proxyReq", (proxyReq) => proxyReq.setHeader("X-Forwarded-Proto", "http"));
              },
            },
          },
    },
    preview: { port: 4173, strictPort: true },
  };
});
