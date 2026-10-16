import { loadEnvConfig } from "@next/env";
import { defineConfig, devices } from "@playwright/test";

// Load `.env*` the same way Next does so E2E_* from `.env.local` is available.
loadEnvConfig(process.cwd());

const baseURL = process.env.PLAYWRIGHT_BASE_URL?.trim() || "http://localhost:3000";
const apiURL =
  process.env.E2E_API_URL?.trim() ||
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  "http://localhost:8000";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      NEXT_PUBLIC_API_URL: apiURL,
    },
  },
});
