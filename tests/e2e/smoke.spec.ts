import { test, expect } from "@playwright/test";

test.describe("Frontend Foundation & Marketing Smoke Suite", () => {
  test("loads root page and renders expected title and brand header", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/FlowPilot/i);

    // Header brand logo
    const brandLink = page.getByRole("banner").getByRole("link", { name: /FlowPilot Home/i });
    await expect(brandLink).toBeVisible();

    // Hero headline
    const heroHeading = page.getByRole("heading", {
      name: /Run Your Client Operations, Scheduling, and Billing from One Calm Command Center/i,
    });
    await expect(heroHeading).toBeVisible();

    // Dual CTAs
    const getStartedBtn = page.getByRole("link", { name: /Get Started Free/i }).first();
    await expect(getStartedBtn).toHaveAttribute("href", "/login");

    const liveWorkspaceBtn = page.getByRole("link", { name: /Explore Live Workspace/i }).first();
    await expect(liveWorkspaceBtn).toHaveAttribute("href", "/dashboard");
  });

  test("renders core sections: preview, capabilities, how it works, and faq", async ({ page }) => {
    await page.goto("/");

    // Product Preview
    await expect(page.getByText(/Product Experience Preview/i)).toBeVisible();

    // Core Capabilities
    await expect(
      page.getByRole("heading", { name: /Engineered for Every Stage of Service Delivery/i })
    ).toBeVisible();

    // How It Works
    await expect(
      page.getByRole("heading", { name: /A Straightforward Workflow from Setup to Scale/i })
    ).toBeVisible();

    // FAQ Section
    const faqButton = page.getByRole("button", {
      name: /How does multi-tenant workspace isolation protect our business data\?/i,
    });
    await expect(faqButton).toBeVisible();

    // Toggle FAQ
    await faqButton.click();
    await expect(faqButton).toHaveAttribute("aria-expanded", "true");
  });

  test("operates responsive mobile navigation menu", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    const menuButton = page.getByRole("button", { name: /Open navigation menu/i });
    await expect(menuButton).toBeVisible();

    await menuButton.click();
    await expect(page.getByRole("button", { name: /Close navigation menu/i })).toBeVisible();

    // Mobile navigation items
    const mobileFeaturesLink = page
      .locator("#mobile-navigation")
      .getByRole("link", { name: /Features/i });
    await expect(mobileFeaturesLink).toBeVisible();
  });
});
