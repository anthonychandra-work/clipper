import { join } from 'node:path';

import {
  createFileProject,
  createFileProjectInSheet,
  deleteAllProjects,
  expect,
  followBarUntil,
  KEYLESS_END,
  probeTalkLength,
  readRow,
  readStatusCard,
  statusCard,
  test,
  waitForKeylessEnd,
} from './support';

const PHONE = { width: 390, height: 844 };
const TRANSCRIBING = 'Transcribing on this Mac';
const NOT_SENT_HERE =
  'Step 1 of 4. This upload is not running in this browser. ' +
  'If no other browser is sending it, delete the project and upload the file again.';

test.use({ viewport: PHONE });

test.afterEach(async ({ request }) => {
  await deleteAllProjects(request);
});

test('the uploaded fixture is prepared and transcribed: its bar never falls, then the row shows the real length', async ({
  page,
  request,
  fixturesDir,
}) => {
  const projectId = await createFileProjectInSheet(page, join(fixturesDir, 'talk.mp4'));
  await expect(page.locator('h1.large-title')).toHaveText('talk.mp4');
  await page.getByRole('link', { name: 'Back to Library' }).click();

  const whilePrepared = await followBarUntil(page, projectId, TRANSCRIBING);
  const whileTranscribed = await followBarUntil(page, projectId, KEYLESS_END.row.status);
  const barValues = [...whilePrepared, ...whileTranscribed];
  const ended = await waitForKeylessEnd(request, projectId);
  const row = await readRow(page, projectId);

  expect(new Set(barValues).size).toBeGreaterThanOrEqual(2);
  expect(barValues).toEqual([...barValues].sort((lower, higher) => lower - higher));
  expect(row).toEqual({ title: 'talk.mp4', meta: 'Uploaded file · 4 min', ...KEYLESS_END.row });
  expect(ended.durationSeconds).toBe(probeTalkLength(fixturesDir));
  expect(ended.upload).toMatchObject({ fileName: 'talk.mp4', receivedBytes: ended.upload?.sizeBytes });
  expect(ended.steps.map((step) => step.state)).toEqual(KEYLESS_END.stepStates);
});

test('a browser that is not sending the file says so on the status screen', async ({ page, request }) => {
  const project = await createFileProject(request, { name: 'interview.mov', sizeBytes: 2000 });

  await page.goto(`/projects/${project.id}`);
  await expect(statusCard(page).locator('h2')).toHaveText('Uploading Video');

  expect(await readStatusCard(page)).toMatchObject({
    stage: 'Uploading video',
    footnote: NOT_SENT_HERE,
    buttons: [],
    hasBar: true,
  });
});
