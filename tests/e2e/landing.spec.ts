import { test, expect } from "@playwright/test";

/**
 * Phase 0 smoke E2E. These three checks only confirm the app boots and
 * the one load-bearing piece of UI — the liability disclaimer — is
 * actually rendered. Real UI tests arrive with the calculator phase.
 */

const DISCLAIMER_SUBSTRING = "Preliminary sizing aid.";

test.describe("landing page", () => {
  test("renders the disclaimer banner on the root route", async ({ page }) => {
    await page.goto("/");
    const banner = page.getByRole("alert", { name: "Engineering disclaimer" });
    await expect(banner).toBeVisible();
    await expect(banner).toContainText(DISCLAIMER_SUBSTRING);
  });

  test("disclaimer persists across a reload", async ({ page }) => {
    await page.goto("/");
    await page.reload();
    const banner = page.getByRole("alert", { name: "Engineering disclaimer" });
    await expect(banner).toBeVisible();
  });

  test("disclaimer renders on the custom 404 route", async ({ page }) => {
    // Next.js renders app/not-found.tsx for unknown paths; the disclaimer
    // lives in the root layout so it must still appear.
    const response = await page.goto("/this-route-does-not-exist");
    expect(response?.status()).toBe(404);
    const banner = page.getByRole("alert", { name: "Engineering disclaimer" });
    await expect(banner).toBeVisible();
  });
});
