import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/api/ApiProvider";
import { api, queryKeys } from "@/api/endpoints";
import type { ConnectSteamRequest } from "@/api/schemas";

export function useIntegrations() {
  const client = useApi();
  return useQuery({
    queryKey: queryKeys.integrations,
    queryFn: () => api.integrations(client),
  });
}

/**
 * Últimos runs de sync (para mostrar o progresso ao vivo por integração). Faz poll a cada 3s
 * APENAS enquanto houver um run rodando; senão não re-busca (economiza requisições).
 */
export function useLatestRuns() {
  const client = useApi();
  return useQuery({
    queryKey: ["sync-runs", "latest"],
    queryFn: () => api.syncRuns(client, { limit: 20 }),
    refetchInterval: (q) => (q.state.data?.some((r) => r.status === "running") ? 3000 : false),
  });
}

export function useConnectSteam() {
  const client = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ConnectSteamRequest) => api.connectSteam(client, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.integrations });
      void qc.invalidateQueries({ queryKey: ["sync-runs"] });
    },
  });
}

/** Renomeia a conta (apelido). */
export function useRenameIntegration() {
  const client = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, label }: { id: string; label: string }) => api.updateIntegration(client, id, { label }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.integrations });
      void qc.invalidateQueries({ queryKey: ["games"] });
      void qc.invalidateQueries({ queryKey: ["game"] });
    },
  });
}

/** Remove a conta (e, na API, os jogos dela). */
export function useRemoveIntegration() {
  const client = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteIntegration(client, id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.integrations });
      void qc.invalidateQueries({ queryKey: ["games"] });
      void qc.invalidateQueries({ queryKey: ["sync-runs"] });
    },
  });
}

export function useSyncNow() {
  const client = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (integrationId: string) => api.syncIntegration(client, integrationId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.integrations });
      void qc.invalidateQueries({ queryKey: ["sync-runs"] });
    },
  });
}

function useInvalidateAccounts() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: queryKeys.integrations });
    void qc.invalidateQueries({ queryKey: ["sync-runs"] });
  };
}

/** Conecta uma conta PSN pelo NPSSO. */
export function useConnectPSN() {
  const client = useApi();
  const invalidate = useInvalidateAccounts();
  return useMutation({
    mutationFn: (body: { label?: string; npsso: string }) => api.connectPSN(client, body),
    onSuccess: invalidate,
  });
}

/** Reconecta uma conta PSN expirada (NPSSO novo). */
export function useReconnect() {
  const client = useApi();
  const invalidate = useInvalidateAccounts();
  return useMutation({
    mutationFn: ({ id, npsso }: { id: string; npsso: string }) => api.reconnectIntegration(client, id, npsso),
    onSuccess: invalidate,
  });
}
