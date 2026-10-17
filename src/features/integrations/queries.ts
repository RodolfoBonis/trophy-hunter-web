import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/api/ApiProvider";
import { api, queryKeys } from "@/api/endpoints";
import type { Platform } from "@/api/schemas";

export function useIntegrations() {
  const client = useApi();
  return useQuery({
    queryKey: queryKeys.integrations,
    queryFn: () => api.integrations(client),
  });
}

export function useConnectSteam() {
  const client = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { api_key: string; steam_id_or_vanity: string }) => api.connectSteam(client, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.integrations }),
  });
}

export function useSyncNow() {
  const client = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (platform: Platform) => api.syncPlatform(client, platform),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.integrations });
      void qc.invalidateQueries({ queryKey: ["sync-runs"] });
    },
  });
}
