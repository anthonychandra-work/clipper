import { describe, expect, it } from 'vitest';

import { describeTalkClip } from '../../review.fixtures';
import { clipAddress, findNextClip, findShownClip, namesNoClip, reviewAddress } from './review-addresses';

const CLIPS = ['c01', 'c02', 'c03', 'c04', 'c05', 'c06'].map((id, place) => describeTalkClip({ id, rank: place + 1 }));

describe('the addresses of the Review tab', () => {
  it('gives the list the address of the Review tab', () => {
    expect(reviewAddress('a1b2c3d4e5f6')).toBe('/projects/a1b2c3d4e5f6/review');
  });

  it('gives every clip an address of its own under the Review tab', () => {
    expect(clipAddress('a1b2c3d4e5f6', 'c03')).toBe('/projects/a1b2c3d4e5f6/review/c03');
  });
});

describe('findShownClip', () => {
  it('shows the first-ranked clip beside the list at the Review address, from 720 px', () => {
    expect(findShownClip({ clips: CLIPS, clipId: undefined, isPhone: false })?.id).toBe('c01');
  });

  it('shows the list alone at the Review address on a phone', () => {
    expect(findShownClip({ clips: CLIPS, clipId: undefined, isPhone: true })).toBeNull();
  });

  it('shows the clip its address names, at either width', () => {
    expect(findShownClip({ clips: CLIPS, clipId: 'c03', isPhone: false })?.id).toBe('c03');
    expect(findShownClip({ clips: CLIPS, clipId: 'c03', isPhone: true })?.id).toBe('c03');
  });

  it('shows no clip screen for an address that names no clip of the project', () => {
    expect(findShownClip({ clips: CLIPS, clipId: 'c99', isPhone: true })).toBeNull();
    expect(findShownClip({ clips: CLIPS, clipId: 'c99', isPhone: false })?.id).toBe('c01');
  });

  it('shows no clip of a project that has none', () => {
    expect(findShownClip({ clips: [], clipId: undefined, isPhone: false })).toBeNull();
  });
});

describe('namesNoClip', () => {
  it('is true of an address whose clip the project does not have, which leads to the list', () => {
    expect(namesNoClip(CLIPS, 'c99')).toBe(true);
  });

  it('is false of the list’s address and of the address of a clip', () => {
    expect(namesNoClip(CLIPS, undefined)).toBe(false);
    expect(namesNoClip(CLIPS, 'c06')).toBe(false);
  });
});

describe('findNextClip', () => {
  it('goes to the next clip of the group', () => {
    expect(findNextClip(CLIPS, 'c01')?.id).toBe('c02');
    expect(findNextClip(CLIPS, 'c05')?.id).toBe('c06');
  });

  it('goes from the last clip of the group to its first', () => {
    expect(findNextClip(CLIPS, 'c06')?.id).toBe('c01');
  });

  it('goes through the clips of a filter’s group alone', () => {
    const kept = [CLIPS[0], CLIPS[3]];

    expect(findNextClip(kept, 'c01')?.id).toBe('c04');
    expect(findNextClip(kept, 'c04')?.id).toBe('c01');
  });

  it('starts at the first clip of the group from a clip that is not in it, or from no clip', () => {
    const kept = [CLIPS[1], CLIPS[3]];

    expect(findNextClip(kept, 'c06')?.id).toBe('c02');
    expect(findNextClip(kept, null)?.id).toBe('c02');
  });

  it('stays on the one clip of a group of one', () => {
    expect(findNextClip([CLIPS[2]], 'c03')?.id).toBe('c03');
  });

  it('has no next clip in an empty group', () => {
    expect(findNextClip([], 'c01')).toBeNull();
  });
});
