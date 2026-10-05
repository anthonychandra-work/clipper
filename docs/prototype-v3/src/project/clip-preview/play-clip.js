import { state, update } from '../../app-state.js';
import { formatClock } from '../../format-timecode.js';
import { selectedClip } from '../clip-review.js';
import { clipRange, spokenWords } from '../clip-timing.js';
import { buildCaptionChunks, captionAt } from './build-captions.js';

const HOOK_TITLE_SECONDS = 3;

let previousFrameMs = null;

export function createPlayback() {
  return { isPlaying: false, seconds: 0 };
}

export function togglePlayback() {
  if (state.playback.isPlaying) return pausePlayback();
  startPlayback();
}

export function seekTo(seconds) {
  state.playback.seconds = seconds;
  paintPlayhead();
}

export function paintPlayhead() {
  const caption = document.getElementById('preview-caption');
  if (!caption) return;
  const { clip, review, duration } = selectedTiming();
  const seconds = state.playback.seconds;
  const chunks = buildCaptionChunks(spokenWords(clip, review), state.look.captions);
  caption.innerHTML = captionAt(chunks, seconds)?.html ?? '';
  document.getElementById('preview-clock').textContent = `${formatClock(seconds)} / ${formatClock(duration)}`;
  paintScrubber(seconds, duration);
  paintHookTitle(seconds);
}

function paintScrubber(seconds, duration) {
  const scrubber = document.getElementById('preview-scrubber');
  scrubber.value = seconds.toFixed(1);
  scrubber.style.setProperty('--value', `${((seconds / duration) * 100).toFixed(2)}%`);
}

function paintHookTitle(seconds) {
  const hook = document.getElementById('preview-hook');
  if (hook) hook.hidden = seconds >= HOOK_TITLE_SECONDS;
}

function startPlayback() {
  const { duration } = selectedTiming();
  previousFrameMs = null;
  update((current) => {
    if (current.playback.seconds >= duration) current.playback.seconds = 0;
    current.playback.isPlaying = true;
  });
  requestAnimationFrame(stepFrame);
}

function pausePlayback() {
  update((current) => {
    current.playback.isPlaying = false;
  });
}

function stepFrame(nowMs) {
  if (!state.playback.isPlaying) return;
  if (!document.getElementById('preview-caption')) return pausePlayback();
  const { duration } = selectedTiming();
  const elapsedSeconds = previousFrameMs === null ? 0 : (nowMs - previousFrameMs) / 1000;
  previousFrameMs = nowMs;
  state.playback.seconds = Math.min(duration, state.playback.seconds + elapsedSeconds);
  if (state.playback.seconds >= duration) return pausePlayback();
  paintPlayhead();
  requestAnimationFrame(stepFrame);
}

function selectedTiming() {
  const clip = selectedClip(state);
  const review = state.reviews[clip.id];
  return { clip, review, duration: clipRange(clip, review).duration };
}
