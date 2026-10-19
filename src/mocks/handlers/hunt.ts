import { http, HttpResponse } from "msw";
import type { Hunt, RoadmapContent } from "@/api/schemas";
import { db } from "../data/db";
import { API, apiError } from "../http";

/** Modo caçada no mock: mesmo casamento por nome da API (simplificado) sobre o roadmap mock. */
const done = new Map<string, Set<number>>();
let syncingUntil = 0;

export function resetHunt(): void {
  done.clear();
  syncingUntil = 0;
}

const norm = (s: string) =>
  s.normalize("NFD").replace(/\p{Mn}/gu, "").toLowerCase().replace(/\(.*\)$/, "").replace(/[^a-z0-9]+/g, " ").trim();

function hunt(gameId: string): Hunt | null {
  const game = db.games.find((g) => g.id === gameId);
  if (!game) return null;
  const guide = db.aiGuides[`roadmap:${gameId}`];
  const base: Hunt = { roadmap: "none", syncing: Date.now() < syncingUntil, missables_overview: [], stages: [] };
  if (!guide) return base;
  if (guide.status !== "ready" || !guide.content) return { ...base, roadmap: guide.status };
  const rm = (guide.edited_content ?? guide.content) as RoadmapContent;
  const trophies = game.groups.flatMap((g) => g.trophies);
  const marks = done.get(gameId) ?? new Set<number>();
  return {
    ...base,
    roadmap: "ready",
    missables_overview: rm.missables_overview,
    stages: rm.stages.map((s, index) => {
      const ids: string[] = [];
      const unmatched: string[] = [];
      for (const name of s.trophies) {
        const t = trophies.find((x) => norm(x.name) === norm(name));
        if (t) ids.push(t.id);
        else unmatched.push(name);
      }
      const earned = trophies.filter((t) => ids.includes(t.id) && t.earned).length;
      return {
        index, title: s.title, description: s.description, missables: s.missables,
        trophy_ids: ids, unmatched, earned, done: marks.has(index), complete: ids.length > 0 && earned === ids.length,
      };
    }),
  };
}

export const huntHandlers = [
  http.get(`${API}/games/:id/hunt`, ({ params }) => {
    const h = hunt(String(params.id));
    return h ? HttpResponse.json(h) : apiError(404, "not_found", "Jogo não encontrado.");
  }),
  http.put(`${API}/games/:id/hunt/stages/:idx`, async ({ params, request }) => {
    const id = String(params.id);
    if (!db.games.some((g) => g.id === id)) return apiError(404, "not_found", "Jogo não encontrado.");
    const body = (await request.json().catch(() => ({}))) as { done?: boolean };
    if (typeof body.done !== "boolean") return apiError(400, "bad_request", "informe done (true/false)");
    const set = done.get(id) ?? new Set<number>();
    if (body.done) set.add(Number(params.idx));
    else set.delete(Number(params.idx));
    done.set(id, set);
    return new HttpResponse(null, { status: 204 });
  }),
];

/** O POST /games/:id/sync do mock "roda" por ~3 s (o modo caçada acompanha). */
export function markGameSyncing(): void {
  syncingUntil = Date.now() + 3000;
}
