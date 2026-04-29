import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E configuration.
 *
 * Scope for Phase 0: only validate that the app boots, the disclaimer
 * banner renders on the root route, and a custom 404 renders on an
 * unknown route. Heavier interaction tests come with the UI phases.
 *
 * The webServer block runs `pnpm dev` against a fixed port so CI can
 * reuse a single build of the app across multiple specs.
 */
const isCi = !!process.env["CI"];

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  // With exactOptionalPropertyTypes we can't assign `undefined` to an
  // optional prop — conditionally spread instead so the key is omitted
  // when we want Playwright's default.
  ...(isCi ? { workers: 1 } : {}),
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: 'pnpm build && PORT=3000 pnpm start',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});
