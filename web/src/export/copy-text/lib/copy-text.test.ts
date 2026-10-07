import { describe, expect, it, vi } from 'vitest';

import { COPIED, COPYING_BLOCKED, type CopyingPage, copyText } from './copy-text';

const TEXT = 'What a bad morning taught a baker. #bakery';

function standInForThePage(changes: Partial<CopyingPage> = {}) {
  const steps: string[] = [];
  const page: CopyingPage = {
    writeToClipboard: vi.fn(async (text: string) => {
      steps.push(`write ${text}`);
    }),
    rememberSelection: () => {
      steps.push('remember the selection');
      return () => steps.push('put the selection back');
    },
    selectInField: (text: string) => {
      steps.push(`select ${text}`);
      return () => steps.push('remove the field');
    },
    copySelection: () => {
      steps.push('copy the selection');
      return true;
    },
    ...changes,
  };
  return { page, steps };
}

describe('copying a text', () => {
  it('hands the text to the clipboard interface when the page has one, and says Copied', async () => {
    const { page, steps } = standInForThePage();

    const message = await copyText(TEXT, page);

    expect(message).toBe('Copied');
    expect(steps).toEqual([`write ${TEXT}`]);
  });

  it('uses the older copy command on the selected text when the page has no clipboard interface', async () => {
    const { page, steps } = standInForThePage({ writeToClipboard: null });

    const message = await copyText(TEXT, page);

    expect(message).toBe(COPIED);
    expect(steps).toEqual([
      'remember the selection',
      `select ${TEXT}`,
      'copy the selection',
      'remove the field',
      'put the selection back',
    ]);
  });

  it('falls back on the older copy command when the clipboard interface refuses', async () => {
    const refuse = vi.fn(async () => {
      throw new Error('NotAllowedError');
    });
    const { page, steps } = standInForThePage({ writeToClipboard: refuse });

    const message = await copyText(TEXT, page);

    expect(message).toBe(COPIED);
    expect(refuse).toHaveBeenCalledExactlyOnceWith(TEXT);
    expect(steps).toContain('copy the selection');
  });

  it('says that copying is blocked when both ways fail, and still puts the selection back', async () => {
    const { page, steps } = standInForThePage({ writeToClipboard: null, copySelection: () => false });

    const message = await copyText(TEXT, page);

    expect(message).toBe('Copying is blocked here. Select the text and copy it.');
    expect(message).toBe(COPYING_BLOCKED);
    expect(steps.slice(-2)).toEqual(['remove the field', 'put the selection back']);
  });

  it('says that copying is blocked when the older copy command throws', async () => {
    const throwing = () => {
      throw new Error('The command is not supported.');
    };
    const { page, steps } = standInForThePage({ writeToClipboard: null, copySelection: throwing });

    const message = await copyText(TEXT, page);

    expect(message).toBe(COPYING_BLOCKED);
    expect(steps.slice(-2)).toEqual(['remove the field', 'put the selection back']);
  });
});
