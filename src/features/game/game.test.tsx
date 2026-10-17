import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderRoutes } from "@/test/render";
import { gameRoutes } from "./routes";

// Hades existe nas duas contas Steam do mock: Principal (12/49) e Alt (41/49, mais avançada).
const HADES_MAIN = "33333333-3333-3333-3333-333333333333";
const HADES_ALT = "44444444-4444-4444-4444-444444444444";

describe("GamePage — várias contas", () => {
  it("lista as contas (mais avançada primeiro) e marca a atual", async () => {
    renderRoutes({ routes: gameRoutes, path: `/games/${HADES_MAIN}` });
    const nav = await screen.findByRole("navigation", { name: "Contas com este jogo" }, { timeout: 3000 });
    const links = nav.querySelectorAll("a");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", `/games/${HADES_ALT}`);
    expect(links[0]).toHaveTextContent("melhor");
    expect(links[1]).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Conta: Principal")).toBeInTheDocument();
  });

  it("não mostra o seletor quando só uma conta tem o jogo", async () => {
    renderRoutes({ routes: gameRoutes, path: "/games/22222222-2222-2222-2222-222222222222" });
    await screen.findByText("God of War Ragnarök", {}, { timeout: 3000 });
    expect(screen.queryByRole("navigation", { name: "Contas com este jogo" })).not.toBeInTheDocument();
  });
});
