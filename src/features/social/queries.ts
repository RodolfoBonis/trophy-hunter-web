import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/api/ApiProvider";
import { api, queryKeys, type GamesQuery } from "@/api/endpoints";
import type { CreateChallengeRequest, LeaderboardPeriod, User } from "@/api/schemas";
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

/* ── Desafios e comparação ──────────────────────────────────────────────────────────────── */

export function useChallenges(enabled = true) {
  const client = useApi();
  return useQuery({ queryKey: queryKeys.challenges, queryFn: () => api.challenges(client), enabled });
}

export function useChallenge(id: string) {
  const client = useApi();
  return useQuery({ queryKey: queryKeys.challenge(id), queryFn: () => api.challenge(client, id), refetchInterval: 60_000 });
}

export function useCreateChallenge() {
  const client = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateChallengeRequest) => api.createChallenge(client, body),
    onSuccess: (c) => {
      qc.setQueryData(queryKeys.challenge(c.id), c);
      void qc.invalidateQueries({ queryKey: queryKeys.challenges });
    },
  });
}

export function useChallengeAction(id: string) {
  const client = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (action: "accept" | "decline" | "cancel") => api.challengeAction(client, id, action),
    onSuccess: (c) => {
      qc.setQueryData(queryKeys.challenge(c.id), c);
      void qc.invalidateQueries({ queryKey: queryKeys.challenges });
    },
  });
}

export function useCompare(gameId: string, friendId: string | undefined) {
  const client = useApi();
  return useQuery({
    queryKey: queryKeys.compare(gameId, friendId ?? ""),
    queryFn: () => api.compareGame(client, gameId, friendId!),
    enabled: Boolean(friendId),
  });
}
