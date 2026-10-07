import { describe, expect, it } from 'vitest';

import type { Caption } from '../../review.types';
import { findCaption } from './find-caption';

function caption(startSeconds: number, ...texts: string[]): Caption {
  return { startSeconds, words: texts.map((text) => ({ text, isHighlighted: false })) };
}

const OPENING = caption(0.4, 'The', 'oven', 'broke');
const MIDDLE = caption(1.9, 'before', 'sunrise');
const CLOSING = caption(4.2, 'and', 'nobody', 'noticed');
const CAPTIONS = [OPENING, MIDDLE, CLOSING];

describe('the caption for a place of the playhead', () => {
  it('is none before the first caption starts', () => {
    expect(findCaption(CAPTIONS, 0)).toBeNull();
    expect(findCaption(CAPTIONS, 0.39)).toBeNull();
  });

  it('is the caption whose words are being spoken, from the start of its first word', () => {
    expect(findCaption(CAPTIONS, 0.4)).toBe(OPENING);
    expect(findCaption(CAPTIONS, 1.2)).toBe(OPENING);
    expect(findCaption(CAPTIONS, 1.9)).toBe(MIDDLE);
  });

  it('stays in a pause after its last word, until the next caption starts', () => {
    expect(findCaption(CAPTIONS, 3.6)).toBe(MIDDLE);
    expect(findCaption(CAPTIONS, 4.19)).toBe(MIDDLE);
    expect(findCaption(CAPTIONS, 4.2)).toBe(CLOSING);
  });

  it('is the last caption at the end of the clip', () => {
    expect(findCaption(CAPTIONS, 30)).toBe(CLOSING);
  });

  it('is the first caption from the in point when a nudge put the in point inside its first word', () => {
    expect(findCaption([caption(-0.4, 'The', 'oven'), MIDDLE], 0)).toEqual(caption(-0.4, 'The', 'oven'));
  });

  it('is none for a clip without captions', () => {
    expect(findCaption([], 2)).toBeNull();
  });
});
