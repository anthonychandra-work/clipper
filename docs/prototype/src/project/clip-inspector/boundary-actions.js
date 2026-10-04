import { update } from '../../app-state.js';
import { moveEdge, nudgeEdge } from '../move-edge.js';
import { createPlayback } from '../clip-preview/index.js';

export const boundaryActions = {
  'move-edge': ({ edge, step }) => changeBoundary((review) => moveEdge(review, edge, Number(step))),
  'nudge-edge': ({ edge, step }) => changeBoundary((review) => nudgeEdge(review, edge, Number(step))),
  'apply-flag-fix': () => changeBoundary((review) => moveEdge(review, 'start', -1)),
};

function changeBoundary(change) {
  update((state) => {
    change(state.reviews[state.selectedClipId]);
    state.playback = createPlayback();
  });
}
