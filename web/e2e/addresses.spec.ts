import {
  createLinkProject,
  deleteAllProjects,
  expect,
  presentAsReady,
  projectRow,
  statusCard,
  test,
  waitForKeylessEnd,
  waitForStatus,
} from './support';

const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1360, height: 900 };
const FOUR_MINUTE_SUBTITLE = /^Video link · 00:03:5\d · 0 candidates$/;

test.afterEach(async ({ request }) => {
  await deleteAllProjects(request);
});

test.describe('at 390 px', () => {
  test.use({ viewport: PHONE });

  test('a project opens at its own address, a reload shows it again, and Back returns to the Library', async ({
    page,
    request,
    fixtureServer,
  }) => {
    const project = await createLinkProject(request, `${fixtureServer.address}/missing.mp4`);
    await waitForStatus(request, project.id, 'failed');
    await page.goto('/');

    await projectRow(page, project.id).click();
    await expect(page).toHaveURL(`/projects/${project.id}`);
    await page.reload();
    await expect(page).toHaveURL(`/projects/${project.id}`);
    await expect(page.locator('h1.large-title')).toHaveText('New video from link');
    await expect(statusCard(page).locator('h2')).toHaveText('Could Not Finish');
    await page.goBack();

    await expect(page).toHaveURL('/');
    await expect(page.locator('h1.large-title')).toHaveText('Library');
  });

  test('a ready project opens on its Review tab, and each tab has an address that a reload keeps', async ({
    page,
    request,
    fixtureServer,
  }) => {
    const created = await createLinkProject(request, `${fixtureServer.address}/talk.mp4`);
    const ended = await waitForKeylessEnd(request, created.id);
    await presentAsReady(page, ended.id);

    await page.goto(`/projects/${ended.id}`);
    await expect(page).toHaveURL(`/projects/${ended.id}/review`);
    await expect(page.locator('h1.large-title')).toHaveText('talk');
    await expect(page.locator('.screen-head__subtitle')).toHaveText(FOUR_MINUTE_SUBTITLE);
    await expect(page.locator('#tab-review')).toHaveAttribute('aria-current', 'page');
    await expect(page.getByText('No clips in this group.')).toBeVisible();
    await page.getByRole('group', { name: 'Project steps' }).getByRole('link', { name: 'Export' }).click();
    await expect(page).toHaveURL(`/projects/${ended.id}/export`);
    await page.reload();

    await expect(page).toHaveURL(`/projects/${ended.id}/export`);
    await expect(page.locator('#tab-export')).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('.empty h2')).toHaveText('No Kept Clips');
    await expect(page.locator('.empty').getByRole('link', { name: 'Go to Review' })).toBeVisible();
  });

  test('Back and Forward move between the tabs of a ready project', async ({ page, request, fixtureServer }) => {
    const project = await createLinkProject(request, `${fixtureServer.address}/missing.mp4`);
    await presentAsReady(page, project.id);
    await page.goto(`/projects/${project.id}/review`);

    await page.locator('#tab-export').click();
    await expect(page).toHaveURL(`/projects/${project.id}/export`);
    await page.locator('#tab-results').click();
    await expect(page).toHaveURL(`/projects/${project.id}/results`);
    await expect(page.locator('.empty h2')).toHaveText('No Results Yet');
    await page.goBack();
    await expect(page).toHaveURL(`/projects/${project.id}/export`);
    await expect(page.locator('.empty h2')).toHaveText('No Kept Clips');
    await page.goBack();
    await expect(page).toHaveURL(`/projects/${project.id}/review`);
    await page.goForward();
    await expect(page).toHaveURL(`/projects/${project.id}/export`);
    await page.locator('.empty').getByRole('link', { name: 'Go to Review' }).click();

    await expect(page).toHaveURL(`/projects/${project.id}/review`);
    await expect(page.locator('#tab-review')).toHaveAttribute('aria-current', 'page');
  });

  test('the tab address of a project that is not ready shows its status screen', async ({
    page,
    request,
    fixtureServer,
  }) => {
    const project = await createLinkProject(request, `${fixtureServer.address}/missing.mp4`);
    await waitForStatus(request, project.id, 'failed');

    await page.goto(`/projects/${project.id}/export`);

    await expect(statusCard(page).locator('h2')).toHaveText('Could Not Finish');
    await expect(page.locator('.segmented')).toHaveCount(0);
  });
});

test.describe('at 1360 px', () => {
  test.use({ viewport: DESKTOP });

  test('the tabs sit in the toolbar with the current one pressed', async ({ page, request, fixtureServer }) => {
    const project = await createLinkProject(request, `${fixtureServer.address}/missing.mp4`);
    await presentAsReady(page, project.id);

    await page.goto(`/projects/${project.id}/results`);

    const tabs = page.locator('.toolbar .toolbar__centre .segmented');
    await expect(tabs.getByRole('link')).toHaveText(['Review', 'Export0', 'Results']);
    await expect(tabs.locator('#tab-results')).toHaveAttribute('href', `/projects/${project.id}/results`);
    await expect(tabs.locator('[aria-current="page"]')).toHaveText('Results');
    await expect(page.locator('.toolbar').getByRole('button', { name: 'More' })).toBeVisible();
  });
});
