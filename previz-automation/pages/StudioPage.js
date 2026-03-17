import { BasePage } from './BasePage.js';

/**
 * StudioPage — Page Object Model
 * Covers the Studio tab (direct prompt-to-video generation).
 * Ref: US-01 to US-05, TC-S01 to TC-S08
 */
export class StudioPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // ── Locators ──────────────────────────────────────────────────────────
    // Using semantic/label-based selectors — resilient to Tailwind class changes
    this.heading         = page.getByRole('heading', { name: 'Create Your Scene' });
    this.promptTextarea  = page.locator('#direct-prompt');
    this.videoCountInput = page.locator('#num-videos');
    // Labels have no `for` attr and selects have no `id`; use CSS adjacent-sibling
    // selectors with Playwright's :has-text() pseudo-class
    this.durationSelect  = page.locator('label:has-text("Video Duration") + select');
    this.aspectSelect    = page.locator('label:has-text("Aspect Ratio") + select');
    // App uses a plain <button> toggle with bg-accent (on) / bg-secondary (off) classes
    // — no role="switch" or aria-checked in the DOM
    this.hqToggle        = page.locator('label:has-text("High Quality Mode") + button');
    this.generateButton  = page.getByRole('button', { name: /Generate .* Videos? Directly/i });
  }

  /**
   * Navigate to the Studio page.
   */
  async goto() {
    await this.navigate('/');
    await this.heading.waitFor({ state: 'visible' });
  }

  /**
   * Fill the direct prompt textarea.
   * @param {string} text
   */
  async fillPrompt(text) {
    await this.promptTextarea.clear();
    await this.promptTextarea.fill(text);
  }

  /**
   * Set the number of videos to generate (1–5).
   * @param {number} count
   */
  async setVideoCount(count) {
    await this.videoCountInput.fill(String(count));
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
   * @param {'Landscape'|'Portrait'} ratio
   */
  async setAspectRatio(ratio) {
    await this.aspectSelect.selectOption({ label: ratio });
  }

  /**
   * Enable or disable High Quality Mode.
   * Reads current aria state before clicking to avoid redundant toggling.
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
   * Returns the full text of the generate button (e.g. "Generate 3 Videos Directly").
   * @returns {Promise<string>}
   */
  async getGenerateButtonLabel() {
    return this.generateButton.innerText();
  }

  /**
   * Click the generate button. Does NOT wait for video completion —
   * use videoHelper.waitForVideoCard() for post-generation assertions.
   */
  async clickGenerate() {
    await this.generateButton.click();
  }

  /**
   * Returns the current value of the video count input.
   * @returns {Promise<string>}
   */
  async getVideoCountValue() {
    return this.videoCountInput.inputValue();
  }
}
