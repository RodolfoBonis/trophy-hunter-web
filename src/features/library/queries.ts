import { useInfiniteQuery } from "@tanstack/react-query";
import { useApi } from "@/api/ApiProvider";
import { api, queryKeys, type GamesQuery } from "@/api/endpoints";

/** Tamanho da página da biblioteca (rolagem infinita). */
export const LIBRARY_PAGE_SIZE = 60;

/**
 * Biblioteca de jogos (GET /games) com rolagem infinita sobre limit/offset. Filtros mudam a chave da
 * query, então voltam à 1ª página sozinhos.
 */
export function useLibrary(filters: Omit<GamesQuery, "limit" | "offset">) {
  const client = useApi();
  return useInfiniteQuery({
    queryKey: queryKeys.games({ ...filters, infinite: true }),
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      api.games(client, { ...filters, limit: LIBRARY_PAGE_SIZE, offset: pageParam }, signal),
    getNextPageParam: (last) => {
      const next = last.offset + last.items.length;
      return last.items.length > 0 && next < last.total ? next : undefined;
    },
  });
}
