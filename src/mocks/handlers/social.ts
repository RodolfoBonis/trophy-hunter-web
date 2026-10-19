import { http, HttpResponse } from "msw";
import type { FeedItem, GameFriend, LeaderboardItem, SocialUser } from "@/api/schemas";
import { db } from "../data/db";
import { API, ago, apiError, DAY, HOUR } from "../http";
import { hasScenario } from "../scenario";
import type { MockGameRow } from "../data/fixtures";

/**
 * Social (opt-in, recíproco) no modo mock. Começa DESLIGADO como na API; cenário `sharing` já começa
 * ligado. Dois amigos fixos (Ana e Bruno) compartilham.
 */
let sharing: boolean | null = null;

export function isSharing(): boolean {
  return sharing ?? hasScenario("sharing");
}

export function resetSocial(): void {
  sharing = null;
}

const ME: SocialUser = { id: "00000000-0000-0000-0000-000000000001", name: "Rodolfo de Bonis", is_me: true };
const ANA: SocialUser = { id: "aaaaaaaa-0000-0000-0000-000000000001", name: "Ana Souza", is_me: false };
const BRUNO: SocialUser = { id: "bbbbbbbb-0000-0000-0000-000000000002", name: "Bruno Lima", is_me: false };
const FRIENDS = [ANA, BRUNO];

const denied = () =>
  isSharing() ? undefined : apiError(403, "sharing_disabled", "ligue \"compartilhar meu progresso\" para ver o progresso dos amigos");

function leaderboard(period: string): LeaderboardItem[] {
  const f = period === "month" ? 0.15 : period === "year" ? 0.6 : 1;
  const rows: LeaderboardItem[] = [
    { user: ANA, platinum: Math.round(14 * f), earned: Math.round(1890 * f), rare: Math.round(61 * f), psn_points: Math.round(31200 * f), completed: Math.round(19 * f), last_unlock_at: ago(3 * HOUR) },
    { user: ME, platinum: Math.round(9 * f), earned: Math.round(1530 * f), rare: Math.round(44 * f), psn_points: Math.round(20100 * f), completed: Math.round(12 * f), last_unlock_at: ago(DAY) },
    { user: BRUNO, platinum: Math.round(4 * f), earned: Math.round(980 * f), rare: Math.round(20 * f), psn_points: Math.round(8900 * f), completed: Math.round(6 * f), last_unlock_at: ago(5 * DAY) },
  ];
  return rows.sort((a, b) => b.platinum - a.platinum || b.completed - a.completed || b.earned - a.earned);
}

const FEED: FeedItem[] = [
  { user: ANA, kind: "platinum", trophy_id: "f-1", name: "Senhor das Cinzas", description: "Obtenha todos os troféus", type: "platinum", hidden: false, icon: "", rarity_pct: 4.1, earned_at: ago(3 * HOUR), game_title: "ELDEN RING", platform: "psn", external_id: "NPWR22810_00", cover: "", hero: "", completes_game: true },
  { user: BRUNO, kind: "rare", trophy_id: "f-2", name: "Final secreto", description: null, type: "gold", hidden: true, icon: "", rarity_pct: 2.3, earned_at: ago(9 * HOUR), game_title: "God of War Ragnarök", platform: "psn", external_id: "NPWR21528_00", cover: "", hero: "", completes_game: false },
  { user: ME, kind: "completion", trophy_id: "f-3", name: "Escapou do Submundo", description: "Escape do Submundo", type: "achievement", hidden: false, icon: "", rarity_pct: 12.4, earned_at: ago(DAY), game_title: "Hades", platform: "steam", external_id: "1145360", cover: "", hero: "", completes_game: true },
  { user: ANA, kind: "rare", trophy_id: "f-4", name: "Sem dano", description: "Derrote Malenia sem tomar dano", type: "achievement", hidden: false, icon: "", rarity_pct: 0.6, earned_at: ago(3 * DAY), game_title: "ELDEN RING", platform: "steam", external_id: "1245620", cover: "", hero: "", completes_game: false },
];

function gameFriends(gameId: string): GameFriend[] {
  const game = db.games.find((g) => g.id === gameId);
  if (!game) return [];
  return [
    { user: ANA, platform: game.platform, earned: game.progress.total, total: game.progress.total, completion_pct: 1, has_platinum: game.platform === "psn", last_unlock_at: ago(3 * HOUR) },
    { user: BRUNO, platform: "psn", earned: Math.round(game.progress.total * 0.4), total: game.progress.total, completion_pct: 0.4, has_platinum: false, last_unlock_at: ago(6 * DAY) },
  ];
}

/** Dependências do index.ts (injetadas para não criar import circular). */
interface SocialDeps {
  mockStats: () => unknown;
  toListItem: (row: MockGameRow) => unknown;
}

export const makeSocialHandlers = ({ mockStats, toListItem }: SocialDeps) => [
  http.put(`${API}/me/sharing`, async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { share_progress?: boolean };
    if (typeof body.share_progress !== "boolean") return apiError(400, "bad_request", "informe share_progress");
    sharing = body.share_progress;
    return HttpResponse.json({ ...ME, subject: "mock-user", email: "rodolfo@rb.lab", role: "owner", status: "active", share_progress: sharing });
  }),
  http.get(`${API}/social/leaderboard`, ({ request }) => {
    const period = new URL(request.url).searchParams.get("period") ?? "all";
    return denied() ?? HttpResponse.json({ period, items: leaderboard(period) });
  }),
  http.get(`${API}/social/feed`, () => denied() ?? HttpResponse.json({ items: FEED, next_cursor: null })),
  http.get(`${API}/social/friends/:id`, ({ params }) => {
    const d = denied();
    if (d) return d;
    const f = FRIENDS.find((x) => x.id === params.id);
    if (!f) return apiError(404, "not_found", "Not found");
    return HttpResponse.json({ user: f, stats: mockStats() });
  }),
  http.get(`${API}/social/friends/:id/games`, ({ params }) => {
    const d = denied();
    if (d) return d;
    if (!FRIENDS.some((x) => x.id === params.id)) return apiError(404, "not_found", "Not found");
    const items = db.games.slice(0, 4).map((row) => toListItem(row));
    return HttpResponse.json({ items, total: items.length, limit: 50, offset: 0 });
  }),
  http.get(`${API}/games/:id/friends`, ({ params }) =>
    HttpResponse.json({ sharing: isSharing(), items: isSharing() ? gameFriends(String(params.id)) : [] }),
  ),
];
