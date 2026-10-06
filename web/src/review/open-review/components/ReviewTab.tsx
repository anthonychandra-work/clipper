'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { type Project, refreshProjects } from '@/library';
import { ProjectFrame, useOpenProject } from '@/project';
import { useShell } from '@/shell';

import { DecisionControls } from '../../decide-clip';
import { type ClipFilter, filterClips } from '../../list-candidates';
import type { ClipChange, Review, ReviewClip } from '../../review.types';
import { useReview } from '../hooks/use-review';
import { clipAddress, findNextClip, findShownClip, namesNoClip, reviewAddress } from '../lib/review-addresses';
import type { ReviewStore } from '../lib/review-store';
import { ClipDetail } from './ClipDetail';
import { ClipScreen } from './ClipScreen';
import { EmptyReview } from './EmptyReview';
import { ReviewSplit } from './ReviewSplit';

export function ReviewTab() {
  const project = useOpenProject();
  const { review, store } = useReview(project.id);
  if (review === null || review.clips.length === 0) {
    return (
      <ProjectFrame project={project} tab="review">
        {review === null ? null : <EmptyReview />}
      </ProjectFrame>
    );
  }
  return <ReviewWorkbench project={project} review={review} store={store} />;
}

interface ReviewWorkbenchProps {
  project: Project;
  review: Review;
  store: ReviewStore;
}

function ReviewWorkbench({ project, review, store }: ReviewWorkbenchProps) {
  const { layout } = useShell();
  const { clip: clipId } = useParams<{ clip?: string }>();
  const [filter, setFilter] = useState<ClipFilter>('all');
  const isPhone = layout === 'compact';
  const shownClip = findShownClip({ clips: review.clips, clipId, isPhone });
  useListForUnknownClip(project.id, namesNoClip(review.clips, clipId));
  useShownRowInView(isPhone ? null : (shownClip?.id ?? null));

  if (shownClip === null) {
    return (
      <ProjectFrame project={project} tab="review">
        <ReviewSplit project={project} review={review} shownClip={null} filter={filter} onFilter={setFilter} detail={null} />
      </ProjectFrame>
    );
  }
  const clipCount = review.clips.length;
  const decision = <ClipDecision project={project} review={review} clip={shownClip} filter={filter} store={store} />;
  const detail = <ClipDetail project={project} review={review} clip={shownClip} store={store} />;
  if (isPhone) {
    return (
      <ClipScreen projectId={project.id} clip={shownClip} clipCount={clipCount} bottomBar={decision}>
        {detail}
      </ClipScreen>
    );
  }
  return (
    <ProjectFrame project={project} tab="review" actions={decision}>
      <ReviewSplit
        project={project}
        review={review}
        shownClip={shownClip}
        filter={filter}
        onFilter={setFilter}
        detail={detail}
      />
    </ProjectFrame>
  );
}

interface ClipDecisionProps extends ReviewWorkbenchProps {
  clip: ReviewClip;
  filter: ClipFilter;
}

function ClipDecision({ project, review, clip, filter, store }: ClipDecisionProps) {
  const group = filterClips(review.clips, filter);
  const next = findNextClip(group.length > 0 ? group : review.clips, clip.id) ?? clip;
  const decide = (change: ClipChange) => {
    void store.changeClip(clip.id, change).then(refreshProjects);
  };
  return <DecisionControls clip={clip} nextHref={clipAddress(project.id, next.id)} onDecide={decide} />;
}

function useListForUnknownClip(projectId: string, isClipUnknown: boolean): void {
  const router = useRouter();

  useEffect(() => {
    if (isClipUnknown) router.replace(reviewAddress(projectId));
  }, [isClipUnknown, projectId, router]);
}

function useShownRowInView(shownClipId: string | null): void {
  useEffect(() => {
    if (shownClipId !== null) document.getElementById(`candidate-${shownClipId}`)?.scrollIntoView({ block: 'nearest' });
  }, [shownClipId]);
}
