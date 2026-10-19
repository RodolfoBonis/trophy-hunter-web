import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { gameRoutes } from "@/features/game/routes";
import { renderRoutes } from "@/test/render";

const T = { timeout: 5000 };
const ELDEN = "/games/11111111-1111-1111-1111-111111111111";

describe("Modo caçada", () => {
  it("sem roadmap oferece gerar; com roadmap vira checklist ligado aos troféus", async () => {
    const user = userEvent.setup();
    renderRoutes({ routes: gameRoutes, path: `${ELDEN}/hunt` });
    expect(await screen.findByText(/Gere o roadmap deste jogo para começar/, {}, T)).toBeInTheDocument();
    await user.click(await screen.findByRole("button", { name: "Gerar roadmap com IA" }, T));

    const stage1 = (await screen.findByRole("checkbox", { name: /Etapa 1 feita: Campanha/ }, T)).closest("li")!;
    // "Lorde Éldero" (obtido) casou → etapa completa sozinha.
    expect(within(stage1).getByText("1/1 troféus")).toBeInTheDocument();
    expect(within(stage1).getByText("Lorde Éldero")).toBeInTheDocument();

    // Etapa 2: troféu com anotação "(perdível)" casou; o inexistente vira texto.
    const stage2 = screen.getByRole("checkbox", { name: /Etapa 2 feita: Pós-jogo/ }).closest("li")!;
    expect(within(stage2).getByText("Mestre das Grandes Runas")).toBeInTheDocument();
    expect(within(stage2).getByText(/Também citados pela IA: Colecionador/)).toBeInTheDocument();
    expect(stage2).toHaveAttribute("aria-current", "step");
  });

  it("etapa com perdível pendente pede confirmação antes de marcar", async () => {
    const user = userEvent.setup();
    renderRoutes({ routes: gameRoutes, path: `${ELDEN}/hunt` });
    await user.click(await screen.findByRole("button", { name: "Gerar roadmap com IA" }, T));
    const check = await screen.findByRole("checkbox", { name: /Etapa 1 feita/ }, T);
    // Etapa 1 tem perdível ("Diário do capitão") mas todos os troféus casados já foram obtidos → marca direto.
    await user.click(check);
    expect(await screen.findByRole("checkbox", { name: /Etapa 1 feita/, checked: true }, T)).toBeInTheDocument();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();

    // Etapa 2: perdível com troféu ainda faltando → pergunta antes.
    await user.click(screen.getByRole("checkbox", { name: /Etapa 2 feita/ }));
    const dialog = screen.getByRole("alertdialog", { name: "Confirmar etapa com perdíveis" });
    expect(dialog).toHaveTextContent("Você pegou Mestre das Grandes Runas? Depois daqui não dá mais.");
    await user.click(within(dialog).getByRole("button", { name: "Ainda não" }));
    expect(screen.getByRole("checkbox", { name: /Etapa 2 feita/ })).not.toBeChecked();
    await user.click(screen.getByRole("checkbox", { name: /Etapa 2 feita/ }));
    await user.click(screen.getByRole("button", { name: "Já peguei, marcar" }));
    expect(await screen.findByRole("checkbox", { name: /Etapa 2 feita/, checked: true }, T)).toBeInTheDocument();
  });

  it("sincroniza o jogo e mostra que está buscando", async () => {
    const user = userEvent.setup();
    renderRoutes({ routes: gameRoutes, path: `${ELDEN}/hunt` });
    await user.click(await screen.findByRole("button", { name: "Sincronizar este jogo" }, T));
    expect(await screen.findByText("Buscando troféus novos…", {}, T)).toBeInTheDocument();
  });

  it("página do jogo tem o atalho para o modo caçada", async () => {
    renderRoutes({ routes: gameRoutes, path: ELDEN });
    expect(await screen.findByRole("link", { name: "Modo caçada" }, T)).toHaveAttribute("href", `${ELDEN}/hunt`);
  });
});
