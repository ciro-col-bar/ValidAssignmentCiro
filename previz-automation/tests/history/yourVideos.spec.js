import { test, expect } from '@playwright/test';
import { HistoryPage } from '../../pages/HistoryPage.js';

/**
 * History — Your Videos Tests
 * Covers: TC-H01 (cookie scoping), TC-H02 (empty state)
 * User Stories: US-09, US-11
 */
test.describe('History — Your Videos', () => {
  // 1 retry for intermittent network timing variance under parallel load
  test.describe.configure({ retries: 1 });

  test('@smoke @P1 TC-H02 — Empty state is shown for a new user with no videos', async ({ page, context }) => {
    // Start with a clean cookie state to simulate a brand-new user
    await context.clearCookies();

    const historyPage = new HistoryPage(page);
    await historyPage.goto();
    await historyPage.clickYourVideos();

    // Use locator assertions (auto-retry) instead of boolean snapshots (no retry)
    await expect(historyPage.emptyStateMessage).toBeVisible();
    await expect(historyPage.emptyStateCta).toBeVisible();
  });

  test('@P1 TC-H01 — Your Videos tab shows only videos matching the current user cookie', async ({ page, context }) => {
    await context.clearCookies();

    const historyPage = new HistoryPage(page);
    await historyPage.goto();

    // Get the current user's UUID from the debug panel
    const myUUID = await historyPage.getCookieDebugUUID();
    expect(myUUID).toMatch(/[0-9a-f-]{36}/i);

    await historyPage.clickYourVideos();

    const cards = historyPage.getVideoCards();
    const count = await cards.count();

    if (count === 0) {
      // Empty state is acceptable for a new user
      await expect(historyPage.emptyStateMessage).toBeVisible();
      return;
    }

    // If videos exist, every card cookie ID must match the current user
    for (let i = 0; i < count; i++) {
      const cookieId = await historyPage.getCardCookieId(cards.nth(i));
      expect(cookieId.toLowerCase()).toBe(myUUID.toLowerCase());
    }
  });
});
