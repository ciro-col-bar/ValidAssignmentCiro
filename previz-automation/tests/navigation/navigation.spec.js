import { test, expect } from '@playwright/test';
import { BasePage } from '../../pages/BasePage.js';
import { expectedText } from '../../fixtures/testData.js';

/**
 * Navigation Tests
 * Covers: TC-N01 (all header links route correctly), TC-N02 (active state)
 * User Stories: US-13
 */
test.describe('Navigation — Header Links', () => {

  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    const base = new BasePage(page);
    await base.navigate('/');
  });

  test('@smoke @P2 TC-N01 — All three nav links are visible in the header', async ({ page }) => {
    const base = new BasePage(page);
    await expect(base.navLinks.studio).toBeVisible();
    await expect(base.navLinks.stockFootage).toBeVisible();
    await expect(base.navLinks.history).toBeVisible();
  });

  test('@P2 TC-N01 — Clicking Stock Footage nav loads the Stock Footage Generator page', async ({ page }) => {
    const base = new BasePage(page);
    await base.goToStockFootage();
    await expect(
      page.getByRole('heading', { name: expectedText.stockFootageHeading })
    ).toBeVisible();
  });

  test('@P2 TC-N01 — Clicking History nav loads the History page', async ({ page }) => {
    const base = new BasePage(page);
    await base.goToHistory();
    await expect(
      page.getByRole('heading', { name: expectedText.historyHeading })
    ).toBeVisible();
    expect(page.url()).toContain('/history');
  });

  test('@P2 TC-N01 — Clicking Studio nav returns to the Studio page', async ({ page }) => {
    const base = new BasePage(page);
    // Navigate away first
    await base.goToHistory();
    // Then back
    await base.goToStudio();
    await expect(
      page.getByRole('heading', { name: expectedText.studioHeading })
    ).toBeVisible();
  });

  test('@P2 TC-N01 — App logo/title link returns to Studio from any page', async ({ page }) => {
    const base = new BasePage(page);
    await base.goToHistory();
    await base.logoLink.click();
    await base.waitForNetworkIdle();
    await expect(
      page.getByRole('heading', { name: expectedText.studioHeading })
    ).toBeVisible();
  });

  test('@P3 TC-N02 — Navigation does not cause full page reload (SPA routing)', async ({ page }) => {
    const base = new BasePage(page);

    // Inject a JS marker into window — a full page reload would destroy it;
    // SPA client-side routing preserves the JavaScript context.
    await page.evaluate(() => { window.__spaMarker = true; });

    await base.goToStockFootage();

    const markerSurvived = await page.evaluate(() => window.__spaMarker === true);
    expect(markerSurvived).toBe(true);
  });
});
