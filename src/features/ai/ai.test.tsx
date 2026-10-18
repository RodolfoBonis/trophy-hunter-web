import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { renderRoutes } from "@/test/render";
import { gameRoutes } from "@/features/game/routes";

// ELDEN RING (conta Principal) no mock: "Lorde Éldero" (obtido) e um troféu oculto.
const ELDEN = "/games/11111111-1111-1111-1111-111111111111";
const T = { timeout: 5000 };

afterEach(() => window.localStorage.removeItem("mock:scenario"));

async function openTrophyGuide(user: ReturnType<typeof userEvent.setup>) {
  renderRoutes({ routes: gameRoutes, path: ELDEN });
  await user.click(
    await screen.findByRole("button", { name: "Guia de IA: Lorde Éldero" }, T),
  );
}

describe("Guia de IA do troféu", () => {
  it("gera ao vivo, exibe o guia com confiança e fontes, e permite corrigir", async () => {
    const user = userEvent.setup();
    await openTrophyGuide(user);
    expect(screen.getByText(/Pode conter erros/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Gerar guia com IA" }));

    // Ao vivo: trilha de pesquisa; depois o guia pronto (revelado: o usuário acabou de pedir).
    expect(
      await screen.findByText(
        /Derrote o chefe final na dificuldade Normal/,
        {},
        T,
      ),
    ).toBeInTheDocument();
    await waitFor(
      () =>
        expect(screen.getByText(/guia · Sugestão de IA/i)).toBeInTheDocument(),
      T,
    );
    expect(
      screen.getByText("Antes da arena, equipe a armadura de fogo."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Castelo Tempestuoso \(Stormveil Castle\)/),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Dificuldade 6 de 10")).toBeInTheDocument();
    expect(screen.getByText(/Média · 55%/)).toBeInTheDocument();
    expect(
      screen.getByText("Fontes divergem sobre a dificuldade mínima exigida."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /powerpyx\.com/ })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );

    // Correção do usuário vence o gerado; dá para voltar ao original.
    await user.click(screen.getByRole("button", { name: "Editar" }));
    const summary = screen.getByLabelText("Resumo");
    await user.clear(summary);
    await user.type(summary, "Vença o chefe no Normal.");
    await user.click(screen.getByRole("button", { name: "Salvar correção" }));
    expect(
      await screen.findByText("Vença o chefe no Normal.", {}, T),
    ).toBeInTheDocument();
    expect(screen.getByText(/editado por você/)).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Voltar ao original" }),
    );
    expect(
      await screen.findByText(
        /Derrote o chefe final na dificuldade Normal/,
        {},
        T,
      ),
    ).toBeInTheDocument();
  });

  it("guia já existente fica borrado até revelar (spoiler guard)", async () => {
    const user = userEvent.setup();
    await openTrophyGuide(user);
    await user.click(screen.getByRole("button", { name: "Gerar guia com IA" }));
    await waitFor(
      () =>
        expect(screen.getByText(/guia · Sugestão de IA/i)).toBeInTheDocument(),
      T,
    );

    // Reabre a linha: o guia salvo volta coberto.
    await user.click(
      screen.getByRole("button", { name: "Guia de IA: Lorde Éldero" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Guia de IA: Lorde Éldero" }),
    );
    const reveal = await screen.findByRole(
      "button",
      { name: "Revelar guia" },
      T,
    );
    await user.click(reveal);
    expect(
      screen.queryByRole("button", { name: "Revelar guia" }),
    ).not.toBeInTheDocument();
  });

  it("mostra o erro da geração e permite tentar de novo", async () => {
    window.localStorage.setItem("mock:scenario", "ai-error");
    const user = userEvent.setup();
    await openTrophyGuide(user);
    await user.click(screen.getByRole("button", { name: "Gerar guia com IA" }));
    expect(
      await screen.findByRole("button", { name: "Tentar de novo" }, T),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "A IA não conseguiu responder",
    );
  });

  it("avisa quando o membro atinge o limite diário de IA", async () => {
    window.localStorage.setItem("mock:scenario", "ai-daily-limit");
    const user = userEvent.setup();
    await openTrophyGuide(user);
    await user.click(screen.getByRole("button", { name: "Gerar guia com IA" }));
    expect(await screen.findByRole("alert", {}, T)).toHaveTextContent(
      "limite de pedidos de IA de hoje",
    );
  });
});

describe("Roadmap e chat", () => {
  it("gera o roadmap com etapas e perdíveis", async () => {
    const user = userEvent.setup();
    renderRoutes({ routes: gameRoutes, path: ELDEN });
    await user.click(await screen.findByRole("tab", { name: "Roadmap IA" }, T));
    await user.click(
      screen.getByRole("button", { name: "Gerar roadmap com IA" }),
    );
    expect(
      await screen.findByRole("heading", { name: "Pós-jogo" }, T),
    ).toBeInTheDocument();
    await waitFor(
      () =>
        expect(
          screen.getByText(/roadmap · Sugestão de IA/i),
        ).toBeInTheDocument(),
      T,
    );
    expect(screen.getAllByText(/Diário do capitão/).length).toBeGreaterThan(0);
  });

  it(
    "responde no chat em tempo real e inicia nova conversa",
    { timeout: 20_000 },
    async () => {
      const user = userEvent.setup();
      renderRoutes({ routes: gameRoutes, path: ELDEN });
      await user.click(await screen.findByRole("tab", { name: "Chat IA" }, T));
      const chat = await screen.findByRole(
        "region",
        { name: "Chat com a IA" },
        T,
      );
      await user.click(
        within(chat).getByRole("button", {
          name: "Perdi algum troféu perdível até aqui?",
        }),
      );

      expect(
        await within(chat).findByText(
          "Perdi algum troféu perdível até aqui?",
          {},
          T,
        ),
      ).toBeInTheDocument();
      const bold = await within(chat).findByText(
        "nada perdível ficou para trás",
        {},
        T,
      );
      expect(bold.tagName).toBe("STRONG");
      await waitFor(
        () =>
          expect(
            within(chat).getByRole("button", { name: "Enviar" }),
          ).toBeInTheDocument(),
        T,
      );

      // Pergunta digitada (Enter envia).
      await user.type(
        within(chat).getByLabelText("Pergunta para a IA"),
        "E agora?{Enter}",
      );
      expect(
        await within(chat).findByText("E agora?", {}, T),
      ).toBeInTheDocument();
      await waitFor(
        () =>
          expect(
            within(chat).getAllByText("nada perdível ficou para trás"),
          ).toHaveLength(2),
        T,
      );
      await waitFor(
        () =>
          expect(
            within(chat).getByRole("button", { name: "Nova conversa" }),
          ).toBeEnabled(),
        T,
      );

      await user.click(
        within(chat).getByRole("button", { name: "Nova conversa" }),
      );
      expect(
        await within(chat).findByRole("group", { name: "Sugestões" }, T),
      ).toBeInTheDocument();
    },
  );
});
