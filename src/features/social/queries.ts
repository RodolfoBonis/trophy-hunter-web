import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/api/ApiProvider";
import { api, queryKeys, type GamesQuery } from "@/api/endpoints";
import type { LeaderboardPeriod, User } from "@/api/schemas";
import { useMe } from "@/features/members/queries";

/** A pessoa compartilha o progresso? (opt-in; sem isso não vê os amigos — recíproco). */
export function useSharing(): boolean {
  return useMe().data?.share_progress ?? false;
}

export function useSetSharing() {
  const client = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (share: boolean) => api.setSharing(client, share),
    onSuccess: (user: User) => {
      qc.setQueryData(queryKeys.me, user);
      void qc.invalidateQueries({ queryKey: ["social"] });
    },
  });
}

export function useLeaderboard(period: LeaderboardPeriod, enabled = true) {
  const client = useApi();
  return useQuery({
    queryKey: queryKeys.leaderboard(period),
    queryFn: () => api.leaderboard(client, period),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useFeed(enabled = true, limit = 30) {
  const client = useApi();
  return useInfiniteQuery({
    queryKey: [...queryKeys.feed, limit],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) => api.feed(client, { cursor: pageParam, limit }, signal),
    getNextPageParam: (last) => last.next_cursor ?? undefined,
    enabled,
  });
}

export function useFriend(id: string) {
  const client = useApi();
  return useQuery({ queryKey: queryKeys.friend(id), queryFn: () => api.friend(client, id) });
}

export function useFriendGames(id: string, params: GamesQuery) {
  const client = useApi();
  return useQuery({
    queryKey: queryKeys.friendGames(id, params),
    queryFn: ({ signal }) => api.friendGames(client, id, params, signal),
    placeholderData: keepPreviousData,
  });
}

export function useGameFriends(gameId: string) {
  const client = useApi();
  return useQuery({ queryKey: queryKeys.gameFriends(gameId), queryFn: () => api.gameFriends(client, gameId) });
}
