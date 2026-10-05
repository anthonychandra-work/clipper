import { formatPreciseTimecode } from '../../format-timecode.js';
import { clipRange, layOutSentences } from '../clip-timing.js';

const FRAME_COUNT = 12;
const FRAMES = '<span class="filmstrip__frame"></span>'.repeat(FRAME_COUNT);
const EDGE_LABELS = { start: 'In point', end: 'Out point' };

export function renderFilmstrip(clip, review) {
  const span = measureSelection(clip, review);
  return `
    <div class="filmstrip" id="filmstrip">
      <div class="filmstrip__frames" aria-hidden="true">${FRAMES}</div>
      <span class="filmstrip__shade filmstrip__shade--before" id="trim-shade-before" style="width:${span.before}%"></span>
      <span class="filmstrip__shade filmstrip__shade--after" id="trim-shade-after" style="width:${span.after}%"></span>
      <div class="filmstrip__selection" id="trim-selection" style="left:${span.before}%;right:${span.after}%">
        ${renderHandle('start', span)}
        ${renderHandle('end', span)}
      </div>
    </div>`;
}

export function paintFilmstrip(clip, review) {
  const span = measureSelection(clip, review);
  const selection = document.getElementById('trim-selection');
  selection.style.left = `${span.before}%`;
  selection.style.right = `${span.after}%`;
  document.getElementById('trim-shade-before').style.width = `${span.before}%`;
  document.getElementById('trim-shade-after').style.width = `${span.after}%`;
  document.getElementById('trim-handle-start').setAttribute('aria-valuetext', span.startText);
  document.getElementById('trim-handle-end').setAttribute('aria-valuetext', span.endText);
}

function measureSelection(clip, review) {
  const sentences = layOutSentences(clip);
  const range = clipRange(clip, review);
  const windowStart = sentences[0].start;
  const windowSeconds = sentences[sentences.length - 1].end - windowStart;
  return {
    before: toPercent(range.start - windowStart, windowSeconds),
    after: toPercent(windowStart + windowSeconds - range.end, windowSeconds),
    startText: formatPreciseTimecode(range.start),
    endText: formatPreciseTimecode(range.end),
  };
}

function toPercent(seconds, windowSeconds) {
  return Math.min(100, Math.max(0, (seconds / windowSeconds) * 100)).toFixed(2);
}

function renderHandle(edge, span) {
  return `
    <button type="button" class="filmstrip__handle filmstrip__handle--${edge}" id="trim-handle-${edge}"
      data-drag="trim-edge" data-step-action="step-edge" data-edge="${edge}" role="slider"
      aria-label="${EDGE_LABELS[edge]}" aria-orientation="horizontal"
      aria-valuetext="${span[`${edge}Text`]}"></button>`;
}
