import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { readToast, showToast, watchToast } from './toast-store';

const VISIBLE_MS = 3500;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runAllTimers();
  vi.useRealTimers();
});

describe('the toast store', () => {
  it('shows a message and hides it after three and a half seconds', () => {
    showToast('Project deleted');
    const shownAtOnce = readToast();
    vi.advanceTimersByTime(VISIBLE_MS - 1);
    const shownJustBeforeTheEnd = readToast();
    vi.advanceTimersByTime(1);

    expect(shownAtOnce).toBe('Project deleted');
    expect(shownJustBeforeTheEnd).toBe('Project deleted');
    expect(readToast()).toBeNull();
  });

  it('replaces the message and restarts the time when another toast arrives', () => {
    showToast('Copied');
    vi.advanceTimersByTime(3000);
    showToast('Project deleted');
    vi.advanceTimersByTime(3000);

    expect(readToast()).toBe('Project deleted');
  });

  it('tells its watchers when a message appears and when it goes', () => {
    const seen: (string | null)[] = [];
    const stopWatching = watchToast(() => seen.push(readToast()));

    showToast('Copied');
    vi.advanceTimersByTime(VISIBLE_MS);
    stopWatching();
    showToast('Not seen');

    expect(seen).toEqual(['Copied', null]);
  });
});
