import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { appRoutes } from "@/app/router";
import { renderRoutes } from "@/test/render";

const T = { timeout: 5000 };
afterEach(() => window.localStorage.removeItem("mock:scenario"));

describe("Próxima Platina · Para comprar", () => {
  it("abre pela aba (e pelo link do aviso) com a lista, preço, promoção e horas", async () => {
    renderRoutes({ routes: appRoutes, path: "/next?tab=comprar" });
    const list = await screen.findByRole("list", { name: "Lista de desejos" }, T);
    const celeste = (await within(list).findByText("Celeste", {}, T)).closest("li")!;
    expect(within(celeste).getByText("−61%")).toBeInTheDocument();
    expect(within(celeste).getByText("No seu preço")).toBeInTheDocument();
    expect(within(celeste).getByText("~40 h para 100%")).toBeInTheDocument();
    expect(within(celeste).getByRole("link", { name: "Nuuvem ↗" })).toHaveAttribute("href", "https://itad.link/celeste");
    expect(screen.getByRole("tab", { name: "Para comprar", selected: true })).toBeInTheDocument();
  });

  it("busca nas lojas, marca o que já tem e adiciona à lista", async () => {
    const user = userEvent.setup();
    renderRoutes({ routes: appRoutes, path: "/next?tab=comprar" });
    await user.type(await screen.findByRole("searchbox", { name: "Buscar jogo nas lojas" }, T), "spider");
    const results = await screen.findByRole("list", { name: "Resultados nas lojas" }, T);
    const row = within(results).getByText("Marvel's Spider-Man 2").closest("li")!;
    await user.click(within(row).getByRole("button", { name: "Quero platinar" }));
    expect(await within(row).findByRole("button", { name: "Na lista" }, T)).toBeDisabled();
    expect(await within(screen.getByRole("list", { name: "Lista de desejos" })).findByText("Marvel's Spider-Man 2", {}, T)).toBeInTheDocument();

    await user.clear(screen.getByRole("searchbox", { name: "Buscar jogo nas lojas" }));
    await user.type(screen.getByRole("searchbox", { name: "Buscar jogo nas lojas" }), "hades");
    const hades = (await within(await screen.findByRole("list", { name: "Resultados nas lojas" }, T)).findByText("Hades", {}, T)).closest("li")!;
    expect(within(hades).getByText("Na biblioteca")).toBeInTheDocument();
  });

  it("filtra platinas rápidas em promoção e tira da lista", async () => {
    const user = userEvent.setup();
    renderRoutes({ routes: appRoutes, path: "/next?tab=comprar" });
    const list = await screen.findByRole("list", { name: "Lista de desejos" }, T);
    await within(list).findByText("Celeste", {}, T);
    await user.click(screen.getByRole("button", { name: "Platinas rápidas em promoção" }));
    // ASTRO BOT: 13 h e −28% → fica; Celeste: 40 h → sai.
    expect(within(list).queryByText("Celeste")).not.toBeInTheDocument();
    expect(within(list).getByText("ASTRO BOT")).toBeInTheDocument();
    await user.click(within(list).getByRole("button", { name: "Tirar ASTRO BOT da lista" }));
    expect(await screen.findByText("Nenhum jogo curto em promoção agora.", {}, T)).toBeInTheDocument();
  });

  it("aba Na biblioteca segue sendo a padrão", async () => {
    renderRoutes({ routes: appRoutes, path: "/next" });
    expect(await screen.findByRole("tab", { name: "Na biblioteca", selected: true }, T)).toBeInTheDocument();
  });
});
