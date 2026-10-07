import { describe, expect, it } from 'vitest';

import { describeTalkClip, describeTalkReach } from '../../review.fixtures';
import type { ClipPoints } from '../../review.types';
import { clipRange, findSentence } from './clip-range';
import { moveEdge, nudgeEdge } from './move-edge';

const REACH = describeTalkReach();
const AS_CUT = describeTalkClip();

describe('clipRange', () => {
  it('starts where the first word of the in sentence starts and ends where the last word of the out sentence ends', () => {
    expect(clipRange(AS_CUT, REACH)).toEqual({ start: 11.94, end: 44.7, duration: 32.76 });
  });

  it('gives the times of the talk’s first clip after one sentence step of its in point', () => {
    const moved = moveEdge(AS_CUT, 'start', -1);

    expect(clipRange(moved, REACH)).toEqual({ start: 5.72, end: 44.7, duration: 38.98 });
  });

  it('gives the times of the talk’s first clip after five nudges of its out point', () => {
    const nudged = [1, 2, 3, 4, 5].reduce<ClipPoints>((points) => nudgeEdge(points, 'end', 1), AS_CUT);

    expect(nudged.endNudge).toBe(5);
    expect(clipRange(nudged, REACH)).toEqual({ start: 11.94, end: 45.7, duration: 33.76 });
  });

  it('moves a point by two tenths of a second for each nudge step, in hundredths', () => {
    const nudged = { ...AS_CUT, startNudge: -3, endNudge: 1 };

    expect(clipRange(nudged, REACH)).toEqual({ start: 11.34, end: 44.9, duration: 33.56 });
  });

  it('works out the length as the difference of the two times', () => {
    const range = clipRange({ ...AS_CUT, startSentence: 10, endSentence: 10 }, REACH);

    expect(range).toEqual({ start: 34.12, end: 35.46, duration: 1.34 });
  });

  it('refuses to time a point on a sentence outside the reach', () => {
    expect(() => clipRange({ ...AS_CUT, endSentence: 16 }, REACH)).toThrow('Sentence 16 is outside the reach');
  });
});

describe('findSentence', () => {
  it('finds a sentence of the reach by its number in the transcript', () => {
    expect(findSentence(REACH, 4)).toMatchObject({ number: 4, startSeconds: 11.94, endSeconds: 16.12 });
    expect(findSentence(REACH, 16)).toBeUndefined();
  });
});
