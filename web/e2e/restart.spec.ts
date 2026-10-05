import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  createFileProject,
  createLinkProject,
  deleteAllProjects,
  expect,
  projectRow,
  readRow,
  sendPart,
  test,
  waitForStatus,
} from './support';

const PHONE = { width: 390, height: 844 };

test.use({ viewport: PHONE });

test.afterEach(async ({ request }) => {
  await deleteAllProjects(request);
});

test('the uploaded project and the link project are listed in the same state after a stop and a start', async ({
  page,
  request,
  tool,
  fixtureServer,
  fixturesDir,
}) => {
  const talk = readFileSync(join(fixturesDir, 'talk.mp4'));
  const uploaded = await createFileProject(request, { name: 'talk.mp4', sizeBytes: talk.length });
  await sendPart(request, { projectId: uploaded.id, offset: 0, bytes: talk });
  const linked = await createLinkProject(request, `${fixtureServer.address}/talk.mp4`);
  const uploadedBefore = await waitForStatus(request, uploaded.id, 'fetched');
  const linkedBefore = await waitForStatus(request, linked.id, 'fetched');
  await page.goto('/');
  const rowsBefore = [await readRow(page, linked.id), await readRow(page, uploaded.id)];

  await tool.stop();
  await tool.start();
  await page.reload();
  await expect(projectRow(page, linked.id)).toBeVisible();
  const rowsAfter = [await readRow(page, linked.id), await readRow(page, uploaded.id)];

  expect(rowsBefore).toEqual([
    { title: 'talk', meta: 'Video link · 4 min', status: 'Fetched', barLabel: 'Fetched' },
    { title: 'talk.mp4', meta: 'Uploaded file · 4 min', status: 'Fetched', barLabel: 'Fetched' },
  ]);
  expect(rowsAfter).toEqual(rowsBefore);
  expect(await waitForStatus(request, uploaded.id, 'fetched')).toEqual(uploadedBefore);
  expect(await waitForStatus(request, linked.id, 'fetched')).toEqual(linkedBefore);
  await expect(page.locator('.project-rows a.project-row')).toHaveCount(2);
});
