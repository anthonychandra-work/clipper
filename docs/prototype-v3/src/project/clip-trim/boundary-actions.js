import { state, update } from '../../app-state.js';
import { selectedClip } from '../clip-review.js';
import { layOutSentences } from '../clip-timing.js';
import { edgeLimits, moveEdge, nudgeEdge } from '../move-edge.js';
import { createPlayback } from '../clip-preview/index.js';

export const boundaryActions = {
  'move-edge': ({ edge, step }) => changeBoundary((review) => moveEdge(review, edge, Number(step))),
  'nudge-edge': ({ edge, step }) => changeBoundary((review) => nudgeEdge(review, edge, Number(step))),
  'step-edge': ({ edge, step }) => stepEdgeWithinLimits(edge, step),
  'apply-flag-fix': () => changeBoundary((review) => moveEdge(review, 'start', -1)),
};

export function changeBoundary(change) {
  update((current) => {
    change(current.reviews[current.selectedClipId]);
    current.playback = createPlayback();
  });
}

function stepEdgeWithinLimits(edge, step) {
  const clip = selectedClip(state);
  const limits = edgeLimits(edge, state.reviews[clip.id], layOutSentences(clip).length);
  const isAllowed = step < 0 ? limits.canMoveEarlier : limits.canMoveLater;
  if (isAllowed) changeBoundary((review) => moveEdge(review, edge, step));
}
