# Bug Report — Mobile Test Execution
**Project:** Pre-Viz Engine v1.9.0
**Execution Date:** 2026-03-17
**Platform:** Mobile Safari (WebKit)
**Test Suite:** `npm run test:mobile`
**Total Tests:** 84 | **Passed:** 77 | **Failed:** 1 | **Flaky:** 2 | **Skipped:** 4

---

## BUG-01 — [FAILED] UUID in Debug Panel Does Not Match the Browser Cookie Value on Mobile Safari

| Field        | Details                                  |
|--------------|------------------------------------------|
| **ID**       | BUG-01                                   |
| **Test Case**| TC-H06                                   |
| **Severity** | High                                     |
| **Priority** | P1                                       |
| **Status**   | Open                                     |
| **Browser**  | Mobile Safari (WebKit)                   |
| **Project**  | `[mobile-safari]`                        |
| **File**     | `tests/history/cookiePersistence.spec.js:32` |

### Summary
On Mobile Safari, the UUID displayed in the debug panel on the History page does not match the UUID stored in the browser cookie. The debug panel returns an empty string instead of a valid UUID, causing a mismatch assertion to fail consistently across all attempts including the retry.

### Steps to Reproduce
1. Open the application in a Mobile Safari (WebKit) browser context.
2. Navigate to the History page.
3. Read the UUID from the debug panel using `historyPage.getCookieDebugUUID()`.
4. Read the `previz-user-id` cookie value from the browser context.
5. Assert that both values match.

### Actual Result
The debug panel UUID returns an **empty string** (`""`), so the comparison between the cookie value and the panel value fails:
```
Expected pattern: /[0-9a-f-]{36}/i
Received string:  ""
```

### Expected Result
The UUID shown in the debug panel should match the `previz-user-id` cookie value and conform to a valid UUID format (`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).

### Evidences
- [Attempt 1 — Screenshot](evidence/BUG-01_TC-H06_uuid-debug-panel-mismatch_attempt1.png)
- [Retry 1 — Screenshot](evidence/BUG-01_TC-H06_uuid-debug-panel-mismatch_retry1.png)

---

## BUG-02 — [FLAKY] New UUID Is Not Assigned After Cookie Clear on Mobile Safari

| Field        | Details                                  |
|--------------|------------------------------------------|
| **ID**       | BUG-02                                   |
| **Test Case**| TC-H07                                   |
| **Severity** | Medium                                   |
| **Priority** | P2                                       |
| **Status**   | Open                                     |
| **Browser**  | Mobile Safari (WebKit)                   |
| **Project**  | `[mobile-safari]`                        |
| **File**     | `tests/history/cookiePersistence.spec.js:47` |

### Summary
On Mobile Safari, after all cookies, localStorage, and sessionStorage are cleared, the debug panel does not display a new UUID upon revisit to the History page. The UUID is read as an empty string instead of a freshly generated valid UUID. This test passed on the second attempt (flaky behavior), indicating a timing or initialization race condition.

### Steps to Reproduce
1. Open the application in a Mobile Safari (WebKit) browser context.
2. Navigate to the History page.
3. Retrieve the initial UUID from the debug panel.
4. Clear all cookies, localStorage, and sessionStorage via `clearPrevizCookies(context)`.
5. Navigate back to the History page.
6. Retrieve the new UUID from the debug panel.
7. Assert the new UUID is a valid UUID format.

### Actual Result
After clearing cookies, the debug panel UUID returns an **empty string** on first attempt:
```
Expected pattern: /[0-9a-f-]{36}/i
Received string:  ""
```
Test passed on retry, confirming intermittent / flaky behavior.

### Expected Result
After clearing storage, a brand-new UUID should be generated and displayed in the debug panel, conforming to UUID format `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`.

### Evidences
- [Attempt 1 — Screenshot](evidence/BUG-02_TC-H07_new-uuid-after-clear-empty_attempt1.png)

---

## BUG-03 — [FLAKY] Your Videos Tab Does Not Resolve User UUID on Mobile Safari

| Field        | Details                                  |
|--------------|------------------------------------------|
| **ID**       | BUG-03                                   |
| **Test Case**| TC-H01                                   |
| **Severity** | Medium                                   |
| **Priority** | P1                                       |
| **Status**   | Open                                     |
| **Browser**  | Mobile Safari (WebKit)                   |
| **Project**  | `[mobile-safari]`                        |
| **File**     | `tests/history/yourVideos.spec.js:26`    |

### Summary
On Mobile Safari, the UUID retrieved from the debug panel on the History page returns an empty string when attempting to validate that the "Your Videos" tab only shows videos belonging to the current user. This test passed on retry (flaky), suggesting a rendering or initialization timing issue specific to WebKit.

### Steps to Reproduce
1. Open the application in a Mobile Safari (WebKit) browser context.
2. Navigate to the History page.
3. Retrieve the current user UUID via `historyPage.getCookieDebugUUID()`.
4. Assert the UUID matches a valid UUID pattern.
5. Click the "Your Videos" tab.
6. Verify all displayed video cards contain the current user's UUID.

### Actual Result
`getCookieDebugUUID()` returns an **empty string** on first attempt, failing the UUID validation:
```
Expected pattern: /[0-9a-f-]{36}/i
Received string:  ""
```
Test passed on retry, confirming intermittent behavior.

### Expected Result
The debug panel should immediately expose a valid UUID after page load, and all video cards in the "Your Videos" tab should match that UUID.

### Evidences
- [Attempt 1 — Screenshot](evidence/BUG-03_TC-H01_your-videos-uuid-empty_attempt1.png)

---

## Root Cause Analysis (Hypothesis)

All three bugs share the same failure pattern: `getCookieDebugUUID()` returns `""` on Mobile Safari. This points to a **single underlying root cause** rather than three independent defects:

> The debug panel element that exposes the UUID may rely on a JavaScript initialization that is slower or deferred on WebKit/Mobile Safari compared to Chromium. The test reads the element before the app has written the UUID value to the DOM.

**Recommended Investigation:**
- Check if the debug panel renders the UUID synchronously or via a `useEffect` / async call.
- Add an explicit wait for the UUID element to be non-empty before reading it in `getCookieDebugUUID()`.
- Verify if Safari's cookie/storage handling differs from Chrome (e.g., ITP — Intelligent Tracking Prevention).
