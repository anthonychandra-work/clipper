import { describe, expect, it } from 'vitest';

import { readTypedViews } from './read-typed-views';

describe('readTypedViews', () => {
  it.each([
    ['1200', 1200],
    [' 1200 ', 1200],
    ['1200.9', 1200],
    ['1', 1],
    ['9999999999', 9_999_999_999],
  ])('reads %j as %d views', (typed, views) => {
    expect(readTypedViews(typed)).toBe(views);
  });

  it.each(['', '   ', '0', '0.9', '-5', 'abc', '12 00'])('reads %j as no views', (typed) => {
    expect(readTypedViews(typed)).toBeNull();
  });
});
