import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/api/ApiProvider";
import { api, queryKeys } from "@/api/endpoints";

/** Detalhe de um jogo (GET /games/:id) com grupos e troféus. */
export function useGame(id: string) {
  const client = useApi();
  return useQuery({
    queryKey: queryKeys.game(id),
    queryFn: () => api.game(client, id),
  });
}

/** Jogos da OUTRA plataforma para vincular (só busca quando o painel está aberto). */
export function useLinkCandidates(id: string, q: string, enabled: boolean) {
  const client = useApi();
  return useQuery({
    queryKey: queryKeys.linkCandidates(id, q),
    queryFn: ({ signal }) => api.linkCandidates(client, id, q, signal),
    enabled,
    placeholderData: keepPreviousData,
  });
}

/** Vincula/desvincula o jogo ao da outra plataforma; recarrega o jogo e a biblioteca. */
export function useLinkGame() {
  const client = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, otherGameId }: { id: string; otherGameId: string | null }) =>
      otherGameId ? api.linkGame(client, id, otherGameId) : api.unlinkGame(client, id),
    onSuccess: () => {
      for (const key of [["game"], ["games"], ["link-candidates"]]) void qc.invalidateQueries({ queryKey: key });
    },
  });
}
