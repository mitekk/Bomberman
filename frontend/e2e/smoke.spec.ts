import { test, expect } from "@playwright/test";

test("critical path: start round, place multiple bombs, and keep controls responsive", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await page.getByRole("button", { name: "Start Round" }).click();
  await expect(page.locator(".grid-board")).toBeVisible();

  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Space");

  const bombsLabel = page.locator(".hud-item").filter({ hasText: "Bombs:" });
  await expect(bombsLabel).toContainText("3/3");
});
