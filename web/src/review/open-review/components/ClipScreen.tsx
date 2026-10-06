import { ScreenFrame } from '@/shell';

import type { ReviewClip } from '../../review.types';
import { reviewAddress } from '../lib/review-addresses';

interface ClipScreenProps {
  projectId: string;
  clip: ReviewClip;
  clipCount: number;
}

export function ClipScreen({ projectId, clip, clipCount }: ClipScreenProps) {
  return (
    <ScreenFrame
      screenKey="clip"
      depth={2}
      section="library"
      title={`Clip ${clip.rank} of ${clipCount}`}
      back={{ label: 'Clips', href: reviewAddress(projectId) }}
    >
      <div className="split is-detail-open">
        <div className="pane pane--detail" id="clip-detail" data-keep-scroll={`clip-${clip.id}`}>
          <div className="detail" />
        </div>
      </div>
    </ScreenFrame>
  );
}
