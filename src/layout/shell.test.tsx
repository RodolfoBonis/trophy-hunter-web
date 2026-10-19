import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { appRoutes } from "@/app/router";
import { renderRoutes } from "@/test/render";

const T = { timeout: 4000 };
afterEach(() => {
  window.localStorage.removeItem("mock:scenario");
  window.localStorage.removeItem("th:notif-seen-at");
});

describe("barra superior e menus", () => {
  it("a navegação principal segue a numeração das seções (01–06) e não tem Configurações", async () => {
    renderRoutes({ routes: appRoutes, path: "/" });
    const nav = await screen.findByRole("navigation", { name: "Navegação principal" }, T);
    const links = within(nav).getAllByRole("link").map((a) => a.getAttribute("href"));
    expect(links).toEqual(["/", "/library", "/next", "/timeline", "/friends", "/recap"]);
    expect(within(nav).queryByRole("link", { name: /Contas/ })).not.toBeInTheDocument();
  });

  it("menu da conta: dados do usuário, Configurações (com Membros para o dono) e sair", async () => {
    const user = userEvent.setup();
    renderRoutes({ routes: appRoutes, path: "/" });
    await user.click(await screen.findByRole("button", { name: /Conta de/ }, T));
    const menu = screen.getByRole("dialog", { name: "Conta e configurações" });
    expect(await within(menu).findByText("Dono", {}, T)).toBeInTheDocument();
    for (const label of ["Contas conectadas", "Notificações", "Privacidade", "Sincronização", "Membros e convites"]) {
      expect(within(menu).getByRole("link", { name: label })).toBeInTheDocument();
    }
    expect(within(menu).getByRole("switch", { name: /Som dos avisos/ })).toBeInTheDocument();
    expect(within(menu).getByRole("button", { name: "Sair" })).toBeInTheDocument();
    await user.click(within(menu).getByRole("link", { name: "Privacidade" }));
    expect(await screen.findByRole("heading", { name: "Privacidade" }, T)).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "Conta e configurações" })).not.toBeInTheDocument();
  });

  it("membro não vê Membros e convites", async () => {
    window.localStorage.setItem("mock:scenario", "member");
    const user = userEvent.setup();
    renderRoutes({ routes: appRoutes, path: "/" });
    await user.click(await screen.findByRole("button", { name: /Conta de/ }, T));
    await screen.findByRole("link", { name: "Privacidade" }, T);
    expect(screen.queryByRole("link", { name: "Membros e convites" })).not.toBeInTheDocument();
  });

  it("sino: selo com o que é novo, itens que pedem atenção e últimos troféus", async () => {
    window.localStorage.setItem("mock:scenario", "sharing");
    const user = userEvent.setup();
    renderRoutes({ routes: appRoutes, path: "/" });
    const bell = await screen.findByRole("button", { name: /Notificações: \d+ novas/ }, T);
    await user.click(bell);
    const panel = screen.getByRole("dialog", { name: "Notificações" });
    expect(await within(panel).findByText("Pede sua atenção", {}, T)).toBeInTheDocument();
    expect(within(panel).getByText("Você foi desafiado")).toBeInTheDocument();
    expect(within(panel).getByText("Últimos troféus")).toBeInTheDocument();
  });
});

describe("Configurações", () => {
  it("/settings abre Contas conectadas com a aba marcada", async () => {
    renderRoutes({ routes: appRoutes, path: "/settings" });
    expect(await screen.findByRole("heading", { name: "Contas conectadas" }, T)).toBeInTheDocument();
    const tabs = screen.getByRole("navigation", { name: "Configurações" });
    expect(within(tabs).getByRole("link", { name: "Contas conectadas" })).toHaveAttribute("aria-current", "page");
  });

  it("o endereço antigo /sync vai para a aba Sincronização", async () => {
    renderRoutes({ routes: appRoutes, path: "/sync" });
    expect(await screen.findByRole("heading", { name: "Sincronização" }, T)).toBeInTheDocument();
  });
});
