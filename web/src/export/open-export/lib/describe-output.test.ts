import { describe, expect, it } from 'vitest';

import { describeFirstClip, STARTING_LOOK } from '../../export.fixtures';
import { describeFile, describeLook, FORMAT_LINE } from './describe-output';

describe('the sentence of the look', () => {
  it('words the starting look as the prototype does', () => {
    expect(describeLook(STARTING_LOOK)).toBe('Keyword captions, speaker framing, hook title on');
  });

  it('names each caption style, each framing and the switch', () => {
    const eachWord = describeLook({ captionStyle: 'word-by-word', framing: 'whole-frame', showHookTitle: false });
    const plain = describeLook({ captionStyle: 'plain', framing: 'stack-two', showHookTitle: true });

    expect(eachWord).toBe('Each Word captions, full frame framing, hook title off');
    expect(plain).toBe('Plain captions, stacked framing, hook title on');
  });
});

describe('the format line', () => {
  it('gives the size, the frame rate and the file format of every export', () => {
    expect(FORMAT_LINE).toBe('1080 × 1920, 30 fps, H.264 MP4');
  });
});

describe('the file line of a clip', () => {
  it('gives the file inside the project and the length to a tenth of a second', () => {
    expect(describeFile(describeFirstClip())).toBe('exports/01-c01.mp4 · 32.8 s');
  });

  it.each([
    [33.18, '33.2 s'],
    [41.3, '41.3 s'],
    [30, '30.0 s'],
    [124.96, '125.0 s'],
  ])('writes %f seconds as %s', (seconds, written) => {
    const clip = describeFirstClip({ file: 'exports/12-c07.mp4', seconds });

    expect(describeFile(clip)).toBe(`exports/12-c07.mp4 · ${written}`);
  });
});
