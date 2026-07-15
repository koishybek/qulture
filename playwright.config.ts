import { defineConfig, devices } from "@playwright/test";

const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, "");
const baseURL = externalBaseUrl ?? "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "./e2e",
  // The smoke suite exercises a shared SQLite-backed demo flow. Serialising
  // workers prevents local Next dev cold starts and database writes from
  // starving unrelated browser actions.
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: {
    // Route transitions are deliberately server-rendered; allow a cold local
    // dev request to complete before treating a navigation as a regression.
    timeout: 15_000,
  },
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: externalBaseUrl
    ? undefined
    : {
        command: "npm run dev -- --hostname 127.0.0.1 --port 3100",
        url: `${baseURL}/en`,
        reuseExistingServer: true,
        timeout: 120_000,
      },
  projects: [
    {
      name: "chromium",
      grep: /@desktop/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chromium",
      grep: /@mobile/,
      use: { ...devices["Pixel 7"] },
    },
  ],
});
