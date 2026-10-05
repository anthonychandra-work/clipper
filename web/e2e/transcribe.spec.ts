import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Locator } from '@playwright/test';

import {
  countWordsWrongInHundred,
  createFileProjectInSheet,
  createLinkProject,
  deleteAllProjects,
  expect,
  projectRow,
  readProject,
  readStatusCard,
  readTranscript,
  statusCard,
  test,
} from './support';

const PHONE = { width: 390, height: 844 };
const TRANSCRIBING = 'Transcribing on this Mac';
const STOPPED_WHILE_TRANSCRIBING = 'Stopped at “Transcribing on this Mac”. The stages before it are kept.';
const REST_TIMEOUT_MS = 90_000;
const BAR_TIMEOUT_MS = 30_000;
const EVIDENCE_NAME = 'talk-transcript.json';
const MOST_WORDS_WRONG_IN_HUNDRED = 15;
const WORDS_IN_FOUR_TALKS = 2512;

function saveEvidence(folder: string, evidence: object): void {
  mkdirSync(folder, { recursive: true });
  writeFileSync(join(folder, EVIDENCE_NAME), `${JSON.stringify(evidence, null, 2)}\n`);
}

async function readBarValue(bar: Locator): Promise<number> {
  return Number(await bar.getAttribute('aria-valuenow'));
}

async function readRisingBarValues(bar: Locator, count: number): Promise<number[]> {
  const values = [await readBarValue(bar)];
  while (values.length < count) {
    const lastValue = values[values.length - 1];
    await expect.poll(() => readBarValue(bar), { timeout: BAR_TIMEOUT_MS }).toBeGreaterThan(lastValue);
    values.push(await readBarValue(bar));
  }
  return values;
}

test.use({ viewport: PHONE });

test.afterEach(async ({ request }) => {
  await deleteAllProjects(request);
});

test('the uploaded talk reaches Transcribed, and its stored words are timed in order and match the script', async ({
  page,
  request,
  fixturesDir,
  tool,
}, testInfo) => {
  const projectId = await createFileProjectInSheet(page, join(fixturesDir, 'talk.mp4'));
  await expect(statusCard(page).locator('h2')).toHaveText('Transcribed', { timeout: REST_TIMEOUT_MS });
  const project = await readProject(request, projectId);
  const transcript = readTranscript(tool.settings.dataDir, projectId);
  const times = transcript.words.flatMap((word) => [word.start, word.end]);
  const evidence = { status: project.status, durationSeconds: project.durationSeconds, transcript };
  saveEvidence(process.env.CLIPPER_EVIDENCE_DIR ?? testInfo.outputDir, evidence);

  expect(project.status).toBe('transcribed');
  expect(transcript.words.length).toBeGreaterThan(500);
  expect(times.every((time) => typeof time === 'number')).toBe(true);
  expect(times).toEqual([...times].sort((earlier, later) => earlier - later));
  expect(times[0]).toBeGreaterThanOrEqual(0);
  expect(times[times.length - 1]).toBeLessThanOrEqual(project.durationSeconds ?? 0);
  expect(countWordsWrongInHundred(transcript)).toBeLessThanOrEqual(MOST_WORDS_WRONG_IN_HUNDRED);
});

test('the long talk shows its transcription in the Library with a rising bar, stops without a transcript, and resumes', async ({
  page,
  request,
  fixtureServer,
  tool,
}) => {
  const project = await createLinkProject(request, `${fixtureServer.address}/long-talk.mp4`);
  const folder = join(tool.settings.dataDir, 'projects', project.id);
  await page.goto('/');
  const row = projectRow(page, project.id);
  await expect(row.locator('.project-row__status')).toHaveText(TRANSCRIBING, { timeout: REST_TIMEOUT_MS });
  const barValues = await readRisingBarValues(row.getByRole('progressbar', { name: TRANSCRIBING }), 3);

  await row.click();
  await expect(statusCard(page).locator('.status-card__stage')).toHaveText(TRANSCRIBING);
  const running = await readStatusCard(page);
  await page.getByRole('button', { name: 'Stop' }).click();
  await expect(statusCard(page).locator('h2')).toHaveText('Stopped');
  const stopped = await readStatusCard(page);
  const filesWhenStopped = readdirSync(folder).sort();
  await page.getByRole('button', { name: 'Resume' }).click();
  await expect(statusCard(page).locator('h2')).toHaveText('Transcribed', { timeout: REST_TIMEOUT_MS });

  expect(barValues).toEqual([...new Set(barValues)].sort((lower, higher) => lower - higher));
  expect(running).toMatchObject({ heading: 'Finding Clips', footnote: 'Step 2 of 4.', buttons: ['Stop'], hasBar: true });
  expect(stopped).toMatchObject({ stage: STOPPED_WHILE_TRANSCRIBING, buttons: ['Resume'], hasBar: false });
  expect(filesWhenStopped).toEqual(['preview.mp4', 'source.mp4']);
  expect(readTranscript(tool.settings.dataDir, project.id).words.length).toBeGreaterThan(WORDS_IN_FOUR_TALKS);
});
