import { state } from '../../app-state.js';
import { copyText } from '../../copy-text.js';
import { showToast } from '../../show-toast.js';
import { startRenderQueue } from './simulate-render.js';

export const exportActions = {
  'render-kept': () => startRenderQueue(),
  'copy-platform-text': ({ clipId, platform }) => copyText(findClip(clipId).copy[platform]),
  'download-clip': () => showToast('The real app saves the MP4 here.'),
};

function findClip(clipId) {
  return state.clips.find((clip) => clip.id === clipId);
}
