import { http, HttpResponse } from "msw";
import type { CatalogItem, WishlistItem } from "@/api/schemas";
import { API, apiError } from "../http";
import { hasScenario } from "../scenario";

/** Backlog no mock: catálogo fixo das lojas + lista de desejos em memória. */
const CATALOG: CatalogItem[] = [
  { platform: "steam", store_id: "1245620", title: "ELDEN RING", cover: "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/library_600x900.jpg", price_cents: 27450, regular_cents: 27450, cut: 0, owned: true },
  { platform: "steam", store_id: "1145360", title: "Hades", cover: "https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/library_600x900.jpg", price_cents: 2299, regular_cents: 4599, cut: 50, owned: true },
  { platform: "steam", store_id: "504230", title: "Celeste", cover: "https://cdn.cloudflare.steamstatic.com/steam/apps/504230/library_600x900.jpg", price_cents: 1449, regular_cents: 3699, cut: 61, owned: false },
  { platform: "psn", store_id: "UP9000-PPSA01411_00-ASTROBOT", title: "ASTRO BOT", cover: "https://image.api.playstation.com/vulcan/astro.png", price_cents: 24990, regular_cents: 34990, cut: 28, owned: false },
  { platform: "psn", store_id: "UP0006-PPSA08588_00-SPIDERMAN2", title: "Marvel's Spider-Man 2", cover: "https://image.api.playstation.com/vulcan/spidey.png", price_cents: 34990, regular_cents: 34990, cut: 0, owned: false },
];

let wishlist: WishlistItem[] = [];
export function resetBacklog(): void {
  wishlist = [
    {
      id: "w-celeste", platform: "steam", store_id: "504230", title: "Celeste", cover: CATALOG[2]!.cover, target_price_cents: 2000,
      added_at: new Date(Date.now() - 5 * 86_400_000).toISOString(), price_status: "ok", price_cents: 1449, regular_cents: 3699, cut: 61,
      low_cents: 1449, shop: "Nuuvem", url: "https://itad.link/celeste", price_fetched_at: new Date().toISOString(), completionist_h: 39.5, main_h: 8.1,
    },
    {
      id: "w-astro", platform: "psn", store_id: "UP9000-PPSA01411_00-ASTROBOT", title: "ASTRO BOT", cover: CATALOG[3]!.cover, target_price_cents: null,
      added_at: new Date(Date.now() - 2 * 86_400_000).toISOString(), price_status: "ok", price_cents: 24990, regular_cents: 34990, cut: 28,
      low_cents: null, shop: "PlayStation Store", url: "https://store.playstation.com/pt-br/product/UP9000-PPSA01411_00-ASTROBOT", price_fetched_at: new Date().toISOString(), completionist_h: 13.2, main_h: 11.4,
    },
  ];
}
resetBacklog();

export const backlogHandlers = [
  http.get(`${API}/catalog/search`, ({ request }) => {
    const q = (new URL(request.url).searchParams.get("q") ?? "").toLowerCase();
    if (q.length < 2) return apiError(400, "bad_request", "busca com 2 a 100 caracteres");
    const items = CATALOG.filter((i) => i.title.toLowerCase().includes(q) || q === "jogos");
    return HttpResponse.json({ items, unavailable: hasScenario("psstore-down") ? ["psn"] : [] });
  }),
  http.get(`${API}/wishlist`, () => HttpResponse.json({ items: wishlist })),
  http.post(`${API}/wishlist`, async ({ request }) => {
    const b = (await request.json()) as { platform: "steam" | "psn"; store_id: string; title: string; cover: string };
    const c = CATALOG.find((i) => i.platform === b.platform && i.store_id === b.store_id);
    if (!wishlist.some((w) => w.platform === b.platform && w.store_id === b.store_id)) {
      wishlist = [
        {
          id: `w-${b.store_id}`, platform: b.platform, store_id: b.store_id, title: b.title, cover: b.cover, target_price_cents: null,
          added_at: new Date().toISOString(), price_status: c?.price_cents != null ? "ok" : "none", price_cents: c?.price_cents ?? null,
          regular_cents: c?.regular_cents ?? null, cut: c?.cut ?? 0, low_cents: null, shop: b.platform === "psn" ? "PlayStation Store" : "Steam",
          url: "https://store.example/" + b.store_id, price_fetched_at: new Date().toISOString(), completionist_h: null, main_h: null,
        },
        ...wishlist,
      ];
    }
    return HttpResponse.json({ id: `w-${b.store_id}` }, { status: 201 });
  }),
  http.patch(`${API}/wishlist/:id`, async ({ params, request }) => {
    const b = (await request.json()) as { target_price_cents: number | null };
    const it = wishlist.find((w) => w.id === params.id);
    if (!it) return apiError(404, "not_found", "item não encontrado");
    it.target_price_cents = b.target_price_cents;
    return new HttpResponse(null, { status: 204 });
  }),
  http.delete(`${API}/wishlist/:id`, ({ params }) => {
    const before = wishlist.length;
    wishlist = wishlist.filter((w) => w.id !== params.id);
    return wishlist.length === before ? apiError(404, "not_found", "item não encontrado") : new HttpResponse(null, { status: 204 });
  }),
];
