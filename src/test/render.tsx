import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderResult } from "@testing-library/react";
import { Suspense, type ReactNode } from "react";
import { createMemoryRouter, RouterProvider, type RouteObject } from "react-router";
import { ApiProvider } from "@/api/ApiProvider";
import { MockSessionProvider } from "@/auth/MockSessionProvider";
import type { AuthenticatedSession } from "@/auth/session";

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } },
  });
}

function Providers({
  children,
  client,
  session,
}: {
  children: ReactNode;
  client: QueryClient;
  session?: Partial<AuthenticatedSession>;
}) {
  return (
    <MockSessionProvider overrides={session}>
      <QueryClientProvider client={client}>
        <ApiProvider>{children}</ApiProvider>
      </QueryClientProvider>
    </MockSessionProvider>
  );
}

interface RenderRouteOptions {
  routes: RouteObject[];
  path: string;
  session?: Partial<AuthenticatedSession>;
}

/** Renderiza rotas reais com sessão mock e API (MSW) — para testes de componente/fluxo. */
export function renderRoutes({ routes, path, session }: RenderRouteOptions): RenderResult & { client: QueryClient } {
  const client = createTestQueryClient();
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const result = render(
    <Providers client={client} session={session}>
      <Suspense fallback={null}>
        <RouterProvider router={router} />
      </Suspense>
    </Providers>,
  );
  return { ...result, client };
}
