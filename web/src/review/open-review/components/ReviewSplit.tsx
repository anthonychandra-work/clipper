'use client';

import type { Project } from '@/library';
import { useShell } from '@/shell';

import { SourceTimeline } from '../../chart-source';
import { CandidateList, type ClipFilter } from '../../list-candidates';
import type { Review, ReviewClip } from '../../review.types';
import { clipAddress } from '../lib/review-addresses';

interface ReviewSplitProps {
  project: Project;
  review: Review;
  shownClip: ReviewClip | null;
  filter: ClipFilter;
  onFilter: (filter: ClipFilter) => void;
}

export function ReviewSplit({ project, review, shownClip, filter, onFilter }: ReviewSplitProps) {
  const { layout } = useShell();
  const shownClipId = shownClip?.id ?? null;
  const hrefOfClip = (clipId: string) => clipAddress(project.id, clipId);
  const timeline = (
    <SourceTimeline
      key="timeline"
      windows={review.windows}
      clips={review.clips}
      videoSeconds={measureVideo(project, review)}
      shownClipId={shownClipId}
      hrefOfClip={hrefOfClip}
    />
  );
  const candidates = (
    <CandidateList
      key="candidates"
      clips={review.clips}
      filter={filter}
      shownClipId={shownClipId}
      hrefOfClip={hrefOfClip}
      onFilter={onFilter}
    />
  );
  return (
    <div className="split">
      <div className="pane pane--list" data-keep-scroll="clips">
        {layout === 'compact' ? [candidates, timeline] : [timeline, candidates]}
      </div>
      {shownClip === null ? null : (
        <div className="pane pane--detail" id="clip-detail" data-keep-scroll={`clip-${shownClip.id}`}>
          <div className="detail" />
        </div>
      )}
    </div>
  );
}

function measureVideo(project: Project, review: Review): number {
  const lastWindowEnd = Math.max(0, ...review.windows.map((scored) => scored.endSeconds));
  return project.durationSeconds ?? lastWindowEnd;
}
