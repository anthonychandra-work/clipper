import { update } from '../../app-state.js';
import { seekTo, togglePlayback } from './play-clip.js';

export const previewActions = {
  'toggle-playback': () => togglePlayback(),
  'set-caption-style': ({ value }) => update((state) => {
    state.look.captions = value;
  }),
  'set-layout': ({ value }) => update((state) => {
    state.look.layout = value;
  }),
  'toggle-look': ({ option }) => update((state) => {
    state.look[option] = !state.look[option];
  }),
};

export const previewInputs = {
  seek: (field) => seekTo(Number(field.value)),
};
