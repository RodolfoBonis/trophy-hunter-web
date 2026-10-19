import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/api/ApiProvider";
import { api, queryKeys } from "@/api/endpoints";

export function useMyBadges() {
  const client = useApi();
  return useQuery({ queryKey: queryKeys.myBadges, queryFn: () => api.myBadges(client), staleTime: 60_000 });
}

export function useFriendBadges(id: string) {
  const client = useApi();
  return useQuery({ queryKey: queryKeys.friendBadges(id), queryFn: () => api.friendBadges(client, id), staleTime: 60_000 });
}
