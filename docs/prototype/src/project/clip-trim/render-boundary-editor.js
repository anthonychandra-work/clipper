import { formatPreciseTimecode } from '../../format-timecode.js';
import { renderIcon } from '../../controls/index.js';
import { clipRange, layOutSentences } from '../clip-timing.js';
import { NUDGE_STEP_SECONDS, edgeLimits } from '../move-edge.js';
import { renderDurationBand } from './render-duration-band.js';
import { paintFilmstrip, renderFilmstrip } from './render-filmstrip.js';
import { renderTranscript } from './render-transcript.js';

const EDGE_NAMES = { start: 'In', end: 'Out' };

const STEPPERS = [
  { unit: 'Sentence', spoken: 'one sentence', action: 'move-edge', earlier: 'canMoveEarlier', later: 'canMoveLater' },
  {
    unit: `${NUDGE_STEP_SECONDS} s`,
    spoken: `${NUDGE_STEP_SECONDS} seconds`,
    action: 'nudge-edge',
    earlier: 'canNudgeEarlier',
    later: 'canNudgeLater',
  },
];

export function renderBoundaryEditor(clip, review) {
  return `
    <div class="group-section">
      <h2 class="list-header">In and Out Points</h2>
      <div class="group group--padded">
        <div id="trim-band">${renderDurationBand(clipRange(clip, review).duration)}</div>
        ${renderFilmstrip(clip, review)}
        <div id="trim-edges">${renderEdges(clip, review)}</div>
      </div>
      <p class="list-footer">Drag a handle to move the cut to another sentence, or step it below.</p>
    </div>`;
}

export function renderTranscriptSection(clip, review) {
  return `
    <div class="group-section">
      <h2 class="list-header">Transcript</h2>
      <ol class="group divided" id="trim-transcript">${renderTranscript(clip, review)}</ol>
    </div>`;
}

export function paintBoundaryEditor(clip, review) {
  document.getElementById('trim-band').innerHTML = renderDurationBand(clipRange(clip, review).duration);
  document.getElementById('trim-edges').innerHTML = renderEdges(clip, review);
  document.getElementById('trim-transcript').innerHTML = renderTranscript(clip, review);
  paintFilmstrip(clip, review);
}

function renderEdges(clip, review) {
  const sentenceCount = layOutSentences(clip).length;
  const range = clipRange(clip, review);
  return Object.keys(EDGE_NAMES)
    .map((edge) => renderEdge({ edge, seconds: range[edge], limits: edgeLimits(edge, review, sentenceCount) }))
    .join('');
}

function renderEdge({ edge, seconds, limits }) {
  const steppers = STEPPERS.map((stepper) => renderStepper(stepper, edge, limits)).join('');
  return `
    <div class="edge">
      <span class="edge__name">${EDGE_NAMES[edge]}</span>
      <span class="edge__time numeric">${formatPreciseTimecode(seconds)}</span>
      <div class="edge__steppers">${steppers}</div>
    </div>`;
}

function renderStepper(stepper, edge, limits) {
  return `
    <span class="stepper" role="group" aria-label="${EDGE_NAMES[edge]} point by ${stepper.spoken}">
      <span class="stepper__unit">${stepper.unit}</span>
      <span class="stepper__buttons">
        ${renderStep({ stepper, edge, step: -1, isAllowed: limits[stepper.earlier] })}
        ${renderStep({ stepper, edge, step: 1, isAllowed: limits[stepper.later] })}
      </span>
    </span>`;
}

function renderStep({ stepper, edge, step, isAllowed }) {
  const direction = step < 0 ? 'earlier' : 'later';
  return `
    <button type="button" class="stepper__step" id="${edge}-${stepper.action}-${direction}"
      data-action="${stepper.action}" data-edge="${edge}" data-step="${step}"
      aria-label="${EDGE_NAMES[edge]} point ${stepper.spoken} ${direction}" ${isAllowed ? '' : 'disabled'}>
      ${renderIcon(step < 0 ? 'chevron-left' : 'chevron-right')}
    </button>`;
}
