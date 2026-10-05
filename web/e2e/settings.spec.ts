import type { Page } from '@playwright/test';

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

async function readChosenLabels(page: Page): Promise<string[]> {
  const selects = page.locator('.menu-button select');
  return selects.evaluateAll((all) => all.map((select) => (select as HTMLSelectElement).selectedOptions[0].label));
}

test.beforeEach(async ({ request }) => {
  for (const [name, value] of Object.entries(DEFAULTS)) {
    await request.patch('/api/settings', { data: { [name]: value } });
  }
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
    await expect(page.getByRole('button', { name: 'Save' })).toBeDisabled();
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
    const startedWith = await readChosenLabels(page);

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
    expect(await readChosenLabels(page)).toEqual(CHANGES.map((change) => change.label));
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
