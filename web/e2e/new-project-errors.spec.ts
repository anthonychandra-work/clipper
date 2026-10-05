import {
  deleteAllProjects,
  expect,
  listProjects,
  newProjectForm,
  openNewProjectSheet,
  pressFindClips,
  readShownProblem,
  test,
} from './support';

const PHONE = { width: 390, height: 844 };

test.use({ viewport: PHONE });

test.beforeEach(async ({ request }) => {
  await deleteAllProjects(request);
});

test('the sheet has the sections, the wording and the defaults of the prototype', async ({ page }) => {
  await openNewProjectSheet(page);
  const form = newProjectForm(page);

  await expect(form.locator('.list-header')).toHaveText([
    'Source',
    'Clip Length',
    'Platforms',
    'What to Look For (Optional)',
  ]);
  await expect(form.getByRole('group', { name: 'Source' }).getByRole('button')).toHaveText([
    'YouTube Link',
    'Upload a File',
  ]);
  await expect(form.locator('#source-link')).toHaveAttribute('aria-pressed', 'true');
  await expect(form.getByLabel('Video Link')).toHaveAttribute('placeholder', 'https://www.youtube.com/watch?v=…');
  await expect(form.getByRole('group', { name: 'Clip length' }).getByRole('button')).toHaveText([
    '15–30 s',
    '25–60 s',
    '60–180 s',
  ]);
  await expect(form.locator('#length-standard')).toHaveAttribute('aria-pressed', 'true');
  await expect(form.getByText('One point with its setup and payoff.')).toBeVisible();
  await expect(form.getByRole('group', { name: 'Platforms' }).locator('label')).toHaveText(['TikTok', 'Reels', 'Shorts']);
  await expect(form.getByRole('switch', { checked: true })).toHaveCount(3);
  await expect(form.locator('#draft-brief')).toHaveAttribute(
    'placeholder',
    'Pricing advice and strong opinions. Skip the sponsor read.',
  );
});

test('the hint follows the chosen length, and the file field names the chosen file', async ({ page, fixturesDir }) => {
  await openNewProjectSheet(page);
  const form = newProjectForm(page);

  await form.getByRole('button', { name: '15–30 s' }).click();
  await expect(form.getByText('One line or one reaction. Easiest to watch to the end.')).toBeVisible();
  await form.getByRole('button', { name: '60–180 s' }).click();
  await expect(form.getByText('A full story or argument. Long enough for TikTok payouts.')).toBeVisible();
  await form.getByRole('button', { name: 'Upload a File' }).click();
  await expect(form.locator('#draft-file-name')).toHaveText('MP4, MOV or MKV.');
  await form.locator('#draft-file').setInputFiles(`${fixturesDir}/talk.mp4`);

  await expect(form.locator('#draft-file-name')).toHaveText('Chosen: talk.mp4');
  await expect(form.locator('#draft-file')).toHaveAttribute('accept', 'video/*');
});

test('a link that is not a link shows its error under Source and moves focus to the link field', async ({
  page,
  request,
}) => {
  await openNewProjectSheet(page);
  await page.locator('#draft-link').fill('youtube.com/watch');

  await pressFindClips(page);
  const problem = await readShownProblem(page);
  const link = page.locator('#draft-link');
  await expect(link).toBeFocused();
  await expect(link).toHaveAttribute('aria-invalid', 'true');
  await expect(link).toHaveAttribute('aria-describedby', 'draft-problem');
  await link.pressSequentially('x');

  expect(problem).toEqual({ section: 'Source', message: 'Paste the full link, starting with https://' });
  await expect(page.locator('#draft-problem')).toHaveCount(0);
  await expect(link).not.toHaveAttribute('aria-invalid', 'true');
  await expect(page).toHaveURL('/new');
  expect(await listProjects(request)).toEqual([]);
});

test('a missing file shows its error under Source and moves focus to the file field', async ({ page, request }) => {
  await openNewProjectSheet(page);
  await page.getByRole('button', { name: 'Upload a File' }).click();

  await pressFindClips(page);
  const problem = await readShownProblem(page);

  expect(problem).toEqual({ section: 'Source', message: 'Choose a video file first.' });
  await expect(page.locator('#draft-file')).toBeFocused();
  await expect(page.locator('#draft-file')).toHaveAttribute('aria-invalid', 'true');
  expect(await listProjects(request)).toEqual([]);
});

test('no platform shows its error under Platforms and moves focus to the first switch', async ({
  page,
  request,
  fixtureServer,
}) => {
  await openNewProjectSheet(page);
  await page.locator('#draft-link').fill(`${fixtureServer.address}/talk.mp4`);
  for (const platform of ['TikTok', 'Reels', 'Shorts']) {
    await page.getByRole('switch', { name: platform }).click();
  }

  await pressFindClips(page);
  const problem = await readShownProblem(page);
  const platforms = page.getByRole('group', { name: 'Platforms' });
  await expect(page.locator('#platform-tiktok')).toBeFocused();
  await expect(platforms).toHaveAttribute('aria-invalid', 'true');
  await page.getByRole('switch', { name: 'Reels' }).click();

  expect(problem).toEqual({ section: 'Platforms', message: 'Turn on at least one platform.' });
  await expect(page.locator('#draft-problem')).toHaveCount(0);
  expect(await listProjects(request)).toEqual([]);
});
