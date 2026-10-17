import { useMemo, type ReactNode } from "react";
import { hasScenario } from "@/mocks/scenario";
import { APP_ROLE, SessionContext, type AuthenticatedSession, type Session } from "./session";

/**
 * Sessão fake para `--mode mock` (dev sem Keycloak e e2e). Só é importado dinamicamente quando
 * VITE_AUTH_MODE=mock, então não entra no bundle de produção.
 * Cenário `no-access` simula um usuário sem a realm role trophy-hunter-user.
 */
export function MockSessionProvider({
  children,
  overrides,
}: {
  children: ReactNode;
  /** Testes: troca ações da sessão (ex.: espiar signOut). */
  overrides?: Partial<AuthenticatedSession>;
}) {
  const session = useMemo<Session>(() => {
    const noAccess = hasScenario("no-access");
    const roles = noAccess ? ["offline_access"] : ["offline_access", APP_ROLE];
    return {
      status: "authenticated",
      user: {
        sub: "mock-user",
        name: "Rodolfo de Bonis",
        firstName: "Rodolfo",
        email: "rodolfo@rb.lab",
        roles,
      },
      hasAccess: !noAccess,
      getAccessToken: () => "mock-access-token",
      signOut: async () => {
        window.location.assign("/");
      },
      handleUnauthorized: async () => false,
      ...overrides,
    } as Session;
  }, [overrides]);
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}
