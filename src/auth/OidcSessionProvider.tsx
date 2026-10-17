import { InMemoryWebStorage, WebStorageStateStore, type User } from "oidc-client-ts";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AuthProvider, hasAuthParams, useAuth, type AuthProviderProps } from "react-oidc-context";
import type { AppConfig } from "@/config/env";
import { addBreadcrumb, reportError } from "@/lib/observability";
import {
  canRedirectToLogin,
  clearLoginRedirectMark,
  isSessionEndedError,
  markLoginRedirect,
  singleFlight,
} from "./redirectGuard";
import { currentReturnTo, safeReturnTo } from "./returnTo";
import { APP_ROLE, SessionContext, firstNameOf, rolesFromAccessToken, type Session } from "./session";

/** Volta para a rota pedida antes do login (só mesmo origin) e limpa ?code&state da URL. */
export function handleSigninCallback(user: User | undefined): void {
  const state = user?.state as { returnTo?: unknown } | undefined;
  window.history.replaceState({}, document.title, safeReturnTo(state?.returnTo));
}

/**
 * Login via Keycloak (realm platform, client público `trophy-hunter-web`): Authorization Code + PKCE
 * S256, renovação silenciosa via refresh token e logout no end-session. O app não tem tela de login
 * própria — o tema do Keycloak cuida disso.
 *
 * DECISÃO — tokens em memória (`InMemoryWebStorage`): nem access nem refresh token tocam o disco
 * (sessionStorage/localStorage), reduzindo a superfície para XSS. Trade-off: ao recarregar a aba os
 * tokens somem e não há `signinSilent` possível; então o efeito abaixo manda para o Keycloak, que —
 * com a sessão SSO ainda válida no cookie — redireciona de volta na hora, sem pedir login. Dentro da
 * vida da aba, o `automaticSilentRenew` usa o refresh token (em memória) normalmente.
 */
export function OidcSessionProvider({ config, children }: { config: AppConfig; children: ReactNode }) {
  const oidcConfig = useMemo<AuthProviderProps>(() => {
    const origin = window.location.origin;
    return {
      authority: config.oidcAuthority,
      client_id: config.oidcClientId,
      redirect_uri: `${origin}/`,
      post_logout_redirect_uri: `${origin}/`,
      scope: config.oidcScope,
      response_type: "code",
      automaticSilentRenew: true,
      // Tokens só em memória (ver docstring acima).
      userStore: new WebStorageStateStore({ store: new InMemoryWebStorage() }),
      onSigninCallback: handleSigninCallback,
    };
  }, [config.oidcAuthority, config.oidcClientId, config.oidcScope]);

  return (
    <AuthProvider {...oidcConfig}>
      <OidcSessionBridge>{children}</OidcSessionBridge>
    </AuthProvider>
  );
}

function OidcSessionBridge({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const redirecting = useRef(false);
  const authRef = useRef(auth);
  authRef.current = auth;
  const tokenRef = useRef<string | undefined>(auth.user?.access_token);
  tokenRef.current = auth.user?.access_token ?? tokenRef.current;
  const [loopError, setLoopError] = useState<Error>();

  /** Vai para o Keycloak; se o redirect falhar (ex.: discovery fora), libera nova tentativa. */
  const redirectToLogin = useCallback((returnTo: string = currentReturnTo()) => {
    if (redirecting.current) return;
    redirecting.current = true;
    authRef.current.signinRedirect({ state: { returnTo } }).catch((error: unknown) => {
      redirecting.current = false;
      reportError(error, { auth: "signin_redirect" });
    });
  }, []);

  // Sem sessão → manda direto pro Keycloak (sem tela intermediária).
  useEffect(() => {
    if (hasAuthParams() || auth.isAuthenticated || auth.activeNavigator || auth.isLoading || auth.error) return;
    redirectToLogin();
  }, [auth, redirectToLogin]);

  // Renovação silenciosa falhou: só vale novo login se a sessão do Keycloak acabou de fato.
  useEffect(() => {
    return auth.events.addSilentRenewError((error) => {
      addBreadcrumb({ category: "auth", level: "warning", message: `silent renew failed: ${error.message}` });
      if (isSessionEndedError(error)) redirectToLogin();
    });
  }, [auth, redirectToLogin]);

  /** Um único singleFlight para a vida do provider: nunca há dois signinSilent em paralelo. */
  const renewSilently = useMemo(
    () =>
      singleFlight(async () => {
        try {
          const user = await authRef.current.signinSilent();
          if (user?.access_token) tokenRef.current = user.access_token;
          return Boolean(user?.access_token);
        } catch {
          return false;
        }
      }),
    [],
  );

  /** 401 da API sem renovação possível: login com trava anti-loop (1 por 30s). */
  const loginAfterUnauthorized = useCallback(() => {
    if (!canRedirectToLogin()) {
      setLoopError(new Error("A sessão não foi aceita pela API. Tente entrar de novo em instantes."));
      return;
    }
    markLoginRedirect();
    redirectToLogin();
  }, [redirectToLogin]);

  const session = useMemo<Session>(() => {
    if (loopError) return { status: "error", error: loopError };
    if (auth.error) return { status: "error", error: auth.error };
    if (!auth.isAuthenticated || !auth.user) return { status: "loading" };
    const profile = auth.user.profile;
    const name = profile.name ?? profile.preferred_username ?? profile.email ?? "Jogador";
    const roles = rolesFromAccessToken(auth.user.access_token);
    const user = {
      sub: profile.sub,
      name,
      firstName: profile.given_name ?? firstNameOf(name),
      email: profile.email ?? "",
      roles,
    };
    return {
      status: "authenticated",
      user,
      hasAccess: roles.includes(APP_ROLE),
      getAccessToken: () => tokenRef.current,
      signOut: async () => {
        clearLoginRedirectMark();
        try {
          await auth.signoutRedirect({ id_token_hint: auth.user?.id_token });
        } catch {
          await auth.removeUser();
          window.location.assign("/");
        }
      },
      handleUnauthorized: async () => {
        if (await renewSilently()) return true;
        loginAfterUnauthorized();
        return false;
      },
    };
  }, [auth, loopError, loginAfterUnauthorized, renewSilently]);

  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}
