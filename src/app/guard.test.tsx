import { QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { StrictMode, Suspense } from "react";
import { createMemoryRouter, RouterProvider, type RouteObject } from "react-router";
import { describe, expect, it } from "vitest";
import { MockSessionProvider } from "@/auth/MockSessionProvider";
import type { AuthenticatedSession } from "@/auth/session";
import MembersPage from "@/features/members/MembersPage";
import { queryKeys } from "@/api/endpoints";
import { server } from "@/mocks/node";
import { createTestQueryClient } from "@/test/render";
import { AuthGate, MemberGate, inviteRoute } from "./router";

function renderGate(opts: { session?: Partial<AuthenticatedSession>; path?: string; routes?: RouteObject[] } = {}) {
  const routes: RouteObject[] = opts.routes ?? [
    {
      element: <AuthGate />,
      children: [
        {
          element: <MemberGate />,
          children: [
            { index: true, element: <div>conteúdo protegido</div> },
            { path: "settings/members", element: <MembersPage /> },
          ],
        },
      ],
    },
  ];
  const router = createMemoryRouter(routes, { initialEntries: [opts.path ?? "/"] });
  const client = createTestQueryClient();
  const result = render(
    <StrictMode>
      <MockSessionProvider overrides={opts.session}>
        <QueryClientProvider client={client}>
          <Suspense fallback={null}>
            <RouterProvider router={router} />
          </Suspense>
        </QueryClientProvider>
      </MockSessionProvider>
    </StrictMode>,
  );
  return { ...result, client };
}

const scenario = (s: string) => window.localStorage.setItem("mock:scenario", s);

describe("AuthGate + MemberGate", () => {
  it("libera o conteúdo para membro ativo", async () => {
    renderGate();
    expect(await screen.findByText("conteúdo protegido")).toBeInTheDocument();
  });

  it("sem convite aceito: pede um convite", async () => {
    scenario("no-access");
    renderGate();
    expect(await screen.findByText("Você ainda não tem acesso")).toBeInTheDocument();
    expect(screen.queryByText("conteúdo protegido")).not.toBeInTheDocument();
  });

  it("membro removido vê 'Acesso removido'", async () => {
    scenario("member-removed");
    renderGate();
    expect(await screen.findByText("Acesso removido")).toBeInTheDocument();
  });

  it("refetch do /me falhando (rede) não derruba o app", async () => {
    const { client } = renderGate();
    await screen.findByText("conteúdo protegido");
    server.use(http.get("*/api/v1/me", () => HttpResponse.json({}, { status: 500 })));
    await act(() => client.refetchQueries({ queryKey: queryKeys.me }));
    expect(screen.getByText("conteúdo protegido")).toBeInTheDocument();
  });

  it("mostra erro quando a sessão falha", async () => {
    renderGate({
      session: { status: "error", error: new Error("Keycloak fora") } as unknown as Partial<AuthenticatedSession>,
    });
    expect(await screen.findByText("Não deu para entrar")).toBeInTheDocument();
  });
});

describe("convite", () => {
  const inviteRoutes: RouteObject[] = [
    {
      element: <AuthGate />,
      children: [
        inviteRoute,
        { element: <MemberGate />, children: [{ index: true, element: <div>conteúdo protegido</div> }] },
      ],
    },
  ];

  it("aceita o link e entra no app", async () => {
    scenario("no-access");
    renderGate({ routes: inviteRoutes, path: "/convite/abc123" });
    expect(await screen.findByText("conteúdo protegido", {}, { timeout: 3000 })).toBeInTheDocument();
  });

  it("aceita uma única vez mesmo no StrictMode", async () => {
    scenario("no-access");
    let calls = 0;
    server.events.on("request:start", ({ request }) => {
      if (request.url.includes("/accept")) calls++;
    });
    renderGate({ routes: inviteRoutes, path: "/convite/abc123" });
    await screen.findByText("conteúdo protegido", {}, { timeout: 3000 });
    server.events.removeAllListeners();
    expect(calls).toBe(1);
  });

  it("falha transitória permite tentar de novo", async () => {
    scenario("no-access");
    renderGate({ routes: inviteRoutes, path: "/convite/fail-1" });
    expect(await screen.findByText("Não deu para aceitar o convite", {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tentar de novo" })).toBeInTheDocument();
  });

  it("link inválido explica e não libera", async () => {
    scenario("no-access");
    renderGate({ routes: inviteRoutes, path: "/convite/bad-code" });
    expect(await screen.findByText("Convite inválido", {}, { timeout: 3000 })).toBeInTheDocument();
  });
});

describe("Membros e convites", () => {
  it("o dono gera um link e remove um membro", async () => {
    const user = userEvent.setup();
    renderGate({ path: "/settings/members" });
    await user.click(await screen.findByRole("button", { name: "Gerar link de convite" }));
    expect(((await screen.findByLabelText("Link de convite")) as HTMLInputElement).value).toMatch(/\/convite\/mock-/);
    expect((await screen.findAllByText(/para uma pessoa/)).length).toBe(2);

    // Revogar o convite recém-criado tira o link da tela.
    await user.click(screen.getByRole("button", { name: /Revogar o convite/ }));
    await expect(screen.findByLabelText("Link de convite", {}, { timeout: 800 })).rejects.toThrow();

    await user.click(await screen.findByRole("button", { name: "Remover Amigo" }));
    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Remover o acesso de Amigo" }));
    expect(await screen.findByText(/removido/)).toBeInTheDocument();
  });

  it("apagar tudo remove o membro da lista", async () => {
    const user = userEvent.setup();
    renderGate({ path: "/settings/members" });
    await user.click(await screen.findByRole("button", { name: "Remover Amigo" }));
    await user.click(screen.getByLabelText(/Apagar também as contas/));
    await user.click(screen.getByRole("button", { name: "Apagar tudo e remover Amigo" }));
    await expect(screen.findByText("amigo@example.com", {}, { timeout: 800 })).rejects.toThrow();
  });

  it("para membro a página não existe", async () => {
    scenario("member");
    renderGate({ path: "/settings/members" });
    expect(await screen.findByText("Página não encontrada")).toBeInTheDocument();
  });
});
