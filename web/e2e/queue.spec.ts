import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import {
  createFileProject,
  createLinkProject,
  deleteAllProjects,
  expect,
  projectRow,
  readProject,
  RESTING,
  sendPart,
  statusCard,
  test,
  waitForRest,
  waitForStatus,
} from './support';

const PHONE = { width: 390, height: 844 };
const REST_TIMEOUT_MS = 90_000;

test.use({ viewport: PHONE });

test.afterEach(async ({ request }) => {
  await deleteAllProjects(request);
});

test('a second project waits while the first is processed, names it, and starts when it finishes', async ({
  page,
  request,
  fixtureServer,
}) => {
  const first = await createLinkProject(request, `${fixtureServer.address}/slow/talk.mp4`);
  const second = await createLinkProject(request, `${fixtureServer.address}/talk.mp4`);
  await page.goto('/');
  await expect(projectRow(page, second.id).locator('.project-row__status')).toHaveText('Waiting in queue');
  await expect(projectRow(page, first.id).locator('.project-row__title')).toHaveText('talk');

  await projectRow(page, second.id).click();
  await expect(statusCard(page).locator('h2')).toHaveText('Waiting in Queue');
  await expect(statusCard(page).locator('.status-card__stage')).toHaveText('It starts when “talk” finishes.');
  await expect(statusCard(page).locator('.list-footer')).toHaveText('One video is processed at a time.');
  const firstWhileSecondWaits = await readProject(request, first.id);
  await expect(statusCard(page).locator('h2')).toHaveText('Finding Clips', { timeout: REST_TIMEOUT_MS });
  const firstWhenSecondStarts = await readProject(request, first.id);
  await expect(statusCard(page).locator('h2')).toHaveText(RESTING.card.heading, { timeout: REST_TIMEOUT_MS });

  expect(firstWhileSecondWaits.status).toBe('processing');
  expect(firstWhenSecondStarts.status).toBe(RESTING.status);
});

test('a file sent while another project is processed arrives in full and then waits its turn', async ({
  request,
  fixtureServer,
  fixturesDir,
  tool,
}) => {
  const talk = readFileSync(join(fixturesDir, 'talk.mp4'));
  const running = await createLinkProject(request, `${fixtureServer.address}/slow/talk.mp4`);
  await waitForStatus(request, running.id, 'processing');

  const upload = await createFileProject(request, { name: 'talk.mp4', sizeBytes: talk.length });
  const whileUploading = await readProject(request, upload.id);
  const sent = await sendPart(request, { projectId: upload.id, offset: 0, bytes: talk });
  const afterUpload = await readProject(request, upload.id);
  const runningMeanwhile = await readProject(request, running.id);
  const rested = await waitForRest(request, upload.id);

  expect(whileUploading.status).toBe('uploading');
  expect((await sent.json()).receivedBytes).toBe(talk.length);
  expect(statSync(join(tool.settings.dataDir, 'projects', upload.id, 'source.mp4')).size).toBe(talk.length);
  expect(afterUpload.status).toBe('queued');
  expect(runningMeanwhile.status).toBe('processing');
  expect(rested.durationSeconds).toBeGreaterThan(200);
});
