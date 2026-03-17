import { test, expect } from '@playwright/test';
import { StudioPage } from '../../pages/StudioPage.js';
import { prompts, expectedText } from '../../fixtures/testData.js';

/**
 * Studio — Prompt Tests
 * Covers: TC-S01 (submit prompt), TC-S08 (empty prompt)
 * User Stories: US-01
 */
test.describe('Studio — Direct Prompt', () => {

  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    const studio = new StudioPage(page);
    await studio.goto();
  });

  test('@smoke @P1 TC-S01 — Studio page loads with correct heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: expectedText.studioHeading })).toBeVisible();
  });

  test('@P1 TC-S01 — Prompt textarea accepts input and generate button is present', async ({ page }) => {
    const studio = new StudioPage(page);

    await studio.fillPrompt(prompts.standard);
    await expect(studio.promptTextarea).toHaveValue(prompts.standard);
    await expect(studio.generateButton).toBeVisible();
    await expect(studio.generateButton).toBeEnabled();
  });

  test('@P1 TC-S01 — Generate button label reflects default video count of 3', async ({ page }) => {
    const studio = new StudioPage(page);
    const label = await studio.getGenerateButtonLabel();
    expect(label).toMatch(expectedText.generateButtonPattern);
    expect(label).toContain('3');
  });

  // TC-S08 is split into two tests to avoid a single test with branching logic.
  // One test covers the "button disabled" path; the other covers "validation message shown".
  // Only one will pass depending on the app's implementation — both are valid behaviors.

  test('@P1 TC-S08a — Empty prompt: generate button is disabled', async ({ page }) => {
    const studio = new StudioPage(page);
    await studio.fillPrompt(prompts.empty);
    // If the app validates on button state, this will pass
    await expect(studio.generateButton).toBeDisabled();
  });

  test('@P1 TC-S08b — Empty prompt: submitting shows user-facing validation feedback', async ({ page }) => {
    const studio = new StudioPage(page);
    await studio.fillPrompt(prompts.empty);

    const isDisabled = await studio.generateButton.isDisabled();
    if (isDisabled) {
      // Button is disabled — validation via button state is acceptable; mark this path
      test.skip(true, 'App uses button-disabled pattern (TC-S08a); validation message not shown.');
    }

    await studio.clickGenerate();
    // Prefer ARIA-based validation locators over Tailwind class selectors
    await expect(
      page.getByRole('alert').or(page.getByText(/required|cannot be empty|enter a prompt/i))
    ).toBeVisible({ timeout: 5_000 });
  });
});
