import { http, HttpResponse, type HttpHandler } from "msw";
import type {
  CrossPlatformGame,
  EnqueueResponse,
  GameAccount,
  Integration,
  SyncRun,
} from "@/api/schemas";
import { db } from "../data/db";
import type { MockGameRow } from "../data/fixtures";
import { API, apiError, scenarioGate } from "../http";
import { hasScenario } from "../scenario";
import { aiHandlers } from "./ai";
import { memberHandlers } from "./members";
import { makeSocialHandlers } from "./social";
import { pushHandlers, unlockHandlers } from "./unlocks";

/* Espelha a API: o mesmo jogo (platform + external_id) em várias contas vira UM item, representado
 * pela conta mais avançada (maior % → mais troféus); accounts lista todas, mais avançada primeiro. */

const gameKey = (g: MockGameRow) => `${g.platform}:${g.external_id}`;

function moreAdvancedFirst(a: MockGameRow, b: MockGameRow): number {
  return (
    b.progress.completion_pct - a.progress.completion_pct ||
    b.progress.earned - a.progress.earned
  );
}

function toAccount(g: MockGameRow): GameAccount {
  const integ = db.integrations.find((i) => i.id === g.integration_id);
  const { by_type: _t, base: _b, dlc: _d, ...summary } = g.progress;
  return {
    integration_id: g.integration_id,
    label: g.account_label,
    display_name: integ?.display_name ?? "",
    game_id: g.id,
    progress: summary,
  };
}

function accountsOf(row: MockGameRow, only?: string | null): GameAccount[] {
  return db.games
    .filter(
      (g) =>
        gameKey(g) === gameKey(row) && (!only || g.integration_id === only),
    )
    .sort(moreAdvancedFirst)
    .map(toAccount);
}

function toCross(g: MockGameRow): CrossPlatformGame {
  return {
    game_id: g.id,
    platform: g.platform,
    external_id: g.external_id,
    title: g.title,
    cover: g.cover ?? "",
    hero: g.hero ?? "",
    earned: g.progress.earned,
    total: g.progress.total,
    completion_pct: g.progress.completion_pct,
    last_unlock_at: lastUnlockOf(g),
  };
}

/** O mesmo jogo na outra plataforma (conta mais avançada), como CrossPlatformSiblings da API. */
function crossOf(row: MockGameRow): CrossPlatformGame[] {
  if (!row.unified_id) return [];
  return bestRows()
    .filter(
      (g) => g.unified_id === row.unified_id && g.platform !== row.platform,
    )
    .map(toCross);
}

/** Cenário `library-many`: 130 jogos sintéticos (testa a rolagem infinita da biblioteca). */
function manyGames(): MockGameRow[] {
  const base = db.games[0]!;
  return Array.from({ length: 130 }, (_, i) => ({
    ...base,
    id: `00000000-0000-0000-0000-${String(i).padStart(12, "0")}`,
    external_id: `9${String(i).padStart(5, "0")}`,
    title: `Jogo ${String(i + 1).padStart(3, "0")}`,
  }));
}

/** Contadores do card (como a API): por tipo e raras ganhas (< 5%). */
function countsOf(row: MockGameRow) {
  const trophies = row.groups.flatMap((g) => g.trophies);
  const tc = (type: string) => ({
    total: trophies.filter((t) => t.type === type).length,
    earned: trophies.filter((t) => t.type === type && t.earned).length,
  });
  return {
    platinum: tc("platinum"),
    gold: tc("gold"),
    silver: tc("silver"),
    bronze: tc("bronze"),
    rarity: (() => {
      const earned = trophies
        .filter((t) => t.earned && t.rarity_pct != null)
        .map((t) => t.rarity_pct!);
      const n = (lo: number, hi: number) =>
        earned.filter((p) => p >= lo && p < hi).length;
      return {
        legendary: n(0, 1),
        epic: n(1, 5),
        rare: n(5, 20),
        uncommon: n(20, 50),
        common: n(50, 101),
      };
    })(),
  };
}

function lastUnlockOf(row: MockGameRow): string | null {
  const dates = row.groups
    .flatMap((g) => g.trophies)
    .map((t) => t.earned_at)
    .filter((d): d is string => Boolean(d));
  return dates.sort().at(-1) ?? row.last_played_at ?? null;
}

function pick(
  obj: Record<string, unknown>,
  keys: string[],
): Record<string, unknown> {
  return Object.fromEntries(
    keys.filter((k) => k in obj).map((k) => [k, obj[k]]),
  );
}

/** Linhas "best" (conta mais avançada por jogo), como a view best_games da API. */
function bestRows(): MockGameRow[] {
  const best = new Map<string, MockGameRow>();
  for (const row of [...db.games].sort(moreAdvancedFirst))
    if (!best.has(gameKey(row))) best.set(gameKey(row), row);
  return [...best.values()];
}

/** Item da biblioteca (GET /games) a partir de uma linha do mock. */
export function toListItem(row: MockGameRow, only?: string | null) {
  const {
    groups: _g,
    integration_id: _i,
    account_label: _l,
    unified_id: _u,
    unify_locked: _k,
    ...rest
  } = row;
  return {
    ...rest,
    cross_platform: crossOf(row).length > 0,
    counts: countsOf(row),
    last_unlock_at: lastUnlockOf(row),
    accounts: accountsOf(row, only),
  };
}

export function mockStats() {
  const rows = bestRows();
  const trophies = rows.flatMap((r) => r.groups.flatMap((g) => g.trophies));
  const by = (type: string) => ({
    total: trophies.filter((t) => t.type === type).length,
    earned: trophies.filter((t) => t.type === type && t.earned).length,
  });
  const done = rows.filter(
    (r) => r.progress.total > 0 && r.progress.earned === r.progress.total,
  );
  const months = [
    "2025-11",
    "2025-12",
    "2026-01",
    "2026-02",
    "2026-03",
    "2026-04",
    "2026-05",
    "2026-06",
    "2026-07",
    "2026-08",
    "2026-09",
    "2026-10",
  ];
  const per = [8, 14, 3, 0, 22, 17, 9, 31, 12, 6, 19, 25];
  let cum = 180;
  return {
    games: {
      total: rows.length,
      completed: done.length,
      almost: rows.filter((r) => r.progress.status === "almost").length,
      in_progress: rows.filter((r) => r.progress.status === "in_progress")
        .length,
      not_started: rows.filter((r) => r.progress.earned === 0).length,
      abandoned: rows.filter((r) => r.abandoned).length,
    },
    trophies: {
      total: rows.reduce((n, r) => n + r.progress.total, 0),
      earned: rows.reduce((n, r) => n + r.progress.earned, 0),
      platinum: by("platinum"),
      gold: by("gold"),
      silver: by("silver"),
      bronze: by("bronze"),
      rarity: { legendary: 2, epic: 9, rare: 26, uncommon: 41, common: 77 },
    },
    rarest: trophies
      .filter((t) => t.earned && t.rarity_pct != null)
      .sort((a, b) => a.rarity_pct! - b.rarity_pct!)
      .slice(0, 6)
      .map((t) => {
        const g = rows.find((r) =>
          r.groups.some((gr) => gr.trophies.includes(t)),
        )!;
        return {
          id: t.id,
          name: t.name,
          type: t.type,
          icon: t.icon ?? "",
          rarity_pct: t.rarity_pct!,
          earned_at: t.earned_at,
          game_id: g.id,
          game_title: g.title,
          platform: g.platform,
        };
      }),
    completions: done.map((r) => ({
      game_id: r.id,
      title: r.title,
      platform: r.platform,
      external_id: r.external_id,
      cover: r.cover ?? "",
      hero: r.hero ?? "",
      total: r.progress.total,
      completed_at: lastUnlockOf(r),
    })),
    evolution: months.map((m, i) => ({
      month: m,
      earned: per[i]!,
      cumulative: (cum += per[i]!),
    })),
  };
}

function mockNext() {
  const rows = bestRows().filter(
    (r) =>
      !r.abandoned &&
      r.progress.earned > 0 &&
      r.progress.earned < r.progress.total,
  );
  const items = rows
    .map((r) => {
      const c = r.progress.completion_pct;
      const remaining = r.progress.total - r.progress.earned;
      const factors = {
        completion: 0.45 * c,
        remaining: 0.25 / (1 + remaining / 8),
        ease: 0.3 * 0.32,
        priority: 0.05 * (r.priority ?? 0),
        urgency: 0,
      };
      return {
        game_id: r.id,
        title: r.title,
        platform: r.platform,
        external_id: r.external_id,
        cover: r.cover ?? "",
        hero: r.hero ?? "",
        earned: r.progress.earned,
        total: r.progress.total,
        remaining,
        completion_pct: c,
        avg_remaining_rarity: 32,
        min_remaining_rarity: 3.2,
        remaining_missable: 1,
        remaining_online: 0,
        priority: r.priority ?? 0,
        last_unlock_at: lastUnlockOf(r),
        score: Object.values(factors).reduce((a, b) => a + b, 0),
        factors,
      };
    })
    .sort((a, b) => b.score - a.score);
  const top = items[0]
    ? db.games.find((g) => g.id === items[0]!.game_id)
    : undefined;
  const today = top
    ? {
        game_id: top.id,
        trophies: top.groups
          .flatMap((g) => g.trophies)
          .filter((t) => !t.earned)
          .slice(0, 3)
          .map((t) => ({
            id: t.id,
            name: t.name,
            description: t.description,
            type: t.type,
            hidden: t.hidden,
            icon: t.icon ?? "",
            icon_locked: t.icon_locked ?? "",
            rarity_pct: t.rarity_pct,
            tags: t.tags ?? [],
          })),
      }
    : null;
  return { items, today };
}

function mockTimeline() {
  return db.games
    .flatMap((g) =>
      g.groups.flatMap((gr) =>
        gr.trophies
          .filter((t) => t.earned && t.earned_at)
          .map((t) => ({
            trophy_id: t.id,
            name: t.name,
            description: t.description,
            type: t.type,
            icon: t.icon ?? "",
            rarity_pct: t.rarity_pct,
            earned_at: t.earned_at,
            game_id: g.id,
            game_title: g.title,
            platform: g.platform,
            external_id: g.external_id,
            cover: g.cover ?? "",
            hero: g.hero ?? "",
            account_label: g.account_label,
            completes_game:
              g.progress.earned === g.progress.total &&
              t.earned_at === lastUnlockOf(g),
          })),
      ),
    )
    .sort((a, b) => (b.earned_at ?? "").localeCompare(a.earned_at ?? ""));
}

function mockAlerts() {
  return db.games.flatMap((g) =>
    g.groups.flatMap((gr) =>
      gr.trophies
        .filter(
          (t) =>
            !t.earned &&
            ((t.tags ?? []).some((x) =>
              ["missable", "online", "difficulty"].includes(x),
            ) ||
              t.server_shutdown_risk),
        )
        .map((t) => ({
          trophy_id: t.id,
          name: t.name,
          type: t.type,
          hidden: t.hidden,
          icon: t.icon ?? "",
          rarity_pct: t.rarity_pct,
          tags: t.tags ?? [],
          server_shutdown_risk: t.server_shutdown_risk ?? false,
          game_id: g.id,
          game_title: g.title,
          platform: g.platform,
        })),
    ),
  );
}

export const handlers: HttpHandler[] = [
  ...memberHandlers,
  ...makeSocialHandlers({ mockStats, toListItem: (row) => toListItem(row) }),
  ...aiHandlers,
  ...unlockHandlers,
  ...pushHandlers,
  /* Busca (paleta): mesma regra da API — conta mais avançada; oculto não obtido não aparece. */
  http.get(`${API}/search`, ({ request }) => {
    const q = (new URL(request.url).searchParams.get("q") ?? "")
      .trim()
      .toLowerCase();
    if (q.length < 2) return HttpResponse.json({ games: [], trophies: [] });
    const best = bestRows();
    const games = best
      .filter((g) => g.title.toLowerCase().includes(q))
      .slice(0, 8)
      .map((g) => ({
        id: g.id,
        title: g.title,
        platform: g.platform,
        external_id: g.external_id,
        cover: g.cover ?? "",
        hero: g.hero ?? "",
        completion_pct: g.progress.completion_pct,
      }));
    const trophies = best
      .flatMap((g) =>
        g.groups.flatMap((gr) => gr.trophies.map((t) => ({ t, g }))),
      )
      .filter(
        ({ t }) => t.name.toLowerCase().includes(q) && (t.earned || !t.hidden),
      )
      .slice(0, 12)
      .map(({ t, g }) => ({
        id: t.id,
        name: t.name,
        type: t.type,
        icon: t.icon ?? "",
        earned: t.earned,
        rarity_pct: t.rarity_pct ?? null,
        game_id: g.id,
        game_title: g.title,
        platform: g.platform,
      }));
    return HttpResponse.json({ games, trophies });
  }),

  /* Biblioteca */
  http.get(`${API}/games`, async ({ request }) => {
    const gate = await scenarioGate("library");
    if (gate) return gate;
    const url = new URL(request.url);
    const platform = url.searchParams.get("platform");
    const only = url.searchParams.get("integration_id");
    const q = (url.searchParams.get("q") ?? "").toLowerCase();
    const limit = Number(url.searchParams.get("limit") ?? 50);
    const offset = Number(url.searchParams.get("offset") ?? 0);

    const rows = hasScenario("library-empty")
      ? []
      : (hasScenario("library-many") ? manyGames() : db.games).filter(
          (g) => !only || g.integration_id === only,
        );
    // Um card por jogo: o unificado (Steam + PSN) ou a chave da plataforma; o filtro de plataforma
    // vale antes de agrupar (mostra a versão daquela plataforma), como na API.
    const best = new Map<string, MockGameRow>();
    for (const row of [...rows]
      .filter((g) => !platform || g.platform === platform)
      .sort(moreAdvancedFirst)) {
      const key = row.unified_id ?? gameKey(row);
      if (!best.has(key)) best.set(key, row);
    }
    let items = [...best.values()].map((row) => toListItem(row, only));
    if (q) items = items.filter((g) => g.title.toLowerCase().includes(q));
    const total = items.length;
    return HttpResponse.json({
      items: items.slice(offset, offset + limit),
      total,
      limit,
      offset,
    });
  }),

  http.get(`${API}/games/:id`, ({ params }) => {
    const game = db.games.find((g) => g.id === params.id);
    if (!game) return apiError(404, "not_found", "Jogo não encontrado.");
    const { unified_id: _u, ...rest } = game;
    return HttpResponse.json({
      ...rest,
      unify_locked: game.unify_locked ?? false,
      accounts: accountsOf(game),
      cross_platform: crossOf(game),
    });
  }),

  /* Unificação cross-platform (vale para todas as contas do jogo e trava a decisão) */
  http.post(`${API}/games/:id/link`, async ({ params, request }) => {
    const a = db.games.find((g) => g.id === params.id);
    const { other_game_id } = (await request.json()) as {
      other_game_id: string;
    };
    const b = db.games.find((g) => g.id === other_game_id);
    if (!a || !b) return apiError(404, "not_found", "Jogo não encontrado.");
    if (a.platform === b.platform)
      return apiError(
        422,
        "validation",
        "Vincule a um jogo de OUTRA plataforma.",
      );
    const target = a.unified_id ?? b.unified_id ?? `u-${a.id}`;
    db.games = db.games.map((g) =>
      gameKey(g) === gameKey(a) || gameKey(g) === gameKey(b)
        ? { ...g, unified_id: target, unify_locked: true }
        : g,
    );
    return new HttpResponse(null, { status: 204 });
  }),
  http.delete(`${API}/games/:id/link`, ({ params }) => {
    const a = db.games.find((g) => g.id === params.id);
    if (!a) return apiError(404, "not_found", "Jogo não encontrado.");
    db.games = db.games.map((g) =>
      gameKey(g) === gameKey(a)
        ? { ...g, unified_id: null, unify_locked: true }
        : g,
    );
    return new HttpResponse(null, { status: 204 });
  }),
  http.get(`${API}/games/:id/link-candidates`, ({ params, request }) => {
    const a = db.games.find((g) => g.id === params.id);
    if (!a) return apiError(404, "not_found", "Jogo não encontrado.");
    const q = (
      new URL(request.url).searchParams.get("q") || a.title
    ).toLowerCase();
    return HttpResponse.json(
      bestRows()
        .filter(
          (g) => g.platform !== a.platform && g.title.toLowerCase().includes(q),
        )
        .slice(0, 10)
        .map(toCross),
    );
  }),

  http.post(`${API}/games/:id/sync`, ({ params }) => {
    const game = db.games.find((g) => g.id === params.id);
    if (!game) return apiError(404, "not_found", "Jogo não encontrado.");
    const body: EnqueueResponse = {
      enqueued: true,
      job_id: `job-${Date.now()}`,
    };
    return HttpResponse.json(body, { status: 202 });
  }),

  /* Integrações */
  http.get(`${API}/integrations`, async () => {
    const gate = await scenarioGate("integrations");
    if (gate) return gate;
    const integrations = hasScenario("integrations-needs-reconnect")
      ? db.integrations.map((i) =>
          i.platform === "psn"
            ? { ...i, status: "needs_reconnect" as const }
            : i,
        )
      : db.integrations;
    return HttpResponse.json(integrations);
  }),

  http.post(`${API}/integrations/steam`, async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      label?: string;
      api_key?: string;
      steam_id_or_vanity?: string;
    };
    // Sem api_key → key do servidor (mesma regra da API): só o perfil é obrigatório.
    if (!body.steam_id_or_vanity) {
      return apiError(422, "validation_error", "Informe o SteamID (ou vanity).", [
        { field: "steam_id_or_vanity", code: "required" },
      ]);
    }
    const accountId = /^\d{17}$/.test(body.steam_id_or_vanity)
      ? body.steam_id_or_vanity
      : `vanity:${body.steam_id_or_vanity}`;
    if (
      db.integrations.some(
        (i) => i.platform === "steam" && i.account_id === accountId,
      )
    ) {
      return apiError(409, "conflict", "Essa conta Steam já está conectada.");
    }
    const created: Integration = {
      id: crypto.randomUUID(),
      label: body.label?.trim() || body.steam_id_or_vanity,
      platform: "steam",
      status: "connected",
      account_id: accountId,
      display_name: body.steam_id_or_vanity,
      last_synced_at: null,
    };
    db.integrations = [...db.integrations, created];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.post(`${API}/integrations/psn`, async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      label?: string;
      npsso?: string;
    };
    if (!body.npsso || body.npsso === "BAD") {
      return apiError(422, "validation_error", "NPSSO inválido ou expirado.", [
        { field: "npsso", code: "invalid" },
      ]);
    }
    const created: Integration = {
      id: crypto.randomUUID(),
      label: body.label?.trim() || "psn_mock",
      platform: "psn",
      status: "connected",
      account_id: `acc-${Date.now()}`,
      display_name: "psn_mock",
      last_synced_at: null,
    };
    db.integrations = [...db.integrations, created];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.post(
    `${API}/integrations/:id/reconnect`,
    async ({ params, request }) => {
      const body = (await request.json().catch(() => ({}))) as {
        npsso?: string;
      };
      const integ = db.integrations.find((i) => i.id === params.id);
      if (!integ)
        return apiError(404, "not_found", "Integração não encontrada.");
      if (!body.npsso || body.npsso === "BAD") {
        return apiError(
          422,
          "validation_error",
          "NPSSO inválido ou expirado.",
          [{ field: "npsso", code: "invalid" }],
        );
      }
      integ.status = "connected";
      integ.last_error = "";
      return HttpResponse.json(integ);
    },
  ),

  http.patch(`${API}/integrations/:id`, async ({ params, request }) => {
    const body = (await request.json().catch(() => ({}))) as { label?: string };
    const integ = db.integrations.find((i) => i.id === params.id);
    if (!integ) return apiError(404, "not_found", "Integração não encontrada.");
    if (body.label !== undefined) {
      if (!body.label.trim())
        return apiError(422, "validation_error", "Apelido inválido.", [
          { field: "label", code: "invalid" },
        ]);
      integ.label = body.label.trim();
      db.games = db.games.map((g) =>
        g.integration_id === integ.id
          ? { ...g, account_label: integ.label }
          : g,
      );
    }
    return HttpResponse.json(integ);
  }),

  http.delete(`${API}/integrations/:id`, ({ params }) => {
    db.integrations = db.integrations.filter((i) => i.id !== params.id);
    db.games = db.games.filter((g) => g.integration_id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${API}/integrations/:id/sync`, ({ params }) => {
    const integ = db.integrations.find((i) => i.id === params.id);
    if (!integ) return apiError(404, "not_found", "Integração não encontrada.");
    const run: SyncRun = {
      id: `run-${Date.now()}`,
      integration_id: integ.id,
      platform: integ.platform,
      scope: "incremental",
      trigger: "manual",
      status: "running",
      started_at: new Date().toISOString(),
      finished_at: null,
    };
    db.syncRuns = [run, ...db.syncRuns];
    const body: EnqueueResponse = {
      enqueued: true,
      job_id: `job-${Date.now()}`,
    };
    return HttpResponse.json(body, { status: 202 });
  }),

  /* Insights */
  http.get(`${API}/stats`, async () => {
    const gate = await scenarioGate("dashboard");
    if (gate) return gate;
    return HttpResponse.json(mockStats());
  }),
  http.get(`${API}/next`, () => HttpResponse.json(mockNext())),
  http.get(`${API}/timeline`, ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? 60);
    const cursor = url.searchParams.get("cursor");
    const all = mockTimeline();
    const start = cursor ? Number(cursor) : 0;
    const items = all.slice(start, start + limit);
    const next = start + limit < all.length ? String(start + limit) : null;
    return HttpResponse.json({ items, next_cursor: next });
  }),
  http.get(`${API}/alerts`, () => HttpResponse.json(mockAlerts())),
  http.patch(`${API}/games/:id`, async ({ params, request }) => {
    const body = (await request.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    const game = db.games.find((g) => g.id === params.id);
    if (!game) return apiError(404, "not_found", "Jogo não encontrado.");
    Object.assign(game, pick(body, ["abandoned", "priority", "notes", "tags"]));
    const {
      groups: _g,
      integration_id: _i,
      account_label: _l,
      progress: _p,
      ...rest
    } = game;
    return HttpResponse.json(rest);
  }),
  http.patch(`${API}/trophies/:id`, async ({ params, request }) => {
    const body = (await request.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    const trophy = db.games
      .flatMap((g) => g.groups.flatMap((gr) => gr.trophies))
      .find((t) => t.id === params.id);
    if (!trophy) return apiError(404, "not_found", "Troféu não encontrado.");
    Object.assign(
      trophy,
      pick(body, ["priority", "notes", "tags", "server_shutdown_risk"]),
    );
    return HttpResponse.json(trophy);
  }),

  /* Log de sync */
  http.get(`${API}/sync-runs`, async () => {
    const gate = await scenarioGate("sync");
    if (gate) return gate;
    return HttpResponse.json(db.syncRuns);
  }),
];
