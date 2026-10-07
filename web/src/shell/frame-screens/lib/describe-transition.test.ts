import { describe, expect, it } from 'vitest';

import { describeTransition } from './describe-transition';

const LIBRARY = { key: 'library', depth: 0 };
const SETTINGS = { key: 'settings', depth: 0 };
const PROJECT = { key: 'project', depth: 1 };

describe('describeTransition', () => {
  it('does not animate the first screen', () => {
    expect(describeTransition(null, LIBRARY)).toBe('none');
  });

  it('does not animate a screen that stays', () => {
    expect(describeTransition(PROJECT, { key: 'project', depth: 1 })).toBe('none');
  });

  it('swaps between screens of the same depth', () => {
    expect(describeTransition(LIBRARY, SETTINGS)).toBe('swap');
  });

  it('pushes a deeper screen', () => {
    expect(describeTransition(LIBRARY, PROJECT)).toBe('push');
  });

  it('pops back to a shallower screen', () => {
    expect(describeTransition(PROJECT, LIBRARY)).toBe('pop');
  });
});
