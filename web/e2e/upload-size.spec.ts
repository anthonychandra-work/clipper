import { createHash, randomBytes } from 'node:crypto';
import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

import {
  createFileProjectInSheet,
  deleteAllProjects,
  expect,
  readStatusCard,
  statusCard,
  test,
  waitForStatus,
} from './support';

const PHONE = { width: 390, height: 844 };
const FILE_BYTES = 50 * 1024 * 1024;
const PART_HOLD_MS = 500;
const KEEP_PAGE_OPEN = 'Step 1 of 4. Keep this page open until the upload finishes.';

function checksumOf(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex');
}

test.use({ viewport: PHONE });

test.afterEach(async ({ request }) => {
  await deleteAllProjects(request);
});

test('a 50 MiB upload shows its progress and arrives at the size and checksum it was sent with', async ({
  page,
  request,
  tool,
}) => {
  const content = randomBytes(FILE_BYTES);
  const file = join(tool.settings.runDir, 'fifty-mebibytes.mp4');
  writeFileSync(file, content);
  const partsSent: number[] = [];
  await page.route('**/api/projects/*/upload?*', async (route) => {
    partsSent.push(route.request().postDataBuffer()?.length ?? 0);
    await delay(PART_HOLD_MS);
    await route.continue();
  });

  const projectId = await createFileProjectInSheet(page, file);
  await expect(statusCard(page).locator('h2')).toHaveText('Uploading Video');
  const whileUploading = await readStatusCard(page);
  await expect
    .poll(async () => Number(await statusCard(page).getByRole('progressbar').getAttribute('aria-valuenow')))
    .toBeGreaterThan(0);
  const barWhileUploading = Number(await statusCard(page).getByRole('progressbar').getAttribute('aria-valuenow'));
  await waitForStatus(request, projectId, 'failed');
  const stored = join(tool.settings.dataDir, 'projects', projectId, 'source.mp4');

  expect(whileUploading).toMatchObject({ stage: 'Uploading video', footnote: KEEP_PAGE_OPEN, hasBar: true });
  expect(barWhileUploading).toBeLessThan(100);
  expect(partsSent).toEqual([8, 8, 8, 8, 8, 8, 2].map((mebibytes) => mebibytes * 1024 * 1024));
  expect(statSync(stored).size).toBe(52_428_800);
  expect(checksumOf(readFileSync(stored))).toBe(checksumOf(content));
  await expect(statusCard(page).locator('h2')).toHaveText('Could Not Finish');
});
