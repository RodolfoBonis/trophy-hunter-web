import { createContext, useContext } from "react";
export interface SessionUser {
  sub: string;
  name: string;
  firstName: string;
  email: string;
}

export type Session =
  | { status: "loading" }
  | { status: "error"; error: Error }
  | {
      status: "authenticated";
      user: SessionUser;
      /** Access token atual (renovado em silêncio pelo provider). */
      getAccessToken: () => string | undefined;
      signOut: () => Promise<void>;
      /**
       * 401 da API: tenta renovar o token em silêncio (uma vez, deduplicado). `true` = pode
       * repetir a requisição; `false` = vai para o login (ou tela de erro, se em loop).
       */
      handleUnauthorized: () => Promise<boolean>;
    };

export type AuthenticatedSession = Extract<Session, { status: "authenticated" }>;

export const SessionContext = createContext<Session>({ status: "loading" });

export function useSession(): Session {
  return useContext(SessionContext);
}

/** Para telas dentro do guard: a sessão já é garantidamente autenticada. */
export function useAuthenticatedSession(): AuthenticatedSession {
  const session = useSession();
  if (session.status !== "authenticated") {
    throw new Error("useAuthenticatedSession usado fora do guard de autenticação");
  }
  return session;
}

export function firstNameOf(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}
