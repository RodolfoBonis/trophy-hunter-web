import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { dashboardRoutes } from "@/features/dashboard/routes";
import { gameRoutes } from "@/features/game/routes";
import { renderRoutes } from "@/test/render";
import { socialRoutes } from "./routes";

const T = { timeout: 4000 };
beforeEach(() => window.localStorage.setItem("mock:scenario", "sharing"));
afterEach(() => window.localStorage.removeItem("mock:scenario"));

describe("Desafios", () => {
  it("lista em Amigos e aceita um convite", async () => {
    const user = userEvent.setup();
    renderRoutes({ routes: socialRoutes, path: "/friends" });
    const list = await screen.findByRole("list", { name: "Desafios" }, T);
    expect(await within(list).findByText("Quem pega os 100% de ELDEN RING primeiro", {}, T)).toBeInTheDocument();
    await user.click(within(list).getByRole("button", { name: "Aceitar: Mais troféus raros em 14 dias" }));
    await expect(within(list).findByRole("button", { name: /Aceitar:/ }, { timeout: 800 })).rejects.toThrow();
  });

  it("placar ao vivo do desafio, com cancelar para quem criou", async () => {
    renderRoutes({ routes: socialRoutes, path: "/friends/challenges/c-1" });
    const board = await screen.findByRole("list", { name: "Placar do desafio" }, T);
    const rows = within(board).getAllByRole("listitem");
    expect(rows[0]).toHaveTextContent("Ana Souza");
    expect(rows[1]).toHaveTextContent("Você");
    expect(screen.getByRole("button", { name: "Cancelar desafio" })).toBeInTheDocument();
  });

  it("cria um desafio de troféus raros com um amigo", async () => {
    const user = userEvent.setup();
    renderRoutes({ routes: socialRoutes, path: "/friends/challenges/new" });
    await user.click(await screen.findByRole("radio", { name: /Mais troféus raros/ }, T));
    await user.click(await screen.findByRole("button", { name: /Ana Souza/ }, T));
    await user.click(screen.getByRole("button", { name: "14 dias" }));
    await user.click(screen.getByRole("button", { name: "Desafiar" }));
    expect(await screen.findByRole("heading", { name: "Mais troféus raros em 14 dias" }, T)).toBeInTheDocument();
  });

  it("corrida de jogo exige escolher o jogo", async () => {
    const user = userEvent.setup();
    renderRoutes({ routes: socialRoutes, path: "/friends/challenges/new?friend=aaaaaaaa-0000-0000-0000-000000000001" });
    await user.click(await screen.findByRole("radio", { name: /Quem fecha primeiro/ }, T));
    expect(screen.getByRole("button", { name: "Desafiar" })).toBeDisabled();
    const games = await screen.findByRole("list", { name: "Jogos" }, T);
    await user.click(within(games).getAllByRole("button").find((b) => !b.hasAttribute("disabled"))!);
    expect(screen.getByRole("button", { name: "Desafiar" })).toBeEnabled();
  });

  it("o Início avisa do convite pendente", async () => {
    renderRoutes({ routes: dashboardRoutes, path: "/" });
    expect(await screen.findByText("Você foi desafiado", {}, T)).toBeInTheDocument();
  });
});

describe("Comparar troféu a troféu", () => {
  it("filtra o que o amigo tem e eu não", async () => {
    const user = userEvent.setup();
    renderRoutes({ routes: gameRoutes, path: "/games/11111111-1111-1111-1111-111111111111" });
    await user.click(await screen.findByRole("tab", { name: "Comparar" }, T));
    const list = await screen.findByRole("list", { name: "Troféus comparados" }, T);
    const total = within(list).getAllByRole("listitem").length;
    await user.click(screen.getByRole("button", { name: "Ele tem, eu não" }));
    const rows = within(screen.getByRole("list", { name: "Troféus comparados" })).queryAllByRole("listitem");
    expect(rows.length).toBeLessThanOrEqual(total);
    for (const r of rows) {
      expect(within(r).getByLabelText("Você: não tem")).toBeInTheDocument();
      expect(within(r).getByLabelText("Amigo: tem")).toBeInTheDocument();
    }
  });
});
