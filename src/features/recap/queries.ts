import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useApi } from "@/api/ApiProvider";
import { api, queryKeys } from "@/api/endpoints";

export function useRecap(period: string) {
  const client = useApi();
  return useQuery({ queryKey: queryKeys.recap(period), queryFn: () => api.recap(client, period), placeholderData: keepPreviousData });
}

export function useWeeklyRecap() {
  const client = useApi();
  return useQuery({
    queryKey: queryKeys.weeklyRecap,
    queryFn: () => api.weeklyRecap(client),
    // Enquanto a IA escreve, confere a cada 10 s.
    refetchInterval: (q) => (q.state.data?.recap?.status === "pending" ? 10_000 : false),
  });
}

export function useGenerateWeeklyRecap() {
  const client = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.generateWeeklyRecap(client),
    onSuccess: (data) => qc.setQueryData(queryKeys.weeklyRecap, data),
  });
}
