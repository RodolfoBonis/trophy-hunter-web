import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider, type RouteObject } from "react-router";
import { describe, expect, it } from "vitest";
import { MockSessionProvider } from "@/auth/MockSessionProvider";
import type { AuthenticatedSession } from "@/auth/session";
import { createTestQueryClient } from "@/test/render";
import { AuthGate } from "./router";

function renderGate(session?: Partial<AuthenticatedSession>) {
  const routes: RouteObject[] = [
    { element: <AuthGate />, children: [{ index: true, element: <div>conteúdo protegido</div> }] },
  ];
  const router = createMemoryRouter(routes, { initialEntries: ["/"] });
  return render(
    <MockSessionProvider overrides={session}>
      <QueryClientProvider client={createTestQueryClient()}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </MockSessionProvider>,
  );
}

describe("AuthGate", () => {
  it("libera o conteúdo para quem tem a realm role", async () => {
    renderGate();
    expect(await screen.findByText("conteúdo protegido")).toBeInTheDocument();
  });

  it("mostra 'sem acesso' sem a role", async () => {
    renderGate({ hasAccess: false } as Partial<AuthenticatedSession>);
    expect(await screen.findByText("Sem acesso")).toBeInTheDocument();
    expect(screen.queryByText("conteúdo protegido")).not.toBeInTheDocument();
  });

  it("mostra erro quando a sessão falha", async () => {
    // MockSessionProvider repassa o override: status 'error' cai no ramo de erro do guard.
    renderGate({ status: "error", error: new Error("Keycloak fora") } as unknown as Partial<AuthenticatedSession>);
    expect(await screen.findByText("Não deu para entrar")).toBeInTheDocument();
  });
});
