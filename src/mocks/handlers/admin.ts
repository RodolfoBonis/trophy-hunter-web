import { http, HttpResponse } from "msw";
import type { AdminHealth } from "@/api/schemas";
import { API, ago, apiError, DAY, HOUR } from "../http";
import { hasScenario } from "../scenario";

let dead = [
  { id: "job-dead-1", kind: "sync_game", attempts: 1, error: "steam: profile is not public", updated_at: ago(2 * HOUR) },
  { id: "job-dead-2", kind: "ai_guide", attempts: 3, error: "claude: rate limited", updated_at: ago(DAY) },
];
export function resetAdmin(): void {
  dead = dead.slice(0, 2);
}

const isOwner = () => !hasScenario("member") && !hasScenario("no-access") && !hasScenario("member-removed");

function health(): AdminHealth {
  return {
    generated_at: new Date().toISOString(),
    accounts: [
      { id: "integ-steam-main", user: "Rodolfo de Bonis", platform: "steam", display_name: "rbonis", label: "Principal", status: "connected", last_synced_at: ago(HOUR), last_error: "" },
      { id: "integ-psn", user: "Rodolfo de Bonis", platform: "psn", display_name: "rb_lab", label: "", status: "needs_reconnect", last_synced_at: ago(2 * DAY), last_error: "NPSSO expirado" },
      { id: "integ-ana", user: "Ana", platform: "steam", display_name: "ana_plays", label: "", status: "connected", last_synced_at: ago(3 * HOUR), last_error: "" },
    ],
    syncs_24h: { ok: 12, error: 1 },
    queue: [
      { kind: "sync_game", status: "dead", count: dead.filter((d) => d.kind === "sync_game").length },
      { kind: "ai_guide", status: "dead", count: dead.filter((d) => d.kind === "ai_guide").length },
    ].filter((q) => q.count > 0),
    recent_dead: dead,
    ai_usage: [
      { user: "Rodolfo de Bonis", owner: true, last_7d: 41, last_24h: 6, day_limit: 0 },
      { user: "Ana", owner: false, last_7d: 12, last_24h: 3, day_limit: 30 },
    ],
    totals: { members: 3, badges: 21, open_challenges: 1, wishlist_items: 4 },
    prometheus: hasScenario("prometheus-down")
      ? { available: false, alerts: [], client_errors_24h: [], providers: [], vitals: [] }
      : {
          available: true,
          alerts: [{ name: "TrophyHunterExternalAPIFailing", severity: "warning" }],
          client_errors_24h: [{ label: "render", value: 2 }],
          providers: [
            { provider: "psstore", calls_24h: 40, error_ratio_1h: 0.8 },
            { provider: "steam", calls_24h: 912, error_ratio_1h: 0.01 },
          ],
          vitals: [
            { route: "game", device: "mobile", lcp_p75_s: 1.9 },
            { route: "home", device: "desktop", lcp_p75_s: 0.6 },
          ],
        },
  };
}

export const adminHandlers = [
  http.get(`${API}/admin/health`, () => (isOwner() ? HttpResponse.json(health()) : apiError(404, "not_found", "Recurso não encontrado."))),
  http.post(`${API}/admin/jobs/:id/retry`, ({ params }) => {
    const before = dead.length;
    dead = dead.filter((d) => d.id !== params.id);
    return dead.length < before ? new HttpResponse(null, { status: 202 }) : apiError(409, "conflict", "o job não está parado");
  }),
  http.post(`${API}/admin/integrations/:id/sync`, () => HttpResponse.json({ enqueued: true, job_id: "job-x" }, { status: 202 })),
];
