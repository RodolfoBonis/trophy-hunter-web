import { useQuery } from "@tanstack/react-query";
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
