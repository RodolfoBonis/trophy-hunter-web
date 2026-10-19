import { lazy } from "react";
import { createBrowserRouter, Outlet, type RouteObject } from "react-router";
import { ApiProvider } from "@/api/ApiProvider";
import { API_ERROR, isApiError } from "@/api/errors";
import { useSession } from "@/auth/session";
import { AppShell } from "@/layout/AppShell";
import { dashboardRoutes } from "@/features/dashboard/routes";
import { gameRoutes } from "@/features/game/routes";
import { integrationsRoutes } from "@/features/integrations/routes";
import { membersRoutes } from "@/features/members/routes";
import { socialRoutes } from "@/features/social/routes";
import { useMe } from "@/features/members/queries";
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
  RemovedScreen,
} from "./screens";

const InviteScreen = lazy(() => import("@/features/members/InviteScreen"));

/** `/convite/:code` — dentro do AuthGate (precisa de login) e fora do MemberGate (ainda sem acesso). */
export const inviteRoute: RouteObject = { path: "convite/:code", element: <InviteScreen /> };

/** Guard 1: sessão do Keycloak. Só então monta a API (o `/convite/:code` fica logo abaixo). */
export function AuthGate() {
  const session = useSession();
  if (session.status === "loading") return <SessionLoadingScreen />;
  if (session.status === "error")
    return <SessionErrorScreen error={session.error} />;
  return (
    <ApiProvider>
      <Outlet />
    </ApiProvider>
  );
}

/**
 * Guard 2: membro do app. Quem decide é o `/me` da API (convite aceito), não o IdP — o realm aceita
 * cadastro livre. pending → "peça um convite"; removed → "acesso removido".
 */
export function MemberGate() {
  const me = useMe();
  const err = me.error;
  // Dados em cache vencem um refetch que falhou por rede/5xx (voltar para a aba não derruba o app);
  // um 403 é resposta de verdade sobre o acesso e vence o cache.
  const denied = isApiError(err) && err.status === 403;
  if (me.data && !denied) {
    if (me.data.status === "removed") return <RemovedScreen />;
    if (me.data.status !== "active") return <NoAccessScreen />;
    return <Outlet />;
  }
  if (me.isPending) return <SessionLoadingScreen message="Carregando o seu perfil" />;
  if (isApiError(err) && err.code === API_ERROR.memberRemoved) return <RemovedScreen />;
  if (isApiError(err) && err.status === 403) return <NoAccessScreen />;
  return <SessionErrorScreen error={err ?? new Error("Não foi possível carregar o seu perfil.")} />;
}

export const appRoutes: RouteObject[] = [
  {
    element: <AuthGate />,
    children: [
      inviteRoute,
      {
        element: <MemberGate />,
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
                  ...membersRoutes,
              ...socialRoutes,
                  { path: "*", element: <NotFoundScreen /> },
                ],
              },
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
