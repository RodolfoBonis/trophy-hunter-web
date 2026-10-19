import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/api/ApiProvider";
import { api, queryKeys } from "@/api/endpoints";
import type { CatalogItem, WishlistItem } from "@/api/schemas";

export function useWishlist() {
  const client = useApi();
  return useQuery({ queryKey: queryKeys.wishlist, queryFn: () => api.wishlist(client) });
}

/** Busca nas lojas (≥ 2 caracteres). */
export function useCatalogSearch(term: string) {
  const client = useApi();
  return useQuery({
    queryKey: queryKeys.catalog(term),
    queryFn: ({ signal }) => api.catalogSearch(client, term, signal),
    enabled: term.length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
  });
}

export function useAddWishlist() {
  const client = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (it: CatalogItem) => api.addWishlist(client, { platform: it.platform, store_id: it.store_id, title: it.title, cover: it.cover }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.wishlist }),
  });
}

export function useSetWishlistTarget() {
  const client = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, target }: { id: string; target: number | null }) => api.setWishlistTarget(client, id, target),
    onMutate: ({ id, target }) => {
      qc.setQueryData<{ items: WishlistItem[] }>(queryKeys.wishlist, (d) =>
        d && { items: d.items.map((i) => (i.id === id ? { ...i, target_price_cents: target } : i)) },
      );
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.wishlist }),
  });
}

export function useDeleteWishlist() {
  const client = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteWishlist(client, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.wishlist }),
  });
}
