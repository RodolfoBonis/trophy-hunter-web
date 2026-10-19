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
export default defineConfig(() => {
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
          // config.js é a configuração de RUNTIME (gerada pelo nginx a partir das envs): nunca no
          // precache, senão o navegador fica preso à config do build (ex.: realm antigo do login).
          globIgnores: ["config.js", "mockServiceWorker.js", "silent-callback.*"],
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
    },
    preview: { port: 4173, strictPort: true },
    build: {
      rolldownOptions: {
        output: {
          // Bibliotecas em chunks próprios e estáveis: um deploy que só mexe no app não invalida
          // react/router/zod/oidc no cache do navegador (nem no precache do PWA).
          codeSplitting: {
            groups: [
              { name: "vendor-react", test: /[\\/]node_modules[\\/](react|react-dom|scheduler|react-router)[\\/]/, priority: 30 },
              { name: "vendor-data", test: /[\\/]node_modules[\\/](@tanstack|zod)[\\/]/, priority: 20 },
              { name: "vendor-auth", test: /[\\/]node_modules[\\/](oidc-client-ts|react-oidc-context)[\\/]/, priority: 20 },
            ],
          },
        },
      },
    },
  };
});
