import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderRoutes } from "@/test/render";
import { recapPeriods } from "./periods";
import { recapRoutes } from "./routes";

vi.mock("./shareCard", () => ({
  renderRecapCard: vi.fn(async () => new Blob(["png"], { type: "image/png" })),
  shareOrDownload: vi.fn(async () => "downloaded"),
}));

const T = { timeout: 4000 };
afterEach(() => window.localStorage.removeItem("mock:scenario"));

describe("Retrospectiva", () => {
  it("mostra os números do período e gera o cartão", async () => {
    const user = userEvent.setup();
    renderRoutes({ routes: recapRoutes, path: "/recap" });
    expect(await screen.findByText("troféus e conquistas", {}, T)).toBeInTheDocument();
    expect(screen.getByText(/▲ 61% vs. período anterior/)).toBeInTheDocument();
    expect(screen.getByText("Jogo do período")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Compartilhar cartão" }));
    expect(await screen.findByText("Cartão pronto.", {}, T)).toBeInTheDocument();
    const { renderRecapCard } = await import("./shareCard");
    expect(renderRecapCard).toHaveBeenCalled();
  });

  it("período vazio não oferece cartão", async () => {
    window.localStorage.setItem("mock:scenario", "recap-empty");
    renderRoutes({ routes: recapRoutes, path: "/recap" });
    expect(await screen.findByText(/Nenhum troféu em/, {}, T)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Compartilhar cartão" })).toBeDisabled();
  });

  it("gera o resumo semanal da IA", async () => {
    const user = userEvent.setup();
    renderRoutes({ routes: recapRoutes, path: "/recap" });
    const panel = await screen.findByLabelText("Resumo da semana", {}, T);
    await user.click(within(panel).getByRole("button", { name: "Gerar o resumo desta semana" }));
    expect(await within(panel).findByText(/Semana de Elden Ring/, {}, T)).toBeInTheDocument();
    expect(within(panel).getByText("Para a próxima semana")).toBeInTheDocument();
  });

  it("oferece este mês, o anterior, este ano e o passado", () => {
    const p = recapPeriods(new Date(2026, 0, 15));
    expect(p.map((x) => x.key)).toEqual(["2026-01", "2025-12", "2026", "2025"]);
  });
});
