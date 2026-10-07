import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Page } from '@playwright/test';

import {
  cutTalkAndKeepRequests,
  deleteAllProjects,
  deleteProject,
  expect,
  exportSeededClips,
  forgetHistory,
  type LearnedRequests,
  nameSentTasks,
  openResults,
  readSentNotes,
  rejectOnTheReviewTab,
  removeSavedKey,
  saveTestKey,
  SEEDED_NOTE,
  SEEDED_REJECTIONS,
  SEEDED_VIEWS,
  test,
  typeViews,
} from './support';

const DESKTOP = { width: 1360, height: 900 };
const LEARNING_TIMEOUT_MS = 300_000;
const EVIDENCE_FILE = 'learning-requests.json';
const ONE_SCORE_AND_THREE_CUTS = ['score', 'cut w01', 'cut w02', 'cut w03'];
const TWO_REASONS_LEARNED = { cutOff: 1, notInteresting: 1, needsContext: 0, repeat: 0 };
const NOTHING_LEARNED = { cutOff: 0, notInteresting: 0, needsContext: 0, repeat: 0 };

async function rejectTwoClipsFromTheMenu(page: Page, projectId: string): Promise<void> {
  for (const { clipId, reason } of SEEDED_REJECTIONS) {
    await rejectOnTheReviewTab(page, `/projects/${projectId}/review/${clipId}`, reason);
  }
}

async function typeTheViewsOnTheResultsTab(page: Page, projectId: string): Promise<void> {
  await openResults(page, projectId);
  for (const [clipId, views] of Object.entries(SEEDED_VIEWS)) {
    await typeViews(page, clipId, String(views));
  }
}

async function readLearnedCounts(page: Page): Promise<string[]> {
  await page.goto('/settings');
  await expect(page.locator('.memory-count')).toHaveCount(4);
  return page.locator('.memory-count').allInnerTexts();
}

async function pressForgetAllOfIt(page: Page): Promise<void> {
  await page.goto('/settings');
  await page.getByRole('button', { name: 'Forget All of It' }).click();
  await expect(page.locator('#toast')).toHaveText('The selector forgot what it had learned');
}

function saveEvidence(folder: string, evidence: Record<string, LearnedRequests>): void {
  mkdirSync(folder, { recursive: true });
  writeFileSync(join(folder, EVIDENCE_FILE), `${JSON.stringify(evidence, null, 2)}\n`);
}

test.use({ viewport: DESKTOP });
test.setTimeout(LEARNING_TIMEOUT_MS);

test.afterEach(async ({ request }) => {
  await removeSavedKey(request);
  await deleteAllProjects(request);
  await forgetHistory(request);
});

test('two rejections with a reason and three clips with views reach the next talk’s four requests as a note, and Forget All of It ends it', async ({
  page,
  request,
  ownTalk,
  fixtureServer,
  recordedClaude,
}, testInfo) => {
  const sources = { request, recordedClaude };
  const link = `${fixtureServer.address}/talk.mp4`;
  await forgetHistory(request);
  await exportSeededClips(request, ownTalk.project.id);
  await rejectTwoClipsFromTheMenu(page, ownTalk.project.id);
  await typeTheViewsOnTheResultsTab(page, ownTalk.project.id);
  const learned = await readLearnedCounts(page);

  await deleteProject(request, ownTalk.project.id);
  await saveTestKey(request);
  const withHistory = await cutTalkAndKeepRequests(sources, link);
  await pressForgetAllOfIt(page);
  const afterForgetting = await cutTalkAndKeepRequests(sources, link);
  const forgotten = await readLearnedCounts(page);
  saveEvidence(process.env.CLIPPER_EVIDENCE_DIR ?? testInfo.outputDir, { withHistory, afterForgetting });

  expect([learned, forgotten]).toEqual([
    ['1', '1', '0', '0'],
    ['0', '0', '0', '0'],
  ]);
  expect([withHistory.rejections, afterForgetting.rejections]).toEqual([TWO_REASONS_LEARNED, NOTHING_LEARNED]);
  expect(nameSentTasks(withHistory.requests)).toEqual(ONE_SCORE_AND_THREE_CUTS);
  expect(readSentNotes(withHistory.requests)).toEqual([SEEDED_NOTE, SEEDED_NOTE, SEEDED_NOTE, SEEDED_NOTE]);
  expect(nameSentTasks(afterForgetting.requests)).toEqual(ONE_SCORE_AND_THREE_CUTS);
  expect(readSentNotes(afterForgetting.requests)).toEqual([null, null, null, null]);
});
