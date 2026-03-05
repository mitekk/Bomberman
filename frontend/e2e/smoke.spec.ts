import { test, expect } from "@playwright/test";

test("critical path: start round and see board", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await page.getByRole("button", { name: "Start Round" }).click();
  await expect(page.locator(".grid-board")).toBeVisible();
});
