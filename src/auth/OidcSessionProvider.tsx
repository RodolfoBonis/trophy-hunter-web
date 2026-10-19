import { InMemoryWebStorage, UserManager, WebStorageStateStore, type User } from "oidc-client-ts";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AuthProvider, hasAuthParams, useAuth } from "react-oidc-context";
import type { AppConfig } from "@/config/env";
import { addBreadcrumb, reportError } from "@/lib/observability";
import {
  canRedirectToLogin,
  clearLoginRedirectMark,
  isSessionEndedError,
  markLoginRedirect,
  singleFlight,
} from "./redirectGuard";
import { currentReturnTo, loginPromptFor, safeReturnTo } from "./returnTo";
import { SessionContext, firstNameOf, type Session } from "./session";

/**
 * Volta para a rota pedida antes do login (só mesmo origin) e limpa ?code&state da URL. O router já
 * foi montado na URL do callback ("/?code=…"): `replaceState` sozinho não o avisa — sem o `popstate`
 * a tela ficava no Início em vez de voltar para onde a pessoa estava.
 */
export function handleSigninCallback(user: User | undefined | void): void {
  const state = (user ? user.state : undefined) as { returnTo?: unknown } | undefined;
  const target = safeReturnTo(state?.returnTo);
  const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
  window.history.replaceState({ usr: null, key: "auth", idx }, document.title, target);
  window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
}

/**
 * UserManager do app. Tokens SÓ em memória (nem access nem refresh token tocam o disco — menos
 * superfície para XSS). Para não perder a sessão ao recarregar, a aba nova recupera os tokens com
 * `signinSilent` num iframe (prompt=none) usando o cookie de SSO do Keycloak — mesmo site
 * (*.rodolfodebonis.com.br), então funciona inclusive no Safari — sem sair da página atual.
 *
 * `automaticSilentRenew` fica DESLIGADO: no react-oidc-context uma falha de renovação vira erro da
 * sessão inteira (tela "Não deu para entrar"). A renovação é nossa (ver `useSessionRenewal`): refresh
 * token antes de expirar, ao voltar para a aba e ao reconectar; só vai para o login se a sessão do
 * Keycloak acabou de fato.
 */
export function createUserManager(config: AppConfig): UserManager {
  const origin = window.location.origin;
  return new UserManager({
    authority: config.oidcAuthority,
    client_id: config.oidcClientId,
    redirect_uri: `${origin}/`,
    silent_redirect_uri: `${origin}/silent-callback.html`,
    post_logout_redirect_uri: `${origin}/`,
    scope: config.oidcScope,
    response_type: "code",
    automaticSilentRenew: false,
    accessTokenExpiringNotificationTimeInSeconds: 60,
    silentRequestTimeoutInSeconds: 10,
    userStore: new WebStorageStateStore({ store: new InMemoryWebStorage() }),
  });
}

/** Login via Keycloak (realm trophy-hunter, client público `trophy-hunter-web`, Code + PKCE S256). */
export function OidcSessionProvider({ config, children }: { config: AppConfig; children: ReactNode }) {
  const [userManager] = useState(() => createUserManager(config));
  return <UserManagerSessionProvider userManager={userManager}>{children}</UserManagerSessionProvider>;
}

/** Mesmo provider com um UserManager pronto (testes injetam um falso). */
export function UserManagerSessionProvider({ userManager, children }: { userManager: UserManager; children: ReactNode }) {
  return (
    <AuthProvider userManager={userManager} onSigninCallback={handleSigninCallback}>
      <OidcSessionBridge userManager={userManager}>{children}</OidcSessionBridge>
    </AuthProvider>
  );
}

/** Renova antes de expirar o access token, e ao voltar para a aba/rede (timers dormem em segundo plano). */
function useSessionRenewal(userManager: UserManager, renew: () => Promise<boolean>) {
  useEffect(() => {
    const onExpiring = () => void renew();
    const onWake = () => {
      if (document.visibilityState !== "visible") return;
      void userManager.getUser().then((u) => {
        if (u && (u.expired || (u.expires_in ?? 0) < 90)) void renew();
      });
    };
    userManager.events.addAccessTokenExpiring(onExpiring);
    userManager.events.addAccessTokenExpired(onExpiring);
    document.addEventListener("visibilitychange", onWake);
    window.addEventListener("online", onWake);
    window.addEventListener("focus", onWake);
    return () => {
      userManager.events.removeAccessTokenExpiring(onExpiring);
      userManager.events.removeAccessTokenExpired(onExpiring);
      document.removeEventListener("visibilitychange", onWake);
      window.removeEventListener("online", onWake);
      window.removeEventListener("focus", onWake);
    };
  }, [userManager, renew]);
}

function OidcSessionBridge({ userManager, children }: { userManager: UserManager; children: ReactNode }) {
  const auth = useAuth();
  const redirecting = useRef(false);
  const restoreTried = useRef(false);
  const tokenRef = useRef<string | undefined>(auth.user?.access_token);
  tokenRef.current = auth.user?.access_token ?? tokenRef.current;
  const [loopError, setLoopError] = useState<Error>();

  /** Vai para o Keycloak guardando a rota atual; se o redirect falhar (ex.: discovery fora), libera nova tentativa. */
  const redirectToLogin = useCallback(
    (returnTo: string = currentReturnTo()) => {
      if (redirecting.current) return;
      redirecting.current = true;
      userManager.signinRedirect({ state: { returnTo }, prompt: loginPromptFor(returnTo) }).catch((error: unknown) => {
        redirecting.current = false;
        reportError(error, { auth: "signin_redirect" });
      });
    },
    [userManager],
  );

  // Sem tokens (aba nova / recarregou): tenta recuperar a sessão em silêncio, sem sair da página;
  // só se o Keycloak disser que não há sessão é que vai para o login (voltando para a mesma rota).
  useEffect(() => {
    if (hasAuthParams() || auth.isAuthenticated || auth.activeNavigator || auth.isLoading || auth.error) return;
    if (restoreTried.current) {
      redirectToLogin();
      return;
    }
    restoreTried.current = true;
    userManager
      .signinSilent()
      .then((user) => {
        if (!user) redirectToLogin();
      })
      .catch((error: unknown) => {
        addBreadcrumb({ category: "auth", level: "info", message: `silent restore failed: ${String((error as Error)?.message ?? error)}` });
        redirectToLogin();
      });
  }, [auth.isAuthenticated, auth.activeNavigator, auth.isLoading, auth.error, userManager, redirectToLogin]);

  /** Um único singleFlight para a vida do provider: nunca há dois renews em paralelo. */
  const renewSilently = useMemo(
    () =>
      singleFlight(async () => {
        try {
          const user = await userManager.signinSilent();
          if (user?.access_token) tokenRef.current = user.access_token;
          return Boolean(user?.access_token);
        } catch (error) {
          addBreadcrumb({ category: "auth", level: "warning", message: `silent renew failed: ${String((error as Error)?.message ?? error)}` });
          // Sessão do Keycloak acabou (idle/max/logout em outro lugar): novo login, voltando para cá.
          if (isSessionEndedError(error)) redirectToLogin();
          return false;
        }
      }),
    [userManager, redirectToLogin],
  );

  useSessionRenewal(userManager, renewSilently);

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
    const user = {
      sub: profile.sub,
      name,
      firstName: profile.given_name ?? firstNameOf(name),
      email: profile.email ?? "",
    };
    const idToken = auth.user.id_token;
    return {
      status: "authenticated",
      user,
      getAccessToken: () => tokenRef.current,
      signOut: async () => {
        clearLoginRedirectMark();
        try {
          await userManager.signoutRedirect({ id_token_hint: idToken });
        } catch {
          await userManager.removeUser();
          window.location.assign("/");
        }
      },
      handleUnauthorized: async () => {
        if (await renewSilently()) return true;
        loginAfterUnauthorized();
        return false;
      },
    };
  }, [auth.error, auth.isAuthenticated, auth.user, loopError, loginAfterUnauthorized, renewSilently, userManager]);

  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}
