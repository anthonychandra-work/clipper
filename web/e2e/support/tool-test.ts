import { test as base } from '@playwright/test';

import { ToolRun, readTestRunSettings } from './run-tool';

const TOOL_START_TIMEOUT_MS = 300_000;

interface WorkerFixtures {
  tool: ToolRun;
}

export const test = base.extend<object, WorkerFixtures>({
  tool: [
    async ({}, use) => {
      const tool = new ToolRun(readTestRunSettings());
      await tool.start();
      await use(tool);
      await tool.stop();
    },
    { scope: 'worker', timeout: TOOL_START_TIMEOUT_MS },
  ],
  baseURL: async ({ tool }, use) => {
    await use(tool.address);
  },
});
