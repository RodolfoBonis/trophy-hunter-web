import type { AIGuide, ChatMessage, Integration, SyncRun } from "@/api/schemas";
import { mockGames, mockIntegrations, mockSyncRuns, type MockGameRow } from "./fixtures";

/** Estado mutável do modo mock: connectSteam/syncNow alteram e os testes resetam entre casos. */
interface MockDb {
  integrations: Integration[];
  /** Uma linha por (conta, jogo) — igual à tabela games da API. */
  games: MockGameRow[];
  syncRuns: SyncRun[];
  /** Guias de IA por chave (`trophy:<id>` / `roadmap:<gameId>`). */
  aiGuides: Record<string, AIGuide>;
  /** Conversa ativa por jogo. */
  chats: Record<string, ChatMessage[]>;
}

function seed(): MockDb {
  return structuredClone({
    integrations: mockIntegrations,
    games: mockGames,
    syncRuns: mockSyncRuns,
    aiGuides: {},
    chats: {},
  });
}

export const db: MockDb = seed();

export function resetMockDb(): void {
  const fresh = seed();
  db.integrations = fresh.integrations;
  db.games = fresh.games;
  db.syncRuns = fresh.syncRuns;
  db.aiGuides = fresh.aiGuides;
  db.chats = fresh.chats;
}
