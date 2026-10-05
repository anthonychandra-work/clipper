import { readdirSync } from 'node:fs';
import { join } from 'node:path';

import {
  createLinkProject,
  deleteAllProjects,
  expect,
  readProject,
  RESTING,
  test,
  waitForRest,
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
  const firstRested = await waitForRest(request, first.id);
  const secondAfterFirst = await readProject(request, second.id);
  const secondRested = await waitForRest(request, second.id);

  expect(secondWhileFirstRuns.status).toBe('queued');
  expect(['queued', 'processing']).toContain(secondAfterFirst.status);
  expect(firstRested.title).toBe('talk');
  expect(firstRested.steps.map((step) => step.state)).toEqual(RESTING.stepStates);
  expect(secondRested.durationSeconds).toBe(firstRested.durationSeconds);
});

test('a project whose fetch is cut off by a stop finishes after the start', async ({ request, tool, fixtureServer }) => {
  const project = await createLinkProject(request, `${fixtureServer.address}/slow/talk.mp4`);
  await waitForStatus(request, project.id, 'processing');

  await tool.stop();
  await tool.start();
  const afterRestart = await readProject(request, project.id);
  const rested = await waitForRest(request, project.id);

  expect(['queued', 'processing']).toContain(afterRestart.status);
  expect(rested.durationSeconds).toBeGreaterThan(200);
  expect(readdirSync(join(tool.settings.dataDir, 'projects', project.id)).sort()).toEqual(RESTING.files);
});
