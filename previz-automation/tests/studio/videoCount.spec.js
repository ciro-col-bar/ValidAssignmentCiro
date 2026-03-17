import { test, expect } from '@playwright/test';
import { StudioPage } from '../../pages/StudioPage.js';
import { videoCounts } from '../../fixtures/testData.js';

/**
 * Studio — Video Count Tests
 * Covers: TC-S03 (valid counts), TC-S04 (boundary/invalid counts)
 * User Stories: US-02
 */
test.describe('Studio — Video Count', () => {

  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    const studio = new StudioPage(page);
    await studio.goto();
  });

  for (const { count, label } of [
    { count: videoCounts.min,     label: 'minimum (1)' },
    { count: videoCounts.default, label: 'default (3)' },
    { count: videoCounts.max,     label: 'maximum (5)' },
  ]) {
    test(`@P1 TC-S03 — Count ${count} (${label}) updates generate button label`, async ({ page }) => {
      const studio = new StudioPage(page);

      await studio.setVideoCount(count);
      const btnLabel = await studio.getGenerateButtonLabel();
      expect(btnLabel).toContain(String(count));
    });
  }

  test('@P2 TC-S04 — Value 0 is rejected or clamped to minimum', async ({ page }) => {
    const studio = new StudioPage(page);

    await studio.setVideoCount(videoCounts.underMin);
    const value = await studio.getVideoCountValue();
    const numValue = parseInt(value, 10);
    // Either input is blocked (empty/NaN) or clamped to 1
    expect(isNaN(numValue) || numValue >= videoCounts.min).toBe(true);
  });

  test('@P2 TC-S04 — Value 6 is rejected or clamped to maximum', async ({ page }) => {
    const studio = new StudioPage(page);

    await studio.setVideoCount(videoCounts.overMax);
    const value = await studio.getVideoCountValue();
    const numValue = parseInt(value, 10);
    // Either clamped to 5 or input shows 5 max
    expect(isNaN(numValue) || numValue <= videoCounts.max).toBe(true);
  });
});
