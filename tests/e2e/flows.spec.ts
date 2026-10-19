import { expect, test } from "@playwright/test";
import { open, stabilize } from "./helpers";

/** Fluxos principais em modo mock, no desktop e no celular. */
test.beforeEach(async ({ page }) => stabilize(page));

test("menu do usuário leva às configurações", async ({ page }) => {
  await open(page, "/", "Início");
  await page.getByRole("button", { name: /^Conta de/ }).click();
  await page.getByRole("dialog", { name: "Conta e configurações" }).getByRole("link", { name: /Privacidade/ }).click();
  await expect(page).toHaveURL(/\/settings\/privacy$/);
  await expect(page.getByRole("heading", { name: "Privacidade", exact: true })).toBeVisible();
});

test("sino abre e fecha com Esc", async ({ page }) => {
  await open(page, "/", "Início");
  await page.getByRole("button", { name: /^Notificações/ }).click();
  const panel = page.getByRole("dialog", { name: "Notificações" });
  await expect(panel).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
});

test("biblioteca filtra pela busca", async ({ page }) => {
  await open(page, "/library", "Biblioteca");
  await page.getByPlaceholder(/Buscar jogo/).fill("hades");
  await expect(page.getByRole("link", { name: /^Hades,/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /^ELDEN RING,/ })).toHaveCount(0);
});

test("roteiro da IA é gerado na página do jogo", async ({ page }) => {
  await open(page, "/games/11111111-1111-1111-1111-111111111111", "ELDEN RING");
  await page.getByRole("tab", { name: "Roadmap IA" }).click();
  await page.getByRole("button", { name: "Gerar roadmap com IA" }).click();
  await expect(page.getByRole("heading", { name: "Pós-jogo" })).toBeVisible({ timeout: 20_000 });
});
