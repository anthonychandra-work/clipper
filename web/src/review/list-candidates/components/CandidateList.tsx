'use client';

import { SegmentedControl } from '@/shared/ui';

import type { ReviewClip } from '../../review.types';
import { type ClipFilter, countFilters, filterClips } from '../lib/filter-clips';
import { CandidateRow } from './CandidateRow';

interface CandidateListProps {
  clips: readonly ReviewClip[];
  filter: ClipFilter;
  shownClipId: string | null;
  hrefOfClip: (clipId: string) => string;
  onFilter: (filter: ClipFilter) => void;
}

export function CandidateList({ clips, filter, shownClipId, hrefOfClip, onFilter }: CandidateListProps) {
  const group = filterClips(clips, filter);
  return (
    <section className="group-section" aria-labelledby="candidates-heading">
      <h2 className="list-header" id="candidates-heading">
        Candidates
      </h2>
      <SegmentedControl name="filter" label="Show" selected={filter} options={countFilters(clips)} onSelect={onFilter} />
      <ol className="group divided">
        {group.map((clip) => (
          <CandidateRow key={clip.id} clip={clip} href={hrefOfClip(clip.id)} isShown={clip.id === shownClipId} />
        ))}
        {group.length === 0 ? <li className="candidate-list__empty">No clips in this group.</li> : null}
      </ol>
      <p className="list-footer">The score orders clips inside this video. It does not forecast views.</p>
    </section>
  );
}
