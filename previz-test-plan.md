# Test Plan — Pre-Viz Engine v1.9.0
### ISTQB-Aligned Master Test Plan

| Field | Value |
|---|---|
| **Document ID** | TP-PREVIZ-001 |
| **Version** | 1.0 |
| **Date** | 2026-03-16 |
| **Application** | Pre-Viz Engine v1.9.0 |
| **URL** | https://previz-engine-m1mm9ayva-valid.vercel.app/ |
| **Prepared by** | QA Team |
| **Status** | Draft |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Test Objectives](#2-test-objectives)
3. [Scope](#3-scope)
4. [Test Strategy](#4-test-strategy)
5. [Test Levels](#5-test-levels)
6. [Test Types](#6-test-types)
7. [Test Cases & Traceability Matrix](#7-test-cases--traceability-matrix)
8. [Environment Matrix](#8-environment-matrix)
9. [Entry & Exit Criteria](#9-entry--exit-criteria)
10. [Test Schedule & Effort Estimate](#10-test-schedule--effort-estimate)
11. [Roles & Responsibilities](#11-roles--responsibilities)
12. [Risk Register](#12-risk-register)
13. [Release Recommendation](#13-release-recommendation)

---

## 1. Introduction

### 1.1 Purpose
This document defines the master test plan for **Pre-Viz Engine v1.9.0**, an AI-powered pre-visualization platform that enables filmmakers, directors, and creative professionals to generate video previews from textual prompts and scripts using the OpenAI Sora model.

### 1.2 Background
The application is a React Single Page Application (SPA) hosted on Vercel. It uses a browser-cookie-based UUID for anonymous user identity. There is no authentication layer. The primary AI backend is OpenAI's Sora video generation model. Three functional modules have been identified: **Studio**, **Stock Footage Generator**, and **History**.

### 1.3 References

| Document | Version | Location |
|---|---|---|
| App Definition Document | 1.0 | `previz-app-definition.md` |
| User Stories | 1.0 | `previz-user-stories.md` |
| ISTQB Standard Glossary | 4.0 | istqb.org |

---

## 2. Test Objectives

1. Verify that all 14 user stories and their acceptance criteria are fully met.
2. Confirm correct end-to-end behavior of the video generation pipeline (Studio and Stock Footage).
3. Validate correct filtering and display of user-owned vs. all community videos in History.
4. Assess cross-browser and cross-device functional parity.
5. Identify usability, performance, and security risks prior to a production release decision.
6. Provide a Go / No-Go release recommendation supported by measurable evidence.

---

## 3. Scope

### 3.1 In Scope

| Module | Features Covered |
|---|---|
| **Studio** | Direct prompt input, video count (1–5), duration, aspect ratio, high quality toggle, generation trigger |
| **Stock Footage** | Script textarea input, AI script parsing, shot extraction, video generation per shot, all generation settings |
| **History** | "Your Videos" tab, "All Videos" tab, video count, video card data, refresh, cookie debug panel |
| **Navigation** | Header links (Studio / Stock Footage / History), logo link, active state |
| **Identity** | Browser cookie creation, cookie persistence, "Your Videos" scoping |
| **Cross-cutting** | UI responsiveness, error states, loading indicators, empty states |

### 3.2 Out of Scope

- Video download (not observed in UI)
- User account management / authentication
- Video playback quality assessment (AI output quality is not deterministic)
- AI prompt enhancement features (not present)
- Backend / API-level testing (no API documentation available)
- Performance load testing at scale (requires infrastructure access)
- Accessibility (WCAG) full audit (separate engagement)

---

## 4. Test Strategy

### 4.1 Approach
Testing will follow a **risk-based** approach, prioritising the two core generation workflows (Studio and Stock Footage) as they involve the most complex, external-dependent operations (Sora API calls). A combination of **exploratory testing** and **scripted test cases** will be used.

### 4.2 Test Design Techniques (ISTQB)

| Technique | Applied To |
|---|---|
| **Equivalence Partitioning** | Video count (valid: 1–5; invalid: 0, 6+), Duration values, Aspect ratio options |
| **Boundary Value Analysis** | Video count boundaries (1, 5, 0, 6), textarea character limits |
| **Decision Table** | High Quality Mode (on/off) × Duration × Aspect Ratio combinations |
| **State Transition** | Cookie state: fresh browser → cookie assigned → cookie cleared → re-assigned |
| **Error Guessing** | Empty prompt submission, very long scripts, special characters in prompts |
| **Exploratory Testing** | Free-form exploration of edge cases in generation and history rendering |

### 4.3 Test Prioritisation (Risk-Based)

| Priority | Module | Rationale |
|---|---|---|
| P1 — Critical | Studio video generation | Core user flow; depends on external Sora API |
| P1 — Critical | Stock Footage script parsing | Core user flow; AI parsing accuracy is untested |
| P2 — High | History — "Your Videos" filter | Cookie scoping correctness is a data isolation concern |
| P2 — High | History — "All Videos" display | Public data exposure risk |
| P3 — Medium | Generation settings (duration, ratio, quality) | Incorrect settings silently produce wrong output |
| P3 — Medium | Navigation & routing | Regression risk from SPA routing |
| P4 — Low | Cookie debug panel | Developer utility; low end-user impact |

---

## 5. Test Levels

| Level | Description | Owner |
|---|---|---|
| **System Testing** | Full end-to-end testing of all features against requirements | QA Team |
| **Acceptance Testing** | Validation against user stories and acceptance criteria | QA + Product Owner |
| **Regression Testing** | Re-execution of critical P1/P2 cases after any fix | QA Team |

> **Note:** Unit and Integration testing levels are not covered in this plan as source code access is not available. This plan covers black-box system and acceptance testing only.

---

## 6. Test Types

| Test Type | Description | Included |
|---|---|---|
| **Functional Testing** | Verify features behave per specification | Yes |
| **Usability Testing** | Heuristic evaluation of UX clarity and feedback | Yes (lightweight) |
| **Compatibility Testing** | Cross-browser and cross-device execution | Yes (see Section 8) |
| **Negative Testing** | Invalid inputs, boundary violations, empty states | Yes |
| **Performance Testing** | Generation latency, page load time | Observational only |
| **Security Testing** | Cookie exposure, prompt injection surface, data privacy | Yes (lightweight) |
| **Regression Testing** | Stability checks after defect fixes | Yes |

---

## 7. Test Cases & Traceability Matrix

### 7.1 Test Cases

---

#### MODULE: Studio

---

**TC-S01** — Submit direct prompt and verify video generation triggers
- **US:** US-01
- **Priority:** P1
- **Preconditions:** User is on Studio page; prompt textarea is empty
- **Steps:**
  1. Type a descriptive scene prompt in the "Direct Prompt for Sora" textarea
  2. Verify default video count is 3
  3. Click "Generate 3 Videos Directly"
- **Expected Result:** Generation initiates; loading state shown; video(s) appear upon completion
- **Test Data:** `"A cinematic wide shot of a rainy city street at night, shallow depth of field, slow pan left"`

---

**TC-S02** — Verify prompt is passed unmodified to Sora
- **US:** US-01
- **Priority:** P1
- **Preconditions:** User is on Studio page
- **Steps:**
  1. Enter a unique, distinctive prompt with unusual formatting or casing
  2. Submit generation
  3. Check the corresponding History entry's prompt field
- **Expected Result:** The prompt in the History card exactly matches the submitted text, unaltered

---

**TC-S03** — Set video count to valid values (1, 3, 5)
- **US:** US-02
- **Priority:** P1
- **Preconditions:** User is on Studio page
- **Steps:**
  1. Set "Number of Videos to Generate" to `1`; verify button label reads "Generate 1 Video Directly"
  2. Set to `3`; verify button label reads "Generate 3 Videos Directly"
  3. Set to `5`; verify button label reads "Generate 5 Videos Directly"
  4. Submit with count = 3; verify 3 videos are created
- **Expected Result:** Button label updates dynamically; correct number of videos are generated

---

**TC-S04** — Reject invalid video count values (0 and 6)
- **US:** US-02
- **Priority:** P2
- **Preconditions:** User is on Studio page
- **Steps:**
  1. Enter `0` in the "Number of Videos" field; attempt to submit
  2. Enter `6` in the "Number of Videos" field; attempt to submit
- **Expected Result:** Submission is blocked or values are clamped; error/validation feedback is shown

---

**TC-S05** — Select each video duration option
- **US:** US-03
- **Priority:** P2
- **Preconditions:** User is on Studio page
- **Steps:**
  1. Select "4 seconds"; submit; verify generated video is 4s
  2. Select "8 seconds"; submit; verify generated video is 8s
  3. Select "12 seconds"; submit; verify generated video is 12s
- **Expected Result:** Each selected duration is applied to all generated videos; duration is reflected in History card

---

**TC-S06** — Select Landscape and Portrait aspect ratio
- **US:** US-04
- **Priority:** P2
- **Preconditions:** User is on Studio page
- **Steps:**
  1. Verify default aspect ratio is "Landscape"
  2. Select "Portrait"; submit generation
  3. Verify generated video card in History shows "Portrait"
- **Expected Result:** Correct ratio applied; History card confirms selected ratio

---

**TC-S07** — Toggle High Quality Mode on and off
- **US:** US-05
- **Priority:** P2
- **Preconditions:** User is on Studio page
- **Steps:**
  1. Verify High Quality Mode toggle defaults to Off
  2. Enable toggle; verify no warning is shown on Studio (warning only on Stock Footage)
  3. Submit generation; verify History card shows "High Quality"
  4. Disable toggle; submit; verify History card shows "Standard"
- **Expected Result:** Toggle state persists until changed; quality mode is accurately reflected in History

---

**TC-S08** — Submit empty prompt
- **US:** US-01 (negative)
- **Priority:** P1
- **Preconditions:** Prompt textarea is empty
- **Steps:**
  1. Leave "Direct Prompt for Sora" blank
  2. Click the generate button
- **Expected Result:** Submission is blocked; user receives a clear validation message

---

**TC-S09** — Submit a very long prompt (500+ characters)
- **US:** US-01 (negative)
- **Priority:** P3
- **Steps:**
  1. Paste a 600-character prompt into the textarea
  2. Submit generation
- **Expected Result:** Generation accepts the prompt without error; no silent truncation occurs

---

#### MODULE: Stock Footage Generator

---

**TC-SF01** — Paste script and trigger Parse Script
- **US:** US-06
- **Priority:** P1
- **Preconditions:** User is on Stock Footage page
- **Steps:**
  1. Paste a multi-scene script into the "Script Text" textarea
  2. Click "Parse Script"
- **Expected Result:** The system processes the script; individual shots are extracted and displayed or queued for generation
- **Test Data:** A 3-scene screenplay excerpt with distinct INT./EXT. headings

---

**TC-SF02** — Verify each extracted shot generates a video
- **US:** US-07
- **Priority:** P1
- **Preconditions:** Script with 3 clearly separated shots is submitted
- **Steps:**
  1. Submit a script with 3 labelled shots
  2. Navigate to History after generation
- **Expected Result:** 3 video entries appear in History, each associated with its respective shot prompt

---

**TC-SF03** — Verify generation settings apply to all script shots
- **US:** US-08
- **Priority:** P2
- **Steps:**
  1. Set Duration = 8s, Aspect Ratio = Portrait, High Quality = On
  2. Paste a 2-scene script; click Parse Script
  3. Verify both resulting History cards show: 8s, Portrait, High Quality
- **Expected Result:** All generation settings are uniformly applied to every shot extracted from the script

---

**TC-SF04** — High Quality warning is displayed when toggled
- **US:** US-05, US-08
- **Priority:** P2
- **Steps:**
  1. On Stock Footage page, enable High Quality Mode toggle
  2. Observe page
- **Expected Result:** Warning message appears: *"⚠️ Warning: High quality mode can take 3x longer to generate"*

---

**TC-SF05** — Submit empty script
- **US:** US-06 (negative)
- **Priority:** P1
- **Steps:**
  1. Leave "Script Text" textarea blank
  2. Click "Parse Script"
- **Expected Result:** Submission blocked; validation message displayed

---

**TC-SF06** — Submit script with no recognisable shot structure
- **US:** US-06 (negative)
- **Priority:** P2
- **Test Data:** Plain unformatted paragraph text with no scene headings
- **Steps:**
  1. Paste unstructured paragraph text
  2. Click "Parse Script"
- **Expected Result:** System gracefully handles the input — either extracts as a single shot or shows a user-facing message explaining the outcome

---

#### MODULE: History

---

**TC-H01** — "Your Videos" tab shows only current user's videos
- **US:** US-09, US-11
- **Priority:** P1
- **Preconditions:** At least 1 video has been generated in the current session
- **Steps:**
  1. Navigate to History
  2. Click "Your Videos" tab
  3. Note all displayed Cookie IDs
- **Expected Result:** All displayed Cookie IDs match the current browser's cookie UUID shown in the Debug Panel

---

**TC-H02** — Empty state on "Your Videos" for new user
- **US:** US-09
- **Priority:** P2
- **Preconditions:** New browser with no prior generations (clear cookies)
- **Steps:**
  1. Clear cookies; open app
  2. Navigate to History → "Your Videos"
- **Expected Result:** Message: *"You haven't generated any videos yet."* and a CTA to the Studio is visible

---

**TC-H03** — "All Videos" tab shows all users' videos with count
- **US:** US-10
- **Priority:** P2
- **Steps:**
  1. Click "All Videos" tab
  2. Verify total count is displayed (e.g., "4370 videos")
  3. Verify video cards include Cookie IDs from different users
- **Expected Result:** Multi-user cookie IDs are visible; count reflects total across all users

---

**TC-H04** — Video card displays all required metadata fields
- **US:** US-09, US-10
- **Priority:** P2
- **Steps:**
  1. Open "All Videos" tab
  2. Inspect the first visible video card
- **Expected Result:** Card contains: status badge, generation duration, timestamp, prompt text, aspect ratio, video duration, quality mode, cookie ID

---

**TC-H05** — Refresh button reloads video list
- **US:** US-12
- **Priority:** P3
- **Steps:**
  1. Note current video count on "All Videos" tab
  2. Click the Refresh button
  3. Observe whether the list reloads
- **Expected Result:** Video list reloads without a full page navigation; count may update if new videos were generated

---

**TC-H06** — Cookie persistence across browser sessions
- **US:** US-14
- **Priority:** P1
- **Steps:**
  1. Note UUID shown in Cookie Debug Panel
  2. Close browser; reopen app
  3. Navigate to History; check Cookie Debug Panel UUID
- **Expected Result:** Same UUID persists; "Your Videos" still shows previously generated videos

---

**TC-H07** — Cookie cleared — loss of video history
- **US:** US-14 (negative / risk)
- **Priority:** P2
- **Steps:**
  1. Note UUID and generate 1 video
  2. Clear all browser cookies
  3. Revisit app; check "Your Videos"
- **Expected Result:** A new UUID is assigned; "Your Videos" shows empty state — prior videos are inaccessible. (Behaviour is by design; document for user communication)

---

#### MODULE: Navigation

---

**TC-N01** — All header navigation links route correctly
- **US:** US-13
- **Priority:** P2
- **Steps:**
  1. From Studio, click "Stock Footage" → verify Stock Footage Generator page loads
  2. Click "History" → verify History page loads
  3. Click "Studio" → verify Studio (home) page loads
  4. Click logo/title → verify Studio page loads
- **Expected Result:** Each link navigates to the correct section without full page reload

---

**TC-N02** — Active navigation state is visually indicated
- **US:** US-13
- **Priority:** P3
- **Steps:**
  1. Navigate to each of the 3 sections
  2. Inspect the active link styling in the header
- **Expected Result:** The current section's nav link is visually distinguished (e.g., underline, bold, colour change)

---

### 7.2 Traceability Matrix

| User Story | Acceptance Criteria | Test Case(s) | Priority |
|---|---|---|---|
| US-01 | Prompt submitted unmodified | TC-S01, TC-S02, TC-S08, TC-S09 | P1 |
| US-02 | Count 1–5, button label dynamic, parallel generation | TC-S03, TC-S04 | P1 |
| US-03 | Duration 4/8/12s, applied to batch | TC-S05 | P2 |
| US-04 | Landscape/Portrait, default correct | TC-S06 | P2 |
| US-05 | HQ toggle, warning on Stock Footage | TC-S07, TC-SF04 | P2 |
| US-06 | Script textarea, Parse Script triggers parsing | TC-SF01, TC-SF05, TC-SF06 | P1 |
| US-07 | Each shot generates a video, settings applied | TC-SF02, TC-SF03 | P1 |
| US-08 | Settings accessible, applied before submit, warning shown | TC-SF03, TC-SF04 | P2 |
| US-09 | Your Videos filtered by cookie, metadata shown, empty state | TC-H01, TC-H02, TC-H04 | P1/P2 |
| US-10 | All Videos shows all users, count, correct metadata | TC-H03, TC-H04 | P2 |
| US-11 | Cookie-scoped filter, cookie IDs visible | TC-H01, TC-H03 | P1 |
| US-12 | Refresh reloads list | TC-H05 | P3 |
| US-13 | All nav links route correctly, active state | TC-N01, TC-N02 | P2/P3 |
| US-14 | No login required, cookie persists, empty state on clear | TC-H06, TC-H07 | P1 |

**Coverage Summary:** 14 user stories → 21 test cases → 100% story coverage

---

## 8. Environment Matrix

### 8.1 Browser / Desktop Matrix

| Browser | Version | OS | Priority | Notes |
|---|---|---|---|---|
| Chrome | Latest (stable) | Windows 11 | **P1 — Primary** | Main dev target; baseline browser |
| Firefox | Latest (stable) | Windows 11 | P2 | Second most-used; cookie handling differs |
| Edge | Latest (Chromium) | Windows 11 | P2 | Enterprise user base; shares Chromium engine |
| Safari | Latest | macOS Ventura | P2 | Different cookie/SameSite behaviour |
| Chrome | Latest | macOS Ventura | P3 | Cross-OS parity check |

### 8.2 Mobile / Responsive Matrix

| Device | Browser | Viewport | Priority | Notes |
|---|---|---|---|---|
| iPhone 14 | Safari (iOS) | 390×844 | P2 | Portrait-default use case; iOS cookie sandbox |
| Pixel 5 (Android) | Chrome Mobile | 393×851 | P2 | Android baseline |
| iPad (10th gen) | Safari (iPadOS) | 820×1180 | P3 | Tablet landscape/portrait split UI check |
| Samsung Galaxy S21 | Chrome Mobile | 360×800 | P3 | Common Android mid-range device |

### 8.3 Minimum Execution Requirement

For a **go/no-go decision**, all P1 test cases must pass on:
- Chrome Latest / Windows 11 *(primary environment)*
- Safari Latest / macOS *(cookie behaviour validation)*
- Chrome Mobile / Pixel 5 *(mobile responsiveness)*

---

## 9. Entry & Exit Criteria

### 9.1 Entry Criteria (Testing may begin when…)

- [ ] Application is deployed and accessible at the target URL
- [ ] App Definition and User Stories documents are approved
- [ ] Test environment is confirmed stable (no planned deployments)
- [ ] Tester has a clean browser profile (no pre-existing cookies for the domain)
- [ ] Network access to the Sora API is confirmed functional

### 9.2 Exit Criteria (Testing is complete when…)

- [ ] All P1 test cases have been executed
- [ ] All P2 test cases have been executed
- [ ] 100% of critical defects (severity 1–2) are resolved or have an accepted mitigation
- [ ] No open P1 test case has a "Fail" status without a documented workaround
- [ ] Traceability matrix is fully populated with Pass/Fail results
- [ ] Release recommendation document is signed off

### 9.3 Suspension Criteria (Testing paused when…)

- Sora API is unavailable or returning consistent errors (blocks all generation tests)
- Application fails to load on the primary environment (Chrome/Windows 11)
- A blocker defect prevents navigation between sections

---

## 10. Test Schedule & Effort Estimate

| Phase | Activities | Estimated Effort |
|---|---|---|
| Planning & Setup | Environment prep, test data creation, cookie profiling | 0.5 day |
| P1 Test Execution | TC-S01/02/03/08, TC-SF01/05, TC-H01/06, TC-H07 (9 cases) | 1.0 day |
| P2 Test Execution | TC-S04–07, TC-SF02–04/06, TC-H02–04, TC-N01 (12 cases) | 1.5 days |
| P3 Test Execution | TC-S09, TC-H05, TC-N02 (3 cases) | 0.5 day |
| Cross-browser / Device | Matrix execution (P1 cases × 3 environments) | 1.0 day |
| Defect Reporting & Retesting | Bug logging, fix verification, regression | 1.0 day |
| **Total** | | **5.5 days** |

---

## 11. Roles & Responsibilities

| Role | Responsibility |
|---|---|
| **Test Lead** | Test plan authoring, risk assessment, release recommendation |
| **QA Engineer** | Test case execution, defect reporting, retesting |
| **Product Owner** | Acceptance criteria sign-off, release go/no-go approval |
| **Developer** | Defect investigation, fix delivery, deployment confirmation |

---

## 12. Risk Register

| ID | Risk | Likelihood | Impact | Severity | Mitigation |
|---|---|---|---|---|---|
| R01 | **Sora API unavailable** during testing — blocks all generation TCs | Medium | Critical | **HIGH** | Schedule testing during low-load windows; have a recorded generation session as fallback evidence |
| R02 | **Video generation is non-deterministic** — no ground-truth to assert output quality | High | High | **HIGH** | Limit assertions to structural/metadata checks (history card data, count, duration tag); exclude subjective output quality |
| R03 | **Cookie cleared accidentally** during cross-browser testing contaminates "Your Videos" filter results | Medium | High | **HIGH** | Use dedicated browser profiles per test session; document cookie UUIDs before starting |
| R04 | **Script parsing accuracy is untested** — AI may extract wrong number of shots or fail on unconventional script formats | High | High | **HIGH** | Test with 3+ diverse script formats (standard screenplay, bare paragraphs, numbered list); document observed behaviour |
| R05 | **All Videos tab exposes all user prompts publicly** — privacy/legal risk | High | High | **HIGH** | Flag to Product Owner for policy review; test that cookie IDs are the only PII visible |
| R06 | **No input validation** on prompt or script fields — empty/oversized inputs may crash Sora call | Medium | Medium | **MEDIUM** | Execute TC-S08, TC-S09, TC-SF05, TC-SF06 as P1 priority |
| R07 | **History pagination** — with 4,370+ videos, "All Videos" may have performance/rendering issues | Medium | Medium | **MEDIUM** | Observe rendering time; check for virtual scrolling; report if list takes >3s to become interactive |
| R08 | **Mobile layout degradation** — complex form controls (selects, toggles) may be unusable on small viewports | Medium | Low | **LOW** | Execute P2 mobile matrix runs; screenshot any layout breakage |
| R09 | **No rate limiting observed** — high-volume generation could incur unexpected API costs | Low | Medium | **LOW** | Do not generate more than 15 videos in testing; use minimum duration (4s) for all test generations |

---

## 13. Release Recommendation

### 13.1 Criteria Assessed

| Category | Status | Notes |
|---|---|---|
| Core generation flow (Studio) | ⚠️ Untested | Awaiting test execution |
| Script parsing flow (Stock Footage) | ⚠️ Untested | Highest uncertainty — AI parsing accuracy unverified |
| History / cookie filtering | ⚠️ Untested | Cookie scoping logic must be validated |
| Cross-browser compatibility | ⚠️ Untested | Pending matrix execution |
| Input validation | ⚠️ Untested | Empty and boundary inputs unverified |
| Privacy (public All Videos) | 🔴 Risk identified | All user prompts are publicly visible — requires policy decision |
| Cookie debug panel in production | 🔴 Risk identified | Developer tool exposing UUIDs is visible to all users |

---

### 13.2 Pre-Execution Recommendation: **⛔ NO-GO**

> **Rationale:** Testing has not yet been executed. Based on exploratory analysis alone, two immediate blockers are identified that must be resolved before a go decision can be considered regardless of test results.

---

### 13.3 Top Risks Requiring Resolution Before Go

#### 🔴 BLOCKER 1 — Public exposure of all user prompts (R05)
**Risk:** The "All Videos" tab displays every prompt submitted by every user, with no opt-out or access control. In a production environment with real filmmakers and studios, submitted prompts may contain **confidential project details, unreleased IP, or sensitive creative work**.

**Required Action:** Product Owner must decide on one of:
- (a) Restrict "All Videos" to authenticated users only
- (b) Require explicit user consent before prompts are made public
- (c) Remove "All Videos" from the public-facing product

---

#### 🔴 BLOCKER 2 — Cookie Debug Panel exposed in production (R03/R05)
**Risk:** The `cookie-debug-panel` on the History page is visible to all users and displays internal filter state and the user's UUID cookie. This is a development utility that **should not be present in production**.

**Required Action:** Hide or remove the cookie debug panel behind a feature flag or dev-only condition before release.

---

#### 🟠 HIGH RISK 3 — Script parsing accuracy unverified (R04)
**Risk:** The Stock Footage Generator's core value — extracting structured shots from freeform scripts — has never been tested. Failure to parse correctly would result in wrong shot counts, merged scenes, or silent failures with no user feedback.

**Required Action:** Execute TC-SF01 through TC-SF06 with at minimum 3 diverse script formats before release; document acceptable parsing accuracy threshold.

---

#### 🟠 HIGH RISK 4 — No input validation confirmed (R06)
**Risk:** Empty prompts, oversized inputs, or malformed scripts submitted to the Sora API may produce unhandled errors, unhelpful blank screens, or unexpected API charges.

**Required Action:** Confirm validation gates (TC-S08, TC-S09, TC-SF05, TC-SF06) pass before release.

---

### 13.4 Conditional Go Criteria

The release may be recommended **GO** if all of the following are met after test execution:

- [ ] Blockers 1 and 2 are resolved or explicitly accepted by Product Owner with a documented risk acceptance
- [ ] All 9 P1 test cases pass across the minimum environment matrix (Chrome/Win, Safari/Mac, Chrome Mobile)
- [ ] Zero Severity-1 (Blocker) open defects
- [ ] High Risks 3 and 4 are validated with documented results (pass or documented known limitation)
- [ ] No critical console errors on primary environment (Chrome/Windows 11)

---

*End of Test Plan — TP-PREVIZ-001 v1.0*
