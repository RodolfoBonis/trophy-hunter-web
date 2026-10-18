import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/api/ApiProvider";
import { api, queryKeys } from "@/api/endpoints";

/** Desbloqueios ainda não exibidos. Verifica a cada minuto e ao voltar para a aba. */
export function useUnseenUnlocks() {
  const client = useApi();
  return useQuery({
    queryKey: queryKeys.unlocks,
    queryFn: () => api.unseenUnlocks(client),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}

/** Marca avisos como exibidos; a lista e os dados de progresso são revalidados. */
export function useMarkUnlocksSeen() {
  const client = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => api.markUnlocksSeen(client, ids),
    onSuccess: () => {
      for (const key of [
        queryKeys.unlocks,
        queryKeys.stats,
        ["games"],
        ["game"],
        queryKeys.timeline,
      ])
        void qc.invalidateQueries({ queryKey: key });
    },
  });
}
