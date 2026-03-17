/**
 * BasePage
 * Base class for all Page Object Models.
 * Provides shared navigation and wait utilities.
 */
export class BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  /**
   * Navigate to a relative path and wait for network idle.
   * @param {string} [path='']
   */
  async navigate(path = '') {
    await this.page.goto(path);
    await this.waitForNetworkIdle();
  }

  /**
   * Wait for DOM content to be ready.
   * Uses 'domcontentloaded' instead of 'networkidle' because React SPAs may
   * have persistent polling/keep-alive connections that never reach networkidle,
   * causing hangs. Each page's goto() adds a heading.waitFor() for content readiness.
   */
  async waitForNetworkIdle() {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Returns the document title.
   * @returns {Promise<string>}
   */
  async getTitle() {
    return this.page.title();
  }

  /**
   * Clicks the Studio nav link.
   */
  async goToStudio() {
    // dispatchEvent bypasses pointer-events interception on all browsers/viewports
    // (force:true alone can timeout on WebKit after scroll-into-view)
    await this.page.getByRole('link', { name: 'Studio' }).dispatchEvent('click');
    await this.waitForNetworkIdle();
  }

  /**
   * Clicks the Stock Footage nav link.
   */
  async goToStockFootage() {
    await this.page.getByRole('link', { name: 'Stock Footage' }).dispatchEvent('click');
    await this.waitForNetworkIdle();
  }

  /**
   * Clicks the History nav link.
   */
  async goToHistory() {
    await this.page.getByRole('link', { name: 'History' }).dispatchEvent('click');
    await this.waitForNetworkIdle();
  }

  /**
   * Returns the header navigation locators for assertion.
   * @returns {{ studio: import('@playwright/test').Locator, stockFootage: import('@playwright/test').Locator, history: import('@playwright/test').Locator }}
   */
  get navLinks() {
    return {
      studio: this.page.getByRole('link', { name: 'Studio' }),
      stockFootage: this.page.getByRole('link', { name: 'Stock Footage' }),
      history: this.page.getByRole('link', { name: 'History' }),
    };
  }

  /**
   * Returns the app logo/title link locator.
   * @returns {import('@playwright/test').Locator}
   */
  get logoLink() {
    return this.page.getByRole('link', { name: /Pre-Viz Engine/i }).first();
  }
}
