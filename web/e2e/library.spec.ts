import {
  createLinkProject,
  deleteAllProjects,
  expect,
  projectRow,
  readRow,
  seedEveryState,
  test,
  waitForStatus,
} from './support';

const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1360, height: 900 };
const FETCH_TIMEOUT_MS = 60_000;

test.afterEach(async ({ request }) => {
  await deleteAllProjects(request);
});

test.describe('at 390 px', () => {
  test.use({ viewport: PHONE });

  test('each row shows its title, its source and length, and its status', async ({ page, request, fixtureServer }) => {
    const seeded = await seedEveryState(request, fixtureServer);
    await page.goto('/');
    await expect(projectRow(page, seeded.uploading.id)).toBeVisible();

    const fetched = await readRow(page, seeded.fetched.id);
    const failed = await readRow(page, seeded.failed.id);
    const stopped = await readRow(page, seeded.stopped.id);
    const processing = await readRow(page, seeded.processing.id);
    const queued = await readRow(page, seeded.queued.id);
    const uploading = await readRow(page, seeded.uploading.id);

    expect(fetched).toEqual({ title: 'talk', meta: 'Video link · 4 min', status: 'Fetched', barLabel: 'Fetched' });
    expect(failed).toMatchObject({ meta: 'Video link', status: 'Could not finish', barLabel: null });
    expect(stopped).toMatchObject({ status: 'Stopped', barLabel: null });
    expect(processing).toMatchObject({ status: 'Fetching video', barLabel: 'Fetching video' });
    expect(queued).toMatchObject({ title: 'New video from link', status: 'Waiting in queue', barLabel: null });
    expect(uploading).toMatchObject({ title: 'interview.mov', meta: 'Uploaded file', status: 'Uploading video' });
    await expect(projectRow(page, seeded.failed.id).locator('.project-row__status--failed svg.icon')).toHaveCount(1);
    await expect(projectRow(page, seeded.fetched.id)).toHaveAttribute('href', `/projects/${seeded.fetched.id}`);
  });

  test('the Library has a large title, the plus control, the Projects group and the free space', async ({
    page,
    request,
    fixtureServer,
  }) => {
    const older = await createLinkProject(request, `${fixtureServer.address}/missing.mp4`);
    const newer = await createLinkProject(request, `${fixtureServer.address}/missing.mp4`);
    await page.goto('/');

    const group = page.getByRole('region', { name: 'Projects' });
    const rows = group.locator('ul.group.divided.project-rows a.project-row');
    await expect(page.locator('h1.large-title')).toHaveText('Library');
    await expect(page.locator('.toolbar').getByRole('link', { name: 'New Project' })).toHaveAttribute('href', '/new');
    await expect(rows).toHaveCount(2);
    await expect(rows.first()).toHaveAttribute('id', `project-${newer.id}`);
    await expect(rows.last()).toHaveAttribute('id', `project-${older.id}`);
    await expect(group.locator('.list-footer')).toHaveText('50 GB free on this Mac');
    await expect(page.getByText('Prototype with sample data')).toHaveCount(0);
  });

  test('a row follows the progress of its project without a reload', async ({ page, request, fixtureServer }) => {
    const project = await createLinkProject(request, `${fixtureServer.address}/slow/talk.mp4`);
    await page.goto('/');
    const row = projectRow(page, project.id);

    await expect(row.locator('.project-row__status')).toHaveText('Fetching video');
    await expect(row.locator('.project-row__title')).toHaveText('New video from link');
    await expect(row.locator('.project-row__status')).toHaveText('Fetched', { timeout: FETCH_TIMEOUT_MS });

    await expect(row.locator('.project-row__title')).toHaveText('talk');
    await expect(row.locator('.project-row__meta')).toHaveText('Video link · 4 min');
  });
});

test.describe('at 1360 px', () => {
  test.use({ viewport: DESKTOP });

  test('the projects are in the sidebar and the free space is in its foot', async ({ page, request, fixtureServer }) => {
    const first = await createLinkProject(request, `${fixtureServer.address}/missing.mp4`);
    const second = await createLinkProject(request, `${fixtureServer.address}/missing.mp4`);
    await waitForStatus(request, second.id, 'failed');
    await page.goto('/');

    const sidebar = page.locator('#sidebar');
    await expect(sidebar.locator('h2.list-header')).toHaveText('Projects');
    await expect(sidebar.locator('ul.project-rows > li')).toHaveCount(2);
    await expect(sidebar.locator('.sidebar__foot .sidebar__disk')).toHaveText('50 GB free on this Mac');
    expect(await readRow(page, first.id)).toMatchObject({ meta: 'Video link', status: 'Could not finish' });
    await expect(page.locator('.screen .project-rows')).toHaveCount(0);
  });
});
