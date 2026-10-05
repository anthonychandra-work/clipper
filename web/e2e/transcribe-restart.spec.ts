import { readdirSync } from 'node:fs';
import { join } from 'node:path';

import type { APIRequestContext } from '@playwright/test';

import {
  createLinkProject,
  deleteAllProjects,
  expect,
  projectRow,
  readProject,
  test,
  waitForStepDone,
} from './support';

const PHONE = { width: 390, height: 844 };
const STEP_TIMEOUT_MS = 90_000;

async function readTranscribedPercent(request: APIRequestContext, projectId: string): Promise<number> {
  const project = await readProject(request, projectId);
  return project.steps.find((step) => step.kind === 'transcribe')?.percent ?? 0;
}

test.use({ viewport: PHONE });

test.afterEach(async ({ request }) => {
  await deleteAllProjects(request);
});

test('the tool stopped during a transcription and started again lists one project, which is transcribed', async ({
  page,
  request,
  tool,
  fixtureServer,
}) => {
  const project = await createLinkProject(request, `${fixtureServer.address}/long-talk.mp4`);
  const folder = join(tool.settings.dataDir, 'projects', project.id);
  await expect.poll(() => readTranscribedPercent(request, project.id), { timeout: STEP_TIMEOUT_MS }).toBeGreaterThan(0);

  await tool.stop();
  await tool.start();
  const afterTheStart = await readProject(request, project.id);
  const transcribed = await waitForStepDone(request, project.id, 'transcribe');
  await page.goto('/');
  await expect(projectRow(page, project.id)).toBeVisible();

  expect(['queued', 'processing']).toContain(afterTheStart.status);
  await expect(page.locator('.project-rows a.project-row')).toHaveCount(1);
  expect(readdirSync(folder).sort()).toEqual(['preview.mp4', 'source.mp4', 'transcript.json']);
  expect(transcribed.steps.map((step) => step.kind)).toEqual(['fetch', 'transcribe', 'score', 'cut']);
  expect(transcribed.steps.slice(0, 2).map((step) => step.state)).toEqual(['done', 'done']);
});
