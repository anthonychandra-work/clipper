import type { Framing } from '../../review.types';

const FRAME_ASPECT = 9 / 16;
const HALF_FRAME_ASPECT = 9 / 8;

export interface PicturePart {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface FramedPicture {
  video: PicturePart;
  second: PicturePart | null;
}

const WHOLE_PICTURE: PicturePart = { left: 0, top: 0, width: 1, height: 1 };
const LEFT_HALF: PicturePart = { left: 0, top: 0, width: 0.5, height: 1 };
const RIGHT_HALF: PicturePart = { left: 0.5, top: 0, width: 0.5, height: 1 };

const FRAMERS: Record<Framing, (sourceAspect: number) => FramedPicture> = {
  'follow-speaker': (sourceAspect) => ({
    video: cropMiddle(WHOLE_PICTURE, sourceAspect, FRAME_ASPECT),
    second: null,
  }),
  'stack-two': (sourceAspect) => ({
    video: cropMiddle(LEFT_HALF, sourceAspect, HALF_FRAME_ASPECT),
    second: cropMiddle(RIGHT_HALF, sourceAspect, HALF_FRAME_ASPECT),
  }),
  'whole-frame': (sourceAspect) => ({
    video: WHOLE_PICTURE,
    second: cropMiddle(WHOLE_PICTURE, sourceAspect, FRAME_ASPECT),
  }),
};

export function framePicture(framing: Framing, sourceAspect: number): FramedPicture {
  return FRAMERS[framing](sourceAspect);
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
