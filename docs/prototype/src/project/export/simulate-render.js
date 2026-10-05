import { refresh, state, update } from '../../app-state.js';
import { paintProgress } from '../../controls/index.js';
import { keptClips } from '../clip-review.js';
import { failWithSampleReason, isSampleFailureDue } from './stage-sample-failure.js';

const RENDER_SECONDS = 2.5;
const TICK_MS = 200;

let timer = null;

export function isRendering(current) {
  return Object.values(current.renderJobs).some(isUnfinished);
}

export function findRenderingClip(current) {
  return keptClips(current).find((candidate) => {
    const job = current.renderJobs[candidate.id];
    return Boolean(job) && isUnfinished(job);
  });
}

export function startRenderQueue() {
  update((current) => {
    keptClips(current).forEach((clip) => {
      current.renderJobs[clip.id] = { percent: 0 };
    });
  });
  keepQueueRunning();
}

export function retryRender(clipId) {
  update((current) => {
    current.renderJobs[clipId] = { percent: 0 };
  });
  keepQueueRunning();
}

export function cancelRendering() {
  update((current) => {
    const unfinished = Object.keys(current.renderJobs).filter((clipId) => isUnfinished(current.renderJobs[clipId]));
    unfinished.forEach((clipId) => delete current.renderJobs[clipId]);
  });
}

function isUnfinished(job) {
  return job.percent < 100 && !job.error;
}

function keepQueueRunning() {
  if (!timer) timer = setInterval(advanceQueue, TICK_MS);
}

function advanceQueue() {
  const clip = findRenderingClip(state);
  if (!clip) return stopQueue();
  const job = state.renderJobs[clip.id];
  job.percent = Math.min(100, job.percent + (TICK_MS / (RENDER_SECONDS * 1000)) * 100);
  if (isSampleFailureDue(keptClips(state).indexOf(clip), job)) failWithSampleReason(job);
  if (isUnfinished(job)) return paintProgress(`render-${clip.id}`, job.percent);
  refresh();
}

function stopQueue() {
  clearInterval(timer);
  timer = null;
}
