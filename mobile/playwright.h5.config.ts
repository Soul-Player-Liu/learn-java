import { defineConfig, devices } from "@playwright/test";

const isCi = process.env.CI === "true" || process.env.GITLAB_CI === "true";
const mobilePort = process.env.MOBILE_E2E_PORT ?? "15174";
const mobileUrl = `http://127.0.0.1:${mobilePort}`;
const scenario = process.env.VITE_MOCK_SCENARIO ?? "many";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  workers: 1,
  retries: isCi ? 1 : 0,
  reporter: isCi
    ? [
        ["list"],
        ["junit", { outputFile: "test-results/mobile-h5-junit.xml" }],
        ["html", { open: "never", outputFolder: "playwright-report" }],
      ]
    : "list",
  use: {
    baseURL: mobileUrl,
    trace: "on-first-retry",
  },
  webServer: {
    command: `VITE_USE_MOCK=true VITE_MOCK_SCENARIO=${scenario} npm run dev:h5 -- --host 127.0.0.1 --port ${mobilePort} --strictPort`,
    url: mobileUrl,
    timeout: 90_000,
    reuseExistingServer: false,
  },
  projects: [
    {
      name: "mobile-h5-chromium",
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "mobile-h5-webkit",
      use: { ...devices["iPhone 15"] },
    },
  ],
});
