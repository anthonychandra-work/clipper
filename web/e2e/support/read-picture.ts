import type { Locator, Page } from '@playwright/test';

export const TALK_COLOUR_BARS = ['gray', 'yellow', 'cyan', 'green', 'magenta', 'red', 'blue'];

export interface PicturePoint {
  across: number;
  down: number;
}

export function listPointsAcross(count: number, down: number): PicturePoint[] {
  return Array.from({ length: count }, (_, place) => ({ across: (place + 0.5) / count, down }));
}

export function nameColoursOfPicture(picture: Locator, points: PicturePoint[]): Promise<string[]> {
  return picture.evaluate(nameColours, points);
}

export async function nameColoursOfCapture(page: Page, capture: Buffer, points: PicturePoint[]): Promise<string[]> {
  const address = `data:image/png;base64,${capture.toString('base64')}`;
  const picture = await page.evaluateHandle(async (source) => {
    const image = new Image();
    image.src = source;
    await image.decode();
    return image;
  }, address);
  return picture.evaluate(nameColours, points);
}

/* Runs inside the page, so it can use nothing declared outside itself. */
function nameColours(picture: Element, points: PicturePoint[]): string[] {
  const HIGH = 110;
  const NAMES = ['black', 'blue', 'green', 'cyan', 'red', 'magenta', 'yellow', 'gray'];
  const measure = (): [number, number] => {
    if (picture instanceof HTMLImageElement) return [picture.naturalWidth, picture.naturalHeight];
    if (picture instanceof HTMLVideoElement) return [picture.videoWidth, picture.videoHeight];
    if (picture instanceof HTMLCanvasElement) return [picture.width, picture.height];
    throw new Error('Only an image, a video or a canvas has colours to read.');
  };
  const [width, height] = measure();
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const pen = canvas.getContext('2d');
  if (pen === null) throw new Error('This browser has no canvas to read the picture with.');
  pen.drawImage(picture as CanvasImageSource, 0, 0, width, height);
  return points.map((point) => {
    const [red, green, blue] = pen.getImageData(Math.floor(point.across * width), Math.floor(point.down * height), 1, 1).data;
    const bits = [red, green, blue].map((level) => (level > HIGH ? 1 : 0));
    return NAMES[bits[0] * 4 + bits[1] * 2 + bits[2]];
  });
}
