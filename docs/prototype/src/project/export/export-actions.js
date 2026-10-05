import { state } from '../../app-state.js';
import { copyText } from '../../copy-text.js';
import { showToast } from '../../show-toast.js';
import { cancelRendering, retryRender, startRenderQueue } from './simulate-render.js';

export const exportActions = {
  'render-kept': () => startRenderQueue(),
  'retry-render': ({ clipId }) => retryRender(clipId),
  'cancel-render': () => cancelRendering(),
  'copy-platform-text': ({ clipId, platform }) => copyText(findClip(clipId).copy[platform]),
  'download-clip': () => showToast('The real app saves the MP4 here.'),
};

function findClip(clipId) {
  return state.clips.find((clip) => clip.id === clipId);
}
