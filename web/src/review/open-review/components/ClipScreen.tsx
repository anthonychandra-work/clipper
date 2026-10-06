import type { ReactNode } from 'react';

import { ScreenFrame } from '@/shell';

import type { ReviewClip } from '../../review.types';
import { reviewAddress } from '../lib/review-addresses';

interface ClipScreenProps {
  projectId: string;
  clip: ReviewClip;
  clipCount: number;
  bottomBar: ReactNode;
  children: ReactNode;
}

export function ClipScreen({ projectId, clip, clipCount, bottomBar, children }: ClipScreenProps) {
  return (
    <ScreenFrame
      screenKey="clip"
      depth={2}
      section="library"
      title={`Clip ${clip.rank} of ${clipCount}`}
      back={{ label: 'Clips', href: reviewAddress(projectId) }}
      bottomBar={bottomBar}
    >
      <div className="split is-detail-open">{children}</div>
    </ScreenFrame>
  );
}
