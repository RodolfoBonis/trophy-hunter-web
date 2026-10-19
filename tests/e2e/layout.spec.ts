import { expect, test } from "@playwright/test";
import { open, overflowWithLongText, PAGES, stabilize } from "./helpers";

/**
 * Nenhuma tela pode vazar para a direita, nem com nomes de jogo/troféu enormes (o bug da margem
 * preta na Retrospectiva do celular). Roda em todas as plataformas — não depende de print.
 */
test.beforeEach(async ({ page }) => stabilize(page));

for (const p of PAGES) {
  test(`${p.name}: sem overflow horizontal com textos longos`, async ({ page }) => {
    await open(page, p.path, p.heading);
    const { overflow, culprits } = await overflowWithLongText(page);
    expect(overflow, `vazou ${overflow}px: ${culprits.join(" | ")}`).toBeLessThanOrEqual(0);
  });
}

for (const p of PAGES) {
  test(`${p.name}: todo botão (inclusive link com cara de botão) tem o fundo do tile`, async ({ page }) => {
    await open(page, p.path, p.heading);
    const bare = await page.evaluate(() =>
      Array.from(document.querySelectorAll(".btn"))
        .filter((el) => !el.querySelector(":scope > .s"))
        .map((el) => `${el.tagName.toLowerCase()} "${(el.textContent ?? "").trim().slice(0, 40)}"`),
    );
    expect(bare, `botões sem <span class="s">: ${bare.join(", ")}`).toEqual([]);
  });
}
