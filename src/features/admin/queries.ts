import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/api/ApiProvider";
import { api, queryKeys } from "@/api/endpoints";

/** Painel do dono: atualiza sozinho a cada minuto enquanto aberto. */
export function useAdminHealth() {
  const client = useApi();
  return useQuery({ queryKey: queryKeys.adminHealth, queryFn: () => api.adminHealth(client), refetchInterval: 60_000 });
}

export function useRetryJob() {
  const client = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.retryJob(client, id),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.adminHealth }),
  });
}

export function useAdminSync() {
  const client = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.adminSyncIntegration(client, id),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.adminHealth }),
  });
}
