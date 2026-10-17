import { z } from "zod";

/**
 * Schemas de runtime (fronteira de validação) espelhando o contrato `../trophy-hunter-api/api/openapi.yaml`
 * → `src/api/generated/schema.ts` (via `pnpm gen:api`). `schemas.contract.ts` garante em tempo de
 * compilação que nenhum campo do contrato falte aqui. Campos opcionais do contrato ficam tolerantes
 * (optional/nullish) para a UI degradar.
 */

const timestamp = z.string();

/* ── Enums ──────────────────────────────────────────────────────────────────────────────── */

export const platformSchema = z.enum(["steam", "psn"]);
export type Platform = z.infer<typeof platformSchema>;

export const integrationStatusSchema = z.enum([
  "connected",
  "needs_reconnect",
  "error_private",
  "error",
  "disabled",
]);
export type IntegrationStatus = z.infer<typeof integrationStatusSchema>;

export const gameStatusSchema = z.enum([
  "completed",
  "platinum",
  "almost",
  "in_progress",
  "not_started",
  "abandoned",
]);
export type GameStatus = z.infer<typeof gameStatusSchema>;

export const trophyTypeSchema = z.enum(["platinum", "gold", "silver", "bronze", "achievement"]);
export type TrophyType = z.infer<typeof trophyTypeSchema>;

export const trophyTagSchema = z.enum(["missable", "online", "grind", "difficulty", "collectible", "buggy"]);
export type TrophyTag = z.infer<typeof trophyTagSchema>;

export const syncScopeSchema = z.enum(["full", "incremental"]);
export type SyncScope = z.infer<typeof syncScopeSchema>;

/* ── Perfil ─────────────────────────────────────────────────────────────────────────────── */

export const userSchema = z.object({
  subject: z.string(),
  email: z.string().optional(),
  name: z.string().optional(),
});
export type User = z.infer<typeof userSchema>;

/* ── Integrações ────────────────────────────────────────────────────────────────────────── */

export const integrationSchema = z.object({
  id: z.string(),
  platform: platformSchema,
  /** Apelido da conta no app (ex.: "Principal", "Alt") — várias contas por plataforma. */
  label: z.string(),
  status: integrationStatusSchema,
  account_id: z.string().optional(),
  display_name: z.string().optional(),
  avatar: z.string().optional(),
  last_synced_at: timestamp.nullish(),
  last_error: z.string().optional(),
});
export type Integration = z.infer<typeof integrationSchema>;

export const integrationListSchema = z
  .array(integrationSchema)
  .nullable()
  .transform((items) => items ?? []);

export const connectSteamRequestSchema = z.object({
  label: z.string().optional(),
  /** Obrigatória só na 1ª conta Steam; nas seguintes, omitida → a API reaproveita a key existente. */
  api_key: z.string().optional(),
  steam_id_or_vanity: z.string(),
});
export type ConnectSteamRequest = z.infer<typeof connectSteamRequestSchema>;

/* ── Sync ───────────────────────────────────────────────────────────────────────────────── */

export const enqueueResponseSchema = z.object({
  enqueued: z.boolean(),
  job_id: z.string().nullish(),
});
export type EnqueueResponse = z.infer<typeof enqueueResponseSchema>;

export const syncRunSchema = z.object({
  id: z.string(),
  /** Conta do run (null se a conta foi removida). */
  integration_id: z.string().nullish(),
  platform: platformSchema,
  scope: z.enum(["full", "incremental", "game"]),
  trigger: z.enum(["schedule", "manual"]),
  status: z.enum(["running", "ok", "error"]),
  started_at: timestamp,
  finished_at: timestamp.nullish(),
  items_changed: z.number().int().optional(),
  /** Fan-out do run: jogos a sincronizar, concluídos e com falha. */
  games_total: z.number().int().optional(),
  games_done: z.number().int().optional(),
  games_failed: z.number().int().optional(),
  error: z.string().optional(),
});
export type SyncRun = z.infer<typeof syncRunSchema>;

export const syncRunListSchema = z
  .array(syncRunSchema)
  .nullable()
  .transform((items) => items ?? []);

/* ── Progresso ──────────────────────────────────────────────────────────────────────────── */

export const progressSummarySchema = z.object({
  total: z.number().int(),
  earned: z.number().int(),
  remaining: z.number().int(),
  /** Fração concluída por contagem (0..1). */
  completion_pct: z.number(),
  status: gameStatusSchema,
  has_platinum: z.boolean().optional(),
  platinum_earned: z.boolean().optional(),
});
export type ProgressSummary = z.infer<typeof progressSummarySchema>;

export const typeCountSchema = z.object({ total: z.number().int(), earned: z.number().int() });
export type TypeCount = z.infer<typeof typeCountSchema>;

export const progressBucketSchema = z.object({
  total: z.number().int(),
  earned: z.number().int(),
  remaining: z.number().int(),
});
export type ProgressBucket = z.infer<typeof progressBucketSchema>;

export const progressDetailSchema = progressSummarySchema.extend({
  by_type: z.record(z.string(), typeCountSchema).optional(),
  base: progressBucketSchema.optional(),
  dlc: progressBucketSchema.optional(),
});
export type ProgressDetail = z.infer<typeof progressDetailSchema>;

/* ── Jogos / Troféus ────────────────────────────────────────────────────────────────────── */

export const gameSchema = z.object({
  id: z.string(),
  platform: platformSchema,
  external_id: z.string(),
  np_service_name: z.string().nullish(),
  title: z.string(),
  icon: z.string().optional(),
  cover: z.string().optional(),
  /** Arte horizontal (Steam header). Vazio → usar cover. */
  hero: z.string().optional(),
  platforms: z.array(z.string()).optional(),
  has_achievements: z.boolean(),
  has_platinum: z.boolean().optional(),
  last_played_at: timestamp.nullish(),
  playtime_minutes: z.number().int().optional(),
  abandoned: z.boolean().optional(),
  priority: z.number().int().optional(),
  notes: z.string().optional(),
  tags: z.array(trophyTagSchema).optional(),
});
export type Game = z.infer<typeof gameSchema>;

/** Troféus ganhos/total por tipo (PSN) e conquistas raras ganhas (< 5%) — contadores do card. */
export const typeCountsSchema = z.object({
  platinum: typeCountSchema,
  gold: typeCountSchema,
  silver: typeCountSchema,
  bronze: typeCountSchema,
  rare_earned: z.number().int(),
});
export type TypeCounts = z.infer<typeof typeCountsSchema>;

/** Uma conta que possui o jogo, com o progresso dela. */
export const gameAccountSchema = z.object({
  integration_id: z.string(),
  label: z.string(),
  display_name: z.string(),
  /** Linha do jogo NESTA conta (GET /games/{id}). */
  game_id: z.string(),
  progress: progressSummarySchema,
});
export type GameAccount = z.infer<typeof gameAccountSchema>;

const accountListSchema = z
  .array(gameAccountSchema)
  .nullable()
  .transform((a) => a ?? []);

/**
 * Um item por jogo: Game/progress são da conta MAIS AVANÇADA (id = game_id dela); accounts lista
 * todas as contas que possuem o jogo, mais avançada primeiro.
 */
export const gameListItemSchema = gameSchema.extend({
  progress: progressSummarySchema,
  /** Desbloqueio mais recente (conta best). */
  last_unlock_at: timestamp.nullish(),
  counts: typeCountsSchema,
  accounts: accountListSchema,
});
export type GameListItem = z.infer<typeof gameListItemSchema>;

export const gameListPageSchema = z.object({
  items: z
    .array(gameListItemSchema)
    .nullable()
    .transform((items) => items ?? []),
  total: z.number().int(),
  limit: z.number().int(),
  offset: z.number().int(),
});
export type GameListPage = z.infer<typeof gameListPageSchema>;

export const trophySchema = z.object({
  id: z.string(),
  external_id: z.string(),
  name: z.string(),
  /** Null em troféus ocultos sem descrição (spoiler guard). */
  description: z.string().nullish(),
  type: trophyTypeSchema,
  hidden: z.boolean(),
  icon: z.string().optional(),
  icon_locked: z.string().optional(),
  rarity_pct: z.number().nullish(),
  earned: z.boolean(),
  earned_at: timestamp.nullish(),
  progress: z.number().int().nullish(),
  target: z.number().int().nullish(),
  priority: z.number().int().optional(),
  notes: z.string().optional(),
  tags: z.array(trophyTagSchema).optional(),
  server_shutdown_risk: z.boolean().optional(),
});
export type Trophy = z.infer<typeof trophySchema>;

export const trophyGroupSchema = z.object({
  id: z.string(),
  external_id: z.string(),
  name: z.string(),
  is_base: z.boolean(),
  icon: z.string().optional(),
  trophies: z
    .array(trophySchema)
    .nullable()
    .transform((t) => t ?? []),
});
export type TrophyGroup = z.infer<typeof trophyGroupSchema>;

export const gameDetailSchema = gameSchema.extend({
  /** Conta desta linha do jogo. */
  integration_id: z.string(),
  account_label: z.string(),
  /** Todas as contas que possuem o jogo (mais avançada primeiro). */
  accounts: accountListSchema,
  progress: progressDetailSchema,
  groups: z
    .array(trophyGroupSchema)
    .nullable()
    .transform((g) => g ?? []),
});
export type GameDetail = z.infer<typeof gameDetailSchema>;
