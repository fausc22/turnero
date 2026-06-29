import { defineConfig, devices } from '@playwright/test';

const headed = process.env.E2E_HEADED === '1';

export default defineConfig({
  testDir: './specs',
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    headless: !headed,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'cliente',
      use: { baseURL: 'http://peluqueria-naz.localhost:4010' },
      testMatch: /reserva-cliente/,
    },
    {
      name: 'panel',
      use: { baseURL: 'http://panel.localhost:4011' },
      testMatch: /panel-turno/,
    },
    {
      name: 'super',
      use: { baseURL: 'http://admin.localhost:4012' },
      testMatch: /super-tenant/,
    },
  ],
  webServer: {
    command: 'npm run dev',
    cwd: '..',
    url: 'http://api.localhost:4013/health',
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});
