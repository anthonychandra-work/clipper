import { test as base } from '@playwright/test';

import { findOrBuildFixtures } from './build-fixtures';
import { ToolRun, readTestRunSettings } from './run-tool';
import { type FixtureServer, serveFixtures } from './serve-fixtures';
import { findOrFetchTestModel, placeAsDefaultModel } from './test-model';

const TOOL_START_TIMEOUT_MS = 300_000;
const FIXTURE_BUILD_TIMEOUT_MS = 120_000;
const MODEL_FETCH_TIMEOUT_MS = 300_000;

interface TestFixtures {
  fixtureServer: FixtureServer;
}

interface WorkerFixtures {
  tool: ToolRun;
  fixturesDir: string;
  modelServer: FixtureServer;
}

export const test = base.extend<TestFixtures, WorkerFixtures>({
  modelServer: [
    async ({}, use) => {
      const testModelDir = findOrFetchTestModel();
      placeAsDefaultModel(testModelDir, readTestRunSettings().dataDir);
      const server = await serveFixtures(testModelDir);
      await use(server);
      await server.stop();
    },
    { scope: 'worker', timeout: MODEL_FETCH_TIMEOUT_MS },
  ],
  tool: [
    async ({ modelServer }, use) => {
      const tool = new ToolRun(readTestRunSettings(), modelServer.address);
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
