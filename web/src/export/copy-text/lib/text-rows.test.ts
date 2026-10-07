import { describe, expect, it } from 'vitest';

import { describeFirstClip, describeSecondClip } from '../../export.fixtures';
import { listTextRows } from './text-rows';

describe('the text rows of a clip', () => {
  it('gives a title and a description for each of three platforms, in the order TikTok, Reels, Shorts', () => {
    expect(listTextRows(describeFirstClip())).toEqual([
      { id: 'copy-c01-tiktok-title', label: 'TikTok title', text: 'The oven broke' },
      {
        id: 'copy-c01-tiktok-description',
        label: 'TikTok description',
        text: 'What a bad morning taught a baker. #bakery',
      },
      { id: 'copy-c01-reels-title', label: 'Reels title', text: 'Nobody left angry' },
      {
        id: 'copy-c01-reels-description',
        label: 'Reels caption',
        text: 'Customers forgive bad news. #smallbusiness',
      },
      { id: 'copy-c01-shorts-title', label: 'Shorts title', text: 'The worst day my bakery had' },
      { id: 'copy-c01-shorts-description', label: 'Shorts description', text: 'Tell them the truth.' },
    ]);
  });

  it('gives the two rows of the one platform chosen', () => {
    const forReels = describeSecondClip({
      texts: [{ platform: 'reels', title: 'Hire for habits', description: 'Skills can be taught.' }],
    });

    expect(listTextRows(forReels)).toEqual([
      { id: 'copy-c02-reels-title', label: 'Reels title', text: 'Hire for habits' },
      { id: 'copy-c02-reels-description', label: 'Reels caption', text: 'Skills can be taught.' },
    ]);
  });

  it('gives no row for a clip without texts', () => {
    expect(listTextRows(describeFirstClip({ texts: [] }))).toEqual([]);
  });
});
