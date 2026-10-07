import type { Framing } from '../../review.types';

const FRAME_ASPECT = 9 / 16;
const HALF_FRAME_ASPECT = 9 / 8;

export interface PicturePart {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface DrawnParts {
  behind: PicturePart[];
  inFront: PicturePart[];
}

const WHOLE_PICTURE: PicturePart = { left: 0, top: 0, width: 1, height: 1 };
const LEFT_HALF: PicturePart = { left: 0, top: 0, width: 0.5, height: 1 };
const RIGHT_HALF: PicturePart = { left: 0.5, top: 0, width: 0.5, height: 1 };

const PARTS_TO_DRAW: Record<Framing, (sourceAspect: number) => DrawnParts> = {
  'follow-speaker': () => ({ behind: [], inFront: [] }),
  'stack-two': (sourceAspect) => ({
    behind: [],
    inFront: [
      cropMiddle(LEFT_HALF, sourceAspect, HALF_FRAME_ASPECT),
      cropMiddle(RIGHT_HALF, sourceAspect, HALF_FRAME_ASPECT),
    ],
  }),
  'whole-frame': (sourceAspect) => ({
    behind: [cropMiddle(WHOLE_PICTURE, sourceAspect, FRAME_ASPECT)],
    inFront: [],
  }),
};

export function listDrawnParts(framing: Framing, sourceAspect: number): DrawnParts {
  return PARTS_TO_DRAW[framing](sourceAspect);
}

export function measureWholePictureWidth(sourceAspect: number): number {
  return Math.min(1, sourceAspect / FRAME_ASPECT);
}

function cropMiddle(part: PicturePart, sourceAspect: number, boxAspect: number): PicturePart {
  const partAspect = (sourceAspect * part.width) / part.height;
  if (partAspect > boxAspect) {
    const width = (part.width * boxAspect) / partAspect;
    return { ...part, left: part.left + (part.width - width) / 2, width };
  }
  const height = (part.height * partAspect) / boxAspect;
  return { ...part, top: part.top + (part.height - height) / 2, height };
}
