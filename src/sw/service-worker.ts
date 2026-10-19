/// <reference lib="webworker" />
import { cacheNames, clientsClaim } from "workbox-core";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst, NetworkOnly } from "workbox-strategies";

/**
 * Service Worker do Trophy Hunter (estratégia `injectManifest` do vite-plugin-pwa).
 * - precache dos assets do build (`self.__WB_MANIFEST`);
 * - CacheFirst para capas/ícones de jogos (hosts da Steam/PSN) com expiração ~30 dias;
 * - NetworkOnly para a API (paths .../v1/..., ex. api.rodolfodebonis.com.br/trophy/v1) e SSE — nunca cacheamos dados mutáveis;
 * - Web Push: `push` mostra a notificação enviada pelo worker da API ({ title, body, url, tag, kind });
 *   `notificationclick` foca uma aba aberta (navegando para a url) ou abre uma nova.
 */

// `self` é Window+WebWorker com as duas libs ligadas; reduzimos ao tipo de SW aqui.
const sw = self as unknown as ServiceWorkerGlobalScope;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
precacheAndRoute((self as any).__WB_MANIFEST ?? []);
cleanupOutdatedCaches();
clientsClaim();

// Configuração de runtime: sempre da rede (o nginx serve com no-store).
registerRoute(
  ({ url }) => url.origin === sw.location.origin && (url.pathname === "/config.js" || url.pathname.startsWith("/silent-callback.")),
  new NetworkOnly(),
);

// A API nunca é cacheada (inclui SSE). Deixa passar direto para a rede. Ela vive em outra origem
// (rota do gateway, ex. api.rodolfodebonis.com.br/trophy/v1/...) ou em /api/v1 no dev local.
registerRoute(({ url }) => /\/(api\/)?v1\//.test(url.pathname), new NetworkOnly());

// Imagens de jogos (capas, ícones de conquistas, avatares) dos CDNs da Steam/PSN. Mantenha em sincronia
// com CSP_IMAGE_HOSTS (docker/05-app-config.envsh): o fetch() do SW obedece ao connect-src da CSP.
const IMAGE_HOSTS = /(\.steamstatic\.com|\.steampowered\.com|\.akamaihd\.net|\.playstation\.net|\.playstation\.com)$/;
registerRoute(
  ({ url, request }) => request.destination === "image" && IMAGE_HOSTS.test(url.hostname),
  new CacheFirst({
    cacheName: `${cacheNames.prefix}-game-images`,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 500, maxAgeSeconds: 30 * 24 * 60 * 60, purgeOnQuotaError: true }),
    ],
  }),
);

// Permite que o app peça para pular a espera na atualização (ver src/app/pwa.ts).
sw.addEventListener("message", (event) => {
  if ((event.data as { type?: string } | undefined)?.type === "SKIP_WAITING") void sw.skipWaiting();
});

/* ── Web Push ──────────────────────────────────────────────────────────────────────────────── */

sw.addEventListener("push", (event) => {
  // Payload da API (internal/push.Message): { title, body, url, tag, kind }.
  let data: { title?: string; body?: string; url?: string; tag?: string } = {};
  try {
    data = event.data?.json() ?? {};
  } catch {
    data = { body: event.data?.text() };
  }
  const title = data.title ?? "Trophy Hunter";
  event.waitUntil(
    sw.registration.showNotification(title, {
      body: data.body ?? "Novidade por aqui.",
      tag: data.tag,
      // PNG: SVG não aparece como ícone de notificação no Android/macOS.
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: data.url ?? "/" },
    }),
  );
});

sw.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data as { url?: string } | undefined)?.url ?? "/";
  event.waitUntil(
    sw.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          void client.focus();
          if ("navigate" in client) void (client as WindowClient).navigate(url);
          return;
        }
      }
      return sw.clients.openWindow(url);
    }),
  );
});
