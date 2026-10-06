import { existsSync, readFileSync, statSync } from 'node:fs';

import type { APIRequestContext, Page } from '@playwright/test';

import {
  createLinkProject,
  deleteAllProjects,
  expect,
  type KeptRequest,
  removeSavedKey,
  test,
  TEST_KEY,
  waitForStatus,
} from './support';

const PHONE = { width: 390, height: 844 };
const OWNER_ONLY = 0o600;
const PERMISSION_BITS = 0o777;
const EVERY_KIND_SEEN = { page: true, prefetched: true, service: true };

interface PageAnswer {
  address: string;
  body: string;
}

// The test fetches each answer itself: the browser keeps no body of a page it left or a link it fetched ahead.
async function watchAnswers(page: Page): Promise<PageAnswer[]> {
  const answers: PageAnswer[] = [];
  await page.route('**/*', async (route) => {
    const answer = await route.fetch();
    answers.push({ address: route.request().url(), body: await answer.text() });
    // The body is already kept, so an answer the page no longer waits for loses nothing here.
    await route.fulfill({ response: answer }).catch(() => undefined);
  });
  return answers;
}

async function settleAnswers(page: Page, answers: PageAnswer[]): Promise<PageAnswer[]> {
  await page.unrouteAll({ behavior: 'wait' });
  return answers;
}

function describeKinds(answers: PageAnswer[]): typeof EVERY_KIND_SEEN {
  const paths = answers.map((answer) => new URL(answer.address));
  return {
    page: paths.some((path) => path.pathname === '/settings' && path.search === ''),
    prefetched: paths.some((path) => path.searchParams.has('_rsc')),
    service: paths.some((path) => path.pathname.startsWith('/api/')),
  };
}

async function saveKeyOnSettings(page: Page): Promise<void> {
  await page.goto('/settings');
  await page.getByLabel('Anthropic API Key').fill(TEST_KEY);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.locator('#toast')).toHaveText('Key saved on this Mac');
}

async function openEveryScreen(page: Page, projectId: string): Promise<void> {
  const screens = [
    { address: '/', landmark: `#project-${projectId}` },
    { address: `/projects/${projectId}/review`, landmark: '#tab-review[aria-current="page"]' },
    { address: `/projects/${projectId}/export`, landmark: '#tab-export[aria-current="page"]' },
    { address: `/projects/${projectId}/results`, landmark: '#tab-results[aria-current="page"]' },
    { address: '/settings', landmark: '#remove-api-key' },
  ];
  for (const screen of screens) {
    await page.goto(screen.address);
    await expect(page.locator(screen.landmark)).toBeVisible();
    await page.waitForLoadState('networkidle');
  }
}

async function askTheService(request: APIRequestContext, projectId: string): Promise<string[]> {
  const project = `/api/projects/${projectId}`;
  const addresses = ['/api/settings', '/api/projects', project, `${project}/selection`, `${project}/review`];
  const answers: string[] = [];
  for (const address of addresses) {
    const answer = await request.get(address);
    if (!answer.ok()) throw new Error(`${address} was not answered: ${answer.status()}`);
    answers.push(await answer.text());
  }
  return answers;
}

function holdsTheKey(text: string): boolean {
  return text.includes(TEST_KEY);
}

function inspectPrinted(printed: string): { saysItRuns: boolean; holdsTheKey: boolean } {
  return { saysItRuns: printed.includes('Clipper is running at'), holdsTheKey: holdsTheKey(printed) };
}

function inspectKept(kept: KeptRequest[]): { cameWithKey: number; holdsTheKey: boolean } {
  return { cameWithKey: kept.filter((asked) => asked.hasKey).length, holdsTheKey: holdsTheKey(JSON.stringify(kept)) };
}

test.use({ viewport: PHONE });

test.beforeEach(async ({ recordedClaude }) => {
  await recordedClaude.forgetRequests();
});

test.afterEach(async ({ request }) => {
  await removeSavedKey(request);
  await deleteAllProjects(request);
});

test('a key saved in Settings finds the clips of a link and is held by its file alone', async ({
  page,
  request,
  tool,
  fixtureServer,
  recordedClaude,
}) => {
  const watched = await watchAnswers(page);
  await saveKeyOnSettings(page);
  const project = await createLinkProject(request, `${fixtureServer.address}/talk.mp4`);
  const ready = await waitForStatus(request, project.id, 'ready');
  await openEveryScreen(page, project.id);
  const kept = await recordedClaude.listRequests();
  const keyInFile = readFileSync(tool.settings.keyFile, 'utf8');
  const fileMode = statSync(tool.settings.keyFile).mode & PERMISSION_BITS;

  await page.getByRole('button', { name: 'Remove' }).click();
  await expect(page.locator('#toast')).toHaveText('Key removed');
  await expect(page.getByLabel('Anthropic API Key')).toHaveValue('');
  const pageAnswers = await settleAnswers(page, watched);
  const served = await askTheService(request, project.id);

  expect(ready.candidateCount).toBe(6);
  expect(describeKinds(pageAnswers)).toEqual(EVERY_KIND_SEEN);
  expect([...pageAnswers.map((answer) => answer.body), ...served].filter(holdsTheKey)).toEqual([]);
  expect(inspectPrinted(tool.readOutput())).toEqual({ saysItRuns: true, holdsTheKey: false });
  expect([keyInFile, fileMode]).toEqual([TEST_KEY, OWNER_ONLY]);
  expect(inspectKept(kept)).toEqual({ cameWithKey: 4, holdsTheKey: false });
  expect(existsSync(tool.settings.keyFile)).toBe(false);
});
