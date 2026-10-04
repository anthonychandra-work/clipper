import { escapeHtml } from '../../escape-html.js';
import { isFlagOpen, rankOf, selectedClip, totalScore } from '../clip-review.js';
import { renderBoundaryEditor } from './render-boundary-editor.js';
import { renderDecision } from './render-decision.js';

const SCORE_PART_MAX = 25;

const SCORE_PARTS = [
  { key: 'hook', label: 'Hook' },
  { key: 'arc', label: 'Arc' },
  { key: 'value', label: 'Value' },
  { key: 'share', label: 'Share' },
];

const REPLAY_NOTE = `
  <p class="why__replay">
    <span class="chip chip--replay">Replay peak</span>
    <span class="hint">Viewers of the source video rewatched this part more than the rest.</span>
  </p>`;

export function renderClipInspector(state) {
  const clip = selectedClip(state);
  const review = state.reviews[clip.id];
  return `
    <section class="inspector panel" aria-label="Clip details">
      <label class="field" for="clip-title">
        <span class="label">Title</span>
        <input id="clip-title" type="text" value="${escapeHtml(review.title)}" data-input="edit-title">
      </label>
      ${isFlagOpen(clip, review) ? renderFlag(clip.flag) : ''}
      ${renderWhy(clip, state.clips)}
      ${renderBoundaryEditor(clip, review)}
      ${renderDecision(review)}
    </section>`;
}

function renderFlag(flag) {
  const fix = `
    <button type="button" class="button button--small" id="flag-fix" data-action="apply-flag-fix">
      Start one sentence earlier
    </button>`;
  return `
    <div class="flag" role="note">
      <p>${escapeHtml(flag.message)}</p>
      ${flag.kind === 'context' ? fix : ''}
    </div>`;
}

function renderWhy(clip, rankedClips) {
  const bars = SCORE_PARTS.map((part) => renderScoreBar(part, clip.scores[part.key])).join('');
  return `
    <div class="inspector__section">
      <h2 class="label">Why this clip</h2>
      <p>${escapeHtml(clip.reason)}</p>
      <div class="scores">${bars}</div>
      <p class="hint">
        <span class="timecode">${totalScore(clip)}</span> of 100, rank ${rankOf(clip, rankedClips)}
        of ${rankedClips.length}. The score orders clips inside this video. It does not forecast views.
      </p>
      ${clip.signals.includes('replay') ? REPLAY_NOTE : ''}
    </div>`;
}

function renderScoreBar(part, points) {
  const width = (points / SCORE_PART_MAX) * 100;
  return `
    <div class="score">
      <span>${part.label}</span>
      <span class="score__track"><span class="score__fill" style="width:${width}%"></span></span>
      <span class="score__value timecode">${points}/${SCORE_PART_MAX}</span>
    </div>`;
}
