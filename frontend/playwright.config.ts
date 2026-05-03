import { defineConfig, devices } from '@playwright/test'

const isCi = process.env.CI === 'true' || process.env.GITLAB_CI === 'true'
const backendPort = process.env.E2E_BACKEND_PORT ?? '18080'
const frontendPort = process.env.E2E_FRONTEND_PORT ?? '15173'
const backendUrl = `http://127.0.0.1:${backendPort}`
const frontendUrl = `http://127.0.0.1:${frontendPort}`

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  workers: 1,
  retries: isCi ? 1 : 0,
  reporter: isCi
    ? [['list'], ['junit', { outputFile: 'test-results/playwright-junit.xml' }], ['html', { open: 'never' }]]
    : 'list',
  use: {
    baseURL: frontendUrl,
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: `cd ../backend && SERVER_PORT=${backendPort} ../scripts/with-java-17.sh ./mvnw spring-boot:run`,
      url: `${backendUrl}/v3/api-docs`,
      timeout: 120_000,
      reuseExistingServer: false,
    },
    {
      command: `VITE_API_TARGET=${backendUrl} npm run dev -- --host 127.0.0.1 --port ${frontendPort} --strictPort`,
      url: frontendUrl,
      timeout: 60_000,
      reuseExistingServer: false,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      grep: /@smoke/,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      grep: /@smoke/,
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chromium',
      grep: /@mobile/,
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'mobile-webkit',
      grep: /@mobile/,
      use: { ...devices['iPhone 15'] },
    },
  ],
})
