import { BasePage } from './BasePage.js';

/**
 * StockFootagePage — Page Object Model
 * Covers the Stock Footage Generator tab.
 * Ref: US-06 to US-08, TC-SF01 to TC-SF06
 */
export class StockFootagePage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // ── Locators ──────────────────────────────────────────────────────────
    // Using semantic/label-based selectors — resilient to Tailwind class changes
    this.heading        = page.getByRole('heading', { name: 'Stock Footage Generator' });
    this.scriptTextarea = page.locator('#script-text');
    // Labels have no `for` attr and selects have no `id`; use CSS adjacent-sibling
    // selectors with Playwright's :has-text() pseudo-class
    this.durationSelect = page.locator('label:has-text("Video Duration") + select');
    this.aspectSelect   = page.locator('label:has-text("Aspect Ratio") + select');
    // App uses a plain <button> toggle with bg-accent (on) / bg-secondary (off) classes
    this.hqToggle       = page.locator('label:has-text("High Quality Mode") + button');
    this.hqWarning      = page.getByText('High quality mode can take 3x longer');
    this.parseButton    = page.getByRole('button', { name: 'Parse Script' });
  }

  /**
   * Navigate to the Stock Footage page via header nav.
   */
  async goto() {
    await this.navigate('/stock-footage');
    await this.heading.waitFor({ state: 'visible' });
  }

  /**
   * Fill the script textarea with the provided content.
   * @param {string} scriptContent
   */
  async fillScript(scriptContent) {
    await this.scriptTextarea.clear();
    await this.scriptTextarea.fill(scriptContent);
  }

  /**
   * Select the video duration.
   * @param {'4 seconds'|'8 seconds'|'12 seconds'} duration
   */
  async setDuration(duration) {
    await this.durationSelect.selectOption({ label: duration });
  }

  /**
   * Select the aspect ratio.
   * @param {'Portrait'|'Landscape'} ratio
   */
  async setAspectRatio(ratio) {
    await this.aspectSelect.selectOption({ label: ratio });
  }

  /**
   * Enable or disable High Quality Mode.
   * @param {boolean} enable
   */
  async toggleHighQuality(enable) {
    // Detect state via bg-accent class (on) vs bg-secondary (off) — no aria-checked
    const currentlyOn = await this.isHighQualityEnabled();
    if (enable !== currentlyOn) {
      // force:true bypasses pointer-event interception on narrow mobile viewports
      await this.hqToggle.click({ force: true });
    }
  }

  /**
   * Returns true if High Quality Mode is currently enabled.
   * @returns {Promise<boolean>}
   */
  async isHighQualityEnabled() {
    return this.hqToggle.evaluate(btn => btn.classList.contains('bg-accent'));
  }

  /**
   * Returns whether the high quality warning banner is visible.
   * @returns {Promise<boolean>}
   */
  async isHighQualityWarningVisible() {
    return this.hqWarning.isVisible();
  }

  /**
   * Click the Parse Script button.
   * Does NOT wait for generation completion.
   */
  async clickParseScript() {
    await this.parseButton.click();
  }
}
