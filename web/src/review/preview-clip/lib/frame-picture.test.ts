import { describe, expect, it } from 'vitest';

import { listDrawnParts, measureWholePictureWidth, type PicturePart } from './frame-picture';

const WIDE = 16 / 9;
const UPRIGHT = 9 / 16;
const TALLER_THAN_THE_FRAME = 9 / 19.5;
const WHOLE_PICTURE = { left: 0, top: 0, width: 1, height: 1 };

function round(parts: PicturePart[]): number[][] {
  return parts.map((part) => [part.left, part.top, part.width, part.height].map((share) => Number(share.toFixed(4))));
}

function measureAspect(part: PicturePart, sourceAspect: number): number {
  return (sourceAspect * part.width) / part.height;
}

describe('the speaker framing', () => {
  it('draws nothing from the video, which fills the frame itself', () => {
    expect(listDrawnParts('follow-speaker', WIDE)).toEqual({ behind: [], inFront: [] });
    expect(listDrawnParts('follow-speaker', UPRIGHT)).toEqual({ behind: [], inFront: [] });
  });
});

describe('the stacked framing', () => {
  it('draws the left half of a wide picture and then its right half, each cut to half the frame', () => {
    const drawn = listDrawnParts('stack-two', WIDE);

    expect(round(drawn.inFront)).toEqual([
      [0, 0.1049, 0.5, 0.7901],
      [0.5, 0.1049, 0.5, 0.7901],
    ]);
    expect(drawn.inFront.map((part) => measureAspect(part, WIDE).toFixed(4))).toEqual(['1.1250', '1.1250']);
    expect(drawn.behind).toEqual([]);
  });

  it('draws the middle band of each half of an upright picture', () => {
    expect(round(listDrawnParts('stack-two', UPRIGHT).inFront)).toEqual([
      [0, 0.375, 0.5, 0.25],
      [0.5, 0.375, 0.5, 0.25],
    ]);
  });
});

describe('the full frame', () => {
  it('draws the middle of a wide picture behind the whole of it, as upright as the frame', () => {
    const drawn = listDrawnParts('whole-frame', WIDE);

    expect(round(drawn.behind)).toEqual([[0.3418, 0, 0.3164, 1]]);
    expect(measureAspect(drawn.behind[0], WIDE)).toBeCloseTo(9 / 16);
    expect(drawn.inFront).toEqual([]);
    expect(measureWholePictureWidth(WIDE)).toBe(1);
  });

  it('draws the whole of an upright picture behind itself, as wide as the frame', () => {
    expect(listDrawnParts('whole-frame', UPRIGHT).behind).toEqual([WHOLE_PICTURE]);
    expect(measureWholePictureWidth(UPRIGHT)).toBe(1);
  });

  it('draws the middle of a picture taller than the frame behind it, and shows it narrower than the frame', () => {
    expect(round(listDrawnParts('whole-frame', TALLER_THAN_THE_FRAME).behind)).toEqual([[0, 0.0897, 1, 0.8205]]);
    expect(measureWholePictureWidth(TALLER_THAN_THE_FRAME)).toBeCloseTo(0.8205, 4);
  });
});
