import { faker } from '@faker-js/faker';

/**
 * testData.js
 * Centralised test data for the Pre-Viz Engine automation suite.
 * All values are derived from requirements or generated deterministically.
 */

// ── Prompt Data ───────────────────────────────────────────────────────────────

export const prompts = {
  /** Standard prompt used as baseline for generation tests (TC-S01, TC-S02) */
  standard:
    'A cinematic wide shot of a rainy city street at night, neon signs reflecting on wet pavement, slow pan left, shallow depth of field, low key lighting.',

  /** Minimal valid prompt */
  minimal: 'A red car.',

  /** Empty string — for negative validation tests (TC-S08, TC-SF05) */
  empty: '',

  /** Over-length prompt for boundary tests (TC-S09) */
  long: faker.lorem.words(120),

  /** Randomised prompt for parallel run variety */
  random: () =>
    `A ${faker.word.adjective()} ${faker.word.noun()} in a ${faker.word.adjective()} landscape, ${faker.word.verb()} slowly, cinematic lighting.`,
};

// ── Video Generation Settings ─────────────────────────────────────────────────

export const durations = {
  short:  '4 seconds',
  medium: '8 seconds',
  long:   '12 seconds',
};

export const aspectRatios = {
  landscape: 'Landscape',
  portrait:  'Portrait',
};

export const videoCounts = {
  min:     1,
  default: 3,
  max:     5,
  overMax: 6,
  underMin: 0,
};

// ── Decision Table Combinations ───────────────────────────────────────────────
// Used by parameterised tests in generationSettings.spec.js

export const settingsCombinations = [
  { duration: durations.short,  ratio: aspectRatios.landscape, hq: false, label: '4s-landscape-standard' },
  { duration: durations.medium, ratio: aspectRatios.portrait,  hq: false, label: '8s-portrait-standard'  },
  { duration: durations.long,   ratio: aspectRatios.portrait,  hq: true,  label: '12s-portrait-hq'       },
];

// ── Expected UI Text ──────────────────────────────────────────────────────────

export const expectedText = {
  studioHeading:       'Create Your Scene',
  stockFootageHeading: 'Stock Footage Generator',
  historyHeading:      'Video History',
  emptyStateMessage:   "You haven't generated any videos yet.",
  emptyStateCta:       'Go to the Studio to create your first video!',
  hqWarning:           'High quality mode can take 3x longer to generate',
  generateButtonPattern: /Generate \d+ Videos? Directly/i,
};
