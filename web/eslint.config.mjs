import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const playwrightFixtureRules = {
  files: ['e2e/**/*.ts'],
  rules: {
    'no-empty-pattern': 'off',
    'react-hooks/rules-of-hooks': 'off',
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  playwrightFixtureRules,
  globalIgnores(['.next/**', '.next-test/**', 'next-env.d.ts', 'test-results/**', 'playwright-report/**']),
]);

export default eslintConfig;
