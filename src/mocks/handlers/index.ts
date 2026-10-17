import { http, HttpResponse, type HttpHandler } from "msw";
import type { EnqueueResponse, GameAccount, Integration, SyncRun } from "@/api/schemas";
import { db } from "../data/db";
import type { MockGameRow } from "../data/fixtures";
import { API, apiError, scenarioGate } from "../http";
import { hasScenario } from "../scenario";

/* Espelha a API: o mesmo jogo (platform + external_id) em várias contas vira UM item, representado
 * pela conta mais avançada (maior % → mais troféus); accounts lista todas, mais avançada primeiro. */

const gameKey = (g: MockGameRow) => `${g.platform}:${g.external_id}`;

function moreAdvancedFirst(a: MockGameRow, b: MockGameRow): number {
  return b.progress.completion_pct - a.progress.completion_pct || b.progress.earned - a.progress.earned;
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
    .filter((g) => gameKey(g) === gameKey(row) && (!only || g.integration_id === only))
    .sort(moreAdvancedFirst)
    .map(toAccount);
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
      const earned = trophies.filter((t) => t.earned && t.rarity_pct != null).map((t) => t.rarity_pct!);
      const n = (lo: number, hi: number) => earned.filter((p) => p >= lo && p < hi).length;
      return { legendary: n(0, 1), epic: n(1, 5), rare: n(5, 20), uncommon: n(20, 50), common: n(50, 101) };
    })(),
  };
}

function lastUnlockOf(row: MockGameRow): string | null {
  const dates = row.groups.flatMap((g) => g.trophies).map((t) => t.earned_at).filter((d): d is string => Boolean(d));
  return dates.sort().at(-1) ?? row.last_played_at ?? null;
}

export const handlers: HttpHandler[] = [
  /* Perfil */
  http.get(`${API}/me`, () => HttpResponse.json({ subject: "mock-user", name: "Rodolfo de Bonis", email: "rodolfo@rb.lab" })),

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
      : (hasScenario("library-many") ? manyGames() : db.games).filter((g) => !only || g.integration_id === only);
    const best = new Map<string, MockGameRow>();
    for (const row of [...rows].sort(moreAdvancedFirst)) {
      if (!best.has(gameKey(row))) best.set(gameKey(row), row);
    }
    let items = [...best.values()].map((row) => {
      const { groups: _g, integration_id: _i, account_label: _l, ...rest } = row;
      return {
        ...rest,
        counts: countsOf(row),
        last_unlock_at: lastUnlockOf(row),
        accounts: accountsOf(row, only),
      };
    });
    if (platform) items = items.filter((g) => g.platform === platform);
    if (q) items = items.filter((g) => g.title.toLowerCase().includes(q));
    const total = items.length;
    return HttpResponse.json({ items: items.slice(offset, offset + limit), total, limit, offset });
  }),

  http.get(`${API}/games/:id`, ({ params }) => {
    const game = db.games.find((g) => g.id === params.id);
    if (!game) return apiError(404, "not_found", "Jogo não encontrado.");
    return HttpResponse.json({ ...game, accounts: accountsOf(game) });
  }),

  http.post(`${API}/games/:id/sync`, ({ params }) => {
    const game = db.games.find((g) => g.id === params.id);
    if (!game) return apiError(404, "not_found", "Jogo não encontrado.");
    const body: EnqueueResponse = { enqueued: true, job_id: `job-${Date.now()}` };
    return HttpResponse.json(body, { status: 202 });
  }),

  /* Integrações */
  http.get(`${API}/integrations`, async () => {
    const gate = await scenarioGate("integrations");
    if (gate) return gate;
    const integrations = hasScenario("integrations-needs-reconnect")
      ? db.integrations.map((i) => (i.platform === "psn" ? { ...i, status: "needs_reconnect" as const } : i))
      : db.integrations;
    return HttpResponse.json(integrations);
  }),

  http.post(`${API}/integrations/steam`, async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      label?: string;
      api_key?: string;
      steam_id_or_vanity?: string;
    };
    const hasSteam = db.integrations.some((i) => i.platform === "steam");
    if (!body.steam_id_or_vanity || (!body.api_key && !hasSteam)) {
      return apiError(422, "validation_error", "Informe o SteamID (ou vanity) e, na 1ª conta, a API key.", [
        ...(body.steam_id_or_vanity ? [] : [{ field: "steam_id_or_vanity", code: "required" }]),
        ...(body.api_key || hasSteam ? [] : [{ field: "api_key", code: "required" }]),
      ]);
    }
    const accountId = /^\d{17}$/.test(body.steam_id_or_vanity) ? body.steam_id_or_vanity : `vanity:${body.steam_id_or_vanity}`;
    if (db.integrations.some((i) => i.platform === "steam" && i.account_id === accountId)) {
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

  http.patch(`${API}/integrations/:id`, async ({ params, request }) => {
    const body = (await request.json().catch(() => ({}))) as { label?: string };
    const integ = db.integrations.find((i) => i.id === params.id);
    if (!integ) return apiError(404, "not_found", "Integração não encontrada.");
    if (body.label !== undefined) {
      if (!body.label.trim()) return apiError(422, "validation_error", "Apelido inválido.", [{ field: "label", code: "invalid" }]);
      integ.label = body.label.trim();
      db.games = db.games.map((g) => (g.integration_id === integ.id ? { ...g, account_label: integ.label } : g));
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
    const body: EnqueueResponse = { enqueued: true, job_id: `job-${Date.now()}` };
    return HttpResponse.json(body, { status: 202 });
  }),

  /* Log de sync */
  http.get(`${API}/sync-runs`, async () => {
    const gate = await scenarioGate("sync");
    if (gate) return gate;
    return HttpResponse.json(db.syncRuns);
  }),
];
