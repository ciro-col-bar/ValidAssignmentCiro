# BUG-005 · Generate button label becomes stale when out-of-range video count is entered

| Field | Detail |
|---|---|
| **ID** | BUG-005 |
| **Title** | "Generate N Videos" button label shows stale count after invalid video count entry is browser-clamped |
| **Priority** | Medium |
| **Severity** | Minor |
| **Status** | Open |
| **Module** | Studio → Number of Videos → Generate Button Label |
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
- A valid prompt is entered in the Direct Prompt textarea
- Number of Videos field has a valid value (e.g., `5`)

---

### Steps to Reproduce

1. Navigate to the Studio page (`/`)
2. Set the **"Number of Videos to Generate"** field to `5`
3. Verify the button reads **"Generate 5 Videos Directly"** ✓
4. Clear the field and type `0` (an out-of-range value, below min=1)
5. Observe the input field value and the button label

---

### Expected Result

When `0` is entered and the browser clamps the value back to the nearest valid value (e.g., `1` or the previous valid value `5`), the **Generate button label should update to reflect the actual current value**. For example: *"Generate 1 Video Directly"* or *"Generate 5 Videos Directly"* — whichever the field reverts to.

---

### Actual Result

- The `#num-videos` input DOM value reverts to `3` (the field's default, not the last valid entry of `5`)
- The Generate button label **remains stale at "Generate 5 Videos Directly"**
- The displayed count (`5`) contradicts the actual field value (`3`)
- The same behaviour occurs when entering `6` (above max=5): input reverts to `3`, button stays at previous label

**Verified values:**
| Action | Input DOM value | Button label |
|---|---|---|
| Set to `5` | `5` | Generate **5** Videos Directly ✓ |
| Set to `0` | `3` (clamped) | Generate **5** Videos Directly ✗ |
| Set to `6` | `3` (clamped) | Generate **5** Videos Directly ✗ |
| Set to `3` explicitly | `3` | Generate **3** Videos Directly ✓ |

---

### Affected Components

| Component | Selector | Type |
|---|---|---|
| Video count input | `#num-videos` | number input (min=1, max=5) |
| Generate button | `button.inline-flex.items-center.justify-center` | button |

---

### Impact Analysis

- **User impact:** A user who types `0` or `6` sees a button label that does not match the actual count that will be generated. If they proceed, they may be surprised that fewer (or different number of) videos are generated than the button label implied. Creates confusion and erodes trust in the form's accuracy.
- **Data/business risk:** Low — the actual generation will use the clamped value (3), not the displayed value (5). No incorrect API call is made, but the user experience is misleading.
- **Violates:** US-02 Acceptance Criterion — *"The generate button label reflects the chosen count (e.g., 'Generate 3 Videos Directly')"* — the label does not reflect the actual chosen count after clamping.

---

### Console / Network Evidence

No console errors. This is a React state synchronisation issue — the `onChange` handler is not fired when the browser silently clamps the input value via the `min`/`max` HTML attributes, so the React state driving the button label is never updated.

---

### Traceability

- **Related User Stories:** [US-02] — *Generate multiple video variations simultaneously*
- **Related Test Cases:** [TC-S03] — *Set video count to valid values (1, 3, 5)*; [TC-S04] — *Reject invalid video count values (0 and 6)*
- **Potential Duplicates:** None

---

### Root Cause Hypothesis

The React `onChange` event does not fire when the browser natively clamps an `<input type="number">` value via `min`/`max` attributes. The component state (`numVideos`) retains the last React-acknowledged value (`5`), while the DOM silently corrects to `3`. The button label reads from React state (stale `5`), not from the live DOM value.

**Suggested fix:** Use `onBlur` or `onInput` in addition to `onChange`, and explicitly read `e.target.value` after clamping to force a React state update, or use a controlled input approach that clamps via React logic rather than relying on native browser clamping.

---

### Evidence

- `Bugs/evidence/BUG-005/BUG-005-baseline-count-5-label-correct-2026-03-18T22-23-07-110Z.png` — Input=5, button correctly reads "Generate 5 Videos Directly"
- `Bugs/evidence/BUG-005/BUG-005-manifestation-input-reverted-label-stale-2026-03-18T22-23-24-926Z.png` — After entering 0: input DOM shows value=3, button still reads "Generate 5 Videos Directly" (stale)
