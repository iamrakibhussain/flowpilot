import { test, expect } from "@playwright/test";

const VIEWPORTS = [
  { name: "mobile-xs-320", width: 320, height: 600 },
  { name: "mobile-sm-375", width: 375, height: 667 },
  { name: "mobile-lg-430", width: 430, height: 932 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "laptop-1024", width: 1024, height: 768 },
  { name: "desktop-1280", width: 1280, height: 800 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "desktop-1920", width: 1920, height: 1080 },
];

const ROUTES = [
  { name: "home", path: "/" },
  { name: "login", path: "/login" },
  { name: "register", path: "/register" },
  { name: "forgot-password", path: "/forgot-password" },
  { name: "dashboard", path: "/dashboard" },
  { name: "invoices", path: "/dashboard/invoices" },
  { name: "customers", path: "/dashboard/customers" },
  { name: "billing", path: "/dashboard/billing" },
  { name: "calendar", path: "/dashboard/calendar" },
  { name: "automations", path: "/dashboard/automations" },
  { name: "settings", path: "/dashboard/settings" },
  { name: "services", path: "/dashboard/services" },
  { name: "contracts", path: "/dashboard/contracts" },
  { name: "quotes", path: "/dashboard/quotes" },
  { name: "staff", path: "/dashboard/staff" },
  { name: "payments", path: "/dashboard/payments" },
  { name: "analytics", path: "/dashboard/analytics" },
  { name: "projects", path: "/dashboard/projects" },
  { name: "book-slug", path: "/book/demo-business" },
  { name: "portal-dashboard", path: "/portal/demo-business/dashboard" },
];

test.describe("M7 Comprehensive Product-Wide Responsive UI Audit", () => {
  for (const vp of VIEWPORTS) {
    test.describe(`Viewport: ${vp.name} (${vp.width}x${vp.height})`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      for (const route of ROUTES) {
        test(`audits ${route.name} (${route.path}) at ${vp.width}px without horizontal overflow`, async ({
          page,
        }) => {
          await page.goto(route.path, { waitUntil: "domcontentloaded" });
          await page.waitForTimeout(500); // Allow styles and layout to settle

          // 1. Audit horizontal overflow
          const overflowInfo = await page.evaluate(() => {
            const docWidth = document.documentElement.scrollWidth;
            const bodyWidth = document.body.scrollWidth;
            const winWidth = window.innerWidth;
            const hasOverflow = docWidth > winWidth + 1 || bodyWidth > winWidth + 1;

            let offendingElements: Array<{
              tag: string;
              className: string;
              id: string;
              rect: DOMRect;
            }> = [];
            if (hasOverflow) {
              const all = Array.from(document.querySelectorAll("*"));
              offendingElements = all
                .filter((el) => {
                  const r = el.getBoundingClientRect();
                  return r.right > winWidth + 1 || r.width > winWidth + 1;
                })
                .slice(0, 10)
                .map((el) => ({
                  tag: el.tagName.toLowerCase(),
                  className: el.className ? String(el.className).slice(0, 100) : "",
                  id: el.id || "",
                  rect: el.getBoundingClientRect(),
                }));
            }

            return {
              winWidth,
              docWidth,
              bodyWidth,
              hasOverflow,
              offendingElements,
            };
          });

          // Assert zero unintended horizontal overflow
          expect(
            overflowInfo.hasOverflow,
            `Horizontal overflow detected on ${route.path} at ${vp.width}px! Doc width: ${overflowInfo.docWidth}px, Win width: ${overflowInfo.winWidth}px. Offending elements: ${JSON.stringify(overflowInfo.offendingElements, null, 2)}`
          ).toBe(false);
        });
      }
    });
  }
});
