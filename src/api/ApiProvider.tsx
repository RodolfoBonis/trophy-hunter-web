import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useAuthenticatedSession } from "@/auth/session";
import { getConfig } from "@/config/env";
import { ApiClient } from "./client";

const ApiContext = createContext<ApiClient | null>(null);

/** Disponibiliza o `ApiClient` autenticado com a sessão atual. */
export function ApiProvider({ children, client }: { children: ReactNode; client?: ApiClient }) {
  const session = useAuthenticatedSession();
  const value = useMemo(
    () =>
      client ??
      new ApiClient({
        baseUrl: getConfig().apiBase,
        getAccessToken: session.getAccessToken,
        onUnauthorized: session.handleUnauthorized,
      }),
    [client, session],
  );
  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useApi(): ApiClient {
  const client = useContext(ApiContext);
  if (!client) throw new Error("useApi usado fora do ApiProvider");
  return client;
}
