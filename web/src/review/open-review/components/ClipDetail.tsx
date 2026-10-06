'use client';

import { ClipFlag, TitleField, WhyThisClip } from '../../inspect-clip';
import type { ClipPoints, ClipSeconds, ReviewClip } from '../../review.types';
import { edgeLimits, isFlagOpen, moveEdge, readPoints } from '../../time-clips';
import { BoundaryEditor, ClipTranscript } from '../../trim-clip';
import type { ReviewStore } from '../lib/review-store';

interface ClipDetailProps {
  clip: ReviewClip;
  clipCount: number;
  clipSeconds: ClipSeconds;
  videoSeconds: number;
  store: ReviewStore;
}

export function ClipDetail({ clip, clipCount, clipSeconds, videoSeconds, store }: ClipDetailProps) {
  const points = readPoints(clip);
  const movePoints = (moved: ClipPoints) => void store.changeClip(clip.id, moved);
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
          <ShownFlag clip={clip} videoSeconds={videoSeconds} onMove={movePoints} />
          <WhyThisClip clip={clip} clipCount={clipCount} />
          <BoundaryEditor
            clip={clip}
            clipSeconds={clipSeconds}
            videoSeconds={videoSeconds}
            onDrag={(dragged) => store.showChange(clip.id, dragged)}
            onMove={movePoints}
          />
          <ClipTranscript reach={clip.sentences} points={points} />
        </section>
      </div>
    </div>
  );
}

interface ShownFlagProps {
  clip: ReviewClip;
  videoSeconds: number;
  onMove: (points: ClipPoints) => void;
}

function ShownFlag({ clip, videoSeconds, onMove }: ShownFlagProps) {
  if (!isFlagOpen(clip) || clip.flagNote === null) return null;
  const points = readPoints(clip);
  const canStartEarlier = edgeLimits('start', points, { reach: clip.sentences, videoSeconds }).canMoveEarlier;
  const offersFix = clip.flag === 'needs-context' && canStartEarlier;
  return (
    <ClipFlag note={clip.flagNote} onStartEarlier={offersFix ? () => onMove(moveEdge(points, 'start', -1)) : undefined} />
  );
}
