import { describe, expect, it } from 'vitest';

import { describeTalkReach } from '../../review.fixtures';
import { placeSelection } from './place-selection';

const REACH = describeTalkReach();

describe('placeSelection', () => {
  it('gives the shares of the strip before and after the clip, in hundredths of its stretch', () => {
    const place = placeSelection({ start: 11.94, end: 44.7, duration: 32.76 }, REACH);

    expect(place.before).toBeCloseTo((11.94 / 57.04) * 100, 6);
    expect(place.after).toBeCloseTo(((57.04 - 44.7) / 57.04) * 100, 6);
  });

  it('leaves nothing before a clip that starts with its reach and nothing after one that ends with it', () => {
    expect(placeSelection({ start: 0, end: 57.04, duration: 57.04 }, REACH)).toEqual({ before: 0, after: 0 });
  });

  it('moves with a nudge of either point', () => {
    const asCut = placeSelection({ start: 11.94, end: 44.7, duration: 32.76 }, REACH);
    const nudged = placeSelection({ start: 12.94, end: 43.7, duration: 30.76 }, REACH);

    expect(nudged.before - asCut.before).toBeCloseTo((1 / 57.04) * 100, 6);
    expect(nudged.after - asCut.after).toBeCloseTo((1 / 57.04) * 100, 6);
  });

  it('keeps a point nudged past the end of the stretch at the edge of the strip', () => {
    expect(placeSelection({ start: -0.6, end: 58, duration: 58.6 }, REACH)).toEqual({ before: 0, after: 0 });
  });

  it('measures a reach that starts later in the video from its own first sentence', () => {
    const laterReach = REACH.slice(9);
    const place = placeSelection({ start: 35.94, end: 44.7, duration: 8.76 }, laterReach);

    expect(place.before).toBeCloseTo(((35.94 - 34.12) / (57.04 - 34.12)) * 100, 6);
    expect(place.after).toBeCloseTo(((57.04 - 44.7) / (57.04 - 34.12)) * 100, 6);
  });
});
