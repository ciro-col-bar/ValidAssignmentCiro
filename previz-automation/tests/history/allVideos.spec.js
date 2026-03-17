import { test, expect } from '@playwright/test';
import { HistoryPage } from '../../pages/HistoryPage.js';

/**
 * History — All Videos Tests
 * Covers: TC-H03 (all videos + count), TC-H04 (card metadata), TC-H05 (refresh)
 * User Stories: US-10, US-12
 */
test.describe('History — All Videos', () => {

  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    const historyPage = new HistoryPage(page);
    await historyPage.goto();
    await historyPage.clickAllVideos();
  });

  test('@smoke @P2 TC-H03 — All Videos tab displays a video count greater than zero', async ({ page }) => {
    const historyPage = new HistoryPage(page);
    const count = await historyPage.getVideoCount();
    expect(count).toBeGreaterThan(0);
  });

  test('@P2 TC-H03 — All Videos tab shows videos from multiple different users', async ({ page }) => {
    const historyPage = new HistoryPage(page);
    const cards = historyPage.getVideoCards();
    const cardCount = await cards.count();

    // Need at least 2 cards to check for multiple users
    if (cardCount < 2) {
      test.skip();
      return;
    }

    const cookieIds = new Set();
    const limit = Math.min(cardCount, 10);
    for (let i = 0; i < limit; i++) {
      const id = await historyPage.getCardCookieId(cards.nth(i));
      if (id) cookieIds.add(id.toLowerCase());
    }
    // Community tab should contain videos from more than 1 user
    expect(cookieIds.size).toBeGreaterThan(1);
  });

  test('@P2 TC-H04 — First video card contains a cookie ID', async ({ page }) => {
    const historyPage = new HistoryPage(page);
    const cards = historyPage.getVideoCards();
    const count = await cards.count();

    if (count === 0) {
      test.skip();
      return;
    }

    const cookieId = await historyPage.getCardCookieId(cards.first());
    expect(cookieId).toMatch(/[0-9a-f-]{36}/i);
  });

  test('@P3 TC-H05 — Refresh button reloads video list without full page navigation', async ({ page }) => {
    const historyPage = new HistoryPage(page);
    const countBefore = await historyPage.getVideoCount();

    // Capture current URL — should not change (SPA, no page reload)
    const urlBefore = page.url();
    await historyPage.clickRefresh();
    const urlAfter = page.url();

    expect(urlAfter).toBe(urlBefore);

    // Count should still be valid after refresh
    const countAfter = await historyPage.getVideoCount();
    // Videos can only increase (new generations arrive); they never decrease
    expect(countAfter).toBeGreaterThanOrEqual(countBefore);
  });
});
