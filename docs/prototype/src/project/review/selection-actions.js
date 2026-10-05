import { state, update } from '../../app-state.js';
import { isCompact } from '../../read-layout.js';
import { visibleClips } from '../clip-review.js';
import { createPlayback } from '../clip-preview/index.js';

let listScrollY = 0;

export const selectionActions = {
  'select-clip': ({ clipId }) => showClip(clipId),
  'select-next': () => showNextClip(),
  'close-detail': () => closeDetail(),
  'set-filter': ({ value }) => update((current) => {
    current.filter = value;
  }),
};

function showClip(clipId) {
  if (isCompact() && !state.isDetailOpen) listScrollY = window.scrollY;
  update((current) => openClip(current, clipId));
  if (isCompact()) window.scrollTo(0, 0);
}

function showNextClip() {
  update((current) => openClip(current, nextClipId(current)));
  if (isCompact()) return window.scrollTo(0, 0);
  document.getElementById(`candidate-${state.selectedClipId}`)?.scrollIntoView({ block: 'nearest' });
}

function closeDetail() {
  update((current) => {
    current.isDetailOpen = false;
    current.playback = createPlayback();
  });
  window.scrollTo(0, listScrollY);
}

function openClip(current, clipId) {
  current.selectedClipId = clipId;
  current.isDetailOpen = true;
  current.playback = createPlayback();
}

function nextClipId(current) {
  const visible = visibleClips(current);
  const pool = visible.length > 0 ? visible : current.clips;
  const position = pool.findIndex((clip) => clip.id === current.selectedClipId);
  return pool[(position + 1) % pool.length].id;
}
