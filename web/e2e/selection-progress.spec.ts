import type { APIRequestContext, Page } from '@playwright/test';

import {
  createLinkProject,
  deleteAllProjects,
  type EnvironmentChanges,
  expect,
  followBarUntil,
  projectRow,
  readProject,
  readSelection,
  readStatusCard,
  type RecordedClaude,
  removeSavedKey,
  saveTestKey,
  statusCard,
  type StatusCardText,
  test,
} from './support';

const PHONE = { width: 390, height: 844 };
const SCORING = 'Scoring 4 windows';
const CUTTING = 'Cutting clips';
const READY_ROW = 'Ready to review · 6 candidates, 0 kept, 0 rejected';
const STOPPED_WHILE_SCORING = 'Stopped at “Scoring 4 windows”. The stages before it are kept.';
const STEP_TIMEOUT_MS = 60_000;

function answerSlowly(recordedClaude: RecordedClaude): EnvironmentChanges {
  return { CLIPPER_ANTHROPIC_SOURCE: recordedClaude.at('slow/talk') };
}

async function readCardAtStage(page: Page, stage: string): Promise<StatusCardText> {
  await expect(statusCard(page).locator('.status-card__stage')).toHaveText(stage, { timeout: STEP_TIMEOUT_MS });
  return readStatusCard(page);
}

async function readCutState(request: APIRequestContext, projectId: string): Promise<string | undefined> {
  const project = await readProject(request, projectId);
  return project.steps.find((step) => step.kind === 'cut')?.state;
}

test.use({ viewport: PHONE });

test.beforeEach(async ({ tool, recordedClaude, request }) => {
  await tool.stop();
  await tool.start(answerSlowly(recordedClaude));
  await saveTestKey(request);
});

test.afterEach(async ({ request, tool }) => {
  await deleteAllProjects(request);
  await removeSavedKey(request);
  await tool.stop();
  await tool.start();
});

test('the row of a link reads its two selection steps over a bar that never falls and ends ready', async ({
  page,
  request,
  fixtureServer,
}) => {
  const project = await createLinkProject(request, `${fixtureServer.address}/talk.mp4`);
  await page.goto('/');

  const beforeScoring = await followBarUntil(page, project.id, SCORING);
  const whileScoring = await followBarUntil(page, project.id, CUTTING);
  const whileCutting = await followBarUntil(page, project.id, READY_ROW);
  const barValues = [...beforeScoring, ...whileScoring, ...whileCutting];

  expect(whileScoring.length).toBeGreaterThan(0);
  expect(new Set(whileCutting).size).toBeGreaterThanOrEqual(2);
  expect(barValues).toEqual([...barValues].sort((lower, higher) => lower - higher));
  expect(Math.min(...whileCutting)).toBeGreaterThanOrEqual(Math.max(...whileScoring));
  await expect(projectRow(page, project.id).getByRole('progressbar')).toHaveCount(0);
});

test('the status screen counts the two steps as 3 and 4, Stop names the score step, and Resume ends on the Review tab', async ({
  page,
  request,
  fixtureServer,
}) => {
  const project = await createLinkProject(request, `${fixtureServer.address}/talk.mp4`);
  await page.goto(`/projects/${project.id}`);
  const scoring = await readCardAtStage(page, SCORING);

  await page.getByRole('button', { name: 'Stop' }).click();
  await expect(statusCard(page).locator('h2')).toHaveText('Stopped');
  const stopped = await readStatusCard(page);
  await page.getByRole('button', { name: 'Resume' }).click();
  const cutting = await readCardAtStage(page, CUTTING);
  await expect(page).toHaveURL(`/projects/${project.id}/review`, { timeout: STEP_TIMEOUT_MS });

  expect(scoring).toMatchObject({ heading: 'Finding Clips', footnote: 'Step 3 of 4.', buttons: ['Stop'] });
  expect(stopped).toMatchObject({ heading: 'Stopped', stage: STOPPED_WHILE_SCORING, buttons: ['Resume'] });
  expect(stopped).toMatchObject({ links: [], hasBar: false });
  expect(cutting).toMatchObject({ heading: 'Finding Clips', footnote: 'Step 4 of 4.', hasBar: true });
});

test('the tool stopped while clips are cut and started again lists one project, which reaches ready with its six candidates', async ({
  page,
  request,
  tool,
  fixtureServer,
  recordedClaude,
}) => {
  const project = await createLinkProject(request, `${fixtureServer.address}/talk.mp4`);
  await expect.poll(() => readCutState(request, project.id), { timeout: STEP_TIMEOUT_MS }).toBe('running');

  await tool.stop();
  await tool.start(answerSlowly(recordedClaude));
  const afterTheStart = await readProject(request, project.id);
  await page.goto('/');
  const rowStatus = projectRow(page, project.id).locator('.project-row__status');
  await expect(rowStatus).toHaveText(READY_ROW, { timeout: STEP_TIMEOUT_MS });
  const selection = await readSelection(request, project.id);

  expect(['queued', 'processing']).toContain(afterTheStart.status);
  await expect(page.locator('.project-rows a.project-row')).toHaveCount(1);
  expect(selection.candidates.map((candidate) => candidate.id)).toEqual(['c01', 'c02', 'c03', 'c04', 'c05', 'c06']);
  expect(selection.candidates.map((candidate) => candidate.total)).toEqual([88, 84, 82, 82, 75, 55]);
  expect(selection.windows.filter((window) => window.isShortlisted)).toHaveLength(3);
});
