'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import type { Project } from '@/library';
import { ProjectFrame, useOpenProject } from '@/project';
import { useShell } from '@/shell';

import type { ClipFilter } from '../../list-candidates';
import type { Review } from '../../review.types';
import { useReview } from '../hooks/use-review';
import { findShownClip, namesNoClip, reviewAddress } from '../lib/review-addresses';
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
  const router = useRouter();
  const { layout } = useShell();
  const { clip: clipId } = useParams<{ clip?: string }>();
  const [filter, setFilter] = useState<ClipFilter>('all');
  const isPhone = layout === 'compact';
  const shownClip = findShownClip({ clips: review.clips, clipId, isPhone });
  const mustLeadToList = namesNoClip(review.clips, clipId);

  useEffect(() => {
    if (mustLeadToList) router.replace(reviewAddress(project.id));
  }, [mustLeadToList, project.id, router]);

  const clipCount = review.clips.length;
  const detail = shownClip === null ? null : <ClipDetail clip={shownClip} clipCount={clipCount} store={store} />;
  if (isPhone && shownClip !== null) {
    return (
      <ClipScreen projectId={project.id} clip={shownClip} clipCount={clipCount}>
        {detail}
      </ClipScreen>
    );
  }
  return (
    <ProjectFrame project={project} tab="review">
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
