import { escapeHtml } from '../../escape-html.js';
import { formatDuration, formatPreciseTimecode } from '../../format-timecode.js';
import { DURATION_BAND, clipRange, layOutSentences, rateDuration } from '../clip-timing.js';
import { NUDGE_STEP_SECONDS, edgeLimits } from '../move-edge.js';

const BAND_SCALE_SECONDS = 75;

const DURATION_NOTES = {
  short: `shorter than the ${DURATION_BAND.min} s minimum`,
  allowed: `inside the ${DURATION_BAND.min}–${DURATION_BAND.max} s limits`,
  ideal: `inside the preferred ${DURATION_BAND.idealMin}–${DURATION_BAND.idealMax} s band`,
  long: `longer than the ${DURATION_BAND.max} s maximum`,
};

const EDGE_NAMES = { start: 'In', end: 'Out' };

const EDGE_BUTTONS = [
  { action: 'move-edge', step: -1, label: '‹ Sentence', limit: 'canMoveEarlier' },
  { action: 'nudge-edge', step: -1, label: `‹ ${NUDGE_STEP_SECONDS} s`, limit: 'canNudgeEarlier' },
  { action: 'nudge-edge', step: 1, label: `${NUDGE_STEP_SECONDS} s ›`, limit: 'canNudgeLater' },
  { action: 'move-edge', step: 1, label: 'Sentence ›', limit: 'canMoveLater' },
];

export function renderBoundaryEditor(clip, review) {
  const sentences = layOutSentences(clip);
  const range = clipRange(clip, review);
  const rows = sentences.map((sentence, index) => renderSentence(sentence, index, review)).join('');
  return `
    <div class="inspector__section">
      <h2 class="label">In and out points</h2>
      ${renderDurationBand(range.duration)}
      ${renderEdge('start', range.start, edgeLimits('start', review, sentences.length))}
      <ol class="sentences">${rows}</ol>
      ${renderEdge('end', range.end, edgeLimits('end', review, sentences.length))}
    </div>`;
}

function renderDurationBand(duration) {
  const rating = rateDuration(duration);
  const ticks = Object.values(DURATION_BAND).map(renderTick).join('');
  return `
    <div class="band band--${rating}">
      <p class="band__reading"><span class="timecode">${formatDuration(duration)}</span>, ${DURATION_NOTES[rating]}.</p>
      <div class="band__track" role="img" aria-label="Clip length against the allowed and preferred bands">
        <span class="band__allowed" style="${spanStyle(DURATION_BAND.min, DURATION_BAND.max)}"></span>
        <span class="band__ideal" style="${spanStyle(DURATION_BAND.idealMin, DURATION_BAND.idealMax)}"></span>
        <span class="band__now" style="left:${toPercent(Math.min(duration, BAND_SCALE_SECONDS))}%"></span>
      </div>
      <div class="band__ticks timecode" aria-hidden="true">${ticks}</div>
    </div>`;
}

function spanStyle(fromSeconds, toSeconds) {
  return `left:${toPercent(fromSeconds)}%;width:${toPercent(toSeconds - fromSeconds)}%`;
}

function toPercent(seconds) {
  return ((seconds / BAND_SCALE_SECONDS) * 100).toFixed(2);
}

function renderTick(seconds) {
  return `<span class="band__tick" style="left:${toPercent(seconds)}%">${seconds}</span>`;
}

function renderEdge(edge, seconds, limits) {
  const buttons = EDGE_BUTTONS.map((button) => renderEdgeButton(button, edge, limits)).join('');
  return `
    <div class="edge">
      <span class="label">${EDGE_NAMES[edge]}</span>
      <span class="edge__time timecode">${formatPreciseTimecode(seconds)}</span>
      <div class="edge__buttons">${buttons}</div>
    </div>`;
}

function renderEdgeButton(button, edge, limits) {
  return `
    <button type="button" class="button button--small" id="${edge}-${button.limit}"
      data-action="${button.action}" data-edge="${edge}" data-step="${button.step}"
      ${limits[button.limit] ? '' : 'disabled'}>${button.label}</button>`;
}

function renderSentence(sentence, index, review) {
  const isIncluded = index >= review.startIndex && index <= review.endIndex;
  return `
    <li class="sentence ${isIncluded ? 'sentence--in' : 'sentence--out'}">
      <span class="sentence__mark timecode" aria-hidden="true">${edgeMark(index, review)}</span>
      <span>${escapeHtml(sentence.text)}</span>
    </li>`;
}

function edgeMark(index, review) {
  if (index === review.startIndex && index === review.endIndex) return '[]';
  if (index === review.startIndex) return '[';
  return index === review.endIndex ? ']' : '';
}
