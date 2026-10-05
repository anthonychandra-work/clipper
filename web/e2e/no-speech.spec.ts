import { statSync } from 'node:fs';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

import type { APIRequestContext } from '@playwright/test';

import type { Project } from '@/library';

import { createLinkProject, deleteAllProjects, expect, readProject, readStatusCard, statusCard, test } from './support';

const PHONE = { width: 390, height: 844 };
const NO_SPEECH = 'No speech was recognised in this video. Clipper needs spoken words to find clips.';
const FAIL_TIMEOUT_MS = 60_000;
const SAMPLE_MS = 50;

function readChangeTimes(folder: string): number[] {
  return ['source.mp4', 'preview.mp4'].map((name) => statSync(join(folder, name)).mtimeMs);
}

function isTranscribing(project: Project): boolean {
  const running = project.steps.find((step) => step.state === 'running');
  return project.status === 'processing' && running?.kind === 'transcribe';
}

async function sampleUntilFailedAgain(request: APIRequestContext, projectId: string): Promise<Project[]> {
  const samples: Project[] = [];
  const deadline = Date.now() + FAIL_TIMEOUT_MS;
  for (;;) {
    const project = await readProject(request, projectId);
    samples.push(project);
    const hasRunAgain = samples.some((sample) => sample.status !== 'failed');
    if (hasRunAgain && project.status === 'failed') return samples;
    if (Date.now() > deadline) throw new Error(`The project did not fail again: ${JSON.stringify(project)}`);
    await delay(SAMPLE_MS);
  }
}

test.use({ viewport: PHONE });

test.afterEach(async ({ request }) => {
  await deleteAllProjects(request);
});

test('a silent video cannot finish for want of speech, and Retry runs the transcription again and nothing else', async ({
  page,
  request,
  fixtureServer,
  tool,
}) => {
  const project = await createLinkProject(request, `${fixtureServer.address}/silence.mp4`);
  const folder = join(tool.settings.dataDir, 'projects', project.id);
  await page.goto(`/projects/${project.id}`);
  await expect(statusCard(page).locator('h2')).toHaveText('Could Not Finish', { timeout: FAIL_TIMEOUT_MS });
  const failed = await readStatusCard(page);
  const stepsWhenFailed = (await readProject(request, project.id)).steps.map((step) => step.state);
  const changeTimes = readChangeTimes(folder);

  await page.getByRole('button', { name: 'Retry' }).click();
  const samples = await sampleUntilFailedAgain(request, project.id);
  await expect(statusCard(page).locator('.status-card__stage')).toHaveText(NO_SPEECH);
  const failedAgain = await readStatusCard(page);

  expect(failed).toEqual({
    heading: 'Could Not Finish',
    stage: NO_SPEECH,
    footnote: null,
    buttons: ['Retry'],
    hasBar: false,
    hasWarning: true,
  });
  expect(stepsWhenFailed).toEqual(['done', 'pending', 'pending', 'pending']);
  expect(samples.some(isTranscribing)).toBe(true);
  expect(samples.every((sample) => sample.steps[0].state === 'done')).toBe(true);
  expect(failedAgain).toEqual(failed);
  expect(readChangeTimes(folder)).toEqual(changeTimes);
});
