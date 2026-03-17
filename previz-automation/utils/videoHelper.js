/**
 * videoHelper.js
 * Utilities for waiting on and asserting video card metadata.
 * Ref: TC-S01, TC-S05, TC-S06, TC-S07, TC-SF02, TC-SF03
 */

/** @typedef {{ status: string, prompt: string, duration: string, ratio: string, quality: string, cookieId: string }} VideoCardMeta */

/**
 * Waits until at least one video card appears in the History view,
 * or until the timeout is exceeded.
 *
 * @param {import('@playwright/test').Page} page
 * @param {number} [timeoutMs=120_000] - Generation can take up to 3 min in HQ mode
 * @returns {Promise<void>}
 */
export async function waitForFirstVideoCard(page, timeoutMs = 120_000) {
  await page.locator('[data-testid="video-cookie-info"]').first().waitFor({
    state: 'visible',
    timeout: timeoutMs,
  });
}

/**
 * Waits until the video count in History reaches at least `minCount`.
 *
 * @param {import('@playwright/test').Page} page
 * @param {number} minCount
 * @param {number} [timeoutMs=120_000]
 * @returns {Promise<void>}
 */
export async function waitForVideoCount(page, minCount, timeoutMs = 120_000) {
  await page.waitForFunction(
    (expectedMin) => {
      // Count video cards via stable data-testid rather than fragile Tailwind class
      const cards = document.querySelectorAll('[data-testid="video-cookie-info"]');
      return cards.length >= expectedMin;
    },
    minCount,
    { timeout: timeoutMs }
  );
}

/**
 * Extracts visible metadata text fields from a video card element.
 * Returns best-effort values; fields not found return empty string.
 *
 * @param {import('@playwright/test').Locator} cardLocator
 * @returns {Promise<VideoCardMeta>}
 */
export async function extractCardMetadata(cardLocator) {
  const fullText = await cardLocator.innerText();

  const cookieMatch  = fullText.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
  const durationMatch = fullText.match(/(\d+s)/);
  const ratioMatch    = fullText.match(/\b(Landscape|Portrait)\b/i);
  const qualityMatch  = fullText.match(/\b(Standard|High Quality)\b/i);
  const statusMatch   = fullText.match(/\b(Completed|Processing|Failed)\b/i);

  return {
    status:   statusMatch   ? statusMatch[1]   : '',
    duration: durationMatch ? durationMatch[1] : '',
    ratio:    ratioMatch    ? ratioMatch[1]     : '',
    quality:  qualityMatch  ? qualityMatch[1]   : '',
    cookieId: cookieMatch   ? cookieMatch[1]    : '',
    // Prompt text: extract by removing the known metadata tokens from full text
    prompt: fullText
      .replace(/Cookie ID:.*$/gim, '')
      .replace(/\b(Completed|Processing|Failed)\b/gi, '')
      .replace(/\b\d+s\b/g, '')
      .replace(/\b(Landscape|Portrait)\b/gi, '')
      .replace(/\b(Standard|High Quality)\b/gi, '')
      .replace(/\d+m \d+s/g, '')
      .replace(/\d+ (minutes?|hours?|days?) ago/gi, '')
      .trim(),
  };
}
