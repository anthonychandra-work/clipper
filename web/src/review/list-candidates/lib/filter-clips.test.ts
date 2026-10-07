import { describe, expect, it } from 'vitest';

import { describeTalkClip } from '../../review.fixtures';
import type { Decision, ReviewClip } from '../../review.types';
import { countFilters, filterClips } from './filter-clips';

function decide(decisions: Decision[]): ReviewClip[] {
  return decisions.map((decision, place) => describeTalkClip({ id: `c0${place + 1}`, rank: place + 1, decision }));
}

function listIds(clips: ReviewClip[]): string[] {
  return clips.map((clip) => clip.id);
}

const UNTOUCHED = decide(['undecided', 'undecided', 'undecided', 'undecided', 'undecided', 'undecided']);
const REVIEWED = decide(['keep', 'reject', 'undecided', 'keep', 'undecided', 'reject']);

describe('countFilters', () => {
  it('names the four filters All, To Do, Kept and Rejected, in that order', () => {
    const filters = countFilters(UNTOUCHED);

    expect(filters.map((filter) => filter.label)).toEqual(['All', 'To Do', 'Kept', 'Rejected']);
    expect(filters.map((filter) => filter.value)).toEqual(['all', 'undecided', 'keep', 'reject']);
  });

  it('counts six clips without a decision as 6, 6, 0 and 0', () => {
    expect(countFilters(UNTOUCHED).map((filter) => filter.count)).toEqual([6, 6, 0, 0]);
  });

  it('counts one kept and one rejected clip of six as 6, 4, 1 and 1', () => {
    const clips = decide(['keep', 'reject', 'undecided', 'undecided', 'undecided', 'undecided']);

    expect(countFilters(clips).map((filter) => filter.count)).toEqual([6, 4, 1, 1]);
  });

  it('counts every clip under All, whatever its decision', () => {
    expect(countFilters(REVIEWED).map((filter) => filter.count)).toEqual([6, 2, 2, 2]);
    expect(countFilters([]).map((filter) => filter.count)).toEqual([0, 0, 0, 0]);
  });
});

describe('filterClips', () => {
  it('shows every clip under All, in the order of the ranks', () => {
    expect(listIds(filterClips(REVIEWED, 'all'))).toEqual(['c01', 'c02', 'c03', 'c04', 'c05', 'c06']);
  });

  it('shows the clips without a decision under To Do', () => {
    expect(listIds(filterClips(REVIEWED, 'undecided'))).toEqual(['c03', 'c05']);
  });

  it('shows the kept clips under Kept', () => {
    expect(listIds(filterClips(REVIEWED, 'keep'))).toEqual(['c01', 'c04']);
  });

  it('shows the rejected clips under Rejected', () => {
    expect(listIds(filterClips(REVIEWED, 'reject'))).toEqual(['c02', 'c06']);
  });

  it('shows no clip in a group that holds none', () => {
    expect(filterClips(UNTOUCHED, 'keep')).toEqual([]);
  });
});
