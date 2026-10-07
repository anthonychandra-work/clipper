import { describe, expect, it } from 'vitest';

import { describeTalkResults, SEEDED_VIEWS } from '../../results.fixtures';
import type { ResultClip } from '../../results.types';
import { rankOutcome } from './rank-outcome';

function clipOfRank(rank: number, views: number | null): ResultClip {
  return { id: `c0${rank}`, rank, title: `The clip of rank ${rank}`, views };
}

describe('rankOutcome', () => {
  it('gives no order while no clip has views', () => {
    expect(rankOutcome(describeTalkResults().clips)).toBeNull();
  });

  it('gives no order from one clip with views', () => {
    expect(rankOutcome(describeTalkResults([null, 5400, null]).clips)).toBeNull();
  });

  it('gives no order for a project with no listed clip', () => {
    expect(rankOutcome([])).toBeNull();
  });

  it('orders the seeded set by its views and says which pick performed best', () => {
    const outcome = rankOutcome(describeTalkResults(SEEDED_VIEWS).clips);

    expect(outcome?.rows.map((row) => row.id)).toEqual(['c03', 'c02', 'c01']);
    expect(outcome?.sentence).toBe(
      'The best performer was the selector’s pick number 3. Ranks in order of views: 3, 2, 1.',
    );
  });

  it('gives each clip of the seeded set its title, its views with separators and its share of the highest views', () => {
    const outcome = rankOutcome(describeTalkResults(SEEDED_VIEWS).clips);

    expect(outcome?.rows).toEqual([
      { id: 'c03', title: 'Almost everyone gets price wrong', views: '48,000', sharePercent: 100 },
      { id: 'c02', title: 'Hire for the habits you cannot teach', views: '5,400', sharePercent: 11.25 },
      { id: 'c01', title: 'The worst day my bakery ever had', views: '1,200', sharePercent: 2.5 },
    ]);
  });

  it('says that the first pick performed best for a set whose most viewed clip has rank 1', () => {
    const outcome = rankOutcome(describeTalkResults([90000, 5400, 48000]).clips);

    expect(outcome?.sentence).toBe('The selector’s first pick performed best. Ranks in order of views: 1, 3, 2.');
  });

  it('puts rank 1 before rank 2 between equal views', () => {
    const outcome = rankOutcome([clipOfRank(2, 700), clipOfRank(3, 9000), clipOfRank(1, 700)]);

    expect(outcome?.rows.map((row) => row.id)).toEqual(['c03', 'c01', 'c02']);
    expect(outcome?.rows.map((row) => row.sharePercent)).toEqual([100, 700 / 90, 700 / 90]);
  });

  it('names clips of the ranks 2, 4 and 5 by those ranks', () => {
    const outcome = rankOutcome([clipOfRank(2, 300), clipOfRank(4, 9100), clipOfRank(5, 1000)]);

    expect(outcome?.sentence).toBe(
      'The best performer was the selector’s pick number 4. Ranks in order of views: 4, 5, 2.',
    );
  });

  it('leaves a clip without views out of the order', () => {
    const outcome = rankOutcome([clipOfRank(1, null), clipOfRank(2, 300), clipOfRank(3, 9100)]);

    expect(outcome?.rows.map((row) => row.id)).toEqual(['c03', 'c02']);
    expect(outcome?.sentence).toBe(
      'The best performer was the selector’s pick number 3. Ranks in order of views: 3, 2.',
    );
  });

  it('writes views of ten digits with their separators', () => {
    const outcome = rankOutcome([clipOfRank(1, 9_999_999_999), clipOfRank(2, 1)]);

    expect(outcome?.rows.map((row) => row.views)).toEqual(['9,999,999,999', '1']);
  });

  it('leaves the clips it was given in their order', () => {
    const clips = describeTalkResults(SEEDED_VIEWS).clips;

    rankOutcome(clips);

    expect(clips.map((clip) => clip.id)).toEqual(['c01', 'c02', 'c03']);
  });
});
