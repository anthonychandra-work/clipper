import { describe, expect, it } from 'vitest';

import { describeTalkClip } from '../../review.fixtures';
import { findOpenFlagLabel, isFlagOpen } from './find-open-flag';

const NEEDS_CONTEXT = describeTalkClip({ flag: 'needs-context', flagNote: 'Opens on “also”.' });
const NOT_RECOMMENDED = describeTalkClip({ flag: 'not-recommended', flagNote: 'No story behind it.' });

describe('isFlagOpen', () => {
  it('shows no flag for a clip that has none', () => {
    expect(isFlagOpen(describeTalkClip())).toBe(false);
    expect(findOpenFlagLabel(describeTalkClip())).toBeNull();
  });

  it('shows “needs context” while the in point sits where selection put it', () => {
    expect(isFlagOpen(NEEDS_CONTEXT)).toBe(true);
    expect(findOpenFlagLabel(NEEDS_CONTEXT)).toBe('Needs context');
  });

  it('hides “needs context” while the in point sits on an earlier sentence', () => {
    const earlier = { ...NEEDS_CONTEXT, startSentence: 3 };

    expect(isFlagOpen(earlier)).toBe(false);
    expect(findOpenFlagLabel(earlier)).toBeNull();
  });

  it('shows “needs context” again when the in point returns, or goes later', () => {
    expect(isFlagOpen({ ...NEEDS_CONTEXT, startSentence: 4 })).toBe(true);
    expect(isFlagOpen({ ...NEEDS_CONTEXT, startSentence: 5 })).toBe(true);
  });

  it('does not hide “needs context” for a nudge earlier on the same sentence', () => {
    const nudged = describeTalkClip({ flag: 'needs-context', startNudge: -5 });

    expect(isFlagOpen(nudged)).toBe(true);
  });

  it('shows “not recommended” wherever the in point sits', () => {
    expect(isFlagOpen(NOT_RECOMMENDED)).toBe(true);
    expect(isFlagOpen({ ...NOT_RECOMMENDED, startSentence: 1 })).toBe(true);
    expect(findOpenFlagLabel(NOT_RECOMMENDED)).toBe('Not recommended');
  });
});
