'use client';

import { ClipFlag, TitleField, WhyThisClip } from '../../inspect-clip';
import type { ReviewClip } from '../../review.types';
import { isFlagOpen } from '../../time-clips';
import type { ReviewStore } from '../lib/review-store';

interface ClipDetailProps {
  clip: ReviewClip;
  clipCount: number;
  store: ReviewStore;
}

export function ClipDetail({ clip, clipCount, store }: ClipDetailProps) {
  return (
    <div className="pane pane--detail" id="clip-detail" data-keep-scroll={`clip-${clip.id}`}>
      <div className="detail">
        <section className="inspector" aria-label="Clip details">
          <TitleField
            key={clip.id}
            title={clip.title}
            onShow={(title) => store.showChange(clip.id, { title })}
            onSave={(title) => void store.changeClip(clip.id, { title })}
          />
          {isFlagOpen(clip) && clip.flagNote !== null ? <ClipFlag note={clip.flagNote} /> : null}
          <WhyThisClip clip={clip} clipCount={clipCount} />
        </section>
      </div>
    </div>
  );
}
