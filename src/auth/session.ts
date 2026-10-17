import { createContext, useContext } from "react";
import { z } from "zod";

/** Realm role exigida pela API (claim `realm_access.roles`). Sem ela: tela "sem acesso". */
export const APP_ROLE = "trophy-hunter-user";

export interface SessionUser {
  sub: string;
  name: string;
  firstName: string;
  email: string;
  roles: string[];
}

export type Session =
  | { status: "loading" }
  | { status: "error"; error: Error }
  | {
      status: "authenticated";
      user: SessionUser;
      hasAccess: boolean;
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

const accessTokenClaims = z.object({
  sub: z.string().optional(),
  realm_access: z.object({ roles: z.array(z.string()) }).optional(),
});

/** Lê os papéis de realm do access token (o mesmo claim que a API valida). Nunca lança. */
export function rolesFromAccessToken(token: string | undefined): string[] {
  if (!token) return [];
  const payload = token.split(".")[1];
  if (!payload) return [];
  try {
    const json = JSON.parse(decodeBase64Url(payload)) as unknown;
    return accessTokenClaims.parse(json).realm_access?.roles ?? [];
  } catch {
    return [];
  }
}

function decodeBase64Url(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function firstNameOf(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}
