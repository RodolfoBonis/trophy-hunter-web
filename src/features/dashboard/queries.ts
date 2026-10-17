import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/api/ApiProvider";
import { api, queryKeys } from "@/api/endpoints";
import type { Annotations } from "@/api/schemas";

/** Resumo do dashboard (GET /stats). */
export function useStats() {
  const client = useApi();
  return useQuery({ queryKey: queryKeys.stats, queryFn: () => api.stats(client) });
}

/** Fila Próxima Platina + "o que fazer hoje" (GET /next). */
export function useNext() {
  const client = useApi();
  return useQuery({ queryKey: queryKeys.next, queryFn: () => api.next(client) });
}

/** Alertas (perdíveis/online/dificuldade) — GET /alerts. */
export function useAlerts() {
  const client = useApi();
  return useQuery({ queryKey: queryKeys.alerts, queryFn: () => api.alerts(client) });
}

/** Linha do tempo com rolagem infinita (cursor). */
export function useTimeline() {
  const client = useApi();
  return useInfiniteQuery({
    queryKey: queryKeys.timeline,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) => api.timeline(client, { cursor: pageParam, limit: 80 }, signal),
    getNextPageParam: (last) => last.next_cursor ?? undefined,
  });
}

/** Invalida tudo que depende de marcações (fila, alertas, biblioteca, jogo, resumo). */
function useInvalidateInsights() {
  const qc = useQueryClient();
  return () => {
    for (const key of [queryKeys.next, queryKeys.alerts, queryKeys.stats, ["games"], ["game"]]) {
      void qc.invalidateQueries({ queryKey: key });
    }
  };
}

/** Marcações do jogo (abandonado, prioridade, notas, tags). */
export function usePatchGame() {
  const client = useApi();
  const invalidate = useInvalidateInsights();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Annotations }) => api.patchGame(client, id, body),
    onSuccess: invalidate,
  });
}

/** Marcações do troféu (tags, notas, prioridade, risco de servidor). */
export function usePatchTrophy() {
  const client = useApi();
  const invalidate = useInvalidateInsights();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Annotations }) => api.patchTrophy(client, id, body),
    onSuccess: invalidate,
  });
}
