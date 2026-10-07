import { readdirSync } from 'node:fs';
import { join } from 'node:path';

import {
  createLinkProject,
  deleteAllProjects,
  expect,
  KEYLESS_END,
  readProject,
  test,
  waitForKeylessEnd,
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
  const firstEnded = await waitForKeylessEnd(request, first.id);
  const secondAfterFirst = await readProject(request, second.id);
  const secondEnded = await waitForKeylessEnd(request, second.id);

  expect(secondWhileFirstRuns.status).toBe('queued');
  expect(['queued', 'processing']).toContain(secondAfterFirst.status);
  expect(firstEnded.title).toBe('talk');
  expect(firstEnded.steps.map((step) => step.state)).toEqual(KEYLESS_END.stepStates);
  expect(secondEnded.durationSeconds).toBe(firstEnded.durationSeconds);
});

test('a project whose fetch is cut off by a stop finishes after the start', async ({ request, tool, fixtureServer }) => {
  const project = await createLinkProject(request, `${fixtureServer.address}/slow/talk.mp4`);
  await waitForStatus(request, project.id, 'processing');

  await tool.stop();
  await tool.start();
  const afterRestart = await readProject(request, project.id);
  const ended = await waitForKeylessEnd(request, project.id);

  expect(['queued', 'processing']).toContain(afterRestart.status);
  expect(ended.durationSeconds).toBeGreaterThan(200);
  expect(readdirSync(join(tool.settings.dataDir, 'projects', project.id)).sort()).toEqual(KEYLESS_END.files);
});
