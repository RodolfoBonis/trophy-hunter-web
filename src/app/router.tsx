import { createBrowserRouter, Outlet, type RouteObject } from "react-router";
import { ApiProvider } from "@/api/ApiProvider";
import { useSession } from "@/auth/session";
import { AppShell } from "@/layout/AppShell";
import { dashboardRoutes } from "@/features/dashboard/routes";
import { gameRoutes } from "@/features/game/routes";
import { integrationsRoutes } from "@/features/integrations/routes";
import { libraryRoutes } from "@/features/library/routes";
import { nextPlatinumRoutes } from "@/features/next-platinum/routes";
import { syncLogRoutes } from "@/features/sync-log/routes";
import { timelineRoutes } from "@/features/timeline/routes";
import {
  NotFoundScreen,
  RouteErrorScreen,
  SessionErrorScreen,
  SessionLoadingScreen,
  NoAccessScreen,
} from "./screens";

/** Guard: sessão do Keycloak + realm role trophy-hunter-user. Só então monta a API e o chrome. */
export function AuthGate() {
  const session = useSession();
  if (session.status === "loading") return <SessionLoadingScreen />;
  if (session.status === "error") return <SessionErrorScreen error={session.error} />;
  if (!session.hasAccess) return <NoAccessScreen />;
  return (
    <ApiProvider>
      <Outlet />
    </ApiProvider>
  );
}

export const appRoutes: RouteObject[] = [
  {
    element: <AuthGate />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            // Rota sem path: erros de uma tela aparecem dentro do chrome (sidebar/topbar continuam).
            errorElement: <RouteErrorScreen />,
            children: [
              ...dashboardRoutes,
              ...libraryRoutes,
              ...gameRoutes,
              ...nextPlatinumRoutes,
              ...timelineRoutes,
              ...integrationsRoutes,
              ...syncLogRoutes,
              { path: "*", element: <NotFoundScreen /> },
            ],
          },
        ],
      },
    ],
  },
];

export function createAppRouter() {
  return createBrowserRouter(appRoutes);
}
