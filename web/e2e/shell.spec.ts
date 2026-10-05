import { expect, test } from './support';

const PHONE = { width: 390, height: 844 };
const NARROW_DESKTOP = { width: 860, height: 900 };
const DESKTOP = { width: 1360, height: 900 };
const LIGHT_PAGE = 'rgb(242, 242, 247)';
const DARK_PAGE = 'rgb(0, 0, 0)';

test('the page is the loading line before the width of the window is known', async ({ request }) => {
  const served = await (await request.get('/')).text();

  expect(served).toContain('<p class="loading">Loading Clipper…</p>');
  expect(served).not.toContain('class="toolbar"');
});

test.describe('at 1360 px', () => {
  test.use({ viewport: DESKTOP });

  test('the sidebar is docked with the app name, its toggle, New Project and Settings', async ({ page }) => {
    await page.goto('/');

    const sidebar = page.locator('#app[data-layout="regular"] > aside#sidebar');
    await expect(sidebar.locator('.sidebar__app')).toHaveText('Clipper');
    await expect(sidebar.getByRole('button', { name: 'Hide sidebar' })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'New Project' })).toHaveAttribute('href', '/new');
    await expect(sidebar.getByRole('link', { name: 'Settings' })).toHaveAttribute('aria-current', 'false');
    await expect(page.locator('.sidebar-scrim')).toHaveCount(0);
    await expect(page.locator('.tab-bar')).toHaveCount(0);
  });

  test('the toolbar carries the title of the screen', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.toolbar h1.toolbar__title')).toHaveText('Library');

    await page.getByRole('link', { name: 'Settings' }).click();

    await expect(page).toHaveURL('/settings');
    await expect(page.locator('.toolbar h1.toolbar__title')).toHaveText('Settings');
    await expect(page.locator('#sidebar-settings')).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('#app')).toHaveAttribute('data-enter', 'swap');
  });

  test('the toggle hides the sidebar and the toolbar offers to show it again', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Hide sidebar' }).click();
    await expect(page.locator('#sidebar')).toHaveCount(0);
    await page.locator('.toolbar').getByRole('button', { name: 'Show sidebar' }).click();

    await expect(page.locator('#sidebar')).toBeVisible();
  });

  test('the sheet, the menu layer and the toast follow the app as its later siblings', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('#app ~ dialog#sheet.sheet[aria-labelledby="sheet-title"]')).toHaveCount(1);
    await expect(page.locator('#app ~ div#menu.menu-layer')).toBeHidden();
    await expect(page.locator('#app ~ div#toast.toast[role="status"][aria-live="polite"]')).toBeHidden();
  });
});

test.describe('at 860 px', () => {
  test.use({ viewport: NARROW_DESKTOP });

  test('the sidebar lies over the content with its scrim, and Escape closes it', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#app')).toHaveAttribute('data-layout', 'regular');
    await expect(page.locator('#sidebar')).toHaveCount(0);

    await page.getByRole('button', { name: 'Show sidebar' }).click();
    const position = await page.locator('#sidebar').evaluate((sidebar) => getComputedStyle(sidebar).position);
    await expect(page.locator('.sidebar-scrim')).toBeVisible();
    await page.keyboard.press('Escape');

    expect(position).toBe('absolute');
    await expect(page.locator('#sidebar')).toHaveCount(0);
    await expect(page.locator('.sidebar-scrim')).toHaveCount(0);
  });

  test('a click on the scrim closes the sidebar, and so does going to another screen', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Show sidebar' }).click();
    await page.locator('.sidebar-scrim').click({ position: { x: 600, y: 400 } });
    await expect(page.locator('#sidebar')).toHaveCount(0);
    await page.getByRole('button', { name: 'Show sidebar' }).click();
    await page.getByRole('link', { name: 'Settings' }).click();

    await expect(page).toHaveURL('/settings');
    await expect(page.locator('#sidebar')).toHaveCount(0);
  });
});

test.describe('at 390 px', () => {
  test.use({ viewport: PHONE });

  test('the tab bar holds Library and Settings with the current one marked', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('#app')).toHaveAttribute('data-layout', 'compact');
    await expect(page.locator('#sidebar')).toHaveCount(0);
    await expect(page.locator('#tab-bar-library')).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('#tab-bar-settings')).toHaveAttribute('aria-current', 'false');
    await page.getByRole('navigation', { name: 'Sections' }).getByRole('link', { name: 'Settings' }).click();

    await expect(page).toHaveURL('/settings');
    await expect(page.locator('#tab-bar-settings')).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('h1.large-title')).toHaveText('Settings');
  });

  test('the large title moves into the bar when the screen is scrolled', async ({ page }) => {
    await page.goto('/');
    await page.addStyleTag({ content: '.screen { min-height: 200vh; }' });
    const inlineTitle = page.locator('.toolbar__title--inline');
    await expect(page.locator('h1.large-title')).toHaveText('Library');
    await expect(page.locator('#app')).toHaveAttribute('data-large-title', 'visible');
    await expect(inlineTitle).toHaveCSS('opacity', '0');

    await page.mouse.wheel(0, 500);

    await expect(page.locator('#app')).toHaveAttribute('data-large-title', 'scrolled');
    await expect(inlineTitle).toHaveCSS('opacity', '1');
    await expect(inlineTitle).toHaveText('Library');
  });
});

test('light and dark follow the system', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  const lightPage = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

  await page.emulateMedia({ colorScheme: 'dark' });
  const darkPage = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

  expect(lightPage).toBe(LIGHT_PAGE);
  expect(darkPage).toBe(DARK_PAGE);
});
