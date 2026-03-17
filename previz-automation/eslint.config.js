// ESLint flat config — ESLint v10 (replaces .eslintrc)
import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['tests/**/*.js', 'pages/**/*.js', 'utils/**/*.js', 'fixtures/**/*.js', 'config/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      // Catch common async issues in test code
      'no-await-in-loop': 'warn',
      'no-console': 'warn',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'prefer-const': 'error',
      'no-var': 'error',
      // Enforce explicit return types help readability in test code
      'consistent-return': 'error',
    },
  },
  {
    // Relax rules for test spec files — test.each and describe patterns are verbose
    files: ['tests/**/*.spec.js'],
    rules: {
      'no-await-in-loop': 'off', // Common pattern in loop-based card assertions
    },
  },
];
