import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { lazy, Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSession } from "@/auth/session";
import { RouterProvider } from "react-router";
import { OidcSessionProvider } from "@/auth/OidcSessionProvider";
import { Sprite } from "@/design-system/components/Sprite";
import type { AppConfig } from "@/config/env";
import { ErrorBoundary } from "./ErrorBoundary";
import { createQueryClient } from "./queryClient";
import { createQueryPersister, dropOtherUsers, PERSIST_MAX_AGE, shouldPersistQuery } from "./queryCache";
import { createAppRouter } from "./router";
import { CrashScreen } from "./screens";

// `import.meta.env.VITE_AUTH_MODE` é substituído em build: fora do modo mock o ramo (e o chunk da
// sessão fake) some do bundle de produção.
const MockSessionProvider =
  import.meta.env.VITE_AUTH_MODE === "mock"
    ? lazy(() => import("@/auth/MockSessionProvider").then((m) => ({ default: m.MockSessionProvider })))
    : null;

function SessionProvider({ config, children }: { config: AppConfig; children: ReactNode }) {
  if (MockSessionProvider && config.authMode === "mock") {
    return (
      <Suspense fallback={null}>
        <MockSessionProvider>{children}</MockSessionProvider>
      </Suspense>
    );
  }
  return <OidcSessionProvider config={config}>{children}</OidcSessionProvider>;
}

/**
 * Cache das telas salvo no navegador, por usuário (ver queryCache.ts). No modo mock não persiste:
 * dev/e2e precisam começar do zero sempre.
 */
function QueryProvider({ client, persist, children }: { client: QueryClient; persist: boolean; children: ReactNode }) {
  const session = useSession();
  const sub = persist && session.status === "authenticated" ? session.user.sub : null;
  const persister = useMemo(() => (sub ? createQueryPersister(sub) : null), [sub]);
  useEffect(() => {
    if (sub) void dropOtherUsers(sub);
  }, [sub]);
  if (!persister) return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return (
    <PersistQueryClientProvider
      client={client}
      persistOptions={{
        persister,
        maxAge: PERSIST_MAX_AGE,
        // Release nova = formato de dado pode ter mudado: descarta o cache salvo.
        buster: import.meta.env.VITE_APP_RELEASE ?? "dev",
        dehydrateOptions: { shouldDehydrateQuery: shouldPersistQuery },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}

export function App({ config }: { config: AppConfig }) {
  const [queryClient] = useState(createQueryClient);
  const [router] = useState(createAppRouter);
  return (
    <ErrorBoundary fallback={(reset) => <CrashScreen onRetry={reset} />}>
      <Sprite />
      <SessionProvider config={config}>
        <QueryProvider client={queryClient} persist={config.authMode !== "mock"}>
          <RouterProvider router={router} />
        </QueryProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}
