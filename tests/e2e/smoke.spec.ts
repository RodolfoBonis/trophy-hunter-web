import { expect, test } from "@playwright/test";

/**
 * Smoke em modo mock (MSW + sessão fake): o app carrega a biblioteca com dados realistas e a
 * navegação é alcançável por teclado (acessibilidade básica).
 */
test("biblioteca carrega e a navegação é alcançável por teclado", async ({ page }) => {
  await page.goto("/library");

  // Dados vindos do MSW.
  await expect(page.getByText("ELDEN RING")).toBeVisible();
  await expect(page.getByText("God of War Ragnarök")).toBeVisible();

  // O primeiro Tab cai no skip link; segue tabulando até chegar num link da navegação principal.
  const nav = page.getByRole("navigation", { name: "Navegação principal" });
  await expect(nav).toBeVisible();

  let reachedNav = false;
  for (let i = 0; i < 12; i += 1) {
    await page.keyboard.press("Tab");
    const focusedInNav = await page.evaluate(() => {
      const el = document.activeElement;
      return Boolean(el?.closest('nav[aria-label="Navegação principal"]'));
    });
    if (focusedInNav) {
      reachedNav = true;
      break;
    }
  }
  expect(reachedNav).toBe(true);
});

test("skip link fica visível ao focar e leva ao conteúdo", async ({ page }) => {
  await page.goto("/library");
  await expect(page.getByRole("navigation", { name: "Navegação principal" })).toBeVisible();
  const skip = page.getByRole("link", { name: "Pular para o conteúdo" });
  // sr-only por padrão; ao receber foco (via teclado), `focus:not-sr-only` o torna visível.
  await skip.focus();
  await expect(skip).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#conteudo$/);
  await expect(page.locator("#conteudo")).toBeFocused();
});
