import type { Project } from '@/library';
import type { Review, ReviewClip, ReviewSentence, ReviewWindow } from '@/review';

import type { ReadyTalk } from './ready-talk';

const THREE_HOURS_IN_SECONDS = 10_800;
const WINDOW_SECONDS = 60;
const CLIP_COUNT = 12;
const KEPT_COUNT = 10;
const FIRST_START_SECONDS = 100;
const SECONDS_BETWEEN_STARTS = 5;
const LONG_TITLE =
  'The supplier called at four in the morning, and what happened in the next hour changed how we hire, pay and train';
const LONG_HOOK_TITLE = 'Nobody at the bakery expected the supplier to call that early in the morning';

export interface CrowdedReview {
  project: Project;
  review: Review;
}

export function presentCrowdedReview(talk: ReadyTalk): CrowdedReview {
  const clips = Array.from({ length: CLIP_COUNT }, (_, place) =>
    crowdClip(talk.review.clips[place % talk.review.clips.length], place),
  );
  return {
    project: {
      ...talk.project,
      durationSeconds: THREE_HOURS_IN_SECONDS,
      candidateCount: CLIP_COUNT,
      keptCount: KEPT_COUNT,
      rejectedCount: CLIP_COUNT - KEPT_COUNT,
    },
    review: {
      ...talk.review,
      look: { ...talk.review.look, showHookTitle: true, showSafeZones: true },
      windows: listMinuteWindows(),
      clips,
    },
  };
}

function crowdClip(cut: ReviewClip, place: number): ReviewClip {
  const moved = FIRST_START_SECONDS + place * SECONDS_BETWEEN_STARTS - cut.startSeconds;
  const isKept = place < KEPT_COUNT;
  return {
    ...cut,
    id: `c${String(place + 1).padStart(2, '0')}`,
    rank: place + 1,
    title: `${LONG_TITLE} ${place + 1}`,
    hookTitle: LONG_HOOK_TITLE,
    isReplayPeak: true,
    decision: isKept ? 'keep' : 'reject',
    rejectReason: isKept ? null : 'needs-context',
    startSeconds: cut.startSeconds + moved,
    endSeconds: cut.endSeconds + moved,
    sentences: cut.sentences.map((sentence) => moveSentence(sentence, moved)),
  };
}

function moveSentence(sentence: ReviewSentence, seconds: number): ReviewSentence {
  return {
    ...sentence,
    startSeconds: sentence.startSeconds + seconds,
    endSeconds: sentence.endSeconds + seconds,
  };
}

function listMinuteWindows(): ReviewWindow[] {
  return Array.from({ length: THREE_HOURS_IN_SECONDS / WINDOW_SECONDS }, (_, place) => ({
    id: `w${String(place + 1).padStart(3, '0')}`,
    startSeconds: place * WINDOW_SECONDS,
    endSeconds: (place + 1) * WINDOW_SECONDS,
    score: 35 + ((place * 37) % 60),
    isShortlisted: place % 9 === 0,
  }));
}
