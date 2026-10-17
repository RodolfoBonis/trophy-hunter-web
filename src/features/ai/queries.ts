import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/api/ApiProvider";
import { api, queryKeys } from "@/api/endpoints";
import type { AIGuide, ChatThread } from "@/api/schemas";

/** Guia de IA do troféu (null = ainda não gerado). */
export function useTrophyGuide(trophyId: string, enabled = true) {
  const client = useApi();
  return useQuery({
    queryKey: queryKeys.trophyGuide(trophyId),
    queryFn: () => api.trophyGuide(client, trophyId).then((r) => r.guide),
    enabled,
  });
}

export function useGenerateTrophyGuide(trophyId: string) {
  const client = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.generateTrophyGuide(client, trophyId),
    onSuccess: (guide) =>
      qc.setQueryData<AIGuide | null>(queryKeys.trophyGuide(trophyId), guide),
  });
}

/** Roadmap de platina/100% do jogo (null = ainda não gerado). */
export function useRoadmap(gameId: string) {
  const client = useApi();
  return useQuery({
    queryKey: queryKeys.roadmap(gameId),
    queryFn: () => api.roadmap(client, gameId).then((r) => r.guide),
  });
}

export function useGenerateRoadmap(gameId: string) {
  const client = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.generateRoadmap(client, gameId),
    onSuccess: (guide) =>
      qc.setQueryData<AIGuide | null>(queryKeys.roadmap(gameId), guide),
  });
}

/** Grava (ou desfaz, com null) a correção do usuário num guia. */
export function useEditGuide(queryKey: readonly unknown[]) {
  const client = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: unknown }) =>
      api.editGuide(client, id, content),
    onSuccess: (guide) => qc.setQueryData<AIGuide | null>(queryKey, guide),
  });
}

export function useChat(gameId: string) {
  const client = useApi();
  return useQuery({
    queryKey: queryKeys.chat(gameId),
    queryFn: () => api.chat(client, gameId),
  });
}

export function useSendChat(gameId: string) {
  const client = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (message: string) => api.sendChat(client, gameId, message),
    onSuccess: ({ user, assistant }) =>
      qc.setQueryData<ChatThread>(queryKeys.chat(gameId), (prev) => ({
        messages: [...(prev?.messages ?? []), user, assistant],
      })),
  });
}

export function useResetChat(gameId: string) {
  const client = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.resetChat(client, gameId),
    onSuccess: () =>
      qc.setQueryData<ChatThread>(queryKeys.chat(gameId), { messages: [] }),
  });
}
