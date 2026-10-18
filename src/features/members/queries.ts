import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/api/ApiProvider";
import { api, queryKeys } from "@/api/endpoints";
import type { User } from "@/api/schemas";

/** Usuário do app (`/me`): papel e status vêm da API — é o que decide o acesso, não o IdP. */
export function useMe() {
  const client = useApi();
  return useQuery({ queryKey: queryKeys.me, queryFn: () => api.me(client), staleTime: 5 * 60_000 });
}

export function useIsOwner(): boolean {
  return useMe().data?.role === "owner";
}

export function useAcceptInvite() {
  const client = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => api.acceptInvite(client, code),
    onSuccess: (user: User) => qc.setQueryData(queryKeys.me, user),
  });
}

export function useInvites() {
  const client = useApi();
  return useQuery({ queryKey: queryKeys.invites, queryFn: () => api.invites(client) });
}

export function useCreateInvite() {
  const client = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.createInvite(client),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.invites }),
  });
}

export function useRevokeInvite() {
  const client = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.revokeInvite(client, id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.invites }),
  });
}

export function useMembers() {
  const client = useApi();
  return useQuery({ queryKey: queryKeys.members, queryFn: () => api.members(client) });
}

export function useRemoveMember() {
  const client = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, purge }: { id: string; purge: boolean }) => api.removeMember(client, id, purge),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.members }),
  });
}
