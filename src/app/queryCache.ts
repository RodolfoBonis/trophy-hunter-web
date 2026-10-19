import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import type { Query } from "@tanstack/react-query";
import { clear, createStore, del, get, keys, set } from "idb-keyval";

/**
 * Cache das telas no IndexedDB (por usuário): reabrir o app mostra os dados da última visita na hora
 * (revalidando em seguida) e, se a conexão cair, o que já foi visto continua na tela.
 * Só dados de leitura do próprio usuário — tokens NUNCA (ficam só em memória). Apagado ao sair.
 */
const store = createStore("trophy-hunter", "query-cache");

/** Quanto tempo o cache salvo vale. As queries precisam viver (gcTime) pelo menos isso. */
export const PERSIST_MAX_AGE = 24 * 60 * 60 * 1000;

/** Raízes de queryKey que valem a pena guardar (telas). Busca, chat, avisos e admin ficam de fora. */
const PERSISTED_ROOTS = new Set([
  "me", "games", "game", "stats", "next", "timeline", "alerts", "recap", "social", "integrations", "sync-runs", "ai-guide", "badges",
]);

export function shouldPersistQuery(query: Query): boolean {
  return query.state.status === "success" && PERSISTED_ROOTS.has(String(query.queryKey[0]));
}

export function createQueryPersister(userSub: string) {
  return createAsyncStoragePersister({
    key: keyFor(userSub),
    storage: {
      getItem: (k: string) => get<string>(k, store).then((v) => v ?? null),
      setItem: (k: string, v: string) => set(k, v, store),
      removeItem: (k: string) => del(k, store),
    },
    throttleTime: 2000,
  });
}

const keyFor = (userSub: string) => `th-cache:${userSub}`;

/** Outra pessoa entrou neste navegador: o cache de quem não saiu direito não fica para trás. */
export async function dropOtherUsers(userSub: string): Promise<void> {
  try {
    const mine = keyFor(userSub);
    await Promise.all((await keys(store)).filter((k) => k !== mine).map((k) => del(k, store)));
  } catch {
    // sem IndexedDB: nada salvo.
  }
}

/** Sair / excluir a conta: some todo cache salvo neste navegador. */
export async function clearPersistedQueries(): Promise<void> {
  try {
    await clear(store);
  } catch {
    // IndexedDB indisponível (modo privado antigo): não havia nada salvo.
  }
}
