import type { Integration, SyncRun } from "@/api/schemas";
import { mockGames, mockIntegrations, mockSyncRuns, type MockGameRow } from "./fixtures";

/** Estado mutável do modo mock: connectSteam/syncNow alteram e os testes resetam entre casos. */
interface MockDb {
  integrations: Integration[];
  /** Uma linha por (conta, jogo) — igual à tabela games da API. */
  games: MockGameRow[];
  syncRuns: SyncRun[];
}

function seed(): MockDb {
  return structuredClone({
    integrations: mockIntegrations,
    games: mockGames,
    syncRuns: mockSyncRuns,
  });
}

export const db: MockDb = seed();

export function resetMockDb(): void {
  const fresh = seed();
  db.integrations = fresh.integrations;
  db.games = fresh.games;
  db.syncRuns = fresh.syncRuns;
}
