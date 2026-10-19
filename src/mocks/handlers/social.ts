import { http, HttpResponse } from "msw";
import type { ChallengeDetail, ChallengeStanding, CompareTrophy, FeedItem, GameFriend, LeaderboardItem, SocialUser } from "@/api/schemas";
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
  challenges = seedChallenges();
}

const ME: SocialUser = { id: "00000000-0000-0000-0000-000000000001", name: "Rodolfo de Bonis", is_me: true };
const ANA: SocialUser = { id: "aaaaaaaa-0000-0000-0000-000000000001", name: "Ana Souza", is_me: false };
const BRUNO: SocialUser = { id: "bbbbbbbb-0000-0000-0000-000000000002", name: "Bruno Lima", is_me: false };
const FRIENDS = [ANA, BRUNO];

/* ── Desafios ─────────────────────────────────────────────────────────────────────────── */

function standing(user: SocialUser, state: ChallengeStanding["state"], extra: Partial<ChallengeStanding> = {}): ChallengeStanding {
  return { user, state, score: 0, has_game: true, earned: 20, total: 42, completion_pct: 20 / 42, completed_at: null, ...extra };
}

function seedChallenges(): ChallengeDetail[] {
  return [
    {
      id: "c-1",
      kind: "first_to_complete",
      title: "Quem pega os 100% de ELDEN RING primeiro",
      status: "open",
      starts_at: ago(3 * DAY),
      ends_at: null,
      my_state: "accepted",
      is_creator: true,
      accepted_count: 2,
      winner_name: null,
      game: { title: "ELDEN RING", platform: "steam", external_id: "1245620", cover: "" },
      finished_at: null,
      winner: null,
      standings: [
        standing(ANA, "accepted", { earned: 35, completion_pct: 35 / 42 }),
        standing(ME, "accepted", { earned: 28, completion_pct: 28 / 42 }),
      ],
    },
    {
      id: "c-2",
      kind: "most_rare",
      title: "Mais troféus raros em 14 dias",
      status: "open",
      starts_at: ago(DAY),
      ends_at: new Date(Date.now() + 13 * DAY).toISOString(),
      my_state: "invited",
      is_creator: false,
      accepted_count: 1,
      winner_name: null,
      game: null,
      finished_at: null,
      winner: null,
      standings: [standing(BRUNO, "accepted", { score: 3, has_game: false }), standing(ME, "invited", { has_game: false })],
    },
  ];
}

let challenges: ChallengeDetail[] = seedChallenges();

const summary = (c: ChallengeDetail) => {
  const { finished_at: _f, winner: _w, standings: _s, ...rest } = c;
  return rest;
};

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
  http.get(`${API}/social/challenges`, () => denied() ?? HttpResponse.json(challenges.map(summary))),
  http.get(`${API}/social/challenges/:id`, ({ params }) => {
    const d = denied();
    if (d) return d;
    const c = challenges.find((x) => x.id === params.id);
    return c ? HttpResponse.json(c) : apiError(404, "not_found", "desafio não encontrado");
  }),
  http.post(`${API}/social/challenges`, async ({ request }) => {
    const d = denied();
    if (d) return d;
    const body = (await request.json()) as { kind: ChallengeDetail["kind"]; friend_ids: string[]; game_id?: string; days?: number };
    if (!body.friend_ids?.length) return apiError(400, "bad_request", "convide de 1 a 5 amigos");
    const game = body.game_id ? db.games.find((g) => g.id === body.game_id) : undefined;
    if (body.kind === "first_to_complete" && !game) return apiError(400, "bad_request", "escolha o jogo do desafio");
    const days = body.days || (body.kind === "first_to_complete" ? 0 : 7);
    const friends = FRIENDS.filter((f) => body.friend_ids.includes(f.id));
    const c: ChallengeDetail = {
      id: `c-${challenges.length + 1}-${Date.now()}`,
      kind: body.kind,
      title:
        body.kind === "first_to_complete"
          ? `Quem pega ${game!.platform === "psn" ? "a platina" : "os 100%"} de ${game!.title} primeiro`
          : `Mais ${body.kind === "most_rare" ? "troféus raros" : "troféus"} em ${days} dias`,
      status: "open",
      starts_at: new Date().toISOString(),
      ends_at: days ? new Date(Date.now() + days * DAY).toISOString() : null,
      my_state: "accepted",
      is_creator: true,
      accepted_count: 1,
      winner_name: null,
      game: game ? { title: game.title, platform: game.platform, external_id: game.external_id, cover: game.cover ?? "" } : null,
      finished_at: null,
      winner: null,
      standings: [standing(ME, "accepted"), ...friends.map((f) => standing(f, "invited"))],
    };
    challenges = [c, ...challenges];
    return HttpResponse.json(c, { status: 201 });
  }),
  http.post(`${API}/social/challenges/:id/:action`, ({ params }) => {
    const c = challenges.find((x) => x.id === params.id);
    if (!c) return apiError(404, "not_found", "desafio não encontrado");
    const action = String(params.action);
    if (action === "cancel") {
      if (!c.is_creator) return apiError(409, "conflict", "só quem criou cancela");
      c.status = "canceled";
    } else {
      if (c.my_state !== "invited") return apiError(409, "conflict", "esse convite não está mais pendente");
      c.my_state = action === "accept" ? "accepted" : "declined";
      for (const st of c.standings) if (st.user.is_me) st.state = c.my_state;
    }
    return HttpResponse.json(c);
  }),
  http.get(`${API}/games/:id/compare/:friendId`, ({ params }) => {
    const d = denied();
    if (d) return d;
    const game = db.games.find((g) => g.id === params.id);
    const friend = FRIENDS.find((f) => f.id === params.friendId);
    if (!game || !friend) return apiError(404, "not_found", "esse amigo não tem este jogo");
    const trophies: CompareTrophy[] = game.groups
      .flatMap((g) => g.trophies)
      .map((t, i) => ({
        trophy_id: t.id,
        name: t.name,
        description: t.hidden && !t.earned ? null : (t.description ?? null),
        type: t.type,
        hidden: t.hidden,
        icon: t.icon ?? "",
        rarity_pct: t.rarity_pct ?? null,
        mine: t.earned,
        mine_earned_at: t.earned_at ?? null,
        friend: i % 3 !== 2,
        friend_earned_at: i % 3 !== 2 ? ago((i + 1) * DAY) : null,
        matched: true,
      }));
    const fe = trophies.filter((t) => t.friend).length;
    return HttpResponse.json({
      friend,
      same_platform: true,
      friend_platform: game.platform,
      friend_earned: fe,
      friend_total: trophies.length,
      friend_completion_pct: trophies.length ? fe / trophies.length : 0,
      trophies,
    });
  }),
  http.get(`${API}/games/:id/friends`, ({ params }) =>
    HttpResponse.json({ sharing: isSharing(), items: isSharing() ? gameFriends(String(params.id)) : [] }),
  ),
];
