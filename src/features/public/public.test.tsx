import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { appRoutes } from "@/app/router";
import { createTestQueryClient, renderRoutes } from "@/test/render";
import PublicProfilePage from "./PublicProfilePage";
import { suggestSlug } from "./PublicProfileSettings";

const T = { timeout: 5000 };

describe("Perfil público", () => {
  it("sugere link a partir do nome", () => {
    expect(suggestSlug("Rodolfo de Bonis")).toBe("rodolfo-de-bonis");
    expect(suggestSlug("  João  Ção! ")).toBe("joao-cao");
  });

  it("vitrine sem login: totais, medalhas, platinas e raros", async () => {
    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <PublicProfilePage apiBase="http://localhost/api" slug="rodolfo" />
      </QueryClientProvider>,
    );
    expect(await screen.findByRole("heading", { level: 1, name: "Rodolfo" }, T)).toBeInTheDocument();
    expect(screen.getByText("1.530")).toBeInTheDocument();
    expect(screen.getByText("Mil troféus")).toBeInTheDocument();
    expect(screen.getByText("Lorde Éldero")).toBeInTheDocument();
    expect(screen.getAllByText("God of War Ragnarök").length).toBeGreaterThan(0);
  });

  it("link inexistente ou desligado = perfil não encontrado", async () => {
    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <PublicProfilePage apiBase="http://localhost/api" slug="ninguem" />
      </QueryClientProvider>,
    );
    expect(await screen.findByRole("heading", { name: "Perfil não encontrado" }, T)).toBeInTheDocument();
  });

  it("Privacidade: liga com link, avisa link ocupado e desliga", async () => {
    const user = userEvent.setup();
    renderRoutes({ routes: appRoutes, path: "/settings/privacy" });
    const slug = await screen.findByLabelText(/Link \(/, {}, T);
    await user.clear(slug);
    await user.type(slug, "ocupado");
    await user.click(screen.getByRole("button", { name: "Ligar perfil público" }));
    expect(await screen.findByText("Esse link já é de outra pessoa.", {}, T)).toBeInTheDocument();

    await user.clear(slug);
    await user.type(slug, "rb-hunter");
    await user.click(screen.getByRole("button", { name: "Ligar perfil público" }));
    expect(await screen.findByRole("link", { name: /\/u\/rb-hunter$/ }, T)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Prévia do cartão/ })).toHaveAttribute("src", "/u/rb-hunter/card.png");

    await user.click(screen.getByRole("button", { name: "Desligar" }));
    expect(await screen.findByRole("button", { name: "Ligar perfil público" }, T)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /\/u\/rb-hunter$/ })).not.toBeInTheDocument();
  }, 20_000);
});
