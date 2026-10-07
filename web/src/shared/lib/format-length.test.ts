import { describe, expect, it } from 'vitest';

import { formatLength } from './format-length';

describe('formatLength', () => {
  it.each([
    [0.4, '0 s'],
    [7, '7 s'],
    [45.4, '45 s'],
    [59.4, '59 s'],
  ])('gives a length under a minute in seconds: %d', (seconds, shown) => {
    expect(formatLength(seconds)).toBe(shown);
  });

  it.each([
    [59.6, '1 min'],
    [60, '1 min'],
    [235.6, '4 min'],
    [1930, '32 min'],
    [3569, '59 min'],
  ])('gives a length under an hour in minutes: %d', (seconds, shown) => {
    expect(formatLength(seconds)).toBe(shown);
  });

  it.each([
    [3571, '1 h 0 min'],
    [3600, '1 h 0 min'],
    [4360, '1 h 13 min'],
    [10_800, '3 h 0 min'],
  ])('gives a length of an hour or more in hours and minutes: %d', (seconds, shown) => {
    expect(formatLength(seconds)).toBe(shown);
  });
});
