import { http, HttpResponse, type HttpHandler } from "msw";
import type { EnqueueResponse, Integration, Platform, SyncRun } from "@/api/schemas";
import { db } from "../data/db";
import { API, apiError, scenarioGate } from "../http";
import { hasScenario } from "../scenario";

/** Item da biblioteca: o jogo com o resumo de progresso, sem os grupos/troféus (que vão no detalhe). */
function toGameListItem(game: (typeof db.games)[number]) {
  const { groups: _groups, ...rest } = game;
  return rest;
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
    const q = (url.searchParams.get("q") ?? "").toLowerCase();
    const limit = Number(url.searchParams.get("limit") ?? 50);
    const offset = Number(url.searchParams.get("offset") ?? 0);
    let items = hasScenario("library-empty") ? [] : db.games.map(toGameListItem);
    if (platform) items = items.filter((g) => g.platform === platform);
    if (q) items = items.filter((g) => g.title.toLowerCase().includes(q));
    const total = items.length;
    return HttpResponse.json({ items: items.slice(offset, offset + limit), total, limit, offset });
  }),

  http.get(`${API}/games/:id`, ({ params }) => {
    const game = db.games.find((g) => g.id === params.id);
    if (!game) return apiError(404, "not_found", "Jogo não encontrado.");
    return HttpResponse.json(game);
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

  http.put(`${API}/integrations/steam`, async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { api_key?: string; steam_id_or_vanity?: string };
    if (!body.api_key || !body.steam_id_or_vanity) {
      return apiError(422, "validation_error", "Informe a API key e o SteamID (ou vanity).", [
        ...(body.api_key ? [] : [{ field: "api_key", code: "required" }]),
        ...(body.steam_id_or_vanity ? [] : [{ field: "steam_id_or_vanity", code: "required" }]),
      ]);
    }
    const updated: Integration = {
      platform: "steam",
      status: "connected",
      account_id: /^\d{17}$/.test(body.steam_id_or_vanity) ? body.steam_id_or_vanity : "76561198000000000",
      display_name: /^\d{17}$/.test(body.steam_id_or_vanity) ? "rbonis" : body.steam_id_or_vanity,
      last_synced_at: null,
    };
    db.integrations = [updated, ...db.integrations.filter((i) => i.platform !== "steam")];
    return HttpResponse.json(updated);
  }),

  http.delete(`${API}/integrations/:platform`, ({ params }) => {
    db.integrations = db.integrations.filter((i) => i.platform !== params.platform);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${API}/integrations/:platform/sync`, ({ params }) => {
    const platform = params.platform as Platform;
    const run: SyncRun = {
      id: `run-${Date.now()}`,
      platform,
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
