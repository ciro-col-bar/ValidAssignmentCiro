// @ts-check
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env') });

// Guard: fail fast if BASE_URL is missing in CI where .env may not exist
if (process.env.CI && !process.env.BASE_URL) {
  throw new Error(
    '[playwright.config] BASE_URL environment variable is not set. ' +
    'Add it as a GitHub Actions variable (vars.BASE_URL) or set it in .env.'
  );
}

/**
 * Playwright configuration — Pre-Viz Engine v1.9.0
 * Ref: TAP-PREVIZ-001
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,         // Sequential within file — prevents cookie test pollution
  workers: process.env.CI ? 2 : 4,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,              // Default per test; generation tests override to 120s
  expect: { timeout: 10_000 },

  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/playwright-report', open: 'never' }],
    ['allure-playwright', { resultsDir: 'reports/allure-results' }],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'https://previz-engine-m1mm9ayva-valid.vercel.app',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    // ── Desktop ──────────────────────────────────────────────────────────────
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // ── Mobile ───────────────────────────────────────────────────────────────
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] },
    },
  ],

  outputDir: 'reports/test-results',
});
