import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { gameRoutes } from "@/features/game/routes";
import { renderRoutes } from "@/test/render";
import { socialRoutes } from "./routes";

const T = { timeout: 4000 };
const ELDEN = "/games/11111111-1111-1111-1111-111111111111";
afterEach(() => window.localStorage.removeItem("mock:scenario"));

describe("Amigos (opt-in)", () => {
  it("começa desligado: só o convite; ao ligar, aparecem ranking, atividade e amigos", async () => {
    const user = userEvent.setup();
    renderRoutes({ routes: socialRoutes, path: "/friends" });
    expect(await screen.findByRole("heading", { name: /Compartilhar seu progresso/ }, T)).toBeInTheDocument();
    expect(screen.queryByText("Ranking")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Compartilhar meu progresso" }));
    const ranking = await screen.findByRole("list", { name: "Ranking por platinas" }, T);
    expect(await within(ranking).findByText("Ana Souza", {}, T)).toBeInTheDocument();
    expect(within(ranking).getByText("Você")).toBeInTheDocument();
    expect(screen.getByText("Atividade")).toBeInTheDocument();
    expect(screen.getAllByText(/platinou/).length).toBeGreaterThan(0);
  });

  it("troféu oculto no feed fica escondido até revelar", async () => {
    window.localStorage.setItem("mock:scenario", "sharing");
    const user = userEvent.setup();
    renderRoutes({ routes: socialRoutes, path: "/friends" });
    const reveal = await screen.findByRole("button", { name: "Oculto — revelar" }, T);
    expect(screen.getByText("Final secreto")).toHaveAttribute("aria-hidden", "true");
    await user.click(reveal);
    expect(screen.getByText("Final secreto")).not.toHaveAttribute("aria-hidden", "true");
  });

  it("perfil do amigo: resumo e biblioteca só leitura", async () => {
    window.localStorage.setItem("mock:scenario", "sharing");
    renderRoutes({ routes: socialRoutes, path: "/friends/aaaaaaaa-0000-0000-0000-000000000001" });
    expect(await screen.findByRole("heading", { name: "Ana Souza" }, T)).toBeInTheDocument();
    expect(await screen.findByText(/Biblioteca · \d+/, {}, T)).toBeInTheDocument();
    expect(screen.getAllByText("ELDEN RING").length).toBeGreaterThan(0);
  });

  it("perfil sem compartilhar mostra o convite", async () => {
    renderRoutes({ routes: socialRoutes, path: "/friends/aaaaaaaa-0000-0000-0000-000000000001" });
    expect(await screen.findByRole("button", { name: "Compartilhar meu progresso" }, T)).toBeInTheDocument();
  });
});

describe("Amigos neste jogo", () => {
  it("com compartilhamento, lista quem tem o mesmo jogo", async () => {
    window.localStorage.setItem("mock:scenario", "sharing");
    renderRoutes({ routes: gameRoutes, path: ELDEN });
    expect(await screen.findByRole("heading", { name: "Amigos neste jogo" }, T)).toBeInTheDocument();
    expect(screen.getByText("Bruno Lima")).toBeInTheDocument();
  });

  it("sem compartilhar, só a dica para ligar", async () => {
    renderRoutes({ routes: gameRoutes, path: ELDEN });
    expect(await screen.findByRole("link", { name: "Ligue o compartilhamento" }, T)).toBeInTheDocument();
  });
});
