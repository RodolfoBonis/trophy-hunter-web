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

export const userRoleSchema = z.enum(["owner", "member"]);
/** pending = entrou mas ainda não aceitou convite; removed = o dono revogou o acesso. */
export const userStatusSchema = z.enum(["pending", "active", "removed"]);

export const userSchema = z.object({
  id: z.string(),
  subject: z.string(),
  email: z.string().optional(),
  name: z.string().optional(),
  role: userRoleSchema,
  status: userStatusSchema,
  /** Compartilha o progresso com os amigos (e vê o deles). Opt-in. */
  share_progress: z.boolean(),
});
export type User = z.infer<typeof userSchema>;

/** Modo caçada: etapas do roadmap ligadas aos troféus reais da conta aberta. */
export const huntStageSchema = z.object({
  index: z.number().int(),
  title: z.string(),
  description: z.string(),
  missables: z.array(z.string()),
  trophy_ids: z.array(z.string()),
  /** Citados pela IA que não casaram com nenhum troféu (mostrados como texto). */
  unmatched: z.array(z.string()),
  earned: z.number().int(),
  /** A pessoa marcou a etapa. */
  done: z.boolean(),
  /** Todos os troféus casados da etapa já foram obtidos. */
  complete: z.boolean(),
});
export type HuntStage = z.infer<typeof huntStageSchema>;
export const huntSchema = z.object({
  roadmap: z.enum(["none", "pending", "running", "ready", "error"]),
  syncing: z.boolean(),
  missables_overview: z.array(z.string()),
  stages: z.array(huntStageSchema),
});
export type Hunt = z.infer<typeof huntSchema>;

/**
 * Export dos dados (LGPD). O conteúdo das seções vai para o arquivo como veio; aqui só se confere o
 * formato e o perfil (passthrough mantém o resto).
 */
export const accountExportSchema = z
  .object({
    format: z.literal("trophy-hunter-export/1"),
    exported_at: z.string(),
    profile: z.object({ email: z.string() }).passthrough(),
  })
  .passthrough();
export type AccountExport = z.infer<typeof accountExportSchema>;

/** Link de convite. `url` só vem na criação (a API guarda só o hash do código). */
export const inviteSchema = z.object({
  id: z.string(),
  expires_at: z.string().nullable(),
  max_uses: z.number(),
  used_count: z.number(),
  created_at: z.string().nullable(),
  url: z.string().optional(),
});
export type Invite = z.infer<typeof inviteSchema>;
export const inviteListSchema = z.array(inviteSchema);

export const memberSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: userRoleSchema,
  status: userStatusSchema,
  accounts: z.number(),
  last_seen_at: z.string().nullable(),
  created_at: z.string().nullable(),
});
export type Member = z.infer<typeof memberSchema>;
export const memberListSchema = z.array(memberSchema);

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

/** Troféus GANHOS por tier de raridade (lendário < 1%, épico 1–5%, raro 5–20%, incomum 20–50%, comum ≥ 50%). */
export const rarityEarnedSchema = z.object({
  legendary: z.number().int(),
  epic: z.number().int(),
  rare: z.number().int(),
  uncommon: z.number().int(),
  common: z.number().int(),
});
export type RarityEarned = z.infer<typeof rarityEarnedSchema>;

/** Troféus ganhos/total por tipo (PSN) e ganhos por tier de raridade — contadores do card. */
export const typeCountsSchema = z.object({
  platinum: typeCountSchema,
  gold: typeCountSchema,
  silver: typeCountSchema,
  bronze: typeCountSchema,
  rarity: rarityEarnedSchema,
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

/** O mesmo jogo na outra plataforma (conta mais avançada) — lado a lado / candidatos a vínculo. */
export const crossPlatformGameSchema = z.object({
  game_id: z.string(),
  platform: platformSchema,
  external_id: z.string(),
  title: z.string(),
  cover: z.string(),
  hero: z.string(),
  earned: z.number().int(),
  total: z.number().int(),
  /** 0–1, pelo critério da plataforma. */
  completion_pct: z.number(),
  last_unlock_at: timestamp.nullish(),
});
export type CrossPlatformGame = z.infer<typeof crossPlatformGameSchema>;
export const crossPlatformListSchema = z
  .array(crossPlatformGameSchema)
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
  /** Vinculado ao mesmo título na outra plataforma. */
  cross_platform: z.boolean().default(false),
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
  /** O mesmo jogo na outra plataforma, para ver lado a lado. */
  cross_platform: crossPlatformListSchema,
  /** Vínculo decidido à mão (a unificação automática não mexe). */
  unify_locked: z.boolean().default(false),
  /** Tempos do HowLongToBeat (horas); null = ainda sem estimativa. */
  estimate: z
    .object({
      main_h: z.number().nullable(),
      extra_h: z.number().nullable(),
      completionist_h: z.number().nullable(),
      hours_left: z.number().nullable(),
      source_url: z.string(),
    })
    .nullable()
    .default(null),
});
export type GameDetail = z.infer<typeof gameDetailSchema>;
export type GameEstimate = NonNullable<GameDetail["estimate"]>;

/* ── Insights (dashboard, próxima platina, linha do tempo, alertas) ─────────────────────── */

export const statsSchema = z.object({
  games: z.object({
    total: z.number().int(),
    completed: z.number().int(),
    almost: z.number().int(),
    in_progress: z.number().int(),
    not_started: z.number().int(),
    abandoned: z.number().int(),
  }),
  trophies: z.object({
    total: z.number().int(),
    earned: z.number().int(),
    platinum: typeCountSchema,
    gold: typeCountSchema,
    silver: typeCountSchema,
    bronze: typeCountSchema,
    rarity: rarityEarnedSchema,
  }),
  rarest: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      type: trophyTypeSchema,
      icon: z.string(),
      rarity_pct: z.number(),
      earned_at: timestamp.nullish(),
      game_id: z.string(),
      game_title: z.string(),
      platform: platformSchema,
    }),
  ),
  completions: z.array(
    z.object({
      game_id: z.string(),
      title: z.string(),
      platform: platformSchema,
      external_id: z.string(),
      cover: z.string(),
      hero: z.string(),
      total: z.number().int(),
      completed_at: timestamp.nullish(),
    }),
  ),
  evolution: z.array(z.object({ month: z.string(), earned: z.number().int(), cumulative: z.number().int() })),
});
export type Stats = z.infer<typeof statsSchema>;

export const remainingTrophySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  type: trophyTypeSchema,
  hidden: z.boolean(),
  icon: z.string(),
  icon_locked: z.string(),
  rarity_pct: z.number().nullish(),
  tags: z.array(trophyTagSchema),
});
export type RemainingTrophy = z.infer<typeof remainingTrophySchema>;

export const nextItemSchema = z.object({
  game_id: z.string(),
  title: z.string(),
  platform: platformSchema,
  external_id: z.string(),
  cover: z.string(),
  hero: z.string(),
  earned: z.number().int(),
  total: z.number().int(),
  remaining: z.number().int(),
  completion_pct: z.number(),
  avg_remaining_rarity: z.number(),
  min_remaining_rarity: z.number(),
  remaining_missable: z.number().int(),
  remaining_online: z.number().int(),
  priority: z.number().int(),
  last_unlock_at: timestamp.nullish(),
  /** Horas para 100% / que faltam (HowLongToBeat); null = sem estimativa. */
  hours_total: z.number().nullable().default(null),
  hours_left: z.number().nullable().default(null),
  score: z.number(),
  factors: z.object({
    completion: z.number(),
    remaining: z.number(),
    ease: z.number(),
    priority: z.number(),
    urgency: z.number(),
    time: z.number().default(0),
  }),
});
export type NextItem = z.infer<typeof nextItemSchema>;

export const nextPlatinumSchema = z.object({
  items: z.array(nextItemSchema),
  today: z.object({ game_id: z.string(), trophies: z.array(remainingTrophySchema) }).nullish(),
});
export type NextPlatinum = z.infer<typeof nextPlatinumSchema>;

export const timelineItemSchema = z.object({
  trophy_id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  type: trophyTypeSchema,
  icon: z.string(),
  rarity_pct: z.number().nullish(),
  earned_at: timestamp.nullish(),
  game_id: z.string(),
  game_title: z.string(),
  platform: platformSchema,
  external_id: z.string(),
  cover: z.string(),
  hero: z.string(),
  account_label: z.string(),
  completes_game: z.boolean(),
});
export type TimelineItem = z.infer<typeof timelineItemSchema>;

export const timelinePageSchema = z.object({
  items: z.array(timelineItemSchema),
  next_cursor: z.string().nullish(),
});
export type TimelinePage = z.infer<typeof timelinePageSchema>;

export const alertSchema = z.object({
  trophy_id: z.string(),
  name: z.string(),
  type: trophyTypeSchema,
  hidden: z.boolean(),
  icon: z.string(),
  rarity_pct: z.number().nullish(),
  tags: z.array(trophyTagSchema),
  server_shutdown_risk: z.boolean(),
  game_id: z.string(),
  game_title: z.string(),
  platform: platformSchema,
});
export type Alert = z.infer<typeof alertSchema>;
export const alertListSchema = z.array(alertSchema);

export interface Annotations {
  abandoned?: boolean;
  priority?: number;
  notes?: string;
  tags?: TrophyTag[];
  server_shutdown_risk?: boolean;
}

/* ── IA: guias, roadmap e chat ─────────────────────────────────────────────────────────── */

const strings = z
  .array(z.string())
  .nullable()
  .transform((a) => a ?? []);

/** Guia de um troféu (schema trophy_guide v1, validado na API). */
export const trophyGuideContentSchema = z.object({
  /** Onde o troféu sai (capítulo/fase/área). Guias v1 não têm. */
  where: z.string().default(""),
  summary: z.string(),
  steps: strings,
  prerequisites: strings,
  missable: z.boolean(),
  point_of_no_return: z.string(),
  difficulty: z.number().int(),
  estimated_time: z.string(),
  tips: strings,
  confidence: z.number(),
  uncertainty_notes: z.string(),
  sources: strings,
});
export type TrophyGuideContent = z.infer<typeof trophyGuideContentSchema>;

export const roadmapStageSchema = z.object({
  title: z.string(),
  description: z.string(),
  trophies: strings,
  missables: strings,
});
export type RoadmapStage = z.infer<typeof roadmapStageSchema>;

/** Roadmap de platina/100% (schema roadmap v1). */
export const roadmapContentSchema = z.object({
  summary: z.string(),
  difficulty: z.number().int(),
  estimated_total_time: z.string(),
  playthroughs: z.number().int(),
  stages: z.array(roadmapStageSchema),
  missables_overview: strings,
  tips: strings,
  confidence: z.number(),
  uncertainty_notes: z.string(),
  sources: strings,
});
export type RoadmapContent = z.infer<typeof roadmapContentSchema>;

export const guideStatusSchema = z.enum(["pending", "running", "ready", "error"]);
export type GuideStatus = z.infer<typeof guideStatusSchema>;

/**
 * Guia de IA. `content` = gerado; `edited_content` = correção do usuário (vence na exibição). O
 * conteúdo fica como `unknown` aqui e é validado pelo schema do escopo na exibição
 * (trophyGuideContentSchema / roadmapContentSchema).
 */
export const aiGuideSchema = z.object({
  id: z.string(),
  scope: z.enum(["trophy", "roadmap"]),
  status: guideStatusSchema,
  content: z.unknown().nullable(),
  edited_content: z.unknown().nullable(),
  model: z.string(),
  error: z.string(),
  generated_at: timestamp.nullish(),
  updated_at: timestamp.nullish(),
});
export type AIGuide = z.infer<typeof aiGuideSchema>;

export const aiGuideEnvelopeSchema = z.object({ guide: aiGuideSchema.nullable() });
export type AIGuideEnvelope = z.infer<typeof aiGuideEnvelopeSchema>;

export const chatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  status: z.enum(["pending", "running", "done", "error"]),
  error: z.string(),
  created_at: timestamp.nullish(),
});
export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const chatThreadSchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .nullable()
    .transform((m) => m ?? []),
});
export type ChatThread = z.infer<typeof chatThreadSchema>;

export const sendChatResponseSchema = z.object({ user: chatMessageSchema, assistant: chatMessageSchema });

/* ── Avisos de troféu ──────────────────────────────────────────────────────────────────── */

/** Troféu recém-desbloqueado (toast). completes_game = fechou o jogo (platina/100%) → cerimônia. */
export const unlockEventSchema = z.object({
  id: z.string(),
  detected_at: timestamp.nullish(),
  trophy_id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  type: trophyTypeSchema,
  icon: z.string(),
  rarity_pct: z.number().nullish(),
  earned_at: timestamp.nullish(),
  game_id: z.string(),
  game_title: z.string(),
  platform: platformSchema,
  external_id: z.string(),
  cover: z.string(),
  hero: z.string(),
  completes_game: z.boolean(),
});
export type UnlockEvent = z.infer<typeof unlockEventSchema>;
export const unlockEventListSchema = z
  .array(unlockEventSchema)
  .nullable()
  .transform((a) => a ?? []);

/* ── Web push ──────────────────────────────────────────────────────────────────────────── */

export const pushStatusSchema = z.object({
  /** false = servidor sem chaves VAPID. */
  enabled: z.boolean(),
  public_key: z.string(),
  subscriptions: z.number().int(),
});
export type PushStatus = z.infer<typeof pushStatusSchema>;

export const notificationPreferencesSchema = z.object({
  unlocks: z.boolean(),
  completions: z.boolean(),
  reconnect: z.boolean(),
  ai_ready: z.boolean(),
  challenges: z.boolean().default(true),
  /** Resumo semanal da IA — opt-in (liga a geração e o aviso). */
  weekly_recap: z.boolean().default(false),
});
export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;

export const pushTestResultSchema = z.object({ sent: z.number().int(), failed: z.number().int(), removed: z.number().int() });

/* ── Busca (paleta de comandos) ────────────────────────────────────────────────────────── */

export const searchResultSchema = z.object({
  games: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        platform: platformSchema,
        external_id: z.string(),
        cover: z.string(),
        hero: z.string(),
        completion_pct: z.number(),
      }),
    )
    .nullable()
    .transform((a) => a ?? []),
  trophies: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        type: trophyTypeSchema,
        icon: z.string(),
        earned: z.boolean(),
        rarity_pct: z.number().nullish(),
        game_id: z.string(),
        game_title: z.string(),
        platform: platformSchema,
      }),
    )
    .nullable()
    .transform((a) => a ?? []),
});
export type SearchResult = z.infer<typeof searchResultSchema>;

/* ── Social (opt-in, recíproco) ─────────────────────────────────────────────────────────── */

export const socialUserSchema = z.object({ id: z.string(), name: z.string(), is_me: z.boolean() });
export type SocialUser = z.infer<typeof socialUserSchema>;

export const leaderboardPeriodSchema = z.enum(["month", "year", "all"]);
export type LeaderboardPeriod = z.infer<typeof leaderboardPeriodSchema>;

export const leaderboardItemSchema = z.object({
  user: socialUserSchema,
  platinum: z.number(),
  earned: z.number(),
  rare: z.number(),
  psn_points: z.number(),
  completed: z.number(),
  last_unlock_at: z.string().nullable(),
});
export type LeaderboardItem = z.infer<typeof leaderboardItemSchema>;
export const leaderboardSchema = z.object({ period: leaderboardPeriodSchema, items: z.array(leaderboardItemSchema) });
export type Leaderboard = z.infer<typeof leaderboardSchema>;

export const feedItemSchema = z.object({
  user: socialUserSchema,
  kind: z.enum(["platinum", "completion", "rare"]),
  trophy_id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  type: trophyTypeSchema,
  hidden: z.boolean(),
  icon: z.string(),
  rarity_pct: z.number().nullable(),
  earned_at: z.string().nullable(),
  game_title: z.string(),
  platform: platformSchema,
  external_id: z.string(),
  cover: z.string(),
  hero: z.string(),
  completes_game: z.boolean(),
});
export type FeedItem = z.infer<typeof feedItemSchema>;
export const feedPageSchema = z.object({ items: z.array(feedItemSchema), next_cursor: z.string().nullable() });
export type FeedPage = z.infer<typeof feedPageSchema>;

export const friendProfileSchema = z.object({ user: socialUserSchema, stats: statsSchema });
export type FriendProfile = z.infer<typeof friendProfileSchema>;

export const gameFriendSchema = z.object({
  user: socialUserSchema,
  platform: platformSchema,
  earned: z.number(),
  total: z.number(),
  completion_pct: z.number(),
  has_platinum: z.boolean(),
  last_unlock_at: z.string().nullable(),
});
export type GameFriend = z.infer<typeof gameFriendSchema>;
export const gameFriendsSchema = z.object({ sharing: z.boolean(), items: z.array(gameFriendSchema) });
export type GameFriends = z.infer<typeof gameFriendsSchema>;

/* ── Desafios e comparação ──────────────────────────────────────────────────────────────── */

export const challengeKindSchema = z.enum(["first_to_complete", "most_trophies", "most_rare"]);
export type ChallengeKind = z.infer<typeof challengeKindSchema>;
export const participantStateSchema = z.enum(["invited", "accepted", "declined"]);

export const challengeGameSchema = z.object({
  title: z.string(),
  platform: platformSchema,
  external_id: z.string(),
  cover: z.string(),
});
export type ChallengeGame = z.infer<typeof challengeGameSchema>;

export const challengeSummarySchema = z.object({
  id: z.string(),
  kind: challengeKindSchema,
  title: z.string(),
  status: z.enum(["open", "finished", "canceled"]),
  starts_at: z.string().nullable(),
  ends_at: z.string().nullable(),
  my_state: participantStateSchema,
  is_creator: z.boolean(),
  accepted_count: z.number(),
  winner_name: z.string().nullable(),
  game: challengeGameSchema.nullable(),
});
export type ChallengeSummary = z.infer<typeof challengeSummarySchema>;

export const challengeStandingSchema = z.object({
  user: socialUserSchema,
  state: participantStateSchema,
  score: z.number(),
  has_game: z.boolean(),
  earned: z.number(),
  total: z.number(),
  completion_pct: z.number(),
  completed_at: z.string().nullable(),
});
export type ChallengeStanding = z.infer<typeof challengeStandingSchema>;

export const challengeDetailSchema = challengeSummarySchema.extend({
  finished_at: z.string().nullable(),
  winner: socialUserSchema.nullable(),
  standings: z.array(challengeStandingSchema),
});
export type ChallengeDetail = z.infer<typeof challengeDetailSchema>;

export interface CreateChallengeRequest {
  kind: ChallengeKind;
  friend_ids: string[];
  game_id?: string;
  days?: number;
  title?: string;
}

export const compareTrophySchema = z.object({
  trophy_id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  type: trophyTypeSchema,
  hidden: z.boolean(),
  icon: z.string(),
  rarity_pct: z.number().nullable(),
  mine: z.boolean(),
  mine_earned_at: z.string().nullable(),
  friend: z.boolean(),
  friend_earned_at: z.string().nullable(),
  matched: z.boolean(),
});
export type CompareTrophy = z.infer<typeof compareTrophySchema>;

export const gameCompareSchema = z.object({
  friend: socialUserSchema,
  same_platform: z.boolean(),
  friend_platform: platformSchema,
  friend_earned: z.number(),
  friend_total: z.number(),
  friend_completion_pct: z.number(),
  trophies: z.array(compareTrophySchema),
});
export type GameCompare = z.infer<typeof gameCompareSchema>;

/* ── Retrospectiva e resumo semanal ─────────────────────────────────────────────────────── */

export const recapSchema = z.object({
  period: z.string(),
  label: z.string(),
  partial: z.boolean(),
  earned: z.number(),
  previous_earned: z.number(),
  platinum: z.number(),
  gold: z.number(),
  silver: z.number(),
  bronze: z.number(),
  achievements: z.number(),
  rare: z.number(),
  games: z.number(),
  active_days: z.number(),
  longest_streak: z.number(),
  favorite_weekday: z.string(),
  best_day: z.string().nullable(),
  best_day_count: z.number(),
  top_games: z.array(
    z.object({
      game_id: z.string(),
      title: z.string(),
      platform: platformSchema,
      external_id: z.string(),
      cover: z.string(),
      hero: z.string(),
      unlocked: z.number(),
      earned: z.number(),
      total: z.number(),
    }),
  ),
  rarest: z.array(
    z.object({
      name: z.string(),
      type: trophyTypeSchema,
      hidden: z.boolean(),
      icon: z.string(),
      rarity_pct: z.number(),
      earned_at: z.string().nullable(),
      game_title: z.string(),
      platform: platformSchema,
    }),
  ),
  completions: z.array(
    z.object({
      game_id: z.string(),
      title: z.string(),
      platform: platformSchema,
      external_id: z.string(),
      cover: z.string(),
      hero: z.string(),
      total: z.number(),
      completed_at: z.string().nullish(),
    }),
  ),
});
export type Recap = z.infer<typeof recapSchema>;

export const weeklyRecapContentSchema = z.object({
  headline: z.string(),
  highlights: z.array(z.string()),
  suggestions: z.array(z.object({ game: z.string(), why: z.string(), trophies: z.array(z.string()) })),
  encouragement: z.string(),
});
export type WeeklyRecapContent = z.infer<typeof weeklyRecapContentSchema>;

export const weeklyRecapSchema = z.object({
  week: z.string(),
  status: z.enum(["pending", "ready", "error"]),
  content: weeklyRecapContentSchema.nullable(),
  error: z.string().nullable(),
  updated_at: z.string().nullable(),
});
export type WeeklyRecap = z.infer<typeof weeklyRecapSchema>;
export const weeklyRecapEnvelopeSchema = z.object({ recap: weeklyRecapSchema.nullable() });
