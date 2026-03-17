/**
 * environments.js
 * Environment configuration for the Pre-Viz Engine test suite.
 * Base URL is resolved from ENVIRONMENT env var, falling back to staging.
 */

const environments = {
  staging: {
    baseUrl: 'https://previz-engine-m1mm9ayva-valid.vercel.app',
    label: 'Staging',
  },
  production: {
    baseUrl: process.env.PROD_BASE_URL || 'https://previz-engine.vercel.app',
    label: 'Production',
  },
};

const active = process.env.ENVIRONMENT || 'staging';

if (!environments[active]) {
  throw new Error(`Unknown ENVIRONMENT value: "${active}". Valid options: ${Object.keys(environments).join(', ')}`);
}

export const config = environments[active];
export default config;
