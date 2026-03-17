import { test, expect } from '@playwright/test';
import { StudioPage } from '../../pages/StudioPage.js';
import { aspectRatios } from '../../fixtures/testData.js';

/**
 * Studio — Aspect Ratio Tests
 * Covers: TC-S06
 * User Stories: US-04
 */
test.describe('Studio — Aspect Ratio', () => {

  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    const studio = new StudioPage(page);
    await studio.goto();
  });

  test('@P2 TC-S06 — Default aspect ratio is Landscape', async ({ page }) => {
    const studio = new StudioPage(page);
    await expect(studio.aspectSelect).toHaveValue(/landscape/i);
  });

  test('@P2 TC-S06 — Can switch to Portrait', async ({ page }) => {
    const studio = new StudioPage(page);
    await studio.setAspectRatio(aspectRatios.portrait);
    await expect(studio.aspectSelect).toHaveValue(/portrait/i);
  });

  test('@P2 TC-S06 — Can switch back to Landscape from Portrait', async ({ page }) => {
    const studio = new StudioPage(page);
    await studio.setAspectRatio(aspectRatios.portrait);
    await studio.setAspectRatio(aspectRatios.landscape);
    await expect(studio.aspectSelect).toHaveValue(/landscape/i);
  });
});
