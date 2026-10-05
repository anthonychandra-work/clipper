import { test as base } from '@playwright/test';

import { findOrBuildFixtures } from './build-fixtures';
import { ToolRun, readTestRunSettings } from './run-tool';
import { removeSavedKey, saveTestKey, TEST_KEY } from './saved-key';
import { type FixtureServer, serveFixtures } from './serve-fixtures';
import { type RecordedClaude, serveRecordedClaude } from './serve-recorded-claude';
import { findOrFetchTestModel, placeAsDefaultModel } from './test-model';

const TOOL_START_TIMEOUT_MS = 300_000;
const FIXTURE_BUILD_TIMEOUT_MS = 120_000;
const MODEL_FETCH_TIMEOUT_MS = 300_000;
const SCENARIO_OF_THE_TOOL = 'talk';

interface TestFixtures {
  fixtureServer: FixtureServer;
  savedKey: string;
}

interface WorkerFixtures {
  tool: ToolRun;
  fixturesDir: string;
  modelServer: FixtureServer;
  recordedClaude: RecordedClaude;
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
  recordedClaude: [
    async ({}, use) => {
      const standIn = await serveRecordedClaude();
      await use(standIn);
      await standIn.stop();
    },
    { scope: 'worker' },
  ],
  tool: [
    async ({ modelServer, recordedClaude }, use) => {
      const anthropicSource = recordedClaude.at(SCENARIO_OF_THE_TOOL);
      const tool = new ToolRun(readTestRunSettings(), modelServer.address, anthropicSource);
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
  savedKey: async ({ request }, use) => {
    await saveTestKey(request);
    await use(TEST_KEY);
    await removeSavedKey(request);
  },
  baseURL: async ({ tool }, use) => {
    await use(tool.address);
  },
});
