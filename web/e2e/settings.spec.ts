import type { APIRequestContext, Page } from '@playwright/test';

import { expect, test } from './support';

const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1360, height: 900 };

const DEFAULTS = {
  scoringModel: 'claude-sonnet-5-5',
  cuttingModel: 'claude-opus-5-5',
  whisperModel: 'large-v3-turbo',
  defaultLength: 'standard',
  clipsPerVideo: 'auto',
  sourceRetention: '7',
};

const CHANGES = [
  { name: 'scoringModel', row: 'Scoring Model', label: 'Claude Haiku 4.5', value: 'claude-haiku-4-5' },
  { name: 'cuttingModel', row: 'Cutting Model', label: 'Claude Fable 5.1', value: 'claude-fable-5-1' },
  { name: 'whisperModel', row: 'Transcription Model', label: 'Whisper small', value: 'small' },
  { name: 'defaultLength', row: 'Clip Length', label: '60–180 s', value: 'long' },
  { name: 'clipsPerVideo', row: 'Clips per Video', label: '12', value: '12' },
  { name: 'sourceRetention', row: 'Delete Source Videos After', label: 'Never', value: 'never' },
];

const TEST_KEY = 'sk-ant-test-4f2a';
const KEY_ADDRESS = '/api/settings/api-key';

function readShownChoices(page: Page): Promise<string[]> {
  return page.locator('.menu-button__chosen').allInnerTexts();
}

async function chooseTheDefaults(request: APIRequestContext): Promise<void> {
  for (const [name, value] of Object.entries(DEFAULTS)) {
    await request.patch('/api/settings', { data: { [name]: value } });
  }
}

function watchKeyRequests(page: Page): string[] {
  const methods: string[] = [];
  page.on('request', (sent) => {
    if (new URL(sent.url()).pathname === KEY_ADDRESS) methods.push(sent.method());
  });
  return methods;
}

test.beforeEach(async ({ request }) => {
  await chooseTheDefaults(request);
});

test.afterEach(async ({ request }) => {
  await chooseTheDefaults(request);
  await request.delete(KEY_ADDRESS);
});

test.describe('at 390 px', () => {
  test.use({ viewport: PHONE });

  test('Settings has the five groups of the prototype with their rows and footers', async ({ page }) => {
    await page.goto('/settings');
    const groups = page.locator('.screen section.group-section');

    await expect(groups.locator('h2.list-header')).toHaveText([
      'AI Services',
      'Defaults for New Projects',
      'Storage',
      'Open on Your Phone',
      'What the Selector Has Learned',
    ]);
    await expect(page.locator('.row .row__label, label.row .row__label')).toHaveText([
      'Anthropic API Key',
      'Scoring Model',
      'Cutting Model',
      'Transcription Model',
      'Clip Length',
      'Clips per Video',
      'Delete Source Videos After',
      'Cut Off Mid-Thought',
      'Not Interesting',
      'Needs Earlier Context',
      'Repeats Another Clip',
    ]);
    await expect(page.getByLabel('Anthropic API Key')).toHaveAttribute('placeholder', 'sk-ant-…');
    await expect(page.getByRole('button', { name: 'Save' })).toBeEnabled();
    await expect(page.locator('.memory-count')).toHaveText(['0', '0', '0', '0']);
    await expect(page.getByRole('button', { name: 'Forget All of It' })).toBeDisabled();
    await expect(groups.nth(2).locator('.list-footer')).toHaveText('Exported clips stay until you delete them.');
    await expect(groups.nth(3).locator('.list-footer')).toHaveText('The phone and this Mac must be on the same Wi-Fi.');
    await expect(groups.nth(4).locator('.list-footer')).toHaveText(
      'Rejections you gave a reason for. They steer the picks on your next video.',
    );
  });

  test('the choices start at the defaults, and each one is kept after a reload', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.locator('#setting-scoringModel')).toBeVisible();
    const startedWith = await readShownChoices(page);

    for (const change of CHANGES) {
      await page.getByLabel(change.row).selectOption({ label: change.label });
      await expect(page.locator(`#setting-${change.name}`)).toHaveValue(change.value);
    }
    await page.reload();
    await expect(page.locator('#setting-scoringModel')).toHaveValue('claude-haiku-4-5');

    expect(startedWith).toEqual([
      'Claude Sonnet 5.5',
      'Claude Opus 5.5',
      'Whisper large-v3-turbo',
      '25–60 s',
      'Auto',
      '7 days',
    ]);
    expect(await readShownChoices(page)).toEqual(CHANGES.map((change) => change.label));
    for (const change of CHANGES) {
      await expect(page.locator(`#setting-${change.name}`)).toHaveValue(change.value);
    }
  });

  test('Save with nothing typed asks for the key and sends nothing', async ({ page }) => {
    const keyRequests = watchKeyRequests(page);
    await page.goto('/settings');

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.locator('#toast')).toHaveText('Paste the key first.');
    await expect(page.getByLabel('Anthropic API Key')).toBeVisible();
    expect(keyRequests).toEqual([]);
  });

  test('a saved key is shown by its last four characters, also after a reload, and Remove brings the field back', async ({
    page,
  }) => {
    const keyRow = page.locator('.row', { hasText: 'Anthropic API Key' });
    const keyRequests = watchKeyRequests(page);
    await page.goto('/settings');
    await expect(page.getByRole('button', { name: 'Save' })).toBeEnabled();

    await page.getByLabel('Anthropic API Key').fill(TEST_KEY);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('#toast')).toHaveText('Key saved on this Mac');
    await expect(keyRow.locator('.row__value')).toHaveText('Saved · ends in 4f2a');
    await expect(page.locator('#setting-apiKey')).toHaveCount(0);
    await page.reload();
    await expect(keyRow.locator('.row__value')).toHaveText('Saved · ends in 4f2a');
    await expect(keyRow.locator('button')).toHaveText(['Remove']);
    expect(await page.content()).not.toContain(TEST_KEY);

    await page.getByRole('button', { name: 'Remove' }).click();

    await expect(page.locator('#toast')).toHaveText('Key removed');
    await expect(page.getByLabel('Anthropic API Key')).toHaveValue('');
    await expect(page.getByRole('button', { name: 'Save' })).toBeEnabled();
    expect(keyRequests).toEqual(['PUT', 'DELETE']);
  });

  test('a key the service refuses is answered in the service’s words, and the field is emptied', async ({ page }) => {
    await page.goto('/settings');

    await page.getByLabel('Anthropic API Key').fill('sk-ant test');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.locator('#toast')).toHaveText('An API key has no spaces or line breaks. Paste it again.');
    await expect(page.getByLabel('Anthropic API Key')).toHaveValue('');
    await expect(page.getByRole('button', { name: 'Save' })).toBeEnabled();
  });

  test('the storage row gives the free and the total space with a bar', async ({ page }) => {
    await page.goto('/settings');
    const storage = page.locator('.storage');

    await expect(storage.locator('p')).toHaveText(/^50 GB free of \d+ GB on this Mac$/);
    await expect(storage.getByRole('progressbar', { name: 'Disk space used' })).toBeVisible();
  });
});

test.describe('at 1360 px', () => {
  test.use({ viewport: DESKTOP, permissions: ['clipboard-read', 'clipboard-write'] });

  test('the phone row gives the address of this Mac with the web port, and Copy copies it', async ({ page, tool }) => {
    await page.goto('/settings');
    const address = page.locator('.address');
    await expect(address).toHaveText(new RegExp(`^http://\\d+\\.\\d+\\.\\d+\\.\\d+:${tool.settings.webPort}$`));

    await page.getByRole('button', { name: 'Copy' }).click();

    await expect(page.locator('#toast')).toHaveText('Copied');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(await address.innerText());
    await expect(page.locator('.toolbar h1.toolbar__title')).toHaveText('Settings');
    await expect(page.locator('#sidebar-settings')).toHaveAttribute('aria-current', 'page');
  });

  test('the tool answers at the phone address', async ({ page, request }) => {
    await page.goto('/settings');
    const phoneAddress = await page.locator('.address').innerText();

    const answer = await request.get(`${phoneAddress}/api/health`);

    expect(answer.status()).toBe(200);
  });
});
