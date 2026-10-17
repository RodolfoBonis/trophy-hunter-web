import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/api/ApiProvider";
import { api, queryKeys, type GamesQuery } from "@/api/endpoints";

/** Biblioteca de jogos (GET /games), com filtro opcional por plataforma/busca. */
export function useLibrary(filters: GamesQuery) {
  const client = useApi();
  return useQuery({
    queryKey: queryKeys.games(filters),
    queryFn: ({ signal }) => api.games(client, filters, signal),
  });
}
