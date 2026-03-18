# BUG-006 · React hydration errors (#418, #423) thrown on every Stock Footage page load

| Field | Detail |
|---|---|
| **ID** | BUG-006 |
| **Title** | React hydration errors #418 (×6) and #423 (×1) thrown in console on every navigation to Stock Footage page |
| **Priority** | High |
| **Severity** | Major |
| **Status** | Open |
| **Module** | Stock Footage → Page Initialisation / SSR Hydration |
| **Reported By** | UAT exploratory session |
| **Date** | 2026-03-18 |

---

### Environment

- **Browser:** Chromium (mcp-web-inspector)
- **URL:** `https://previz-engine-m1mm9ayva-valid.vercel.app/stock-footage`
- **User Role:** Anonymous
- **OS:** Windows 11
- **Framework:** Next.js (React SSR/SSG, Vercel deployment)

---

### Preconditions

- Fresh browser session OR navigating to `/stock-footage` from any other page
- Console errors cleared before navigation

---

### Steps to Reproduce

1. Navigate to any page of the app (e.g., Studio `/`)
2. Open browser DevTools console
3. Click the **"Stock Footage"** nav link (or navigate directly to `/stock-footage`)
4. Observe the console immediately after navigation

---

### Expected Result

The Stock Footage page loads without any console errors. React hydration completes silently — the server-rendered HTML matches the client-rendered React tree.

---

### Actual Result

**7 React exception errors** fire immediately on every page load to `/stock-footage`:

```
[exception] Minified React error #418 — × 6 occurrences
  "Hydration failed because the initial UI does not match what was rendered on the server."
  at fd9d1056-9583fa19bc194043.js:1:24670

[exception] Minified React error #423 — × 1 occurrence
  "There was an error while hydrating but React was able to recover by instead client rendering from the nearest Suspense boundary."
  at fd9d1056-9583fa19bc194043.js:1:118349
```

The page **does eventually render** and appear functional (React #423 indicates recovery via client-side fallback), but:
- The initial server-rendered HTML is discarded and re-rendered client-side on every load
- This adds latency (full client re-render on each visit)
- The errors pollute the console, masking other legitimate issues
- The hydration mismatch may cause subtle state inconsistencies that are difficult to diagnose

---

### Affected Components

| Component | Selector | Type |
|---|---|---|
| Stock Footage page root | `/stock-footage` route | Next.js page |
| React Suspense boundary (recovery point) | `iZ` in minified bundle | Suspense boundary |

---

### Impact Analysis

- **User impact:** While the page renders correctly due to React's error recovery, the hydration failure causes an additional full client-side render pass on every visit to Stock Footage. This results in a noticeable layout flash or delayed interactivity compared to a correctly hydrating page.
- **Data/business risk:** The recurring errors mask other console issues and indicate a structural SSR/client mismatch — a class of bugs known to cause subtle data display issues, incorrect initial state, and accessibility failures (screen readers may read the server HTML before it is replaced).
- **Stability risk:** If the root cause is a dynamic value (e.g., Date.now(), Math.random(), browser-only API) rendered during SSR, it can cause non-deterministic UI states.
- **Violates:** General quality standard — a production application should have zero hydration errors. The test plan exit criterion states *"No critical console errors on primary environment (Chrome/Windows 11)"*.

---

### Console Evidence

```
[exception] Minified React error #418 (× 6)
  Error: Minified React error #418; visit https://react.dev/errors/418
  Stack: t5 → t9 → [Next.js bundle: fd9d1056-9583fa19bc194043.js]

[exception] Minified React error #423 (× 1)
  Error: Minified React error #423; visit https://react.dev/errors/423
  Stack: iZ → ia → [Next.js bundle: fd9d1056-9583fa19bc194043.js]
```

**React error definitions:**
- **#418** — `Hydration failed because the initial UI does not match what was rendered on the server.`
- **#423** — `There was an error while hydrating but React was able to recover by instead client rendering from the nearest Suspense boundary.`

**Reproducibility:** 100% — fires on every navigation to `/stock-footage`, both via direct URL and via in-app nav link.

---

### Traceability

- **Related User Stories:** [US-06] — *Parse a script to extract individual shots*; [US-08] — *Configure generation settings before parsing a script*
- **Related Test Cases:** [TC-SF01] — *Paste script and trigger Parse Script*; [TC-SF04] — *High Quality warning is displayed when toggled*
- **Potential Duplicates:** None

---

### Root Cause Hypothesis

The most common causes of React hydration mismatch (#418) in Next.js are:
1. **Browser-only APIs** accessed during render (e.g., `window`, `localStorage`, `document`, `navigator`) — these are not available during SSR, causing different output
2. **Non-deterministic values** rendered at component mount (e.g., `Date.now()`, `Math.random()`, cookie reads)
3. **Conditional rendering based on client state** (e.g., cookie UUID read) that differs between server and client

Given that the Stock Footage page has generation settings that may depend on browser state (cookies, localStorage for persisted settings), the mismatch is likely caused by one of these client-only reads being used in the initial render.

**Suggested fix direction:**
- Audit the Stock Footage page component for any browser-only API usage during the render phase
- Wrap browser-only reads in `useEffect` or use `next/dynamic` with `{ ssr: false }` for components that depend on client state
- Use React's `suppressHydrationWarning` only as a last resort for genuinely dynamic values (e.g., timestamps)

---

### Evidence

- `Bugs/evidence/BUG-006/BUG-006-stock-footage-loads-despite-hydration-errors-2026-03-18T22-24-22-025Z.png` — Stock Footage page renders visually but with 7 hydration errors in console
