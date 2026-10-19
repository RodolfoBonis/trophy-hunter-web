import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useApi } from "@/api/ApiProvider";
import { api, queryKeys } from "@/api/endpoints";
import type { Hunt } from "@/api/schemas";

/** Enquanto um sync do jogo roda (ou o roadmap está sendo gerado), acompanha de perto. */
const LIVE_POLL_MS = 4000;

export function useHunt(gameId: string) {
  const client = useApi();
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.hunt(gameId),
    queryFn: () => api.hunt(client, gameId),
    refetchInterval: (q) => {
      const d = q.state.data;
      return d && (d.syncing || d.roadmap === "pending" || d.roadmap === "running") ? LIVE_POLL_MS : false;
    },
  });
  // Sync acabou: troféus novos → recarrega o jogo e já mostra o aviso (toast/cerimônia) sem esperar.
  const wasSyncing = useRef(false);
  const syncing = query.data?.syncing ?? false;
  useEffect(() => {
    if (wasSyncing.current && !syncing) {
      void qc.invalidateQueries({ queryKey: queryKeys.game(gameId), exact: true });
      void qc.invalidateQueries({ queryKey: queryKeys.unlocks });
    }
    wasSyncing.current = syncing;
  }, [syncing, gameId, qc]);
  return query;
}

/** Marca/desmarca etapa, otimista (o checkbox responde na hora). */
export function useSetHuntStage(gameId: string) {
  const client = useApi();
  const qc = useQueryClient();
  const key = queryKeys.hunt(gameId);
  return useMutation({
    mutationFn: ({ index, done }: { index: number; done: boolean }) => api.setHuntStage(client, gameId, index, done),
    onMutate: async ({ index, done }) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Hunt>(key);
      qc.setQueryData<Hunt>(key, (h) => h && { ...h, stages: h.stages.map((s) => (s.index === index ? { ...s, done } : s)) });
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(key, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
}

/** Sincroniza só este jogo; o hunt passa a acompanhar (syncing) até terminar. */
export function useSyncThisGame(gameId: string) {
  const client = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.syncGame(client, gameId),
    onSuccess: () => {
      qc.setQueryData<Hunt>(queryKeys.hunt(gameId), (h) => h && { ...h, syncing: true });
      void qc.invalidateQueries({ queryKey: queryKeys.hunt(gameId) });
    },
  });
}
