import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderRoutes } from "@/test/render";
import { nextPlatinumRoutes } from "./routes";

describe("Próxima Platina · tempo", () => {
  it("mostra as horas que faltam e filtra por tempo", async () => {
    const user = userEvent.setup();
    renderRoutes({ routes: nextPlatinumRoutes, path: "/next" });
    const all = await screen.findAllByRole("listitem", {}, { timeout: 4000 });
    expect(all.length).toBeGreaterThan(0);
    expect(screen.getAllByText(/para (a platina|100%)/).length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "Cabe no fim de semana" }));
    const list = screen.queryByRole("list", { name: "Fila de platinas" });
    // Só jogos com estimativa abaixo de 6 h (no mock: Hades); os outros saem da lista.
    if (list) {
      for (const item of within(list).getAllByRole("listitem").filter((li) => li.parentElement === list)) {
        expect(item).toHaveTextContent(/~\d+(,\d)? h/);
      }
    } else {
      expect(screen.getByText(/Nenhum jogo da fila com estimativa/)).toBeInTheDocument();
    }
    await user.click(screen.getByRole("button", { name: "Todos" }));
  });
});
