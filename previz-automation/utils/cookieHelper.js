/**
 * cookieHelper.js
 * Utilities for reading, asserting, and managing browser cookies.
 * Used primarily for History cookie-scoping tests.
 * Ref: TC-H01, TC-H06, TC-H07
 */

/**
 * Returns the UUID cookie value for the previz domain.
 * @param {import('@playwright/test').BrowserContext} context
 * @param {string} baseUrl
 * @returns {Promise<string|null>}
 */
export async function getPrevizCookieUUID(context, baseUrl) {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const hostname = new URL(baseUrl).hostname;

  // Try URL-filtered first (standard), fall back to domain-filtered (WebKit ITP workaround)
  let cookies = await context.cookies(baseUrl);
  if (!cookies.some(c => uuidPattern.test(c.value))) {
    // Fallback: get all cookies and filter to the app domain
    const all = await context.cookies();
    cookies = all.filter(c => hostname.endsWith(c.domain.replace(/^\./, '')));
  }

  for (const cookie of cookies) {
    if (uuidPattern.test(cookie.value)) {
      return cookie.value;
    }
  }
  return null;
}

/**
 * Clears all cookies for the previz domain, simulating a "new user" state.
 * @param {import('@playwright/test').BrowserContext} context
 */
export async function clearPrevizCookies(context) {
  await context.clearCookies();
}

/**
 * Asserts that every cookie ID found in the video cards array
 * matches the expected user UUID.
 * @param {string[]} cardCookieIds  — array of UUIDs from video cards
 * @param {string}   expectedUUID   — the current user's UUID
 * @returns {{ pass: boolean, mismatches: string[] }}
 */
export function assertAllCardsMatchUser(cardCookieIds, expectedUUID) {
  const mismatches = cardCookieIds.filter(
    (id) => id.toLowerCase() !== expectedUUID.toLowerCase()
  );
  return {
    pass: mismatches.length === 0,
    mismatches,
  };
}
