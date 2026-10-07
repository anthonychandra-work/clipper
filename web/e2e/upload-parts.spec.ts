import { createHash, randomBytes } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { createFileProject, deleteProject, expect, sendPart, test } from './support';

const PART_BYTES = 8 * 1024 * 1024;
const FILE_BYTES = 50 * 1024 * 1024;

function checksumOf(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex');
}

test('a 50 MiB file sent in 8 MiB parts through the web port is stored whole', async ({ request, tool }) => {
  const content = randomBytes(FILE_BYTES);
  const project = await createFileProject(request, { name: 'random.mp4', sizeBytes: FILE_BYTES });
  const counts: number[] = [];

  for (let offset = 0; offset < FILE_BYTES; offset += PART_BYTES) {
    const bytes = content.subarray(offset, offset + PART_BYTES);
    const response = await sendPart(request, { projectId: project.id, offset, bytes });
    counts.push((await response.json()).receivedBytes);
  }

  const stored = join(tool.settings.dataDir, 'projects', project.id, 'source.mp4');
  expect(counts.at(-1)).toBe(FILE_BYTES);
  expect(counts).toHaveLength(Math.ceil(FILE_BYTES / PART_BYTES));
  expect(statSync(stored).size).toBe(FILE_BYTES);
  expect(checksumOf(readFileSync(stored))).toBe(checksumOf(content));
  await deleteProject(request, project.id);
});

test('a part sent at another offset is answered with the count the service holds', async ({ request }) => {
  const project = await createFileProject(request, { name: 'short.mp4', sizeBytes: 10 });
  await sendPart(request, { projectId: project.id, offset: 0, bytes: Buffer.from('abcd') });

  const repeated = await sendPart(request, { projectId: project.id, offset: 0, bytes: Buffer.from('abcd') });

  expect(repeated.status()).toBe(409);
  expect((await repeated.json()).receivedBytes).toBe(4);
  await deleteProject(request, project.id);
});
