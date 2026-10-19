import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { appRoutes } from "@/app/router";
import { renderRoutes } from "@/test/render";

const T = { timeout: 5000 };
afterEach(() => window.localStorage.removeItem("mock:scenario"));

describe("Configurações · Saúde (dono)", () => {
  it("mostra alertas, contas, fila, fontes, IA e Web Vitals; reprocessa job parado", async () => {
    const user = userEvent.setup();
    renderRoutes({ routes: appRoutes, path: "/settings/health" });
    expect(await screen.findByText("TrophyHunterExternalAPIFailing", {}, T)).toBeInTheDocument();
    expect(screen.getByText(/reconectar/)).toBeInTheDocument();
    expect(screen.getByText("80% erro")).toBeInTheDocument();
    expect(screen.getByText(/hoje 3\/30/)).toBeInTheDocument();
    expect(screen.getByText("1.9 s")).toBeInTheDocument();
    const dead = screen.getByRole("list", { name: "Jobs parados recentes" });
    expect(within(dead).getAllByRole("listitem")).toHaveLength(2);
    await user.click(within(dead).getAllByRole("button", { name: "Reprocessar" })[0]!);
    await screen.findByText((_, el) => el?.getAttribute("aria-label") === "Jobs parados recentes" && el.querySelectorAll("li").length === 1, {}, T);
  });

  it("Prometheus fora: o resto do painel aparece com o aviso", async () => {
    window.localStorage.setItem("mock:scenario", "prometheus-down");
    renderRoutes({ routes: appRoutes, path: "/settings/health" });
    expect(await screen.findByText(/Prometheus indisponível agora/, {}, T)).toBeInTheDocument();
    expect(screen.getByText(/Contas · 3/)).toBeInTheDocument();
  });

  it("membro não tem a aba nem a página", async () => {
    window.localStorage.setItem("mock:scenario", "member");
    renderRoutes({ routes: appRoutes, path: "/settings/health" });
    expect(await screen.findByText(/não encontrad/i, {}, T)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Saúde" })).not.toBeInTheDocument();
  });
});
