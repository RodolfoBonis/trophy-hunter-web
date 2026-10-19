import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { appRoutes } from "@/app/router";
import { renderRoutes } from "@/test/render";

const T = { timeout: 5000 };

describe("Medalhas", () => {
  it("mostra temporada, ganhas e as que faltam com andamento", async () => {
    renderRoutes({ routes: appRoutes, path: "/badges" });
    expect(await screen.findByRole("heading", { name: "Medalhas" }, T)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Temporada out/2026" })).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Platinas (ou 100% na Steam)" })).toHaveAttribute("aria-valuenow", "1");
    expect(screen.getByText("Mil troféus")).toBeInTheDocument();
    expect(screen.getByText("Temporada set/2026")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Dez platinas: 9 de 10" })).toBeInTheDocument();
  });

  it("chega pelo menu da conta e aparece no Início", async () => {
    const user = userEvent.setup();
    renderRoutes({ routes: appRoutes, path: "/" });
    expect(await screen.findByRole("heading", { name: "Medalhas", level: 3 }, T)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^Conta de/ }));
    await user.click(within(screen.getByRole("dialog", { name: "Conta e configurações" })).getByRole("link", { name: "Medalhas" }));
    expect(await screen.findByRole("heading", { name: "Medalhas", level: 2 }, T)).toBeInTheDocument();
  });
});
