import {
  createLinkProjectInSheet,
  deleteAllProjects,
  expect,
  followBarUntil,
  probeTalkLength,
  readProject,
  readRow,
  RESTING,
  statusCard,
  test,
} from './support';

const PHONE = { width: 390, height: 844 };
const TRANSCRIBING = 'Transcribing on this Mac';

test.use({ viewport: PHONE });

test.afterEach(async ({ request }) => {
  await deleteAllProjects(request);
});

test('a link to the fixture is fetched and transcribed: its bar never falls, then the row rests with the real length', async ({
  page,
  request,
  fixtureServer,
  fixturesDir,
}) => {
  const projectId = await createLinkProjectInSheet(page, `${fixtureServer.address}/slow/talk.mp4`);
  await expect(statusCard(page).locator('h2')).toHaveText('Finding Clips');
  await page.getByRole('link', { name: 'Back to Library' }).click();

  const whileFetched = await followBarUntil(page, projectId, TRANSCRIBING);
  const whileTranscribed = await followBarUntil(page, projectId, RESTING.word);
  const barValues = [...whileFetched, ...whileTranscribed];
  const row = await readRow(page, projectId);
  const rested = await readProject(request, projectId);

  expect(new Set(whileFetched).size).toBeGreaterThanOrEqual(2);
  expect(barValues).toEqual([...barValues].sort((lower, higher) => lower - higher));
  expect(row).toEqual({ title: 'talk', meta: 'Video link · 4 min', status: RESTING.word, barLabel: RESTING.word });
  expect(rested.durationSeconds).toBe(probeTalkLength(fixturesDir));
  expect(rested.steps.map((step) => step.state)).toEqual(RESTING.stepStates);
});

test('Find Clips sends the link, the length, the platforms and the brief the user chose', async ({ page }) => {
  await page.route('**/api/projects', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    const draft = route.request().postDataJSON();
    await route.fulfill({ status: 422, json: { problem: { section: 'source', message: JSON.stringify(draft) } } });
  });
  await page.goto('/new');
  await page.locator('#draft-link').fill('https://www.youtube.com/watch?v=abc123');
  await page.getByRole('button', { name: '15–30 s' }).click();
  await page.getByRole('switch', { name: 'Reels' }).click();
  await page.locator('#draft-brief').fill('Pricing advice.');

  await page.getByRole('button', { name: 'Find Clips' }).click();

  const sent = JSON.parse(await page.locator('#draft-problem').innerText());
  expect(sent).toEqual({
    sourceKind: 'link',
    link: 'https://www.youtube.com/watch?v=abc123',
    fileName: '',
    fileSizeBytes: 0,
    clipLength: 'short',
    platforms: ['tiktok', 'shorts'],
    brief: 'Pricing advice.',
  });
});
