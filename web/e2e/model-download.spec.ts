import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

import type { Page } from '@playwright/test';

import {
  createLinkProject,
  deleteAllProjects,
  expect,
  readProject,
  readStatusCard,
  readTranscript,
  statusCard,
  type StatusCardText,
  test,
} from './support';

const PHONE = { width: 390, height: 844 };
const DEFAULT_MODEL = 'large-v3-turbo';
const DOWNLOADING = 'Downloading Whisper small';
const TRANSCRIBING = 'Transcribing on this Mac';
const STEP_TIMEOUT_MS = 60_000;
const SAMPLE_MS = 150;

async function chooseWhisperSmall(page: Page): Promise<void> {
  await page.goto('/settings');
  await page.getByLabel('Transcription Model').selectOption({ label: 'Whisper small' });
  await expect(page.locator('#setting-whisperModel')).toHaveValue('small');
}

async function readCardAtStage(page: Page, stage: string): Promise<StatusCardText> {
  await expect(statusCard(page).locator('.status-card__stage')).toHaveText(stage, { timeout: STEP_TIMEOUT_MS });
  return readStatusCard(page);
}

async function collectStagesUntilTranscribed(page: Page): Promise<string[]> {
  const stages: string[] = [];
  const deadline = Date.now() + STEP_TIMEOUT_MS;
  while ((await statusCard(page).locator('h2').innerText()) !== 'Transcribed') {
    if (Date.now() > deadline) throw new Error(`The project was not transcribed. Stages shown: ${stages}`);
    stages.push(await statusCard(page).locator('.status-card__stage').innerText());
    await delay(SAMPLE_MS);
  }
  return stages;
}

test.use({ viewport: PHONE });

test.beforeEach(async ({ tool }) => {
  await tool.stop();
  await tool.start({ CLIPPER_MODEL_SOURCE: `${tool.modelSource}/slow` });
});

test.afterEach(async ({ request, tool }) => {
  await deleteAllProjects(request);
  await request.patch('/api/settings', { data: { whisperModel: DEFAULT_MODEL } });
  await tool.stop();
  await tool.start();
});

test('the first project to need a model that is not on the Mac downloads it as a step of its own, and the next does not', async ({
  page,
  request,
  tool,
  fixtureServer,
}) => {
  await chooseWhisperSmall(page);
  const first = await createLinkProject(request, `${fixtureServer.address}/talk.mp4`);
  await page.goto(`/projects/${first.id}`);
  const downloading = await readCardAtStage(page, DOWNLOADING);
  const transcribing = await readCardAtStage(page, TRANSCRIBING);
  const rested = await readCardAtStage(page, 'Step 3 of 5 is done.');
  const second = await createLinkProject(request, `${fixtureServer.address}/talk.mp4`);
  await page.goto(`/projects/${second.id}`);
  const stagesOfSecond = await collectStagesUntilTranscribed(page);
  const stepsOfSecond = (await readProject(request, second.id)).steps.map((step) => step.kind);

  expect(downloading).toMatchObject({ heading: 'Finding Clips', footnote: 'Step 2 of 5.', hasBar: true });
  expect(transcribing).toMatchObject({ heading: 'Finding Clips', footnote: 'Step 3 of 5.', hasBar: true });
  expect(rested).toMatchObject({ heading: 'Transcribed', footnote: 'Not started: Scoring windows, Cutting clips.' });
  expect(readdirSync(join(tool.settings.dataDir, 'models', 'small')).sort()).toEqual(['config.json', 'weights.npz']);
  expect(readTranscript(tool.settings.dataDir, first.id).model).toBe('small');
  expect(stagesOfSecond).toContain(TRANSCRIBING);
  expect(stagesOfSecond).not.toContain(DOWNLOADING);
  expect(stepsOfSecond).toEqual(['fetch', 'transcribe', 'score', 'cut']);
});
