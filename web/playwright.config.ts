import { defineConfig } from '@playwright/test';

const TEST_TIMEOUT_MS = 120_000;
const EXPECT_TIMEOUT_MS = 10_000;

if (!process.env.CLIPPER_TEST_RUN_DIR) {
  throw new Error('Run the browser tests from the repository root: "pnpm test:browser <file>" or "pnpm test".');
}

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  timeout: TEST_TIMEOUT_MS,
  expect: { timeout: EXPECT_TIMEOUT_MS },
  use: {
    browserName: 'chromium',
    trace: 'retain-on-failure',
  },
});
