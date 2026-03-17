import { BasePage } from './BasePage.js';

/**
 * HistoryPage — Page Object Model
 * Covers the History page (/history).
 * Ref: US-09 to US-12, TC-H01 to TC-H07
 */
export class HistoryPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // ── Locators ──────────────────────────────────────────────────────────
    this.heading           = page.getByRole('heading', { name: 'Video History' });
    this.yourVideosTab     = page.getByRole('button', { name: /Your Videos/i });
    this.allVideosTab      = page.getByRole('button', { name: /All Videos/i });
    // Refresh: icon-only button — identified by the lucide-refresh-cw SVG inside it
    this.refreshButton   = page.locator('button').filter({ has: page.locator('svg.lucide-refresh-cw') });
    // Video count: text-based locator is more resilient than Tailwind class selectors
    this.videoCountLabel = page.getByText(/\d+\s+videos?/i);
    this.emptyStateMessage = page.getByText("You haven't generated any videos yet.");
    this.emptyStateCta     = page.getByText("Go to the Studio to create your first video!");
    this.cookieDebugPanel  = page.locator('[data-testid="cookie-debug-panel"]');
    this.cookieUuidText    = page.locator('[data-testid="cookie-debug-panel"]').locator('text=/[0-9a-f-]{36}/i');
  }

  /**
   * Navigate to the History page.
   */
  async goto() {
    await this.navigate('/history');
    await this.heading.waitFor({ state: 'visible' });
  }

  /**
   * Switch to the "Your Videos" tab.
   */
  async clickYourVideos() {
    await this.yourVideosTab.click();
    // Wait for tab content: empty state message OR video cards — both are async
    await Promise.race([
      this.emptyStateMessage.waitFor({ state: 'visible', timeout: 8000 }),
      this.page.locator('[data-testid="video-cookie-info"]').first().waitFor({ state: 'visible', timeout: 8000 }),
    ]).catch(() => {});
  }

  /**
   * Switch to the "All Videos" tab.
   */
  async clickAllVideos() {
    await this.allVideosTab.click();
    // All Videos fetches from API; wait for first video card to confirm data loaded
    await this.page.locator('[data-testid="video-cookie-info"]').first()
      .waitFor({ state: 'visible', timeout: 15000 })
      .catch(() => {});
  }

  /**
   * Returns the displayed video count number.
   * @returns {Promise<number>}
   */
  async getVideoCount() {
    try {
      const text = await this.videoCountLabel.first().innerText();
      const match = text.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Returns all visible video card root locators.
   * @returns {import('@playwright/test').Locator}
   */
  getVideoCards() {
    return this.page.locator('[data-testid="video-cookie-info"]');
  }

  /**
   * Extracts the Cookie ID from a given video card.
   * @param {import('@playwright/test').Locator} cardLocator
   * @returns {Promise<string>}
   */
  async getCardCookieId(cardLocator) {
    const text = await cardLocator.innerText();
    const match = text.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    return match ? match[1] : '';
  }

  /**
   * Clicks the refresh button to reload the video list.
   */
  async clickRefresh() {
    await this.refreshButton.click();
    await this.waitForNetworkIdle();
  }

  /**
   * Reads the current user's UUID from the Cookie Debug Panel.
   * @returns {Promise<string>}
   */
  async getCookieDebugUUID() {
    const text = await this.cookieDebugPanel.innerText();
    const match = text.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    return match ? match[1] : '';
  }

  /**
   * Returns true if the empty state message is visible.
   * @returns {Promise<boolean>}
   */
  async isEmptyStateVisible() {
    return this.emptyStateMessage.isVisible();
  }

  /**
   * Returns true if the empty state CTA is visible.
   * @returns {Promise<boolean>}
   */
  async isEmptyStateCtaVisible() {
    return this.emptyStateCta.isVisible();
  }
}
