'use client';

import type { Project } from '@/library';

import { ClipFlag, TitleField, WhyThisClip } from '../../inspect-clip';
import { ClipPreview } from '../../preview-clip';
import type { ClipPoints, Review, ReviewClip } from '../../review.types';
import { LookControls } from '../../set-look';
import { edgeLimits, isFlagOpen, moveEdge, readPoints } from '../../time-clips';
import { BoundaryEditor, ClipTranscript } from '../../trim-clip';
import { measureVideo } from '../lib/measure-video';
import type { ReviewStore } from '../lib/review-store';

interface ClipDetailProps {
  project: Project;
  review: Review;
  clip: ReviewClip;
  store: ReviewStore;
}

export function ClipDetail({ project, review, clip, store }: ClipDetailProps) {
  const points = readPoints(clip);
  const videoSeconds = measureVideo(project, review);
  const movePoints = (moved: ClipPoints) => void store.changeClip(clip.id, moved);
  return (
    <div className="pane pane--detail" id="clip-detail" data-keep-scroll={`clip-${clip.id}`}>
      <div className="detail">
        <ClipPreview clip={clip} look={review.look} source={review.hasPreview ? previewAddress(project.id) : null} />
        <section className="inspector" aria-label="Clip details">
          <TitleField
            key={clip.id}
            title={clip.title}
            onShow={(title) => store.showChange(clip.id, { title })}
            onSave={(title) => void store.changeClip(clip.id, { title })}
          />
          <ShownFlag clip={clip} videoSeconds={videoSeconds} onMove={movePoints} />
          <WhyThisClip clip={clip} clipCount={review.clips.length} />
          <BoundaryEditor
            clip={clip}
            clipSeconds={review.clipSeconds}
            videoSeconds={videoSeconds}
            onDrag={(dragged) => store.showChange(clip.id, dragged)}
            onMove={movePoints}
          />
          <LookControls look={review.look} onChange={(look) => void store.changeLook(look)} />
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

function previewAddress(projectId: string): string {
  return `/api/projects/${projectId}/preview`;
}
