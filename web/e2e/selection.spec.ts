import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import type { APIRequestContext, Page } from '@playwright/test';

import {
  createLinkProject,
  deleteAllProjects,
  expect,
  openNewProjectSheet,
  pressFindClips,
  projectRow,
  readProject,
  readSelection,
  readStatusCard,
  readTranscript,
  type RecordedClaude,
  removeSavedKey,
  statusCard,
  test,
  TEST_KEY,
  waitForStatus,
} from './support';

const PHONE = { width: 390, height: 844 };
const BRIEF = 'Advice a shop owner can use.';
const NO_KEY = 'No Anthropic API key is saved. Add one in Settings, then retry.';
const STEP_TIMEOUT_MS = 90_000;
const SUBTITLE_WITH_SIX_CANDIDATES = /^Uploaded file · 00:03:5\d · 6 candidates$/;

interface EvidenceSources {
  request: APIRequestContext;
  dataDir: string;
  recordedClaude: RecordedClaude;
}

async function uploadTalkWithTheBrief(page: Page, video: string): Promise<string> {
  await openNewProjectSheet(page);
  await page.getByRole('button', { name: 'Upload a File' }).click();
  await page.locator('#draft-file').setInputFiles(video);
  await page.locator('#draft-brief').fill(BRIEF);
  await pressFindClips(page);
  await page.waitForURL(/\/projects\/[0-9a-f]{12}$/);
  return new URL(page.url()).pathname.split('/')[2];
}

async function saveKeyOnSettings(page: Page): Promise<void> {
  await expect(page).toHaveURL('/settings');
  await page.getByLabel('Anthropic API Key').fill(TEST_KEY);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.locator('#toast')).toHaveText('Key saved on this Mac');
}

function writeJson(file: string, evidence: object): void {
  writeFileSync(file, `${JSON.stringify(evidence, null, 2)}\n`);
}

async function saveEvidence(folder: string, sources: EvidenceSources, projectId: string): Promise<void> {
  const talkSelection = {
    project: await readProject(sources.request, projectId),
    selection: await readSelection(sources.request, projectId),
    transcript: readTranscript(sources.dataDir, projectId),
  };
  mkdirSync(folder, { recursive: true });
  writeJson(join(folder, 'talk-selection.json'), talkSelection);
  writeJson(join(folder, 'selection-requests.json'), await sources.recordedClaude.listRequests());
}

test.use({ viewport: PHONE });

test.beforeEach(async ({ recordedClaude }) => {
  await recordedClaude.forgetRequests();
});

test.afterEach(async ({ request }) => {
  await removeSavedKey(request);
  await deleteAllProjects(request);
});

test('with no key the uploaded talk points to Settings, and with the key saved there Retry ends on its Review tab', async ({
  page,
  request,
  fixturesDir,
  tool,
  recordedClaude,
}, testInfo) => {
  const projectId = await uploadTalkWithTheBrief(page, join(fixturesDir, 'talk.mp4'));
  await expect(statusCard(page).locator('.status-card__stage')).toHaveText(NO_KEY, { timeout: STEP_TIMEOUT_MS });
  const withoutKey = await readStatusCard(page);
  const askedWithoutKey = await recordedClaude.listRequests();

  await statusCard(page).getByRole('link', { name: 'Open Settings' }).click();
  await saveKeyOnSettings(page);
  await page.goBack();
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(page).toHaveURL(`/projects/${projectId}/review`, { timeout: STEP_TIMEOUT_MS });
  await expect(page.locator('.screen-head__subtitle')).toHaveText(SUBTITLE_WITH_SIX_CANDIDATES);
  await page.goto('/');
  const rowStatus = projectRow(page, projectId).locator('.project-row__status');
  await expect(rowStatus).toHaveText('Ready to review · 6 candidates, 0 kept, 0 rejected');
  const sources = { request, dataDir: tool.settings.dataDir, recordedClaude };
  await saveEvidence(process.env.CLIPPER_EVIDENCE_DIR ?? testInfo.outputDir, sources, projectId);

  expect(withoutKey).toMatchObject({ heading: 'Could Not Finish', stage: NO_KEY, hasWarning: true });
  expect(withoutKey).toMatchObject({ buttons: ['Retry'], links: ['Open Settings'], hasBar: false });
  expect(askedWithoutKey).toEqual([]);
});

test('with a saved key a link to the talk reaches ready with six candidates and no replay peak', async ({
  request,
  fixtureServer,
  savedKey,
  recordedClaude,
}) => {
  const project = await createLinkProject(request, `${fixtureServer.address}/talk.mp4`);
  const ready = await waitForStatus(request, project.id, 'ready');
  const selection = await readSelection(request, project.id);
  const asked = await recordedClaude.listRequests();

  expect(savedKey).toBe(TEST_KEY);
  expect(ready.candidateCount).toBe(6);
  expect(selection.candidates.map((candidate) => candidate.rank)).toEqual([1, 2, 3, 4, 5, 6]);
  expect(selection.candidates.filter((candidate) => candidate.isReplayPeak)).toEqual([]);
  expect(selection.replayPeaks).toEqual([]);
  expect(asked.map((kept) => kept.hasKey)).toEqual([true, true, true, true]);
});
