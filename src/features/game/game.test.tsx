import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

const HADES_PSN = "66666666-6666-6666-6666-666666666666";
const GOW_PSN = "22222222-2222-2222-2222-222222222222";
const ELDEN_MAIN = "11111111-1111-1111-1111-111111111111";

describe("GamePage — cross-platform", () => {
  it("mostra o mesmo jogo da outra plataforma lado a lado, pela conta mais avançada", async () => {
    renderRoutes({ routes: gameRoutes, path: `/games/${HADES_MAIN}` });
    const panel = await screen.findByRole("region", { name: "Outras plataformas" }, { timeout: 3000 });
    expect(within(panel).getByText(/Steam × PlayStation/)).toBeInTheDocument();
    const other = within(panel).getByRole("link");
    expect(other).toHaveAttribute("href", `/games/${HADES_PSN}`);
    expect(other).toHaveTextContent("9/49 troféus");
  });

  it("desvincula e permite vincular à mão um jogo da outra plataforma", async () => {
    const user = userEvent.setup();
    renderRoutes({ routes: gameRoutes, path: `/games/${HADES_MAIN}` });
    const panel = await screen.findByRole("region", { name: "Outras plataformas" }, { timeout: 3000 });
    await user.click(within(panel).getByRole("button", { name: "Desvincular" }));
    await user.click(await within(panel).findByRole("button", { name: "Vincular jogo da PlayStation" }));
    const search = within(panel).getByRole("searchbox", { name: "Buscar jogo na PlayStation" });
    await user.clear(search);
    await user.type(search, "god of war");
    await user.click(await within(panel).findByRole("button", { name: "Vincular a God of War Ragnarök" }, { timeout: 3000 }));
    const link = await within(panel).findByRole("link", {}, { timeout: 3000 });
    expect(link).toHaveAttribute("href", `/games/${GOW_PSN}`);
    expect(within(panel).getByText(/vínculo manual/)).toBeInTheDocument();
  });

  it("sem vínculo, oferece buscar na outra plataforma", async () => {
    renderRoutes({ routes: gameRoutes, path: `/games/${ELDEN_MAIN}` });
    const panel = await screen.findByRole("region", { name: "Outras plataformas" }, { timeout: 3000 });
    expect(within(panel).getByRole("button", { name: "Vincular jogo da PlayStation" })).toHaveAttribute("aria-expanded", "false");
    expect(within(panel).queryByRole("link")).not.toBeInTheDocument();
  });
});

describe("tempo estimado (HowLongToBeat)", () => {
  it("mostra história/extras/100% e quanto falta", async () => {
    renderRoutes({ routes: gameRoutes, path: "/games/11111111-1111-1111-1111-111111111111" });
    const panel = await screen.findByLabelText("Tempo estimado", {}, { timeout: 4000 });
    expect(panel).toHaveTextContent("História 60 h");
    expect(panel).toHaveTextContent("100% 136 h");
    expect(panel).toHaveTextContent(/faltam ~\d+ h/);
  });
});
