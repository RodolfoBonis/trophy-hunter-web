import { act, render, screen, waitFor } from "@testing-library/react";
import { User, type UserManager } from "oidc-client-ts";
import { createBrowserRouter, RouterProvider } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AppConfig } from "@/config/env";
import { createUserManager, handleSigninCallback, UserManagerSessionProvider } from "./OidcSessionProvider";
import { useSession } from "./session";

function fakeUser(): User {
  return new User({
    access_token: "tok",
    token_type: "Bearer",
    refresh_token: "ref",
    id_token: "id",
    scope: "openid",
    profile: { sub: "u1", name: "Rodolfo", iss: "x", aud: "y", exp: 0, iat: 0 },
    expires_at: Math.floor(Date.now() / 1000) + 300,
  });
}

function manager() {
  // Mesma configuração de produção (renovação automática do oidc-client-ts DESLIGADA — é nossa).
  const um = createUserManager({
    authMode: "oidc",
    oidcAuthority: "https://auth.test/realms/x",
    oidcClientId: "c",
    oidcScope: "openid",
    apiBase: "https://api.test",
  } as AppConfig);
  vi.spyOn(um, "getUser").mockResolvedValue(null);
  const redirect = vi.spyOn(um, "signinRedirect").mockResolvedValue();
  return { um, redirect };
}

/** Dispara o aviso "access token expirando" (timer interno do oidc-client-ts). */
async function raiseExpiring(um: UserManager) {
  await (um.events as unknown as { _expiringTimer: { raise: () => Promise<void> } })._expiringTimer.raise();
}

function Probe() {
  const s = useSession();
  return <div>status:{s.status}</div>;
}

beforeEach(() => window.history.replaceState({}, "", "/games/abc?tab=guide"));
afterEach(() => vi.restoreAllMocks());

describe("sessão OIDC", () => {
  it("recarregar com sessão SSO válida recupera os tokens em silêncio, sem sair da página", async () => {
    const { um, redirect } = manager();
    vi.spyOn(um, "signinSilent").mockImplementation(async () => {
      const u = fakeUser();
      await um.events.load(u);
      return u;
    });
    render(
      <UserManagerSessionProvider userManager={um}>
        <Probe />
      </UserManagerSessionProvider>,
    );
    expect(await screen.findByText("status:authenticated")).toBeInTheDocument();
    expect(redirect).not.toHaveBeenCalled();
    expect(window.location.pathname + window.location.search).toBe("/games/abc?tab=guide");
  });

  it("sem sessão no Keycloak vai para o login guardando a rota atual", async () => {
    const { um, redirect } = manager();
    vi.spyOn(um, "signinSilent").mockRejectedValue(Object.assign(new Error("login_required"), { error: "login_required" }));
    render(
      <UserManagerSessionProvider userManager={um}>
        <Probe />
      </UserManagerSessionProvider>,
    );
    await waitFor(() => expect(redirect).toHaveBeenCalledTimes(1));
    expect(redirect.mock.calls[0]![0]).toMatchObject({ state: { returnTo: "/games/abc?tab=guide" } });
    expect(screen.getByText("status:loading")).toBeInTheDocument();
  });

  it("falha transitória na renovação (rede) não derruba a sessão nem manda para o login", async () => {
    const { um, redirect } = manager();
    const silent = vi.spyOn(um, "signinSilent").mockImplementationOnce(async () => {
      const u = fakeUser();
      await um.events.load(u);
      return u;
    });
    render(
      <UserManagerSessionProvider userManager={um}>
        <Probe />
      </UserManagerSessionProvider>,
    );
    await screen.findByText("status:authenticated");
    silent.mockRejectedValue(new Error("Failed to fetch"));
    await act(async () => {
      // O aviso de "token expirando" dispara a renovação.
      await raiseExpiring(um);
    });
    expect(silent).toHaveBeenCalledTimes(2); // restauração + renovação
    expect(screen.getByText("status:authenticated")).toBeInTheDocument();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("refresh token recusado (sessão do Keycloak acabou) volta ao login na mesma rota", async () => {
    const { um, redirect } = manager();
    const silent = vi.spyOn(um, "signinSilent").mockImplementationOnce(async () => {
      const u = fakeUser();
      await um.events.load(u);
      return u;
    });
    render(
      <UserManagerSessionProvider userManager={um}>
        <Probe />
      </UserManagerSessionProvider>,
    );
    await screen.findByText("status:authenticated");
    silent.mockRejectedValue(Object.assign(new Error("invalid_grant"), { error: "invalid_grant" }));
    await act(async () => {
      await raiseExpiring(um);
    });
    await waitFor(() => expect(redirect).toHaveBeenCalledTimes(1));
    expect(redirect.mock.calls[0]![0]).toMatchObject({ state: { returnTo: "/games/abc?tab=guide" } });
  });
});

describe("retorno do login", () => {
  it("volta para a rota de antes do login (o router acompanha a troca de URL)", async () => {
    window.history.replaceState({}, "", "/?code=x&state=y");
    const router = createBrowserRouter([
      { path: "/", element: <div>início</div> },
      { path: "/games/:id", element: <div>página do jogo</div> },
    ]);
    render(<RouterProvider router={router} />);
    expect(await screen.findByText("início")).toBeInTheDocument();
    act(() => handleSigninCallback({ state: { returnTo: "/games/abc" } } as unknown as User));
    expect(await screen.findByText("página do jogo")).toBeInTheDocument();
    expect(window.location.search).toBe("");
  });
});
