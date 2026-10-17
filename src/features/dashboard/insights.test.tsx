import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { gameRoutes } from "@/features/game/routes";
import { nextPlatinumRoutes } from "@/features/next-platinum/routes";
import { timelineRoutes } from "@/features/timeline/routes";
import { renderRoutes } from "@/test/render";
import { dashboardRoutes } from "./routes";

const T = { timeout: 3000 };

describe("Início", () => {
  it("mostra o resumo (jogos completos, desbloqueados e raridade)", async () => {
    renderRoutes({ routes: [{ path: "/", children: dashboardRoutes }], path: "/" });
    expect(await screen.findByRole("heading", { level: 1 }, T)).toHaveTextContent(/1\s*jogo\s*completo/i);
    expect(screen.getByText("Desbloqueados")).toBeInTheDocument();
    expect(screen.getByText("Raras")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Desbloqueios por mês/ })).toBeInTheDocument();
  });
});

describe("Próxima Platina", () => {
  it("ranqueia os jogos começados e sugere o de hoje", async () => {
    renderRoutes({ routes: nextPlatinumRoutes, path: "/next" });
    expect(await screen.findByText("O que fazer hoje", {}, T)).toBeInTheDocument();
    expect(screen.getByLabelText("Posição 1")).toBeInTheDocument();
    // Hades (84%) vem antes de ELDEN RING (67%).
    const titles = screen.getAllByRole("link", { name: /^(Hades|ELDEN RING)$/ }).map((a) => a.textContent);
    expect(titles.indexOf("Hades")).toBeLessThan(titles.indexOf("ELDEN RING"));
  });
});

describe("Linha do tempo", () => {
  it("agrupa por dia e transforma platinas em momentos", async () => {
    renderRoutes({ routes: timelineRoutes, path: "/timeline" });
    expect(await screen.findByText(/Platina conquistada/i, {}, T)).toBeInTheDocument();
    expect(screen.getAllByText(/desbloqueio/).length).toBeGreaterThan(0);
  });
});

describe("Marcações do jogo", () => {
  it("prioridade e tags do jogo são salvas", async () => {
    const user = userEvent.setup();
    renderRoutes({ routes: gameRoutes, path: "/games/11111111-1111-1111-1111-111111111111" });
    const prio = await screen.findByRole("group", { name: "Prioridade" }, T);
    await user.click(within(prio).getByRole("button", { name: "Alta" }));
    expect(await within(prio).findByRole("button", { name: "Alta", pressed: true }, T)).toBeInTheDocument();
    const tags = screen.getAllByRole("group", { name: "Marcações" })[0]!;
    await user.click(within(tags).getByRole("button", { name: "Grind" }));
    expect(await within(tags).findByRole("button", { name: "Grind", pressed: true }, T)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /PSNProfiles/ })).toHaveAttribute("href", expect.stringContaining("psnprofiles.com"));
  });
});
