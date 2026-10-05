import { describe, expect, it } from 'vitest';

import { formatTimecode } from './format-timecode';

describe('formatTimecode', () => {
  it.each([
    [0, '00:00:00'],
    [59.9, '00:00:59'],
    [236, '00:03:56'],
    [235.6, '00:03:55'],
    [3600, '01:00:00'],
    [4360, '01:12:40'],
    [10_800, '03:00:00'],
  ])('gives %d seconds as hours, minutes and seconds', (seconds, shown) => {
    expect(formatTimecode(seconds)).toBe(shown);
  });
});
