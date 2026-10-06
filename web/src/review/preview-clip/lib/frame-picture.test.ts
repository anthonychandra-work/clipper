import { describe, expect, it } from 'vitest';

import { framePicture, measureWholePictureWidth, type PicturePart } from './frame-picture';

const WIDE = 16 / 9;
const UPRIGHT = 9 / 16;
const TALLER_THAN_THE_FRAME = 9 / 19.5;
const WHOLE_PICTURE = { left: 0, top: 0, width: 1, height: 1 };

function round(part: PicturePart | null): number[] | null {
  if (part === null) return null;
  return [part.left, part.top, part.width, part.height].map((share) => Number(share.toFixed(4)));
}

function measureAspect(part: PicturePart, sourceAspect: number): number {
  return (sourceAspect * part.width) / part.height;
}

describe('the speaker framing', () => {
  it('draws the middle of a wide picture, as upright as the frame', () => {
    const framed = framePicture('follow-speaker', WIDE);

    expect(round(framed.video)).toEqual([0.3418, 0, 0.3164, 1]);
    expect(measureAspect(framed.video, WIDE)).toBeCloseTo(9 / 16);
    expect(framed.second).toBeNull();
  });

  it('draws the whole of an upright picture', () => {
    expect(framePicture('follow-speaker', UPRIGHT)).toEqual({ video: WHOLE_PICTURE, second: null });
  });

  it('draws the middle of a picture taller than the frame at its full width', () => {
    expect(round(framePicture('follow-speaker', TALLER_THAN_THE_FRAME).video)).toEqual([0, 0.0897, 1, 0.8205]);
  });
});

describe('the stacked framing', () => {
  it('draws the left half of a wide picture above its right half, each cut to half the frame', () => {
    const framed = framePicture('stack-two', WIDE);

    expect(round(framed.video)).toEqual([0, 0.1049, 0.5, 0.7901]);
    expect(round(framed.second)).toEqual([0.5, 0.1049, 0.5, 0.7901]);
    expect(measureAspect(framed.video, WIDE)).toBeCloseTo(9 / 8);
  });

  it('draws the middle band of each half of an upright picture', () => {
    const framed = framePicture('stack-two', UPRIGHT);

    expect(round(framed.video)).toEqual([0, 0.375, 0.5, 0.25]);
    expect(round(framed.second)).toEqual([0.5, 0.375, 0.5, 0.25]);
  });
});

describe('the full frame', () => {
  it('draws the whole of a wide picture over the middle of it', () => {
    const framed = framePicture('whole-frame', WIDE);

    expect(framed.video).toEqual(WHOLE_PICTURE);
    expect(round(framed.second)).toEqual([0.3418, 0, 0.3164, 1]);
    expect(measureWholePictureWidth(WIDE)).toBe(1);
  });

  it('draws the whole of an upright picture twice, as wide as the frame', () => {
    expect(framePicture('whole-frame', UPRIGHT)).toEqual({ video: WHOLE_PICTURE, second: WHOLE_PICTURE });
    expect(measureWholePictureWidth(UPRIGHT)).toBe(1);
  });

  it('draws a picture taller than the frame narrower than the frame, so all of it shows', () => {
    expect(measureWholePictureWidth(TALLER_THAN_THE_FRAME)).toBeCloseTo(0.8205, 4);
  });
});
