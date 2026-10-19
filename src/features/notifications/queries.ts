import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/api/ApiProvider";
import { api, queryKeys } from "@/api/endpoints";
import type { NotificationPreferences } from "@/api/schemas";
import * as browserPush from "./browserPush";

export function usePushStatus() {
  const client = useApi();
  return useQuery({
    queryKey: queryKeys.pushStatus,
    queryFn: () => api.pushStatus(client),
  });
}

/**
 * Este navegador está inscrito? (consulta o pushManager local). null = não deu para saber agora
 * (service worker ainda não ativo) — tratado como "não inscrito" e sem virar erro reportado.
 */
export function useLocalSubscription(enabled: boolean) {
  return useQuery({
    queryKey: ["push", "local"],
    queryFn: async (): Promise<boolean | null> => {
      try {
        return (await browserPush.currentSubscription()) !== null;
      } catch (e) {
        if (e instanceof browserPush.ServiceWorkerUnavailableError) return null;
        throw e;
      }
    },
    enabled,
    retry: false,
  });
}

export function useEnablePush() {
  const client = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (publicKey: string) => {
      const sub = await browserPush.subscribe(publicKey);
      await api.subscribePush(client, sub);
    },
    onSettled: () => void qc.invalidateQueries({ queryKey: ["push"] }),
  });
}

export function useDisablePush() {
  const client = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const endpoint = await browserPush.unsubscribe();
      if (endpoint) await api.unsubscribePush(client, endpoint);
    },
    onSettled: () => void qc.invalidateQueries({ queryKey: ["push"] }),
  });
}

export function useTestPush() {
  const client = useApi();
  return useMutation({ mutationFn: () => api.testPush(client) });
}

export function useNotificationPrefs() {
  const client = useApi();
  return useQuery({
    queryKey: queryKeys.notificationPrefs,
    queryFn: () => api.notificationPrefs(client),
  });
}

export function useSaveNotificationPrefs() {
  const client = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (prefs: NotificationPreferences) =>
      api.saveNotificationPrefs(client, prefs),
    onMutate: (prefs) => qc.setQueryData(queryKeys.notificationPrefs, prefs),
    onSettled: () =>
      void qc.invalidateQueries({ queryKey: queryKeys.notificationPrefs }),
  });
}
