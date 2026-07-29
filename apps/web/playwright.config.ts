import { defineConfig, devices } from "@playwright/test";

/**
 * Runs the happy-path e2e against a running dev server. If none is up,
 * Playwright starts one. Point E2E_BASE_URL at a deployed URL to test remotely.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000/en",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
