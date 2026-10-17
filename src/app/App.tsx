import { QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense, useState, type ReactNode } from "react";
import { RouterProvider } from "react-router";
import { OidcSessionProvider } from "@/auth/OidcSessionProvider";
import type { AppConfig } from "@/config/env";
import { ErrorBoundary } from "./ErrorBoundary";
import { createQueryClient } from "./queryClient";
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

export function App({ config }: { config: AppConfig }) {
  const [queryClient] = useState(createQueryClient);
  const [router] = useState(createAppRouter);
  return (
    <ErrorBoundary fallback={(reset) => <CrashScreen onRetry={reset} />}>
      <SessionProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}
