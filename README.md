# Pre-Viz Engine — Test Automation Suite

> Playwright + JavaScript end-to-end test automation for **Pre-Viz Engine v1.9.0**
> Ref: TAP-PREVIZ-001 | TP-PREVIZ-001

---

## Table of Contents

1. [Overview](#1-overview)
2. [Prerequisites](#2-prerequisites)
3. [Installation](#3-installation)
4. [Configuration](#4-configuration)
5. [Running Tests](#5-running-tests)
6. [Test Tags & Filtering](#6-test-tags--filtering)
7. [Project Structure](#7-project-structure)
8. [Page Object Model](#8-page-object-model)
9. [Test Data & Fixtures](#9-test-data--fixtures)
10. [Utilities Reference](#10-utilities-reference)
11. [Reports](#11-reports)
12. [CI/CD Pipeline](#12-cicd-pipeline)
13. [Writing New Tests](#13-writing-new-tests)
14. [Code Quality](#14-code-quality)
15. [Troubleshooting](#15-troubleshooting)

---

## 1. Overview

This suite automates the functional verification of **Pre-Viz Engine**, an AI-powered pre-visualization platform built with React (SPA) and backed by OpenAI's Sora video generation model.

| Attribute | Value |
|---|---|
| **Framework** | Playwright 1.58.2 + Node.js ≥ 22 LTS |
| **Language** | JavaScript (ES Modules) |
| **Browsers** | Chromium, Firefox, WebKit, Pixel 5 (mobile), iPhone 14 (mobile) |
| **Pattern** | Page Object Model (POM) |
| **Coverage** | 40+ tests across 4 modules: Studio, Stock Footage, History, Navigation |
| **Reporting** | Allure HTML + Playwright built-in HTML |
| **CI/CD** | GitHub Actions — security gate → smoke → full matrix |

---

## 2. Prerequisites

Install the following before proceeding:

| Tool | Minimum Version | Check |
|---|---|---|
| **Node.js** | 22.0.0 LTS | `node --version` |
| **npm** | 11.0.0 | `npm --version` |
| **Git** | any | `git --version` |
| **Allure CLI** *(for HTML reports)* | 2.x | `allure --version` |

> Install Allure CLI: https://allurereport.org/docs/install/

---

## 3. Installation

```bash
# 1. Clone or enter the project directory
cd previz-automation

# 2. Install all dependencies using the lockfile (deterministic build)
npm ci

# 3. Install Playwright browser binaries and OS-level dependencies
npx playwright install --with-deps

# 4. Set up environment variables
cp .env.example .env
# Open .env and review — defaults work for staging without changes
```

> **Why `npm ci` instead of `npm install`?**
> `npm ci` strictly installs from `package-lock.json`, ensuring every developer and CI run uses identical dependency versions. Never use `npm install` in this project.

---

## 4. Configuration

### 4.1 Environment Variables (`.env`)

Copy `.env.example` to `.env` and fill in as needed:

| Variable | Required | Default | Description |
|---|---|---|---|
| `ENVIRONMENT` | No | `staging` | Active environment: `staging` or `production` |
| `BASE_URL` | CI only | staging URL | Full URL of the target application |
| `ALLURE_RESULTS_DIR` | No | `./reports/allure-results` | Directory where Allure JSON results are saved |
| `SKIP_API_TESTS` | No | `false` | Set `true` to skip tests tagged `@api-dependent` (offline/dry-run) |
| `PROD_BASE_URL` | No | — | Production URL, used when `ENVIRONMENT=production` |

> **Security:** `.env` is listed in `.gitignore` and must never be committed. Use GitHub Actions **Variables** (not Secrets) for `BASE_URL` in CI.

### 4.2 Environment Targets (`config/environments.js`)

| Key | URL |
|---|---|
| `staging` (default) | `https://previz-engine-m1mm9ayva-valid.vercel.app` |
| `production` | Value of `PROD_BASE_URL` env var |

Switch environments:

```bash
ENVIRONMENT=production npm test
```

### 4.3 Playwright Configuration Highlights

| Setting | Local | CI |
|---|---|---|
| Workers | 4 | 2 |
| Retries | 0 | 1 |
| Default test timeout | 60 s | 60 s |
| Assertion timeout | 10 s | 10 s |
| Action timeout | 15 s | 15 s |
| Navigation timeout | 30 s | 30 s |
| Parallel within file | No (cookie isolation) | No |

---

## 5. Running Tests

### 5.1 Quick Start

```bash
# Run the full suite (all browsers)
npm test

# Run only smoke tests — fastest feedback (~2 min)
npm run test:smoke

# Run P1 critical tests only
npm run test:p1
```

### 5.2 By Module

```bash
npm run test:studio         # Studio — prompt, count, duration, ratio, HQ
npm run test:stockfootage   # Stock Footage — script parsing, settings
npm run test:history        # History — your videos, all videos, cookie
npm run test:navigation     # Navigation — header links, SPA routing
```

### 5.3 By Browser

```bash
npm run test:chromium       # Desktop Chrome (primary)
npm run test:firefox        # Desktop Firefox
npm run test:webkit         # Desktop Safari
npm run test:mobile         # Pixel 5 + iPhone 14
```

### 5.4 Advanced Filtering

```bash
# Run a single spec file
npx playwright test tests/history/cookiePersistence.spec.js

# Run tests matching a title pattern
npx playwright test --grep "cookie"

# Run P1 AND P2 tests
npx playwright test --grep "@P1|@P2"

# Run smoke tests on Firefox only
npx playwright test --grep @smoke --project=firefox

# Exclude API-dependent tests (offline mode)
npx playwright test --grep-invert @api-dependent

# Run headed (visible browser) — useful for debugging
npx playwright test --headed

# Run in debug mode (Playwright Inspector)
npx playwright test --debug

# Run with UI mode (interactive runner)
npx playwright test --ui
```

### 5.5 CI Mode

```bash
# Enables --forbid-only (catches accidental test.only) and CI retry logic
npm run test:ci
```

---

## 6. Test Tags & Filtering

Every test carries one or more tags in its title. Use `--grep` with these tags for selective execution.

| Tag | Priority | Description | Typical Use |
|---|---|---|---|
| `@smoke` | Sanity | Page loads, core elements visible | Every PR — fast gate (< 3 min) |
| `@P1` | Critical | Core flows that must pass before release | Pre-release gate |
| `@P2` | High | Full regression coverage | Nightly / post-deploy |
| `@P3` | Medium | Edge cases, visual/SPA checks | Weekly full run |
| `@api-dependent` | — | Requires live Sora API | Skip with `SKIP_API_TESTS=true` |

### Tag Distribution

| Module | @smoke | @P1 | @P2 | @P3 |
|---|---|---|---|---|
| Studio | 1 | 7 | 4 | 0 |
| Stock Footage | 1 | 4 | 4 | 0 |
| History | 2 | 3 | 5 | 1 |
| Navigation | 1 | 0 | 4 | 1 |
| **Total** | **5** | **14** | **17** | **2** |

---

## 7. Project Structure

```
previz-automation/
│
├── .github/
│   └── workflows/
│       └── playwright.yml          # CI/CD: security-audit → smoke → full matrix
│
├── pages/                          # Page Object Model classes
│   ├── BasePage.js                 # Shared: navigate, waitForNetworkIdle, nav links
│   ├── StudioPage.js               # Studio: prompt, count, duration, ratio, HQ, generate
│   ├── StockFootagePage.js         # Stock Footage: script input, settings, parse
│   └── HistoryPage.js              # History: tabs, video cards, cookie panel, refresh
│
├── tests/                          # Spec files — mirror page structure
│   ├── studio/
│   │   ├── prompt.spec.js          # TC-S01, TC-S08a/b — direct prompt input
│   │   ├── videoCount.spec.js      # TC-S03, TC-S04 — count 1–5, boundary
│   │   ├── aspectRatio.spec.js     # TC-S06 — Landscape / Portrait
│   │   └── highQuality.spec.js     # TC-S07 — HQ toggle
│   ├── stockFootage/
│   │   ├── scriptParsing.spec.js   # TC-SF01, TC-SF05a/b — script input + parse
│   │   └── generationSettings.spec.js  # TC-SF03, TC-SF04 — settings + HQ warning
│   ├── history/
│   │   ├── yourVideos.spec.js      # TC-H01, TC-H02 — cookie scoping, empty state
│   │   ├── allVideos.spec.js       # TC-H03, TC-H04, TC-H05 — all users, metadata, refresh
│   │   └── cookiePersistence.spec.js   # TC-H06, TC-H07 — UUID assign, clear, reassign
│   └── navigation/
│       └── navigation.spec.js      # TC-N01, TC-N02 — header links, SPA routing
│
├── fixtures/                       # Static test data
│   ├── testData.js                 # Prompts, settings, expected text constants
│   └── scripts/
│       ├── standard-screenplay.txt # 3-scene formatted script (TC-SF01)
│       └── unstructured-text.txt   # Unformatted prose (TC-SF05 negative test)
│
├── utils/                          # Shared helper functions
│   ├── cookieHelper.js             # Read, clear, and assert browser cookies
│   └── videoHelper.js             # Wait for video cards, extract metadata
│
├── config/
│   └── environments.js             # Base URL per environment (staging / production)
│
├── .env.example                    # Template for required environment variables
├── .gitignore                      # Excludes .env, node_modules, reports/
├── eslint.config.js                # ESLint v10 flat config (JS rules)
├── .prettierrc                     # Prettier formatting rules
├── playwright.config.js            # Projects, reporters, timeouts, retries
└── package.json                    # Pinned dependencies and npm scripts
```

---

## 8. Page Object Model

All Page Objects extend **BasePage**, which provides navigation and shared wait logic. Each page class encapsulates all locators and interactions for its corresponding application view.

### BasePage

```js
import { BasePage } from './pages/BasePage.js';

const base = new BasePage(page);
await base.navigate('/');           // Go to a path + wait for domcontentloaded
await base.goToStudio();            // Click Studio nav link
await base.goToStockFootage();      // Click Stock Footage nav link
await base.goToHistory();           // Click History nav link
await base.getTitle();              // Returns document <title>
base.navLinks.studio                // Locator for Studio nav link
base.navLinks.stockFootage          // Locator for Stock Footage nav link
base.navLinks.history               // Locator for History nav link
base.logoLink                       // Locator for app logo/title link
```

### StudioPage

```js
import { StudioPage } from './pages/StudioPage.js';

const studio = new StudioPage(page);
await studio.goto();                            // Navigate to Studio, wait for heading
await studio.fillPrompt('scene description');   // Type into Direct Prompt textarea
await studio.setVideoCount(3);                  // Set number of videos (1–5)
await studio.setDuration('8 seconds');          // '4 seconds' | '8 seconds' | '12 seconds'
await studio.setAspectRatio('Portrait');        // 'Landscape' | 'Portrait'
await studio.toggleHighQuality(true);           // Enable/disable HQ mode
await studio.isHighQualityEnabled();            // Returns boolean
await studio.getGenerateButtonLabel();          // Returns e.g. "Generate 3 Videos Directly"
await studio.getVideoCountValue();              // Returns current input value as string
await studio.clickGenerate();                   // Clicks the generate button
```

### StockFootagePage

```js
import { StockFootagePage } from './pages/StockFootagePage.js';

const sfPage = new StockFootagePage(page);
await sfPage.goto();                            // Navigate via nav link, wait for heading
await sfPage.fillScript(scriptText);            // Paste into Script Text textarea
await sfPage.setDuration('12 seconds');         // '4 seconds' | '8 seconds' | '12 seconds'
await sfPage.setAspectRatio('Landscape');       // 'Portrait' | 'Landscape'
await sfPage.toggleHighQuality(true);           // Enable/disable HQ mode
await sfPage.isHighQualityEnabled();            // Returns boolean
await sfPage.isHighQualityWarningVisible();     // Returns boolean (warning banner)
await sfPage.clickParseScript();                // Clicks Parse Script button
```

### HistoryPage

```js
import { HistoryPage } from './pages/HistoryPage.js';

const historyPage = new HistoryPage(page);
await historyPage.goto();                       // Navigate to /history, wait for heading
await historyPage.clickYourVideos();            // Switch to Your Videos tab
await historyPage.clickAllVideos();             // Switch to All Videos tab
await historyPage.getVideoCount();              // Returns total count as number
historyPage.getVideoCards();                    // Returns Locator for all video cards
await historyPage.getCardCookieId(cardLocator); // Returns UUID string from a card
await historyPage.getCookieDebugUUID();         // Returns current user UUID from debug panel
await historyPage.clickRefresh();               // Click refresh + wait for content
await historyPage.isEmptyStateVisible();        // Returns boolean
await historyPage.isEmptyStateCtaVisible();     // Returns boolean
```

---

## 9. Test Data & Fixtures

All test data lives in `fixtures/testData.js`. Import what you need — never hardcode values in tests.

```js
import {
  prompts,            // standard, minimal, empty, long, random()
  durations,          // short, medium, long
  aspectRatios,       // landscape, portrait
  videoCounts,        // min, default, max, overMax, underMin
  settingsCombinations, // Decision table: 3 duration×ratio×HQ combos
  expectedText,       // UI text constants for assertions
} from '../../fixtures/testData.js';
```

### Available Prompts

| Key | Content |
|---|---|
| `prompts.standard` | Full cinematic scene description (baseline for generation tests) |
| `prompts.minimal` | `'A red car.'` — shortest valid prompt |
| `prompts.empty` | `''` — for negative/validation tests |
| `prompts.long` | 120 Lorem Ipsum words — boundary test |
| `prompts.random()` | Faker-generated scene — use for parallel run variety |

### Script Fixtures (`fixtures/scripts/`)

| File | Use |
|---|---|
| `standard-screenplay.txt` | 3-scene formatted script with `INT.`/`EXT.` headings — TC-SF01 |
| `unstructured-text.txt` | Plain prose paragraph, no screenplay format — TC-SF05 negative |

---

## 10. Utilities Reference

### cookieHelper.js

```js
import {
  getPrevizCookieUUID,
  clearPrevizCookies,
  assertAllCardsMatchUser,
} from '../../utils/cookieHelper.js';

// Get the UUID cookie value for the app domain
const uuid = await getPrevizCookieUUID(context, baseUrl); // string | null

// Clear all cookies (simulates fresh browser / cookie-cleared state)
await clearPrevizCookies(context);

// Assert all video card cookie IDs match the expected user UUID
const result = assertAllCardsMatchUser(cardCookieIds, expectedUUID);
// result: { pass: boolean, mismatches: string[] }
```

### videoHelper.js

```js
import {
  waitForFirstVideoCard,
  waitForVideoCount,
  extractCardMetadata,
} from '../../utils/videoHelper.js';

// Wait for at least 1 video card to appear (default 120s — generation takes time)
await waitForFirstVideoCard(page);
await waitForFirstVideoCard(page, 180_000); // custom timeout for HQ mode

// Wait until N video cards are visible
await waitForVideoCount(page, 3);

// Extract structured metadata from a video card locator
const meta = await extractCardMetadata(cards.first());
// meta: { status, prompt, duration, ratio, quality, cookieId }
```

---

## 11. Reports

### 11.1 Allure Report (Rich HTML)

```bash
# Generate and open the Allure HTML report
npm run report
```

The report includes:
- Test status (passed / failed / skipped)
- Step-level breakdown per test
- Screenshots on failure
- Video replay on failure
- Test suite history trend

Allure results are written to `reports/allure-results/` after each run.
The final HTML report is generated to `reports/allure-report/`.

### 11.2 Playwright Built-in Report

```bash
# Open the Playwright HTML report in your browser
npm run report:playwright
```

Lighter than Allure — good for quick local review.

### 11.3 Report Artifacts

```
reports/
├── allure-results/       # Raw JSON (input to allure generate)
├── allure-report/        # Final HTML report (open index.html)
├── playwright-report/    # Playwright built-in HTML
└── test-results/         # Failure screenshots, videos, traces
```

> `reports/` is gitignored. Download artifacts from GitHub Actions when running in CI.

---

## 12. CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/playwright.yml`) runs on every **push to `main`** and every **pull request targeting `main`**.

```
[ PR or push to main ]
         │
         ▼
┌─────────────────────────┐
│   security-audit job    │  npm audit --audit-level=high
│   Fails on HIGH/CRITICAL│  ← Blocks all subsequent jobs
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│      smoke job          │  @smoke tests — Chromium only
│   Runs on PR + push     │  ← Gate before full matrix
└────────────┬────────────┘
             │ (push to main only)
             ▼
┌─────────────────────────────────────────────────────┐
│                  full-suite job (matrix)            │
│  chromium │ firefox │ webkit │ mobile-chrome │      │
│                              mobile-safari         │
└─────────────────────────────────────────────────────┘
             │
             ▼
   Artifacts uploaded:
   - allure-report-{project}   (30-day retention)
   - playwright-report-{project} (30-day retention)
```

### Required GitHub Configuration

Add a **Variable** (not Secret) in your repository settings:

| Name | Value |
|---|---|
| `BASE_URL` | `https://your-app-url.vercel.app` |

Navigate to: **Settings → Secrets and variables → Actions → Variables → New repository variable**

---

## 13. Writing New Tests

### Step 1 — Create a spec file in the correct module folder

```
tests/
├── studio/          ← Tests for the Studio page
├── stockFootage/    ← Tests for the Stock Footage Generator
├── history/         ← Tests for the History page
└── navigation/      ← Tests for app-wide navigation
```

### Step 2 — Use the standard spec template

```js
import { test, expect } from '@playwright/test';
import { StudioPage } from '../../pages/StudioPage.js';
import { prompts, expectedText } from '../../fixtures/testData.js';

/**
 * [Module] — [Feature] Tests
 * Covers: TC-XXX
 * User Stories: US-XX
 */
test.describe('[Module] — [Feature]', () => {

  // Clear cookies before each test to ensure clean isolation
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    const studioPage = new StudioPage(page);
    await studioPage.goto();
  });

  test('@P2 TC-XXX — [Behaviour being tested]', async ({ page }) => {
    const studioPage = new StudioPage(page);

    // Arrange
    await studioPage.fillPrompt(prompts.standard);

    // Act
    await studioPage.clickGenerate();

    // Assert
    await expect(page.getByRole('heading', { name: expectedText.studioHeading })).toBeVisible();
  });

});
```

### Step 3 — Tag your test correctly

```js
test('@smoke @P1 TC-S01 — heading is visible', ...)  // Smoke + critical
test('@P2 TC-S06 — aspect ratio defaults to Landscape', ...)  // Regression
test('@P3 TC-N02 — SPA routing does not cause reload', ...)   // Edge case
```

### Step 4 — Use test.each for parameterised tests

```js
test.each([
  { duration: '4 seconds', label: '4s' },
  { duration: '8 seconds', label: '8s' },
])('@P2 TC-S05 — Duration $label is selectable', async ({ page }, { duration }) => {
  const studio = new StudioPage(page);
  await studio.setDuration(duration);
  await expect(studio.durationSelect).toHaveValue(new RegExp(duration.split(' ')[0]));
});
```

### Step 5 — Selector guidelines

| Preferred | Avoid |
|---|---|
| `getByRole('button', { name: /submit/i })` | `locator('button.bg-blue-500')` |
| `getByLabel('Video Duration')` | `locator('select').first()` |
| `getByText(/\d+ videos?/i)` | `locator('span.text-sm.text-muted-foreground')` |
| `locator('[data-testid="..."]')` | `locator('.relative.inline-flex')` |
| `getByPlaceholder('Enter prompt...')` | `locator('#div > div > input')` |

> **Rule:** If a selector relies on a Tailwind utility class, it is considered brittle and must not be used.

---

## 14. Code Quality

```bash
# Lint all test and source files
npm run lint

# Auto-format all files
npm run format

# Security audit — fails on HIGH or CRITICAL CVEs
npm run audit
```

### ESLint Rules Summary

| Rule | Level | Reason |
|---|---|---|
| `prefer-const` | error | Enforces immutable bindings |
| `no-var` | error | Disallows `var` (use `const`/`let`) |
| `no-unused-vars` | error | Catches dead code (ignores `_` prefixed params) |
| `no-await-in-loop` | warn | Flags potential sequentialised async (prefer `Promise.all`) |
| `consistent-return` | error | Prevents implicit `undefined` returns |
| `no-console` | warn | Discourage debugging leftovers in CI |

### Prettier Rules

```
Single quotes  │  Semicolons on  │  Trailing commas (ES5)
Print width 100  │  Tab width 2  │  Arrow parens always
```

---

## 15. Troubleshooting

### `BASE_URL environment variable is not set`
**Cause:** Running in CI without `BASE_URL` configured.
**Fix:** Add `BASE_URL` as a GitHub Actions Variable (see Section 12).

---

### `browserType.launch: Executable doesn't exist`
**Cause:** Playwright browsers not installed.
**Fix:**
```bash
npx playwright install --with-deps
```

---

### Tests hang indefinitely on generation steps
**Cause:** Sora API is unavailable or taking > 120 s.
**Fix:** Skip API-dependent tests during outage:
```bash
SKIP_API_TESTS=true npx playwright test --grep-invert @api-dependent
```

---

### `Your Videos` tab shows wrong videos / empty when it shouldn't
**Cause:** Browser cookie was cleared between beforeEach and the assertion.
**Fix:** Do not call `context.clearCookies()` mid-test — only in `beforeEach`. Ensure each test uses its own browser context.

---

### `isChecked()` throws on HQ toggle
**Cause:** The toggle element does not expose `role="switch"` with `aria-checked`.
**Fix:** Inspect the live DOM for the current ARIA role:
```bash
npx playwright test --debug tests/studio/highQuality.spec.js
```
Then update the locator in `StudioPage.js` / `StockFootagePage.js` accordingly.

---

### ESLint reports `Cannot find module '@eslint/js'`
**Cause:** `npm ci` was not run after adding `@eslint/js` to devDependencies.
**Fix:**
```bash
npm ci
```

---

### Allure report shows "No data"
**Cause:** `allure generate` was not run, or `reports/allure-results/` is empty.
**Fix:**
```bash
# Run tests first to populate allure-results/
npm test

# Then generate the report
npm run report
```

---

## Dependency Audit Status

All direct dependencies are pinned to their latest stable release and were audited on 2026-03-16.

| Package | Version | License | Status |
|---|---|---|---|
| `@playwright/test` | 1.58.2 | MIT | ✅ Clean |
| `@faker-js/faker` | 10.3.0 | MIT | ✅ Clean |
| `@eslint/js` | 9.25.1 | MIT | ✅ Clean |
| `allure-playwright` | 3.6.0 | Apache-2.0 | ✅ Clean |
| `dotenv` | 17.3.1 | BSD-2-Clause | ✅ Clean |
| `cross-env` | 10.1.0 | MIT | ✅ Clean |
| `eslint` | 10.0.3 | MIT | ✅ Clean |
| `prettier` | 3.8.1 | MIT | ✅ Clean |

> Re-run `npm run audit` periodically to check for newly disclosed CVEs.

---

*Pre-Viz Engine Test Automation Suite — TAP-PREVIZ-001 v1.0 | 2026-03-16*
