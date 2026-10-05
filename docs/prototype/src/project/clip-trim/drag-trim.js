import { state } from '../../app-state.js';
import { selectedClip } from '../clip-review.js';
import { layOutSentences } from '../clip-timing.js';
import { moveEdgeTo } from '../move-edge.js';
import { changeBoundary } from './boundary-actions.js';
import { paintBoundaryEditor } from './render-boundary-editor.js';

export const trimDrags = {
  'trim-edge': (event, handle) => beginTrimDrag(event, handle),
};

function beginTrimDrag(event, handle) {
  const strip = handle.closest('.filmstrip');
  handle.setPointerCapture(event.pointerId);
  strip.classList.add('is-trimming');
  handle.onpointermove = (move) => trimToward(handle.dataset.edge, positionAlong(strip, move.clientX));
  handle.onpointerup = endTrimDrag;
  handle.onpointercancel = endTrimDrag;
}

function positionAlong(strip, clientX) {
  const box = strip.getBoundingClientRect();
  return Math.min(1, Math.max(0, (clientX - box.left) / box.width));
}

function trimToward(edge, position) {
  const clip = selectedClip(state);
  const review = state.reviews[clip.id];
  const sentenceIndex = nearestSentence({ edge, position, review, sentences: layOutSentences(clip) });
  if (sentenceIndex === review[`${edge}Index`]) return;
  moveEdgeTo(review, edge, sentenceIndex);
  paintBoundaryEditor(clip, review);
}

function nearestSentence({ edge, position, review, sentences }) {
  const windowStart = sentences[0].start;
  const seconds = windowStart + position * (sentences[sentences.length - 1].end - windowStart);
  return sentences
    .map((sentence, index) => ({ index, distance: Math.abs(sentence[edge] - seconds) }))
    .filter(({ index }) => (edge === 'start' ? index <= review.endIndex : index >= review.startIndex))
    .sort((first, second) => first.distance - second.distance)[0].index;
}

function endTrimDrag() {
  changeBoundary(() => {});
}
