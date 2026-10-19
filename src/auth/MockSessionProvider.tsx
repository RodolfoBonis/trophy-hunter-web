import { useMemo, type ReactNode } from "react";
import { SessionContext, type AuthenticatedSession, type Session } from "./session";

/**
 * Sessão fake para `--mode mock` (dev sem Keycloak e e2e). Só é importado dinamicamente quando
 * VITE_AUTH_MODE=mock, então não entra no bundle de produção.
 * Quem decide o acesso é o `/me` da API (cenários `no-access`/`member-removed`/`member` no mock).
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
    return {
      status: "authenticated",
      user: {
        sub: "mock-user",
        name: "Rodolfo de Bonis",
        firstName: "Rodolfo",
        email: "rodolfo@rb.lab",
      },
      getAccessToken: () => "mock-access-token",
      signOut: async (opts?: { redirectTo?: string }) => {
        window.location.assign(opts?.redirectTo ?? "/");
      },
      handleUnauthorized: async () => false,
      ...overrides,
    } as Session;
  }, [overrides]);
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}
