# Test Automation Plan — Pre-Viz Engine v1.9.0
### ISTQB-Aligned Test Automation Plan

| Field | Value |
|---|---|
| **Document ID** | TAP-PREVIZ-001 |
| **Version** | 1.0 |
| **Date** | 2026-03-16 |
| **References** | TP-PREVIZ-001 (Master Test Plan) |
| **Stack** | Playwright + JavaScript (Node.js) |
| **Status** | Draft |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Automation Objectives & Scope](#2-automation-objectives--scope)
3. [Tool Selection & Justification](#3-tool-selection--justification)
4. [Dependency Security Audit](#4-dependency-security-audit)
5. [Framework Architecture](#5-framework-architecture)
6. [Folder Structure](#6-folder-structure)
7. [Page Object Model Design](#7-page-object-model-design)
8. [Test Data Strategy](#8-test-data-strategy)
9. [Reporting Strategy](#9-reporting-strategy)
10. [CI/CD Integration](#10-cicd-integration)
11. [Environment & Configuration Management](#11-environment--configuration-management)
12. [Risks & Mitigations](#12-risks--mitigations)
13. [Ideas & Future Strategies](#13-ideas--future-strategies)

---

## 1. Introduction

### 1.1 Purpose
This document defines the test automation strategy, framework design, toolchain, and execution approach for **Pre-Viz Engine v1.9.0**. It supplements the Master Test Plan (TP-PREVIZ-001) by specifying *how* the identified test cases will be automated, which tools will be used, and how the automation assets will be maintained.

### 1.2 Automation Approach
The strategy follows the **ISTQB Advanced Level Test Automation Engineer** principles:
- Automation is applied to **repeatable, stable** test scenarios first
- Volatile UI areas (AI-generated video content) are excluded from assertion-based automation
- The Page Object Model (POM) pattern decouples test logic from UI selectors
- All automated tests are designed to be **environment-agnostic** via configuration

### 1.3 What Will NOT Be Automated
| Area | Reason |
|---|---|
| Video visual quality | Non-deterministic AI output — no ground truth |
| Video playback correctness | Requires video codec analysis, out of scope |
| Script parsing AI accuracy | Output varies; use exploratory/manual testing |
| Performance load testing | Requires separate infrastructure tooling |

---

## 2. Automation Objectives & Scope

### 2.1 Objectives
1. Automate all **P1 and P2** test cases from TP-PREVIZ-001 (18 of 21 cases)
2. Achieve **cross-browser execution** across Chrome, Firefox, and WebKit via a single test suite
3. Enable **CI/CD gate**: automated suite runs on every pull request
4. Produce **human-readable reports** (Allure) consumable by non-technical stakeholders
5. Reduce regression testing cycle from ~3 days manual to **< 30 minutes automated**

### 2.2 Automation Scope

| Module | Test Cases | Automated | Manual Only |
|---|---|---|---|
| Studio | TC-S01 to TC-S09 | TC-S01–S07 | TC-S09 (long prompt — exploratory) |
| Stock Footage | TC-SF01 to TC-SF06 | TC-SF01, SF03–SF05 | TC-SF02, SF06 (AI output variability) |
| History | TC-H01 to TC-H07 | TC-H01–H07 | — |
| Navigation | TC-N01, TC-N02 | TC-N01, N02 | — |
| **Total** | **21** | **17 (81%)** | **4 (19%)** |

### 2.3 Automation Prioritisation (ISTQB Risk-Based)
| Priority | Cases | Rationale |
|---|---|---|
| P1 — Automate first | TC-S01, S08, SF01, SF05, H01, H06 | Core flows + privacy/cookie risks |
| P2 — Second sprint | TC-S02–S07, SF03, SF04, H02–H05, H07, N01 | Full regression coverage |
| P3 — Third sprint | TC-N02 | Visual/style assertions |

---

## 3. Tool Selection & Justification

### 3.1 Core Framework

| Tool | Version | License | Justification |
|---|---|---|---|
| **Playwright** (`@playwright/test`) | 1.58.2 | MIT | Native multi-browser (Chromium, Firefox, WebKit); built-in fixtures, parallelism, auto-waits, network interception, mobile emulation. No WebDriver dependency. Maintained by Microsoft. |
| **Node.js** | 22.16.0 LTS | MIT | LTS release — security patches guaranteed until April 2027. Even-numbered LTS guarantees long-term stability. |

### 3.2 Test Utilities

| Tool | Version | License | Justification |
|---|---|---|---|
| **@faker-js/faker** | 10.3.0 | MIT | Generates realistic, varied test prompts and script data. Community fork of the original faker.js; actively maintained with 45k+ GitHub stars. |
| **dotenv** | 17.3.1 | BSD-2-Clause | Loads environment variables from `.env` files. BSD-2-Clause is a permissive, well-understood licence. Zero runtime dependencies. |
| **cross-env** | 10.1.0 | MIT | Cross-platform environment variable injection for npm scripts. Essential for Windows/macOS CI parity. |

### 3.3 Reporting

| Tool | Version | License | Justification |
|---|---|---|---|
| **allure-playwright** | 3.6.0 | Apache-2.0 | Rich HTML reports with screenshots, step breakdowns, and history trends. Apache-2.0 is OSI-approved and safe for commercial use. Integrates natively with Playwright reporter API. |

### 3.4 Code Quality

| Tool | Version | License | Justification |
|---|---|---|---|
| **ESLint** | 10.0.3 | MIT | Static analysis to enforce consistent code style and catch common JS errors in test files. |
| **Prettier** | 3.8.1 | MIT | Opinionated code formatter — eliminates style debates in code reviews. |

### 3.5 Rejected Alternatives

| Tool | Reason Rejected |
|---|---|
| Cypress | Browser support limited (no true WebKit/Safari); no multi-tab support; slower for large suites |
| Selenium + WebDriver | Requires separate driver management; slower; no built-in mobile emulation |
| Jest (standalone) | Not designed for browser automation; no built-in page interaction primitives |
| Puppeteer | Chromium-only; Playwright is a direct superset with multi-browser support |

---

## 4. Dependency Security Audit

> Audit performed: 2026-03-16 | Node.js v22.16.0 | npm v11.4.1

### 4.1 Direct Dependencies — Audit Results

| Package | Version | License | CVEs | CVSS | Verdict |
|---|---|---|---|---|---|
| `@playwright/test` | 1.58.2 | MIT | None found | — | ✅ CLEAR |
| `@faker-js/faker` | 10.3.0 | MIT | None found | — | ✅ CLEAR |
| `dotenv` | 17.3.1 | BSD-2-Clause | None found | — | ✅ CLEAR |
| `cross-env` | 10.1.0 | MIT | None found | — | ✅ CLEAR |
| `allure-playwright` | 3.6.0 | Apache-2.0 | None found | — | ✅ CLEAR |
| `eslint` | 10.0.3 | MIT | None found | — | ✅ CLEAR |
| `prettier` | 3.8.1 | MIT | None found | — | ✅ CLEAR |

**All direct dependencies are pinned to their latest stable release. No known CVEs were identified.**

### 4.2 Transitive Dependency Notice

During the local environment audit (`npm audit`), 3 HIGH-severity vulnerabilities were detected in the **existing project environment** (unrelated to this automation framework):

| Package | Vulnerability | CVSS | Affects Our Framework? |
|---|---|---|---|
| `@hono/node-server` < 1.19.10 | Auth bypass via encoded slashes (GHSA-wc8c-qw6v-h7f6) | 7.5 | ❌ No — belongs to context-mode tooling |
| `express-rate-limit` 8.2.0–8.2.1 | Resource exhaustion / DoS (CWE-770) | 7.5 | ❌ No — belongs to context-mode tooling |
| `hono` ≤ 4.12.6 | Prototype pollution (CWE-1321) | 4.8 | ❌ No — belongs to context-mode tooling |

> **Action Required (outside this framework):** The host environment should run `npm audit fix` on the parent project to resolve these. They do not affect the test automation package.

### 4.3 Ongoing Security Practices

- **Pin all versions** in `package.json` — no `^` or `~` wildcards for production dependencies
- Run `npm audit` as a **CI step** on every pull request (see `.github/workflows/playwright.yml`)
- Review dependencies quarterly with `npm outdated`
- Use `npm ci` (not `npm install`) in CI to enforce lockfile integrity

---

## 5. Framework Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Test Runner Layer                    │
│              @playwright/test (spec files)              │
└────────────────────────┬────────────────────────────────┘
                         │ imports
┌────────────────────────▼────────────────────────────────┐
│                  Page Object Layer                      │
│     BasePage → StudioPage / StockFootagePage /          │
│                HistoryPage / NavigationPage             │
└────────────────────────┬────────────────────────────────┘
                         │ uses
┌────────────┬───────────▼──────────┬─────────────────────┐
│  Fixtures  │       Utilities      │     Config          │
│ testData.js│  cookieHelper.js     │  environments.js    │
│ scripts/   │  videoHelper.js      │  playwright.config  │
└────────────┴──────────────────────┴─────────────────────┘
                         │ reports to
┌────────────────────────▼────────────────────────────────┐
│               Allure Reporter + HTML Report             │
└─────────────────────────────────────────────────────────┘
```

### 5.1 Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Pattern | Page Object Model (POM) | Isolates selectors from test logic; single point of maintenance |
| Test isolation | `storageState` cleared per test | Prevents cookie bleed-through between tests |
| Parallelism | Workers per file, sequential within file | Avoids race conditions on cookie-scoped history tests |
| Assertions | Playwright built-in `expect` | Auto-retry with configurable timeout; no external assert lib needed |
| Wait strategy | `waitForLoadState('networkidle')` | Appropriate for SPA with async Sora API calls |
| Secrets | `.env` file + `process.env` | Never hardcoded; excluded from git via `.gitignore` |

---

## 6. Folder Structure

```
previz-automation/
│
├── .github/
│   └── workflows/
│       └── playwright.yml          # CI/CD pipeline definition
│
├── pages/                          # Page Object Model classes
│   ├── BasePage.js                 # Shared actions: navigate, waitForIdle, etc.
│   ├── StudioPage.js               # Studio tab: prompt, count, settings, generate
│   ├── StockFootagePage.js         # Stock Footage: script input, parse
│   └── HistoryPage.js              # History: tabs, cards, refresh, cookie panel
│
├── tests/                          # Test specs (mirror page structure)
│   ├── studio/
│   │   ├── prompt.spec.js          # TC-S01, TC-S02, TC-S08
│   │   ├── videoCount.spec.js      # TC-S03, TC-S04
│   │   ├── aspectRatio.spec.js     # TC-S06
│   │   └── highQuality.spec.js     # TC-S07
│   ├── stockFootage/
│   │   ├── scriptParsing.spec.js   # TC-SF01, TC-SF05
│   │   └── generationSettings.spec.js  # TC-SF03, TC-SF04
│   ├── history/
│   │   ├── yourVideos.spec.js      # TC-H01, TC-H02
│   │   ├── allVideos.spec.js       # TC-H03, TC-H04, TC-H05
│   │   └── cookiePersistence.spec.js   # TC-H06, TC-H07
│   └── navigation/
│       └── navigation.spec.js      # TC-N01, TC-N02
│
├── fixtures/                       # Static test data and helpers
│   ├── testData.js                 # Prompts, settings, expected values
│   └── scripts/
│       ├── standard-screenplay.txt # 3-scene formatted script (TC-SF01)
│       └── unstructured-text.txt   # Plain paragraph text (TC-SF06)
│
├── utils/                          # Shared utility functions
│   ├── cookieHelper.js             # Read / clear / assert browser cookies
│   └── videoHelper.js              # Wait for video card, assert card metadata
│
├── config/
│   └── environments.js             # Base URLs per environment (staging, prod)
│
├── .env.example                    # Template for required environment variables
├── .gitignore                      # Excludes .env, node_modules, reports
├── playwright.config.js            # Playwright projects, reporters, timeouts
└── package.json                    # Pinned dependencies and npm scripts
```

---

## 7. Page Object Model Design

### 7.1 BasePage
All page objects extend `BasePage`, which provides:
- `navigate(path)` — navigates to a relative path
- `waitForNetworkIdle()` — wraps `waitForLoadState('networkidle')`
- `getTitle()` — returns page `<title>`

### 7.2 StudioPage
Encapsulates all interactions with `/` (Studio tab):

| Method | Description |
|---|---|
| `fillPrompt(text)` | Types into `#direct-prompt` |
| `setVideoCount(n)` | Sets `#num-videos` value |
| `setDuration(seconds)` | Selects from duration dropdown |
| `setAspectRatio(ratio)` | Selects from aspect ratio dropdown |
| `toggleHighQuality(enable)` | Clicks HQ toggle if state differs |
| `getGenerateButtonLabel()` | Returns button text for label assertion |
| `clickGenerate()` | Clicks the generate button |

### 7.3 StockFootagePage
Encapsulates all interactions with the Stock Footage Generator:

| Method | Description |
|---|---|
| `fillScript(text)` | Pastes content into `#script-text` |
| `setDuration(seconds)` | Selects duration |
| `setAspectRatio(ratio)` | Selects aspect ratio |
| `toggleHighQuality(enable)` | Clicks HQ toggle |
| `isHighQualityWarningVisible()` | Asserts warning `⚠️` message is visible |
| `clickParseScript()` | Clicks "Parse Script" button |

### 7.4 HistoryPage
Encapsulates all interactions with `/history`:

| Method | Description |
|---|---|
| `clickYourVideos()` | Switches to "Your Videos" tab |
| `clickAllVideos()` | Switches to "All Videos" tab |
| `getVideoCount()` | Parses the `N videos` counter |
| `getVideoCards()` | Returns all visible video card locators |
| `getCardMetadata(cardLocator)` | Returns `{ status, prompt, duration, ratio, quality, cookieId }` |
| `clickRefresh()` | Clicks the refresh button |
| `getCookieDebugUUID()` | Reads UUID from debug panel |
| `isEmptyStateVisible()` | Checks for empty-state message |

---

## 8. Test Data Strategy

### 8.1 Prompt Test Data (`fixtures/testData.js`)
- **Standard prompt**: A deterministic, specific scene description used for all generation tests
- **Empty string**: Used for negative validation tests
- **Boundary prompt**: Exactly 1 character and 500+ characters
- Generated using `@faker-js/faker` where variety is needed (e.g., randomised scene descriptions for parallel runs)

### 8.2 Script Test Data (`fixtures/scripts/`)
- `standard-screenplay.txt` — 3-scene script with proper `INT.`/`EXT.` headings and scene descriptions
- `unstructured-text.txt` — Plain prose paragraph with no screenplay formatting (negative test)

### 8.3 Generation Settings Combinations (Decision Table)
Derived from TP-PREVIZ-001 decision table technique:

| Duration | Aspect Ratio | High Quality | Test Case |
|---|---|---|---|
| 4s | Landscape | Off | TC-S05 (baseline) |
| 8s | Portrait | Off | TC-SF03 |
| 12s | Portrait | On | TC-S07 |

---

## 9. Reporting Strategy

### 9.1 Allure Report
- **Step-level annotations**: Every POM method is wrapped with `allure.step()`
- **Screenshots on failure**: Playwright `screenshot: 'only-on-failure'` is set globally
- **Video on failure**: `video: 'retain-on-failure'` records a replay of failing tests
- **Labels**: Each test is tagged with `@allure.story` matching the US-XX id
- **Severity**: Mapped from test priority (P1 → Critical, P2 → Normal, P3 → Minor)

### 9.2 Built-in Playwright HTML Report
- Retained as a lightweight secondary report (no external server needed)
- Stored as CI artifact for 30 days

### 9.3 Report Artefacts (CI)
```
reports/
├── allure-results/     # Raw Allure JSON (input to allure generate)
├── allure-report/      # Final HTML report (uploaded as CI artefact)
└── playwright-report/  # Built-in HTML report
```

---

## 10. CI/CD Integration

### 10.1 Pipeline (GitHub Actions — `.github/workflows/playwright.yml`)

```
Trigger: push to main / pull_request to main
│
├── Step 1: Checkout
├── Step 2: Setup Node.js 22 LTS
├── Step 3: npm ci             ← Lockfile-enforced install
├── Step 4: npm audit          ← Security gate — fails on HIGH/CRITICAL
├── Step 5: npx playwright install --with-deps
├── Step 6: npx playwright test --project=chromium   ← Fast gate (P1 only)
├── Step 7: npx playwright test                       ← Full matrix (on main push)
└── Step 8: Upload Allure + HTML reports as artefacts
```

### 10.2 Test Tags for Selective Execution
```js
// Run only P1 tests
npx playwright test --grep @P1

// Run only Studio tests
npx playwright test tests/studio/

// Run on Firefox only
npx playwright test --project=firefox
```

---

## 11. Environment & Configuration Management

### 11.1 `.env.example`
```
BASE_URL=https://previz-engine-m1mm9ayva-valid.vercel.app
ENVIRONMENT=staging
ALLURE_RESULTS_DIR=./reports/allure-results
```

### 11.2 Playwright Projects (from `playwright.config.js`)

| Project Name | Browser | Device |
|---|---|---|
| `chromium` | Chromium (Chrome) | Desktop 1280×800 |
| `firefox` | Firefox | Desktop 1280×800 |
| `webkit` | WebKit (Safari) | Desktop 1280×800 |
| `mobile-chrome` | Chromium | Pixel 5 (393×851) |
| `mobile-safari` | WebKit | iPhone 14 (390×844) |

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Sora API unavailable during CI | Blocks all generation tests | Tag generation tests `@api-dependent`; skip in CI dry-run mode via `SKIP_API_TESTS=true` env var |
| Flaky tests due to AI response time variance | False failures | Set `timeout: 120_000` for generation tests; use `waitForNetworkIdle` before assertions |
| Cookie tests contaminating each other | False passes on "Your Videos" filter | Clear `storageState` in `beforeEach`; use isolated browser contexts per test |
| Selector drift (no `data-testid` on most elements) | Brittle selectors | Use semantic selectors (`role`, `label`, `placeholder`) with POM centralisation — one fix propagates everywhere |
| CI costs from long generation waits | Pipeline slowdown | Separate `@smoke` (no generation) and `@full` (with generation) suites; smoke suite runs on every PR |

---

## 13. Ideas & Future Strategies

### 13.1 AI-Assisted Test Generation
**Tool: GitHub Copilot / Claude API**
Use LLM-generated test case suggestions as a complement to specification-based test design. The Claude API can analyse new user stories and propose additional edge cases not covered by the test plan.

**Strategy:**
- Feed the user story + AC into a prompt
- Receive suggested Gherkin scenarios
- Human QA reviews and converts to Playwright specs
- Reduces test case authoring time by ~40%

---

### 13.2 Visual Regression Testing
**Tool: Playwright + `@percy/playwright` or `pixelmatch`**
Since the app renders AI-generated videos, the surrounding UI (cards, layout, generation form) is stable and ideal for visual regression baselines.

**Strategy:**
- Capture baseline screenshots per browser on first approved run
- Compare on subsequent runs; fail if pixel diff exceeds threshold (e.g., 0.2%)
- Target the video card grid, header, and form layouts
- Particularly valuable for cross-browser layout fidelity (Safari vs. Chrome)

---

### 13.3 Contract Testing for the Sora API Integration
**Tool: Pact.js**
The application's most critical dependency is the Sora API. Even without access to the backend, consumer-driven contract tests can verify that the frontend sends correctly-shaped requests and handles expected response shapes.

**Strategy:**
- Define Pact contracts for video generation request/response
- Run contract verification in CI independent of the live Sora API
- Detect breaking API changes before they cause UI failures

---

### 13.4 Accessibility Automation
**Tool: `@axe-core/playwright`**
The app currently has no verified accessibility compliance. Automated axe-core scans can catch WCAG 2.1 AA violations on every CI run with zero manual effort.

**Strategy:**
- Add `checkA11y(page)` calls to each page's smoke test
- Fail CI on critical/serious violations
- Report moderate/minor as warnings in Allure
- Target: All 3 pages pass axe-core at WCAG 2.1 AA level

---

### 13.5 API-Level History Validation
**Tool: Playwright `request` fixture (built-in)**
Rather than relying on UI rendering to confirm video history, use Playwright's built-in API testing to directly query the history endpoint and assert on raw response data.

**Strategy:**
- Intercept the network request made by the History page
- Assert response JSON structure: `{ videos: [], total: N }`
- Faster than waiting for DOM rendering; runs in parallel with UI suite
- No extra tool needed — `playwright/test` includes `request` context natively

---

### 13.6 Data-Driven Testing for Generation Settings
**Tool: `@playwright/test` `test.each()`**
Rather than writing separate test cases for each Duration × Aspect Ratio × Quality combination, use parameterised tests to cover the full decision table with minimal code.

```js
// Example — replaces 6 separate test files with one
const combinations = [
  { duration: '4 seconds', ratio: 'Landscape', hq: false },
  { duration: '8 seconds', ratio: 'Portrait',  hq: false },
  { duration: '12 seconds', ratio: 'Portrait', hq: true  },
];

for (const combo of combinations) {
  test(`generates video: ${combo.duration} ${combo.ratio} HQ=${combo.hq}`, async ({ page }) => {
    // ...
  });
}
```

---

### 13.7 Mutation Testing
**Tool: Stryker Mutator (`@stryker-mutator/core`)**
Once the test suite is mature, mutation testing can measure its true effectiveness by introducing controlled bugs into the codebase and verifying the suite catches them.

**Strategy:**
- Run Stryker against the test utility files (`cookieHelper.js`, `videoHelper.js`)
- Target mutation score > 70%
- Use to identify undertested branches in helper logic

---

*End of Test Automation Plan — TAP-PREVIZ-001 v1.0*
