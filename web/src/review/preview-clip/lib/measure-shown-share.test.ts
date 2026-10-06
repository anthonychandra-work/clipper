import { describe, expect, it } from 'vitest';

import { measureShownShare } from './measure-shown-share';

const BETWEEN_THE_BARS = { top: 60, bottom: 844 };

describe('the share of the preview that shows between the top bar and the bottom of the window', () => {
  it('is all of it when the preview lies inside', () => {
    expect(measureShownShare({ top: 76, bottom: 609 }, BETWEEN_THE_BARS)).toBe(1);
  });

  it('is the part below the top bar when the screen is scrolled down', () => {
    expect(measureShownShare({ top: -240, bottom: 160 }, BETWEEN_THE_BARS)).toBe(0.25);
    expect(measureShownShare({ top: -241, bottom: 159 }, BETWEEN_THE_BARS)).toBeLessThan(0.25);
  });

  it('is the part above the bottom of the window when the preview starts low', () => {
    expect(measureShownShare({ top: 644, bottom: 1044 }, BETWEEN_THE_BARS)).toBe(0.5);
  });

  it('is nothing when the preview is scrolled away, above or below', () => {
    expect(measureShownShare({ top: -800, bottom: -267 }, BETWEEN_THE_BARS)).toBe(0);
    expect(measureShownShare({ top: 900, bottom: 1433 }, BETWEEN_THE_BARS)).toBe(0);
  });

  it('counts a preview that has no height yet as shown', () => {
    expect(measureShownShare({ top: 76, bottom: 76 }, BETWEEN_THE_BARS)).toBe(1);
  });
});
