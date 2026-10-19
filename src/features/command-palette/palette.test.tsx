import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { useLocation } from "react-router";
import { describe, expect, it } from "vitest";
import { renderRoutes } from "@/test/render";
import { CommandPalette } from "./CommandPalette";
import { usePaletteHotkey } from "./hotkey";

function Harness() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  usePaletteHotkey(() => setOpen(true));
  return (
    <>
      <p data-testid="where">{loc.pathname + loc.hash}</p>
      <CommandPalette open={open} onOpenChange={setOpen} />
    </>
  );
}

const routes = [{ path: "*", element: <Harness /> }];
const T = { timeout: 4000 };

describe("Paleta de comandos", () => {
  it("abre com Ctrl+K, busca jogo e abre", async () => {
    const user = userEvent.setup();
    renderRoutes({ routes, path: "/" });
    await user.keyboard("{Control>}k{/Control}");
    const input = await screen.findByRole("combobox", { name: "Buscar jogo, troféu ou ação" }, T);
    await user.type(input, "elden");
    await screen.findByText("ELDEN RING", {}, T);
    await user.keyboard("{Enter}");
    await waitFor(() =>
      expect(screen.getByTestId("where")).toHaveTextContent(
        /^\/games\/[0-9a-f-]+$/,
      ),
    );
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it('abre com "/" e leva ao troféu com âncora; oculto não obtido não aparece', async () => {
    const user = userEvent.setup();
    renderRoutes({ routes, path: "/" });
    await user.keyboard("/");
    const input = await screen.findByRole("combobox", { name: "Buscar jogo, troféu ou ação" }, T);
    await user.type(input, "mestre");
    expect(
      await screen.findByText("Nada encontrado.", {}, T),
    ).toBeInTheDocument();

    await user.clear(input);
    await user.type(input, "lorde");
    await user.click(await screen.findByText("Lorde Éldero", {}, T));
    await waitFor(() =>
      expect(screen.getByTestId("where")).toHaveTextContent(/#trophy-/),
    );
  });

  it("filtra telas e executa ações", async () => {
    const user = userEvent.setup();
    renderRoutes({ routes, path: "/" });
    await user.keyboard("{Meta>}k{/Meta}");
    await user.type(
      await screen.findByRole("combobox", { name: "Buscar jogo, troféu ou ação" }, T),
      "bibli",
    );
    await user.click(await screen.findByText("Biblioteca", {}, T));
    expect(screen.getByTestId("where")).toHaveTextContent("/library");

    await user.keyboard("{Control>}k{/Control}");
    await user.type(
      await screen.findByRole("combobox", { name: "Buscar jogo, troféu ou ação" }, T),
      "som",
    );
    expect(
      await screen.findByText("Ligar o som dos avisos", {}, T),
    ).toBeInTheDocument();
  });
});
