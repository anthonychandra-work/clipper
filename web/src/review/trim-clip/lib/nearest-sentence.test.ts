import { describe, expect, it } from 'vitest';

import { describeTalkReach, TALK_SECONDS } from '../../review.fixtures';
import type { ClipPoints } from '../../review.types';
import type { TrimLimits } from '../../time-clips';
import { findNearestSentence } from './nearest-sentence';

const LIMITS: TrimLimits = { reach: describeTalkReach(), videoSeconds: TALK_SECONDS };
const AS_CUT: ClipPoints = { startSentence: 4, startNudge: 0, endSentence: 12, endNudge: 0 };
const STRETCH_SECONDS = 57.04;

function shareOf(seconds: number): number {
  return seconds / STRETCH_SECONDS;
}

describe('findNearestSentence', () => {
  it('puts the in handle on the sentence that starts nearest the place it was dragged to', () => {
    expect(findNearestSentence({ edge: 'start', share: shareOf(5.5), points: AS_CUT }, LIMITS)).toBe(3);
    expect(findNearestSentence({ edge: 'start', share: shareOf(17), points: AS_CUT }, LIMITS)).toBe(5);
    expect(findNearestSentence({ edge: 'start', share: shareOf(12.5), points: AS_CUT }, LIMITS)).toBe(4);
  });

  it('puts the out handle on the sentence that ends nearest the place it was dragged to', () => {
    expect(findNearestSentence({ edge: 'end', share: shareOf(50), points: AS_CUT }, LIMITS)).toBe(13);
    expect(findNearestSentence({ edge: 'end', share: shareOf(42), points: AS_CUT }, LIMITS)).toBe(11);
    expect(findNearestSentence({ edge: 'end', share: shareOf(45), points: AS_CUT }, LIMITS)).toBe(12);
  });

  it('takes the first and the last sentence of the reach at the ends of the strip', () => {
    expect(findNearestSentence({ edge: 'start', share: 0, points: AS_CUT }, LIMITS)).toBe(1);
    expect(findNearestSentence({ edge: 'end', share: 1, points: AS_CUT }, LIMITS)).toBe(15);
  });

  it('keeps the in handle on or before the sentence of the out point', () => {
    const points = { ...AS_CUT, endSentence: 9 };

    expect(findNearestSentence({ edge: 'start', share: shareOf(50), points }, LIMITS)).toBe(9);
    expect(findNearestSentence({ edge: 'start', share: 1, points }, LIMITS)).toBe(9);
  });

  it('keeps the out handle on or after the sentence of the in point', () => {
    const points = { ...AS_CUT, startSentence: 9 };

    expect(findNearestSentence({ edge: 'end', share: shareOf(12), points }, LIMITS)).toBe(9);
    expect(findNearestSentence({ edge: 'end', share: 0, points }, LIMITS)).toBe(9);
  });

  it('passes over a sentence that would leave the clip shorter than one second', () => {
    const nudged = { ...AS_CUT, endSentence: 10, endNudge: -2 };

    expect(findNearestSentence({ edge: 'start', share: shareOf(34.2), points: nudged }, LIMITS)).toBe(9);
  });

  it('leaves the handle where it is when no sentence is allowed', () => {
    const noRoom = { reach: describeTalkReach().slice(9, 10), videoSeconds: 35 };
    const points = { startSentence: 10, startNudge: 0, endSentence: 10, endNudge: 5 };

    expect(findNearestSentence({ edge: 'end', share: 1, points }, noRoom)).toBe(10);
  });
});
