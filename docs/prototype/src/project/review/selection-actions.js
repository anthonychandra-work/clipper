import { update } from '../../app-state.js';
import { visibleClips } from '../clip-review.js';
import { createPlayback } from '../clip-preview/index.js';

const PHONE_LAYOUT = '(max-width: 720px)';

export const selectionActions = {
  'select-clip': ({ clipId }) => showClip(clipId),
  'select-next': () => update((state) => openClip(state, nextClipId(state))),
  'close-detail': () => update((state) => {
    state.isDetailOpen = false;
    state.playback = createPlayback();
  }),
  'set-filter': ({ value }) => update((state) => {
    state.filter = value;
  }),
};

function showClip(clipId) {
  update((state) => openClip(state, clipId));
  if (window.matchMedia(PHONE_LAYOUT).matches) window.scrollTo(0, 0);
}

function openClip(state, clipId) {
  state.selectedClipId = clipId;
  state.isDetailOpen = true;
  state.playback = createPlayback();
}

function nextClipId(state) {
  const visible = visibleClips(state);
  const pool = visible.length > 0 ? visible : state.clips;
  const position = pool.findIndex((clip) => clip.id === state.selectedClipId);
  return pool[(position + 1) % pool.length].id;
}
