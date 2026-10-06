import { describe, expect, it } from 'vitest';

import type { ClipSeconds } from '../../review.types';
import { describeLength, measureBandScale, rateLength } from './rate-length';

const STANDARD: ClipSeconds = { min: 25, max: 60, preferred: { min: 25, max: 50 } };
const SHORT: ClipSeconds = { min: 15, max: 30, preferred: null };
const LONG: ClipSeconds = { min: 60, max: 180, preferred: null };

describe('rateLength', () => {
  it.each([
    [4.7, 'short'],
    [24.99, 'short'],
    [25, 'ideal'],
    [32.76, 'ideal'],
    [50, 'ideal'],
    [50.01, 'allowed'],
    [52.6, 'allowed'],
    [60, 'allowed'],
    [60.01, 'long'],
    [65.3, 'long'],
  ] as const)('rates a clip of %d seconds against the 25–60 s preset as %s', (seconds, rating) => {
    expect(rateLength(seconds, STANDARD)).toBe(rating);
  });

  it.each([
    [14.99, 'short'],
    [15, 'allowed'],
    [22, 'allowed'],
    [30, 'allowed'],
    [30.01, 'long'],
  ] as const)('has three readings for a preset without a preferred band: %d seconds is %s', (seconds, rating) => {
    expect(rateLength(seconds, SHORT)).toBe(rating);
  });
});

describe('describeLength', () => {
  it.each([
    [32.76, 'inside the preferred 25–50 s band'],
    [52.6, 'inside the 25–60 s limits'],
    [4.7, 'shorter than the 25 s minimum'],
    [65.3, 'longer than the 60 s maximum'],
  ])('says of %d seconds under the 25–60 s preset that it is “%s”', (seconds, words) => {
    expect(describeLength(seconds, STANDARD)).toBe(words);
  });

  it('words the limits with the numbers of the project’s own preset', () => {
    expect(describeLength(20, SHORT)).toBe('inside the 15–30 s limits');
    expect(describeLength(10, SHORT)).toBe('shorter than the 15 s minimum');
    expect(describeLength(200, LONG)).toBe('longer than the 180 s maximum');
    expect(describeLength(90, LONG)).toBe('inside the 60–180 s limits');
  });
});

describe('measureBandScale', () => {
  it('ends the drawn band at one and a quarter times the maximum', () => {
    expect(measureBandScale(STANDARD)).toBe(75);
    expect(measureBandScale(SHORT)).toBe(37.5);
    expect(measureBandScale(LONG)).toBe(225);
  });
});
