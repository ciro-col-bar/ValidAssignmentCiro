# BUG-004 · High Quality Mode warning incorrectly appears on Studio page

| Field | Detail |
|---|---|
| **ID** | BUG-004 |
| **Title** | "High quality mode can take 3x longer" warning shown on Studio page — should only appear on Stock Footage |
| **Priority** | Medium |
| **Severity** | Minor |
| **Status** | Open |
| **Module** | Studio → Video Generation Options → High Quality Mode |
| **Reported By** | UAT exploratory session |
| **Date** | 2026-03-18 |

---

### Environment

- **Browser:** Chromium (mcp-web-inspector)
- **URL:** `https://previz-engine-m1mm9ayva-valid.vercel.app/`
- **User Role:** Anonymous
- **OS:** Windows 11

---

### Preconditions

- User is on the Studio page (`/`)
- High Quality Mode toggle is in the default Off state

---

### Steps to Reproduce

1. Navigate to the Studio page (`/`)
2. Locate the **High Quality Mode** toggle in "Video Generation Options"
3. Click the toggle to enable High Quality Mode (toggle turns green/active)
4. Observe the text content below the toggle

---

### Expected Result

No warning message appears on the Studio page when High Quality Mode is enabled. Per US-05 Acceptance Criteria: *"When enabled on Stock Footage, a warning is shown: 'High quality mode can take 3x longer to generate'"* — the warning is explicitly scoped to Stock Footage only.

---

### Actual Result

The warning message **"⚠️ Warning: High quality mode can take 3x longer to generate"** appears on the Studio page immediately after enabling the toggle — the same message that is intended only for the Stock Footage page.

---

### Affected Components

| Component | Selector | Type |
|---|---|---|
| High Quality Mode toggle | `button.relative.inline-flex.h-6` | toggle button |
| Warning message | `text=⚠️ Warning: High quality mode can take 3x longer to generate` | text/paragraph |
| Video Generation Options section | `h3=Video Generation Options` | section |

---

### Impact Analysis

- **User impact:** The warning creates unnecessary anxiety for Studio users who have no reason to be warned about generation time in the same way as Stock Footage users (who generate many shots at once). The warning is contextually misleading on Studio.
- **Data/business risk:** Low functional risk — the warning is informational only. However, it may confuse users and erode trust in the UI's accuracy.
- **Violates:** US-05 Acceptance Criterion — *"When enabled on Stock Footage, a warning is shown"* (implicit: not on Studio).

---

### Console / Network Evidence

No console errors or network failures observed related to this issue. This is a conditional rendering logic defect — the warning component is not gated by page context.

---

### Traceability

- **Related User Stories:** [US-05] — *Enable High Quality Mode for finer output*
- **Related Test Cases:** [TC-S07] — *Toggle High Quality Mode on and off*; [TC-SF04] — *High Quality warning is displayed when toggled*
- **Potential Duplicates:** None

---

### Root Cause Hypothesis

The warning component is rendered based solely on the HQ toggle state (`isHighQuality === true`), without checking which page/route is currently active. The condition should be: `isHighQuality && currentPage === 'stock-footage'`.

**Suggested fix:** Gate the warning with a page context check — only render it when the component is mounted on the Stock Footage page.

---

### Evidence

- `Bugs/evidence/BUG-004/BUG-004-baseline-hq-off-no-warning-2026-03-18T22-18-12-951Z.png` — Studio page with HQ off — no warning shown (correct state)
- `Bugs/evidence/BUG-004/BUG-004-manifestation-hq-warning-on-studio-2026-03-18T22-18-01-309Z.png` — Studio page with HQ enabled — warning incorrectly visible
