import { expect, type Page } from "@playwright/test";

/** Data fixa: as fixtures do mock são relativas a "agora", então o print não muda de um dia pro outro. */
export const FIXED_NOW = new Date("2026-10-15T15:00:00-03:00");

/** Telas principais, com o título que indica que a página terminou de carregar. */
export const PAGES = [
  { name: "inicio", path: "/", heading: "Início" },
  { name: "biblioteca", path: "/library", heading: "Biblioteca" },
  { name: "jogo", path: "/games/11111111-1111-1111-1111-111111111111", heading: "ELDEN RING" },
  { name: "proxima", path: "/next", heading: "Próxima Platina" },
  { name: "linha-do-tempo", path: "/timeline", heading: "Linha do tempo" },
  { name: "amigos", path: "/friends", heading: "Amigos" },
  { name: "retrospectiva", path: "/recap", heading: "Retrospectiva" },
  { name: "configuracoes", path: "/settings/integrations", heading: "Configurações" },
  { name: "privacidade", path: "/settings/privacy", heading: "Configurações" },
] as const;

/** Prepara a página para prints estáveis: relógio fixo e sem imagens externas (capas viram placeholder). */
export async function stabilize(page: Page): Promise<void> {
  await page.clock.setFixedTime(FIXED_NOW);
  await page.route(/^https?:\/\/(?!localhost|127\.0\.0\.1)/, (route) => route.abort());
}

export async function open(page: Page, path: string, heading: string): Promise<void> {
  await page.goto(path);
  await expect(page.getByRole("heading", { name: heading, exact: true }).first()).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
}

/**
 * Troca todo texto curto por um nome bem comprido (títulos de jogo/troféu reais chegam a isso) e
 * devolve quanto a página passou da largura da tela. 0 = nada vaza para a direita.
 */
export async function overflowWithLongText(page: Page): Promise<{ overflow: number; culprits: string[] }> {
  return page.evaluate(() => {
    const STATIC_UI =
      "button, [role=tab], [role=switch], label, nav, h2, h3, svg, table.sr-only, .sr-only, .seg, .label, .kicker, .chip, .settings-tab, input, select";
    const LONG = "Marvel's Spider-Man 2 Digital Deluxe Edition Remastered Collection";
    const walker = document.createTreeWalker(document.querySelector("main") ?? document.body, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    while (walker.nextNode()) {
      const t = walker.currentNode as Text;
      // Só texto de dado (nomes, títulos, descrições); rótulos fixos da interface ficam como estão.
      if ((t.textContent ?? "").trim().length > 4 && !t.parentElement?.closest(STATIC_UI)) nodes.push(t);
    }
    for (const t of nodes) t.textContent = LONG;
    const vw = document.documentElement.clientWidth;
    const culprits = Array.from(document.querySelectorAll("main *"))
      .filter((e) => e.getBoundingClientRect().right > vw + 1 && !e.closest(".sr-only"))
      .slice(0, 5)
      .map((e) => `${e.tagName.toLowerCase()}.${String(e.className).slice(0, 80)}`);
    return { overflow: document.documentElement.scrollWidth - vw, culprits };
  });
}
