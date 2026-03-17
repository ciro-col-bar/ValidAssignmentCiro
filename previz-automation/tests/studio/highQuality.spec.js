import { test, expect } from '@playwright/test';
import { StudioPage } from '../../pages/StudioPage.js';

/**
 * Studio — High Quality Mode Tests
 * Covers: TC-S07
 * User Stories: US-05
 */
test.describe('Studio — High Quality Mode', () => {

  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    const studio = new StudioPage(page);
    await studio.goto();
  });

  test('@P2 TC-S07 — HQ toggle is present and defaults to off', async ({ page }) => {
    const studio = new StudioPage(page);
    await expect(studio.hqToggle).toBeVisible();
    // App uses bg-accent class (on) / bg-secondary class (off) — no aria-checked
    await expect(studio.hqToggle).not.toHaveClass(/bg-accent/);
  });

  test('@P2 TC-S07 — HQ toggle can be enabled', async ({ page }) => {
    const studio = new StudioPage(page);
    await studio.toggleHighQuality(true);
    // toHaveClass auto-retries — waits for React re-render after click
    await expect(studio.hqToggle).toHaveClass(/bg-accent/);
  });

  test('@P2 TC-S07 — HQ toggle can be disabled after enabling', async ({ page }) => {
    const studio = new StudioPage(page);
    await studio.toggleHighQuality(true);
    await studio.toggleHighQuality(false);
    await expect(studio.hqToggle).not.toHaveClass(/bg-accent/);
  });
});
