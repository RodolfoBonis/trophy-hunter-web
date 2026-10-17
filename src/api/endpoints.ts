import type { ApiClient } from "./client";
import {
  enqueueResponseSchema,
  gameDetailSchema,
  gameListPageSchema,
  integrationListSchema,
  integrationSchema,
  syncRunListSchema,
  userSchema,
  type GameStatus,
  type Platform,
  type SyncScope,
} from "./schemas";

export interface GamesQuery {
  platform?: Platform;
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

  /* Integrações */
  integrations: (c: ApiClient) => c.request("/integrations", { schema: integrationListSchema }),
  /** Conecta/atualiza a Steam (PUT): valida contra a Steam e enfileira full sync. Nunca retorna o segredo. */
  connectSteam: (c: ApiClient, body: { api_key: string; steam_id_or_vanity: string }) =>
    c.request("/integrations/steam", { method: "PUT", body, schema: integrationSchema }),
  deleteIntegration: (c: ApiClient, platform: Platform) =>
    c.request(`/integrations/${encodeURIComponent(platform)}`, { method: "DELETE" }),

  /* Sync */
  syncPlatform: (c: ApiClient, platform: Platform, scope?: SyncScope) =>
    c.request(`/integrations/${encodeURIComponent(platform)}/sync`, {
      method: "POST",
      body: scope ? { scope } : undefined,
      schema: enqueueResponseSchema,
    }),
  syncGame: (c: ApiClient, id: string) =>
    c.request(`/games/${encodeURIComponent(id)}/sync`, { method: "POST", schema: enqueueResponseSchema }),

  /* Log de sync */
  syncRuns: (c: ApiClient, params: { platform?: Platform; limit?: number } = {}) =>
    c.request("/sync-runs", { query: params, schema: syncRunListSchema }),
} as const;

/** Chaves do TanStack Query, centralizadas para invalidação consistente. */
export const queryKeys = {
  me: ["me"] as const,
  games: (params: object) => ["games", params] as const,
  game: (id: string) => ["game", id] as const,
  integrations: ["integrations"] as const,
  syncRuns: (params: object) => ["sync-runs", params] as const,
} as const;
