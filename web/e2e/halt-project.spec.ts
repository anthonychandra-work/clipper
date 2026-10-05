import { createLinkProject, deleteAllProjects, expect, readStatusCard, RESTING, statusCard, test } from './support';

const PHONE = { width: 390, height: 844 };
const REST_TIMEOUT_MS = 60_000;
const DOWNLOAD_FAILED = 'The video could not be downloaded. Check the link and your connection, then retry.';

test.use({ viewport: PHONE });

test.afterEach(async ({ request }) => {
  await deleteAllProjects(request);
});

test('a link that answers "not found" shows the reason and Retry, and Retry finishes it once repaired', async ({
  page,
  request,
  fixtureServer,
}) => {
  const project = await createLinkProject(request, `${fixtureServer.address}/missing-until-repaired/talk.mp4`);
  await page.goto(`/projects/${project.id}`);
  await expect(statusCard(page).locator('h2')).toHaveText('Could Not Finish');
  const failed = await readStatusCard(page);

  await fixtureServer.repair();
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(statusCard(page).locator('h2')).toHaveText(RESTING.card.heading, { timeout: REST_TIMEOUT_MS });

  expect(failed).toEqual({
    heading: 'Could Not Finish',
    stage: DOWNLOAD_FAILED,
    footnote: null,
    buttons: ['Retry'],
    hasBar: false,
    hasWarning: true,
  });
  expect(await readStatusCard(page)).toEqual({ ...RESTING.card, buttons: [], hasBar: true, hasWarning: false });
});

test('Stop during a fetch leaves the project stopped, and Resume finishes it', async ({ page, request, fixtureServer }) => {
  const project = await createLinkProject(request, `${fixtureServer.address}/slow/talk.mp4`);
  await page.goto(`/projects/${project.id}`);
  await expect(statusCard(page).locator('h2')).toHaveText('Finding Clips');
  const running = await readStatusCard(page);

  await page.getByRole('button', { name: 'Stop' }).click();
  await expect(statusCard(page).locator('h2')).toHaveText('Stopped');
  const stopped = await readStatusCard(page);
  await page.getByRole('button', { name: 'Resume' }).click();
  await expect(statusCard(page).locator('h2')).toHaveText(RESTING.card.heading, { timeout: REST_TIMEOUT_MS });

  expect(running).toMatchObject({ stage: 'Fetching video', footnote: 'Step 1 of 4.', buttons: ['Stop'], hasBar: true });
  expect(stopped).toEqual({
    heading: 'Stopped',
    stage: 'Stopped at “Fetching video”. The stages before it are kept.',
    footnote: null,
    buttons: ['Resume'],
    hasBar: false,
    hasWarning: true,
  });
  await expect(page.locator('.screen-head__subtitle')).toHaveText('Video link · 4 min');
});
