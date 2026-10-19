import { useMutation } from "@tanstack/react-query";
import { useApi } from "@/api/ApiProvider";
import { api } from "@/api/endpoints";

export function useExportMyData() {
  const client = useApi();
  return useMutation({ mutationFn: () => api.exportMe(client) });
}

export function useDeleteMyAccount() {
  const client = useApi();
  return useMutation({ mutationFn: () => api.deleteMe(client) });
}
