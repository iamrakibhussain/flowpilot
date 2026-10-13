import { test, expect } from "@playwright/test";

test.describe("Frontend Foundation Smoke Suite", () => {
  test("loads root page and renders expected title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/FlowPilot/i);
  });
});
