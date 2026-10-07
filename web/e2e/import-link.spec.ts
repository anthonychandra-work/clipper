import {
  createLinkProjectInSheet,
  deleteAllProjects,
  expect,
  followBarUntil,
  KEYLESS_END,
  probeTalkLength,
  readRow,
  statusCard,
  test,
  waitForKeylessEnd,
} from './support';

const PHONE = { width: 390, height: 844 };
const TRANSCRIBING = 'Transcribing on this Mac';

test.use({ viewport: PHONE });

test.afterEach(async ({ request }) => {
  await deleteAllProjects(request);
});

test('a link to the fixture is fetched and transcribed: its bar never falls, then the row shows the real length', async ({
  page,
  request,
  fixtureServer,
  fixturesDir,
}) => {
  const projectId = await createLinkProjectInSheet(page, `${fixtureServer.address}/slow/talk.mp4`);
  await expect(statusCard(page).locator('h2')).toHaveText('Finding Clips');
  await page.getByRole('link', { name: 'Back to Library' }).click();

  const whileFetched = await followBarUntil(page, projectId, TRANSCRIBING);
  const whileTranscribed = await followBarUntil(page, projectId, KEYLESS_END.row.status);
  const barValues = [...whileFetched, ...whileTranscribed];
  const ended = await waitForKeylessEnd(request, projectId);
  const row = await readRow(page, projectId);

  expect(new Set(whileFetched).size).toBeGreaterThanOrEqual(2);
  expect(barValues).toEqual([...barValues].sort((lower, higher) => lower - higher));
  expect(row).toEqual({ title: 'talk', meta: 'Video link · 4 min', ...KEYLESS_END.row });
  expect(ended.durationSeconds).toBe(probeTalkLength(fixturesDir));
  expect(ended.steps.map((step) => step.state)).toEqual(KEYLESS_END.stepStates);
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
