import { CandidateList, type ClipFilter } from '../../list-candidates';
import type { Review, ReviewClip } from '../../review.types';
import { clipAddress } from '../lib/review-addresses';

interface ReviewSplitProps {
  projectId: string;
  review: Review;
  shownClip: ReviewClip | null;
  filter: ClipFilter;
  onFilter: (filter: ClipFilter) => void;
}

export function ReviewSplit({ projectId, review, shownClip, filter, onFilter }: ReviewSplitProps) {
  return (
    <div className="split">
      <div className="pane pane--list" data-keep-scroll="clips">
        <CandidateList
          clips={review.clips}
          filter={filter}
          shownClipId={shownClip?.id ?? null}
          hrefOfClip={(clipId) => clipAddress(projectId, clipId)}
          onFilter={onFilter}
        />
      </div>
      {shownClip === null ? null : (
        <div className="pane pane--detail" id="clip-detail" data-keep-scroll={`clip-${shownClip.id}`}>
          <div className="detail" />
        </div>
      )}
    </div>
  );
}
