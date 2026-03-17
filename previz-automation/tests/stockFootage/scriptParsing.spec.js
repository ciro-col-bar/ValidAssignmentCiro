import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { StockFootagePage } from '../../pages/StockFootagePage.js';
import { prompts, expectedText } from '../../fixtures/testData.js';

const standardScript = readFileSync(
  resolve(process.cwd(), 'fixtures/scripts/standard-screenplay.txt'), 'utf8'
);

/**
 * Stock Footage — Script Parsing Tests
 * Covers: TC-SF01 (standard script), TC-SF05 (empty script)
 * User Stories: US-06
 */
test.describe('Stock Footage — Script Parsing', () => {

  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    const sfPage = new StockFootagePage(page);
    await sfPage.goto();
  });

  test('@smoke @P1 TC-SF01 — Stock Footage page loads with correct heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: expectedText.stockFootageHeading })
    ).toBeVisible();
  });

  test('@P1 TC-SF01 — Script textarea accepts multi-scene screenplay content', async ({ page }) => {
    const sfPage = new StockFootagePage(page);

    await sfPage.fillScript(standardScript);
    await expect(sfPage.scriptTextarea).toHaveValue(standardScript);
  });

  test('@P1 TC-SF01 — Parse Script button is visible and enabled when script is present', async ({ page }) => {
    const sfPage = new StockFootagePage(page);

    await sfPage.fillScript(standardScript);
    await expect(sfPage.parseButton).toBeVisible();
    await expect(sfPage.parseButton).toBeEnabled();
  });

  // TC-SF05 split: one test per validation strategy (button-disabled vs. message shown)
  test('@P1 TC-SF05a — Empty script: Parse Script button is disabled', async ({ page }) => {
    const sfPage = new StockFootagePage(page);
    await sfPage.fillScript(prompts.empty);
    await expect(sfPage.parseButton).toBeDisabled();
  });

  test('@P1 TC-SF05b — Empty script: submitting shows validation feedback', async ({ page }) => {
    const sfPage = new StockFootagePage(page);
    await sfPage.fillScript(prompts.empty);

    const isDisabled = await sfPage.parseButton.isDisabled();
    if (isDisabled) {
      test.skip(true, 'App uses button-disabled pattern (TC-SF05a); validation message not shown.');
    }

    await sfPage.clickParseScript();
    await expect(
      page.getByRole('alert').or(page.getByText(/required|cannot be empty|enter a script/i))
    ).toBeVisible({ timeout: 5_000 });
  });
});
