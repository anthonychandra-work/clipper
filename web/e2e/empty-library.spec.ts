import { deleteAllProjects, expect, newProjectSheet, test } from './support';

const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1360, height: 900 };

test.beforeEach(async ({ request }) => {
  await deleteAllProjects(request);
});

test.describe('at 390 px', () => {
  test.use({ viewport: PHONE });

  test('with no projects the Library shows the empty state, and its control opens the sheet', async ({ page }) => {
    await page.goto('/');
    const empty = page.locator('.empty');
    await expect(empty.locator('h2.empty__title')).toHaveText('No Projects Yet');
    await expect(empty.locator('p')).toHaveText('Paste a video link or upload a file, and Clipper finds its best clips.');
    await expect(page.locator('.project-rows')).toHaveCount(0);

    await empty.getByRole('link', { name: 'New Project' }).click();

    await expect(page).toHaveURL('/new');
    await expect(newProjectSheet(page).locator('#sheet-title')).toHaveText('New Project');
    await expect(newProjectSheet(page).getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(newProjectSheet(page).getByRole('button', { name: 'Find Clips' })).toBeVisible();
    await expect(page.locator('h2.empty__title')).toHaveText('No Projects Yet');
  });

  test('Cancel closes the sheet, returns to the Library and gives focus back to the control', async ({ page }) => {
    await page.goto('/');
    await page.locator('#first-project').click();
    await expect(newProjectSheet(page)).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page).toHaveURL('/');
    await expect(newProjectSheet(page)).toHaveCount(0);
    await expect(page.locator('#first-project')).toBeFocused();
  });

  test('Escape and a click outside the sheet both return to the Library', async ({ page }) => {
    await page.goto('/');
    await page.locator('.toolbar').getByRole('link', { name: 'New Project' }).click();
    await expect(newProjectSheet(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page).toHaveURL('/');
    await expect(newProjectSheet(page)).toHaveCount(0);

    await page.locator('#first-project').click();
    await expect(newProjectSheet(page)).toBeVisible();
    await page.mouse.click(195, 8);

    await expect(page).toHaveURL('/');
    await expect(newProjectSheet(page)).toHaveCount(0);
  });

  test('the sheet opened at its own address returns to the Library', async ({ page }) => {
    await page.goto('/new');
    await expect(newProjectSheet(page)).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page).toHaveURL('/');
    await expect(newProjectSheet(page)).toHaveCount(0);
  });
});

test.describe('at 1360 px', () => {
  test.use({ viewport: DESKTOP });

  test('the empty state fills the main area, and the sidebar control opens the sheet', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.screen .empty h2')).toHaveText('No Projects Yet');

    await page.locator('#sidebar').getByRole('link', { name: 'New Project' }).click();

    await expect(page).toHaveURL('/new');
    await expect(newProjectSheet(page)).toBeVisible();
  });

  test('closing the sheet returns to the screen the user was on', async ({ page }) => {
    await page.goto('/settings');
    await page.locator('#sidebar').getByRole('link', { name: 'New Project' }).click();
    await expect(newProjectSheet(page)).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page).toHaveURL('/settings');
    await expect(page.locator('#new-project')).toBeFocused();
  });
});
