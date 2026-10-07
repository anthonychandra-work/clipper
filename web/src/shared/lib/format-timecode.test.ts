import { describe, expect, it } from 'vitest';

import { formatClock, formatDuration, formatPreciseTimecode, formatTimecode } from './format-timecode';

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

describe('formatPreciseTimecode', () => {
  it.each([
    [0, '00:00:00.0'],
    [11.94, '00:00:11.9'],
    [11.99, '00:00:11.9'],
    [5.3, '00:00:05.3'],
    [44.7, '00:00:44.7'],
    [120.16, '00:02:00.1'],
    [3725.05, '01:02:05.0'],
  ])('writes %d seconds with its tenths cut off', (seconds, shown) => {
    expect(formatPreciseTimecode(seconds)).toBe(shown);
  });

  it('counts a time one hundredth short of a second by its hundredths, not by its binary fraction', () => {
    expect(formatPreciseTimecode(0.3)).toBe('00:00:00.3');
    expect(formatPreciseTimecode(8.7)).toBe('00:00:08.7');
  });
});

describe('formatClock', () => {
  it.each([
    [0, '0:00'],
    [7, '0:07'],
    [7.9, '0:07'],
    [32.76, '0:32'],
    [65.3, '1:05'],
    [600, '10:00'],
  ])('writes %d seconds as a clock of minutes and seconds', (seconds, shown) => {
    expect(formatClock(seconds)).toBe(shown);
  });
});

describe('formatDuration', () => {
  it.each([
    [32.76, '32.8 s'],
    [4.7, '4.7 s'],
    [52.6, '52.6 s'],
    [65.3, '65.3 s'],
    [41, '41.0 s'],
  ])('writes a length of %d seconds to a tenth of a second', (seconds, shown) => {
    expect(formatDuration(seconds)).toBe(shown);
  });
});
