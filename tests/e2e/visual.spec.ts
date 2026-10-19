import { expect, test } from "@playwright/test";
import { open, PAGES, stabilize } from "./helpers";

/**
 * Regressão visual. Os prints de referência são gerados no CI (Linux, imagem oficial do Playwright)
 * pelo workflow "visual-snapshots"; fora do Linux a fonte renderiza diferente, então só roda lá.
 */
test.skip(process.platform !== "linux", "prints de referência são do Linux (CI)");
test.beforeEach(async ({ page }) => stabilize(page));

const shot = { fullPage: true, animations: "disabled", caret: "hide", maxDiffPixelRatio: 0.01 } as const;

for (const p of PAGES) {
  test(`${p.name}`, async ({ page }) => {
    await open(page, p.path, p.heading);
    await expect(page).toHaveScreenshot(`${p.name}.png`, shot);
  });
}

test("menu do usuário", async ({ page }) => {
  await open(page, "/", "Início");
  await page.getByRole("button", { name: /^Conta de/ }).click();
  await expect(page.getByRole("dialog", { name: "Conta e configurações" })).toBeVisible();
  await expect(page).toHaveScreenshot("menu-usuario.png", { ...shot, fullPage: false });
});

test("sino de notificações", async ({ page }) => {
  await open(page, "/", "Início");
  await page.getByRole("button", { name: /^Notificações/ }).click();
  await expect(page.getByRole("dialog", { name: "Notificações" })).toBeVisible();
  await expect(page).toHaveScreenshot("sino.png", { ...shot, fullPage: false });
});
