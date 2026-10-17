import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/api/ApiProvider";
import { api, queryKeys } from "@/api/endpoints";

/** Log de execuções de sync (GET /sync-runs). */
export function useSyncRuns(limit = 50) {
  const client = useApi();
  return useQuery({
    queryKey: queryKeys.syncRuns({ limit }),
    queryFn: () => api.syncRuns(client, { limit }),
    refetchInterval: 15_000,
  });
}
