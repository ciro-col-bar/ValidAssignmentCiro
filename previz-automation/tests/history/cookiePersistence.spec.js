import { test, expect } from '@playwright/test';
import { HistoryPage } from '../../pages/HistoryPage.js';
import { getPrevizCookieUUID, clearPrevizCookies } from '../../utils/cookieHelper.js';
import { config } from '../../config/environments.js';

// Centralised — never repeat BASE_URL literals across tests
const BASE_URL = config.baseUrl;

/**
 * History — Cookie Persistence Tests
 * Covers: TC-H06 (cookie persists across sessions), TC-H07 (cookie cleared → new UUID)
 * User Stories: US-14
 */
test.describe('History — Cookie Persistence', () => {
  // 1 retry for intermittent network timing variance under parallel load
  test.describe.configure({ retries: 1 });

  test('@P1 TC-H06 — Cookie UUID is assigned on first visit', async ({ page, context }) => {
    await context.clearCookies();
    const baseUrl = BASE_URL;

    const historyPage = new HistoryPage(page);
    await historyPage.goto();

    const uuid = await getPrevizCookieUUID(context, baseUrl);

    // A UUID should be set after visiting the app
    expect(uuid).not.toBeNull();
    expect(uuid).toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  });

  test('@P1 TC-H06 — UUID in debug panel matches the browser cookie value', async ({ page, context }) => {
    await context.clearCookies();
    const baseUrl = BASE_URL;

    const historyPage = new HistoryPage(page);
    await historyPage.goto();

    const cookieUUID = await getPrevizCookieUUID(context, baseUrl);
    const debugPanelUUID = await historyPage.getCookieDebugUUID();

    expect(cookieUUID).not.toBeNull();
    expect(debugPanelUUID).not.toBe('');
    expect(cookieUUID.toLowerCase()).toBe(debugPanelUUID.toLowerCase());
  });

  test('@P2 TC-H07 — Clearing cookies results in a new UUID on revisit', async ({ page, context }) => {
    const baseUrl = BASE_URL;

    // First visit — capture UUID
    const historyPage = new HistoryPage(page);
    await historyPage.goto();
    const firstUUID = await historyPage.getCookieDebugUUID();
    expect(firstUUID).toMatch(/[0-9a-f-]{36}/i);

    // Clear cookies, localStorage, and sessionStorage — app may store UUID in any
    await clearPrevizCookies(context);
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });

    // Re-visit — should receive a new UUID
    await historyPage.goto();
    const secondUUID = await historyPage.getCookieDebugUUID();
    expect(secondUUID).toMatch(/[0-9a-f-]{36}/i);

    // The two UUIDs must differ
    expect(firstUUID.toLowerCase()).not.toBe(secondUUID.toLowerCase());
  });

  test('@P2 TC-H07 — After cookie clear, Your Videos tab shows empty state', async ({ page, context }) => {
    const historyPage = new HistoryPage(page);
    await historyPage.goto();

    // Clear cookies mid-session
    await clearPrevizCookies(context);
    await historyPage.goto();
    await historyPage.clickYourVideos();

    await expect(historyPage.emptyStateMessage).toBeVisible();
  });
});
