import type { ApiClient } from "./client";
import {
  aiGuideEnvelopeSchema,
  aiGuideSchema,
  chatThreadSchema,
  sendChatResponseSchema,
  alertListSchema,
  crossPlatformListSchema,
  enqueueResponseSchema,
  gameSchema,
  nextPlatinumSchema,
  statsSchema,
  timelinePageSchema,
  trophySchema,
  type Annotations,
  gameDetailSchema,
  gameListPageSchema,
  integrationListSchema,
  integrationSchema,
  syncRunListSchema,
  userSchema,
  type ConnectSteamRequest,
  type GameStatus,
  type Platform,
  type SyncScope,
} from "./schemas";

export interface GamesQuery {
  platform?: Platform;
  /** Restringe a uma conta (default: todas, um item por jogo). */
  integration_id?: string;
  status?: GameStatus;
  q?: string;
  has_achievements?: "true" | "false" | "all";
  sort?: "completion" | "remaining" | "last_played" | "title" | "rarity";
  limit?: number;
  offset?: number;
}

/** Endpoints da API do Trophy Hunter (um por função). Caminhos/shapes do openapi.yaml. */
export const api = {
  me: (c: ApiClient) => c.request("/me", { schema: userSchema }),

  /* Biblioteca */
  games: (c: ApiClient, params: GamesQuery = {}, signal?: AbortSignal) =>
    c.request("/games", { query: { ...params }, schema: gameListPageSchema, signal }),
  game: (c: ApiClient, id: string) => c.request(`/games/${encodeURIComponent(id)}`, { schema: gameDetailSchema }),

  /* Unificação cross-platform */
  /** Vincula ao mesmo jogo na outra plataforma (decisão manual, travada). */
  linkGame: (c: ApiClient, id: string, otherGameId: string) =>
    c.request(`/games/${encodeURIComponent(id)}/link`, { method: "POST", body: { other_game_id: otherGameId } }),
  unlinkGame: (c: ApiClient, id: string) => c.request(`/games/${encodeURIComponent(id)}/link`, { method: "DELETE" }),
  linkCandidates: (c: ApiClient, id: string, q: string, signal?: AbortSignal) =>
    c.request(`/games/${encodeURIComponent(id)}/link-candidates`, { query: { q }, schema: crossPlatformListSchema, signal }),

  /* IA (geração assíncrona; a resposta chega por stream — ver useAIStream) */
  trophyGuide: (c: ApiClient, trophyId: string) =>
    c.request(`/trophies/${encodeURIComponent(trophyId)}/guide`, { schema: aiGuideEnvelopeSchema }),
  generateTrophyGuide: (c: ApiClient, trophyId: string) =>
    c.request(`/trophies/${encodeURIComponent(trophyId)}/guide`, { method: "POST", schema: aiGuideSchema }),
  roadmap: (c: ApiClient, gameId: string) => c.request(`/games/${encodeURIComponent(gameId)}/roadmap`, { schema: aiGuideEnvelopeSchema }),
  generateRoadmap: (c: ApiClient, gameId: string) =>
    c.request(`/games/${encodeURIComponent(gameId)}/roadmap`, { method: "POST", schema: aiGuideSchema }),
  /** Grava a correção do usuário (mesmo schema) ou `null` para voltar ao gerado. */
  editGuide: (c: ApiClient, guideId: string, editedContent: unknown) =>
    c.request(`/ai/guides/${encodeURIComponent(guideId)}`, { method: "PATCH", body: { edited_content: editedContent }, schema: aiGuideSchema }),
  chat: (c: ApiClient, gameId: string) => c.request(`/games/${encodeURIComponent(gameId)}/chat`, { schema: chatThreadSchema }),
  sendChat: (c: ApiClient, gameId: string, message: string) =>
    c.request(`/games/${encodeURIComponent(gameId)}/chat`, { method: "POST", body: { message }, schema: sendChatResponseSchema }),
  resetChat: (c: ApiClient, gameId: string) => c.request(`/games/${encodeURIComponent(gameId)}/chat`, { method: "DELETE" }),

  /* Integrações */
  integrations: (c: ApiClient) => c.request("/integrations", { schema: integrationListSchema }),
  /** Conecta uma NOVA conta Steam: valida contra a Steam e enfileira full sync. Nunca retorna o segredo. */
  connectSteam: (c: ApiClient, body: ConnectSteamRequest) =>
    c.request("/integrations/steam", { method: "POST", body, schema: integrationSchema }),
  /** Conecta uma conta PSN pelo NPSSO (nunca gravado). */
  connectPSN: (c: ApiClient, body: { label?: string; npsso: string }) =>
    c.request("/integrations/psn", { method: "POST", body, schema: integrationSchema }),
  /** Reconecta uma conta PSN expirada com um NPSSO novo (mesma conta). */
  reconnectIntegration: (c: ApiClient, id: string, npsso: string) =>
    c.request(`/integrations/${encodeURIComponent(id)}/reconnect`, { method: "POST", body: { npsso }, schema: integrationSchema }),
  /** Renomeia a conta e/ou troca a API key. */
  updateIntegration: (c: ApiClient, id: string, body: { label?: string; api_key?: string }) =>
    c.request(`/integrations/${encodeURIComponent(id)}`, { method: "PATCH", body, schema: integrationSchema }),
  /** Remove a conta e os jogos dela. */
  deleteIntegration: (c: ApiClient, id: string) =>
    c.request(`/integrations/${encodeURIComponent(id)}`, { method: "DELETE" }),

  /* Sync */
  syncIntegration: (c: ApiClient, id: string, scope?: SyncScope) =>
    c.request(`/integrations/${encodeURIComponent(id)}/sync`, {
      method: "POST",
      body: scope ? { scope } : undefined,
      schema: enqueueResponseSchema,
    }),
  syncGame: (c: ApiClient, id: string) =>
    c.request(`/games/${encodeURIComponent(id)}/sync`, { method: "POST", schema: enqueueResponseSchema }),

  /* Insights */
  stats: (c: ApiClient) => c.request("/stats", { schema: statsSchema }),
  next: (c: ApiClient) => c.request("/next", { schema: nextPlatinumSchema }),
  timeline: (c: ApiClient, params: { cursor?: string; limit?: number } = {}, signal?: AbortSignal) =>
    c.request("/timeline", { query: params, schema: timelinePageSchema, signal }),
  alerts: (c: ApiClient) => c.request("/alerts", { schema: alertListSchema }),

  /* Marcações */
  patchGame: (c: ApiClient, id: string, body: Annotations) =>
    c.request(`/games/${encodeURIComponent(id)}`, { method: "PATCH", body, schema: gameSchema }),
  patchTrophy: (c: ApiClient, id: string, body: Annotations) =>
    c.request(`/trophies/${encodeURIComponent(id)}`, { method: "PATCH", body, schema: trophySchema }),

  /* Log de sync */
  syncRuns: (c: ApiClient, params: { platform?: Platform; integration_id?: string; limit?: number } = {}) =>
    c.request("/sync-runs", { query: params, schema: syncRunListSchema }),
} as const;

/** Chaves do TanStack Query, centralizadas para invalidação consistente. */
export const queryKeys = {
  me: ["me"] as const,
  games: (params: object) => ["games", params] as const,
  game: (id: string) => ["game", id] as const,
  integrations: ["integrations"] as const,
  syncRuns: (params: object) => ["sync-runs", params] as const,
  stats: ["stats"] as const,
  next: ["next"] as const,
  timeline: ["timeline"] as const,
  alerts: ["alerts"] as const,
  linkCandidates: (id: string, q: string) => ["link-candidates", id, q] as const,
  trophyGuide: (trophyId: string) => ["ai-guide", "trophy", trophyId] as const,
  roadmap: (gameId: string) => ["ai-guide", "roadmap", gameId] as const,
  chat: (gameId: string) => ["ai-chat", gameId] as const,
} as const;
