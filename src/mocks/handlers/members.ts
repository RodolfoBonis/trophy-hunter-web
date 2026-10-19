import { http, HttpResponse } from "msw";
import type { Invite, Member, User } from "@/api/schemas";
import { API, ago, apiError, DAY } from "../http";
import { hasScenario } from "../scenario";
import { isSharing } from "./social";

/**
 * Usuário, convites e membros. Cenários: `no-access` (entrou sem convite → pending),
 * `member-removed`, `member` (amigo convidado: sem a área de administração),
 * `ai-daily-limit` (pedidos de IA → 429). Códigos de convite `bad…` = inválido, `fail…` = 503; cada
 * convite só aceita uma vez.
 */
const OWNER_ID = "00000000-0000-0000-0000-000000000001";

let accepted = false;
let invites: Invite[] = [];
let members: Member[] = [];

function seedMembers(): Member[] {
  return [
    {
      id: OWNER_ID,
      email: "rodolfo@rb.lab",
      name: "Rodolfo de Bonis",
      role: "owner",
      status: "active",
      accounts: 3,
      last_seen_at: ago(0),
      created_at: ago(30 * DAY),
    },
    {
      id: "member-1",
      email: "amigo@example.com",
      name: "Amigo",
      role: "member",
      status: "active",
      accounts: 1,
      last_seen_at: ago(DAY),
      created_at: ago(2 * DAY),
    },
  ];
}

export function resetMembers(): void {
  accepted = false;
  invites = [];
  members = seedMembers();
}
resetMembers();

function me(): User {
  const base = { subject: "mock-user", name: "Rodolfo de Bonis", email: "rodolfo@rb.lab", share_progress: isSharing() };
  if (hasScenario("member-removed")) return { ...base, id: "u-removed", role: "member", status: "removed" };
  if (hasScenario("no-access") && !accepted) return { ...base, id: "u-pending", role: "member", status: "pending" };
  if (hasScenario("member") || hasScenario("no-access")) return { ...base, id: "u-member", role: "member", status: "active" };
  return { ...base, id: OWNER_ID, role: "owner", status: "active" };
}

const ownerOnly = () => (me().role === "owner" ? undefined : apiError(404, "not_found", "Recurso não encontrado."));

const aiLimit = () =>
  hasScenario("ai-daily-limit")
    ? apiError(429, "ai_daily_limit", "você atingiu o limite de pedidos de IA de hoje; tente amanhã")
    : undefined;

export const memberHandlers = [
  http.get(`${API}/me`, () => HttpResponse.json(me())),

  http.post(`${API}/invites/:code/accept`, ({ params }) => {
    if (hasScenario("member-removed")) return apiError(403, "member_removed", "o dono removeu seu acesso");
    if (String(params.code).startsWith("fail")) return apiError(503, "upstream_timeout", "A API não respondeu a tempo.");
    if (String(params.code).startsWith("bad") || accepted) {
      return apiError(404, "invite_invalid", "o link expirou, já foi usado ou foi revogado — peça outro");
    }
    accepted = true;
    return HttpResponse.json(me());
  }),

  http.get(`${API}/admin/invites`, () => ownerOnly() ?? HttpResponse.json(invites)),
  http.post(`${API}/admin/invites`, () => {
    const denied = ownerOnly();
    if (denied) return denied;
    const id = `inv-${invites.length + 1}`;
    const invite: Invite = {
      id,
      created_at: ago(0),
      expires_at: new Date(Date.now() + 7 * DAY).toISOString(),
      max_uses: 1,
      used_count: 0,
    };
    invites = [invite, ...invites];
    return HttpResponse.json({ ...invite, url: `${window.location.origin}/convite/mock-${id}` }, { status: 201 });
  }),
  http.delete(`${API}/admin/invites/:id`, ({ params }) => {
    const denied = ownerOnly();
    if (denied) return denied;
    invites = invites.filter((i) => i.id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${API}/admin/members`, () => ownerOnly() ?? HttpResponse.json(members)),
  http.delete(`${API}/admin/members/:id`, ({ params, request }) => {
    const denied = ownerOnly();
    if (denied) return denied;
    const purge = new URL(request.url).searchParams.get("purge") === "true";
    members = purge
      ? members.filter((m) => m.id !== params.id)
      : members.map((m) => (m.id === params.id ? { ...m, status: "removed" as const } : m));
    return new HttpResponse(null, { status: 204 });
  }),

  /* Teto diário de IA: responde antes dos handlers de ai.ts (que só rodam se este passar). */
  http.post(`${API}/trophies/:id/guide`, aiLimit),
  http.post(`${API}/games/:id/roadmap`, aiLimit),
  http.post(`${API}/games/:id/chat`, aiLimit),
];
