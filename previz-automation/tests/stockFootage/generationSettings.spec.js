import { test, expect } from '@playwright/test';
import { StockFootagePage } from '../../pages/StockFootagePage.js';
import { settingsCombinations, expectedText } from '../../fixtures/testData.js';

/**
 * Stock Footage — Generation Settings Tests
 * Covers: TC-SF03 (settings applied), TC-SF04 (HQ warning)
 * User Stories: US-05, US-08
 */
test.describe('Stock Footage — Generation Settings', () => {

  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    const sfPage = new StockFootagePage(page);
    await sfPage.goto();
  });

  test('@P2 TC-SF04 — High Quality warning is shown when toggle is enabled', async ({ page }) => {
    const sfPage = new StockFootagePage(page);

    // Explicitly disable HQ first — app may persist state or default to ON
    await sfPage.toggleHighQuality(false);
    await expect(sfPage.hqToggle).not.toHaveClass(/bg-accent/);
    await expect(sfPage.hqWarning).not.toBeVisible();

    await sfPage.toggleHighQuality(true);
    await expect(sfPage.hqWarning).toBeVisible();
    await expect(sfPage.hqWarning).toContainText(expectedText.hqWarning);
  });

  test('@P2 TC-SF04 — High Quality warning disappears when toggle is disabled', async ({ page }) => {
    const sfPage = new StockFootagePage(page);

    await sfPage.toggleHighQuality(true);
    await expect(sfPage.hqWarning).toBeVisible();

    await sfPage.toggleHighQuality(false);
    await expect(sfPage.hqWarning).not.toBeVisible();
  });

  for (const combo of settingsCombinations) {
    test(`@P2 TC-SF03 — Settings applied: ${combo.label}`, async ({ page }) => {
      const sfPage = new StockFootagePage(page);

      await sfPage.setDuration(combo.duration);
      await sfPage.setAspectRatio(combo.ratio);
      await sfPage.toggleHighQuality(combo.hq);

      await expect(sfPage.durationSelect).toHaveValue(new RegExp(combo.duration.split(' ')[0], 'i'));
      await expect(sfPage.aspectSelect).toHaveValue(new RegExp(combo.ratio, 'i'));
      // toHaveClass auto-retries — waits for React re-render after toggle click
      if (combo.hq) {
        await expect(sfPage.hqToggle).toHaveClass(/bg-accent/);
      } else {
        await expect(sfPage.hqToggle).not.toHaveClass(/bg-accent/);
      }
    });
  }
});
