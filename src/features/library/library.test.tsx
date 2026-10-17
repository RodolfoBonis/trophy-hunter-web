import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderRoutes } from "@/test/render";
import { libraryRoutes } from "./routes";

describe("LibraryPage", () => {
  it("lista os jogos vindos da API mockada", async () => {
    renderRoutes({ routes: libraryRoutes, path: "/library" });
    expect(await screen.findByText("ELDEN RING")).toBeInTheDocument();
    expect(await screen.findByText("God of War Ragnarök")).toBeInTheDocument();
  });

  it("mostra UM card por jogo, pela conta mais avançada, com o total de contas", async () => {
    renderRoutes({ routes: libraryRoutes, path: "/library" });
    expect(await screen.findAllByText("Hades")).toHaveLength(1);
    // Hades: a Alt (41/49) é a mais avançada.
    expect(screen.getByText("Alt · 2 contas")).toBeInTheDocument();
    expect(screen.getByText("41/49")).toBeInTheDocument();
    // ELDEN RING: a Principal é a mais avançada.
    expect(screen.getByText("Principal · 2 contas")).toBeInTheDocument();
  });
});
