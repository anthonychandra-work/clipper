import { refresh, state, update } from '../../app-state.js';
import { paintProgress } from '../../controls/index.js';
import { keptClips } from '../clip-review.js';

const RENDER_SECONDS = 2.5;
const TICK_MS = 200;

let timer = null;

export function isRendering(current) {
  return Object.values(current.renderJobs).some((job) => job.percent < 100);
}

export function findRenderingClip(current) {
  return keptClips(current).find((candidate) => current.renderJobs[candidate.id]?.percent < 100);
}

export function startRenderQueue() {
  if (timer) return;
  update((current) => {
    keptClips(current).forEach((clip) => {
      current.renderJobs[clip.id] = { percent: 0 };
    });
  });
  timer = setInterval(advanceQueue, TICK_MS);
}

function advanceQueue() {
  const clip = findRenderingClip(state);
  if (!clip) return stopQueue();
  const job = state.renderJobs[clip.id];
  job.percent = Math.min(100, job.percent + (TICK_MS / (RENDER_SECONDS * 1000)) * 100);
  if (job.percent < 100) return paintProgress(`render-${clip.id}`, job.percent);
  refresh();
}

function stopQueue() {
  clearInterval(timer);
  timer = null;
}
