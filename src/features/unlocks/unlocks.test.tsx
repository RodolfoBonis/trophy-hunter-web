import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { UnlockEvent } from "@/api/schemas";
import { renderRoutes } from "@/test/render";
import { buildToasts, UnlockNotices } from "./UnlockNotices";

vi.mock("canvas-confetti", () => ({
  default: Object.assign(vi.fn(), { reset: vi.fn() }),
}));

const T = { timeout: 4000 };
const route = [
  { path: "/", element: <UnlockNotices /> },
  { path: "/games/:id", element: <p>página do jogo</p> },
];

afterEach(() => window.localStorage.removeItem("mock:scenario"));

describe("Avisos de troféu", () => {
  it("mostra os toasts, a cerimônia da platina e marca como vistos", async () => {
    window.localStorage.setItem("mock:scenario", "unlocks");
    const user = userEvent.setup();
    const { client } = renderRoutes({ routes: route, path: "/" });

    const list = await screen.findByRole(
      "list",
      { name: "Troféus desbloqueados" },
      T,
    );
    expect(
      await within(list).findByText("Mestre das Grandes Runas", {}, T),
    ).toBeInTheDocument();
    expect(
      within(list).getByText("Conquista desbloqueada"),
    ).toBeInTheDocument();
    expect(within(list).getByText("Senhor da Guerra")).toBeInTheDocument();
    // A platina não vira toast: vira cerimônia.
    expect(within(list).queryByText("Pai e filho")).not.toBeInTheDocument();
    const dialog = screen.getByRole("dialog", { name: "Platina!" });
    expect(within(dialog).getByText("God of War Ragnarök")).toBeInTheDocument();
    expect(
      within(dialog).getByRole("button", { name: "Fechar" }),
    ).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Marcados como vistos: o próximo fetch volta vazio.
    await waitFor(async () => {
      await client.refetchQueries({ queryKey: ["unlocks", "unseen"] });
      expect(client.getQueryData(["unlocks", "unseen"])).toEqual([]);
    }, T);

    await user.click(
      within(list).getAllByRole("button", { name: "Fechar aviso" })[0]!,
    );
    expect(
      within(list).queryByText("Mestre das Grandes Runas"),
    ).not.toBeInTheDocument();
  });

  it("agrupa muitos desbloqueios do mesmo jogo num aviso só", async () => {
    window.localStorage.setItem("mock:scenario", "unlocks-many");
    renderRoutes({ routes: route, path: "/" });
    const list = await screen.findByRole(
      "list",
      { name: "Troféus desbloqueados" },
      T,
    );
    expect(
      await within(list).findByText("6 conquistas novas", {}, T),
    ).toBeInTheDocument();
    expect(within(list).getAllByRole("listitem")).toHaveLength(1);
  });

  it("clicar no aviso abre o jogo", async () => {
    window.localStorage.setItem("mock:scenario", "unlocks");
    const user = userEvent.setup();
    renderRoutes({ routes: route, path: "/" });
    await user.keyboard("{Escape}");
    await user.click(
      await screen.findByRole("link", { name: /Senhor da Guerra/ }, T),
    );
    expect(await screen.findByText("página do jogo")).toBeInTheDocument();
  });
});

describe("buildToasts", () => {
  const ev = (id: string, game: string): UnlockEvent => ({
    id,
    trophy_id: id,
    name: id,
    type: "bronze",
    icon: "",
    game_id: game,
    game_title: game,
    platform: "psn",
    external_id: "x",
    cover: "",
    hero: "",
    completes_game: false,
  });
  it("até 3 são individuais; acima disso agrupa por jogo", () => {
    expect(
      buildToasts([ev("a", "g1"), ev("b", "g1")]).map((t) => t.kind),
    ).toEqual(["single", "single"]);
    const many = buildToasts([
      ev("a", "g1"),
      ev("b", "g1"),
      ev("c", "g1"),
      ev("d", "g2"),
    ]);
    expect(many.map((t) => t.kind)).toEqual(["group", "single"]);
  });
});
