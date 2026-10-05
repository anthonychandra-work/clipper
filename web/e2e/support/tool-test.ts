import { test as base } from '@playwright/test';

import { findOrBuildFixtures } from './build-fixtures';
import { ToolRun, readTestRunSettings } from './run-tool';
import { type FixtureServer, serveFixtures } from './serve-fixtures';

const TOOL_START_TIMEOUT_MS = 300_000;
const FIXTURE_BUILD_TIMEOUT_MS = 120_000;

interface TestFixtures {
  fixtureServer: FixtureServer;
}

interface WorkerFixtures {
  tool: ToolRun;
  fixturesDir: string;
}

export const test = base.extend<TestFixtures, WorkerFixtures>({
  tool: [
    async ({}, use) => {
      const tool = new ToolRun(readTestRunSettings());
      await tool.start();
      await use(tool);
      await tool.stop();
    },
    { scope: 'worker', timeout: TOOL_START_TIMEOUT_MS },
  ],
  fixturesDir: [
    async ({}, use) => {
      await use(findOrBuildFixtures(readTestRunSettings().runDir));
    },
    { scope: 'worker', timeout: FIXTURE_BUILD_TIMEOUT_MS },
  ],
  fixtureServer: async ({ fixturesDir }, use) => {
    const server = await serveFixtures(fixturesDir);
    await use(server);
    await server.stop();
  },
  baseURL: async ({ tool }, use) => {
    await use(tool.address);
  },
});
