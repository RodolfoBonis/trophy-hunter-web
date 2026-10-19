import type { ApiClient } from "./client";
import {
  searchResultSchema,
  notificationPreferencesSchema,
  pushStatusSchema,
  pushTestResultSchema,
  type NotificationPreferences,
  unlockEventListSchema,
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
  huntSchema,
  myBadgesSchema,
  friendBadgesSchema,
  accountExportSchema,
  inviteSchema,
  inviteListSchema,
  memberListSchema,
  leaderboardSchema,
  feedPageSchema,
  friendProfileSchema,
  gameFriendsSchema,
  challengeSummarySchema,
  challengeDetailSchema,
  gameCompareSchema,
  recapSchema,
  weeklyRecapEnvelopeSchema,
  type CreateChallengeRequest,
  type LeaderboardPeriod,
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
  /** Aceita um link de convite (uso único); devolve o usuário já ativo. */
  acceptInvite: (c: ApiClient, code: string) =>
    c.request(`/invites/${encodeURIComponent(code)}/accept`, { method: "POST", schema: userSchema }),

  /* Social (opt-in e recíproco) */
  /** Seus dados (LGPD): o JSON completo para baixar (sem credenciais). */
  exportMe: (c: ApiClient) => c.request("/me/export", { schema: accountExportSchema }),
  deleteMe: (c: ApiClient) => c.request("/me", { method: "DELETE", body: { confirm: "EXCLUIR" } }),
  setSharing: (c: ApiClient, share: boolean) =>
    c.request("/me/sharing", { method: "PUT", body: { share_progress: share }, schema: userSchema }),
  leaderboard: (c: ApiClient, period: LeaderboardPeriod) => c.request("/social/leaderboard", { query: { period }, schema: leaderboardSchema }),
  feed: (c: ApiClient, params: { cursor?: string; limit?: number } = {}, signal?: AbortSignal) =>
    c.request("/social/feed", { query: params, schema: feedPageSchema, signal }),
  friend: (c: ApiClient, id: string) => c.request(`/social/friends/${encodeURIComponent(id)}`, { schema: friendProfileSchema }),
  friendGames: (c: ApiClient, id: string, params: GamesQuery = {}, signal?: AbortSignal) =>
    c.request(`/social/friends/${encodeURIComponent(id)}/games`, { query: { ...params }, schema: gameListPageSchema, signal }),
  gameFriends: (c: ApiClient, gameId: string) => c.request(`/games/${encodeURIComponent(gameId)}/friends`, { schema: gameFriendsSchema }),
  challenges: (c: ApiClient) => c.request("/social/challenges", { schema: challengeSummarySchema.array() }),
  challenge: (c: ApiClient, id: string) => c.request(`/social/challenges/${encodeURIComponent(id)}`, { schema: challengeDetailSchema }),
  createChallenge: (c: ApiClient, body: CreateChallengeRequest) =>
    c.request("/social/challenges", { method: "POST", body, schema: challengeDetailSchema }),
  challengeAction: (c: ApiClient, id: string, action: "accept" | "decline" | "cancel") =>
    c.request(`/social/challenges/${encodeURIComponent(id)}/${action}`, { method: "POST", schema: challengeDetailSchema }),
  compareGame: (c: ApiClient, gameId: string, friendId: string) =>
    c.request(`/games/${encodeURIComponent(gameId)}/compare/${encodeURIComponent(friendId)}`, { schema: gameCompareSchema }),

  /* Administração (só o dono) */
  invites: (c: ApiClient) => c.request("/admin/invites", { schema: inviteListSchema }),
  createInvite: (c: ApiClient) => c.request("/admin/invites", { method: "POST", schema: inviteSchema }),
  revokeInvite: (c: ApiClient, id: string) => c.request(`/admin/invites/${encodeURIComponent(id)}`, { method: "DELETE" }),
  members: (c: ApiClient) => c.request("/admin/members", { schema: memberListSchema }),
  /** Revoga o acesso; com `purge`, apaga também as contas e os dados do membro. */
  removeMember: (c: ApiClient, id: string, purge = false) =>
    c.request(`/admin/members/${encodeURIComponent(id)}`, { method: "DELETE", query: { purge: purge || undefined } }),

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

  /* Avisos de troféu */
  unseenUnlocks: (c: ApiClient) => c.request("/events/unseen", { schema: unlockEventListSchema }),
  markUnlocksSeen: (c: ApiClient, ids: string[]) => c.request("/events/seen", { method: "POST", body: { ids } }),

  /* Busca (paleta de comandos) */
  search: (c: ApiClient, q: string, signal?: AbortSignal) => c.request("/search", { query: { q }, schema: searchResultSchema, signal }),

  /* Web push */
  pushStatus: (c: ApiClient) => c.request("/push/key", { schema: pushStatusSchema }),
  subscribePush: (c: ApiClient, sub: PushSubscriptionJSON) => c.request("/push/subscriptions", { method: "POST", body: sub }),
  unsubscribePush: (c: ApiClient, endpoint: string) => c.request("/push/subscriptions", { method: "DELETE", body: { endpoint } }),
  testPush: (c: ApiClient) => c.request("/push/test", { method: "POST", schema: pushTestResultSchema }),
  notificationPrefs: (c: ApiClient) => c.request("/notifications/preferences", { schema: notificationPreferencesSchema }),
  saveNotificationPrefs: (c: ApiClient, prefs: NotificationPreferences) =>
    c.request("/notifications/preferences", { method: "PUT", body: prefs, schema: notificationPreferencesSchema }),

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
  myBadges: (c: ApiClient) => c.request("/me/badges", { schema: myBadgesSchema }),
  friendBadges: (c: ApiClient, id: string) =>
    c.request(`/social/friends/${encodeURIComponent(id)}/badges`, { schema: friendBadgesSchema }),
  hunt: (c: ApiClient, gameId: string) => c.request(`/games/${encodeURIComponent(gameId)}/hunt`, { schema: huntSchema }),
  setHuntStage: (c: ApiClient, gameId: string, idx: number, done: boolean) =>
    c.request(`/games/${encodeURIComponent(gameId)}/hunt/stages/${idx}`, { method: "PUT", body: { done } }),
  syncGame: (c: ApiClient, id: string) =>
    c.request(`/games/${encodeURIComponent(id)}/sync`, { method: "POST", schema: enqueueResponseSchema }),

  /* Retrospectiva e resumo semanal da IA */
  recap: (c: ApiClient, period?: string) => c.request("/recap", { query: { period }, schema: recapSchema }),
  weeklyRecap: (c: ApiClient) => c.request("/recap/weekly", { schema: weeklyRecapEnvelopeSchema }),
  generateWeeklyRecap: (c: ApiClient) => c.request("/recap/weekly", { method: "POST", schema: weeklyRecapEnvelopeSchema }),

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
  invites: ["admin", "invites"] as const,
  members: ["admin", "members"] as const,
  leaderboard: (period: string) => ["social", "leaderboard", period] as const,
  feed: ["social", "feed"] as const,
  friend: (id: string) => ["social", "friend", id] as const,
  friendGames: (id: string, params: object) => ["social", "friend", id, "games", params] as const,
  gameFriends: (gameId: string) => ["social", "game", gameId] as const,
  challenges: ["social", "challenges"] as const,
  recap: (period: string) => ["recap", period] as const,
  weeklyRecap: ["recap", "weekly"] as const,
  challenge: (id: string) => ["social", "challenges", id] as const,
  compare: (gameId: string, friendId: string) => ["social", "compare", gameId, friendId] as const,
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
  hunt: (gameId: string) => ["game", gameId, "hunt"] as const,
  myBadges: ["badges", "me"] as const,
  friendBadges: (id: string) => ["social", "friend", id, "badges"] as const,
  chat: (gameId: string) => ["ai-chat", gameId] as const,
  unlocks: ["unlocks", "unseen"] as const,
  pushStatus: ["push", "status"] as const,
  search: (q: string) => ["search", q] as const,
  notificationPrefs: ["push", "preferences"] as const,
} as const;
