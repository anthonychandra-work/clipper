import { existsSync } from 'node:fs';
import { join } from 'node:path';

import {
  createLinkProject,
  deleteAllProjects,
  expect,
  readProject,
  test,
  waitForStatus,
} from './support';

test.afterEach(async ({ request }) => {
  await deleteAllProjects(request);
});

test('a second link project waits for the first and then finishes', async ({ request, fixtureServer }) => {
  const first = await createLinkProject(request, `${fixtureServer.address}/slow/talk.mp4`);
  const second = await createLinkProject(request, `${fixtureServer.address}/talk.mp4`);

  await waitForStatus(request, first.id, 'processing');
  const secondWhileFirstRuns = await readProject(request, second.id);
  const firstFetched = await waitForStatus(request, first.id, 'fetched');
  const secondAfterFirst = await readProject(request, second.id);
  const secondFetched = await waitForStatus(request, second.id, 'fetched');

  expect(secondWhileFirstRuns.status).toBe('queued');
  expect(['queued', 'processing']).toContain(secondAfterFirst.status);
  expect(firstFetched.title).toBe('talk');
  expect(firstFetched.steps.map((step) => step.state)).toEqual(['done', 'pending', 'pending', 'pending']);
  expect(secondFetched.durationSeconds).toBe(firstFetched.durationSeconds);
});

test('a project whose fetch is cut off by a stop finishes after the start', async ({ request, tool, fixtureServer }) => {
  const project = await createLinkProject(request, `${fixtureServer.address}/slow/talk.mp4`);
  await waitForStatus(request, project.id, 'processing');

  await tool.stop();
  await tool.start();
  const afterRestart = await readProject(request, project.id);
  const fetched = await waitForStatus(request, project.id, 'fetched');

  expect(['queued', 'processing']).toContain(afterRestart.status);
  expect(fetched.durationSeconds).toBeGreaterThan(200);
  expect(existsSync(join(tool.settings.dataDir, 'projects', project.id, 'preview.mp4'))).toBe(true);
});
