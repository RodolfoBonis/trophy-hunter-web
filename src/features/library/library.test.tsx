import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderRoutes } from "@/test/render";
import { libraryRoutes } from "./routes";

describe("LibraryPage", () => {
  it("lista os jogos vindos da API mockada", async () => {
    renderRoutes({ routes: libraryRoutes, path: "/library" });
    expect(await screen.findByRole("link", { name: /^ELDEN RING,/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^God of War Ragnarök,/ })).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument(); // contador "3 jogos"
  });

  it("mostra UM card por jogo, pela conta mais avançada, com o total de contas", async () => {
    renderRoutes({ routes: libraryRoutes, path: "/library" });
    const hades = await screen.findByRole("link", { name: /^Hades, Steam/ });
    expect(screen.getAllByRole("link", { name: /^Hades,/ })).toHaveLength(1);
    // Hades: a Alt (41/49) é a mais avançada.
    expect(hades).toHaveTextContent("41/49 conquistas");
    expect(hades).toHaveTextContent("Alt · 2 contas");
    expect(hades).toHaveAccessibleName(/84% concluído/);
    // ELDEN RING: a Principal é a mais avançada.
    expect(screen.getByText("Principal · 2 contas")).toBeInTheDocument();
  });
});

describe("LibraryPage — rolagem infinita", () => {
  it("carrega a próxima página com o botão (alternativa ao sentinela)", async () => {
    window.localStorage.setItem("mock:scenario", "library-many");
    try {
      const user = userEvent.setup();
      renderRoutes({ routes: libraryRoutes, path: "/library" });
      await screen.findByRole("link", { name: /^Jogo 001,/ }, { timeout: 3000 });
      expect(screen.getAllByRole("link", { name: /^Jogo \d+,/ })).toHaveLength(60);
      expect(screen.getByText("130")).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Carregar mais" }));
      expect(await screen.findByRole("link", { name: /^Jogo 120,/ }, { timeout: 3000 })).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Carregar mais" }));
      expect(await screen.findByRole("link", { name: /^Jogo 130,/ }, { timeout: 3000 })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Carregar mais" })).not.toBeInTheDocument();
    } finally {
      window.localStorage.removeItem("mock:scenario");
    }
  });
});
