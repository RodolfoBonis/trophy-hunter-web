import { http, HttpResponse } from "msw";
import type { UnlockEvent } from "@/api/schemas";
import { API } from "../http";
import { hasScenario } from "../scenario";

/* Avisos de troféu no mock: vazio por padrão (não atrapalha as outras telas/testes). Cenário
 * `unlocks` = 2 troféus + uma platina; `unlocks-many` = 6 troféus (vira aviso agrupado). */

const base = {
  detected_at: new Date().toISOString(),
  earned_at: new Date().toISOString(),
  icon: "",
  description: null,
  hero: "",
};

const GOW = {
  game_id: "22222222-2222-2222-2222-222222222222",
  game_title: "God of War Ragnarök",
  platform: "psn" as const,
  external_id: "NPWR21234_00",
  cover: "",
};
const ELDEN = {
  game_id: "11111111-1111-1111-1111-111111111111",
  game_title: "ELDEN RING",
  platform: "steam" as const,
  external_id: "1245620",
  cover:
    "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/library_600x900.jpg",
};

function events(): UnlockEvent[] {
  if (hasScenario("unlocks-many")) {
    return Array.from({ length: 6 }, (_, i) => ({
      ...base,
      ...ELDEN,
      id: `ev-m${i}`,
      trophy_id: `t-m${i}`,
      name: `Conquista ${i + 1}`,
      type: "achievement",
      rarity_pct: 30,
      completes_game: false,
    }));
  }
  if (!hasScenario("unlocks")) return [];
  return [
    {
      ...base,
      ...ELDEN,
      id: "ev-1",
      trophy_id: "t-e1",
      name: "Mestre das Grandes Runas",
      type: "achievement",
      rarity_pct: 3.4,
      completes_game: false,
    },
    {
      ...base,
      ...GOW,
      id: "ev-2",
      trophy_id: "t-g1",
      name: "Senhor da Guerra",
      type: "gold",
      rarity_pct: 18.2,
      completes_game: false,
    },
    {
      ...base,
      ...GOW,
      id: "ev-3",
      trophy_id: "t-g2",
      name: "Pai e filho",
      type: "platinum",
      rarity_pct: 6.1,
      completes_game: true,
    },
  ];
}

let seen = new Set<string>();

/** Zera os vistos entre testes (chamado no reset do mock). */
export function resetUnlocks(): void {
  seen = new Set();
}

export const unlockHandlers = [
  http.get(`${API}/events/unseen`, () =>
    HttpResponse.json(events().filter((e) => !seen.has(e.id))),
  ),
  http.post(`${API}/events/seen`, async ({ request }) => {
    const { ids } = (await request.json()) as { ids: string[] };
    ids.forEach((id) => seen.add(id));
    return new HttpResponse(null, { status: 204 });
  }),
];

/* Web push no mock: servidor "configurado", inscrições em memória. */
let subs = new Set<string>();
let prefs = {
  unlocks: true,
  completions: true,
  reconnect: true,
  ai_ready: true,
  challenges: true,
};

export function resetPush(): void {
  subs = new Set();
  prefs = {
    unlocks: true,
    completions: true,
    reconnect: true,
    ai_ready: true,
    challenges: true,
  };
}

export const pushHandlers = [
  http.get(`${API}/push/key`, () =>
    HttpResponse.json({
      enabled: !hasScenario("push-off"),
      public_key: "BFakeKey_-",
      subscriptions: subs.size,
    }),
  ),
  http.post(`${API}/push/subscriptions`, async ({ request }) => {
    const { endpoint } = (await request.json()) as { endpoint: string };
    subs.add(endpoint);
    return new HttpResponse(null, { status: 201 });
  }),
  http.delete(`${API}/push/subscriptions`, async ({ request }) => {
    const { endpoint } = (await request.json()) as { endpoint: string };
    subs.delete(endpoint);
    return new HttpResponse(null, { status: 204 });
  }),
  http.post(`${API}/push/test`, () =>
    HttpResponse.json({ sent: subs.size, failed: 0, removed: 0 }),
  ),
  http.get(`${API}/notifications/preferences`, () => HttpResponse.json(prefs)),
  http.put(`${API}/notifications/preferences`, async ({ request }) => {
    prefs = (await request.json()) as typeof prefs;
    return HttpResponse.json(prefs);
  }),
];
