import { loadEnvConfig } from "@next/env";
import { defineConfig, devices } from "@playwright/test";

// Load `.env*` the same way Next does so E2E_* from `.env.local` is available.
loadEnvConfig(process.cwd());

const baseURL = process.env.PLAYWRIGHT_BASE_URL?.trim() || "http://localhost:3000";
const apiURL =
  process.env.E2E_API_URL?.trim() ||
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  "http://localhost:8000";

// Workers reload this file without CLI flags in argv, so persist --headed for them.
if (process.argv.includes("--headed")) {
  process.env.PW_HEADED = "1";
}
const headed = process.env.PW_HEADED === "1";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
  ],
  use: {
    baseURL,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure",
    launchOptions: {
      // Visible runs: 700ms between actions. Headless stays fast.
      slowMo: headed ? 700 : 0,
    },
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
