import { escapeHtml } from '../../escape-html.js';
import { renderIcon } from '../../controls/index.js';
import { isFlagOpen, rankOf, selectedClip, totalScore } from '../clip-review.js';
import { renderLookControls } from '../clip-preview/index.js';
import { renderBoundaryEditor, renderTranscriptSection } from '../clip-trim/index.js';

const SCORE_PART_MAX = 25;

const SCORE_PARTS = [
  { key: 'hook', label: 'Hook' },
  { key: 'arc', label: 'Arc' },
  { key: 'value', label: 'Value' },
  { key: 'share', label: 'Share' },
];

const REPLAY_NOTE = `
  <p class="replay-note">
    ${renderIcon('replay')}
    <span><strong>Replay peak.</strong> Viewers of the source video rewatched this part more than the rest.</span>
  </p>`;

const FLAG_FIX = `
  <button type="button" class="button" id="flag-fix" data-action="apply-flag-fix">
    Start One Sentence Earlier
  </button>`;

export function renderClipInspector(state) {
  const clip = selectedClip(state);
  const review = state.reviews[clip.id];
  return `
    <section class="inspector" aria-label="Clip details">
      ${renderTitleField(review)}
      ${isFlagOpen(clip, review) ? renderFlag(clip.flag) : ''}
      ${renderWhy(clip, state.clips)}
      ${renderBoundaryEditor(clip, review)}
      ${renderLookControls(state.look)}
      ${renderTranscriptSection(clip, review)}
    </section>`;
}

function renderTitleField(review) {
  return `
    <div class="group-section">
      <label class="list-header" for="clip-title">Title</label>
      <div class="group">
        <input class="text-field" id="clip-title" type="text" value="${escapeHtml(review.title)}"
          data-input="edit-title">
      </div>
    </div>`;
}

function renderFlag(flag) {
  return `
    <div class="group flag" role="note">
      ${renderIcon('warning')}
      <p class="flag__message">${escapeHtml(flag.message)}</p>
      ${flag.kind === 'context' ? FLAG_FIX : ''}
    </div>`;
}

function renderWhy(clip, rankedClips) {
  const bars = SCORE_PARTS.map((part) => renderScoreBar(part, clip.scores[part.key])).join('');
  return `
    <div class="group-section">
      <h2 class="list-header">Why This Clip</h2>
      <div class="group group--padded">
        <p>${escapeHtml(clip.reason)}</p>
        <div class="scores">${bars}</div>
        ${clip.signals.includes('replay') ? REPLAY_NOTE : ''}
      </div>
      <p class="list-footer">
        <span class="numeric">${totalScore(clip)}</span> of 100, rank ${rankOf(clip, rankedClips)}
        of ${rankedClips.length}. The score orders clips inside this video. It does not forecast views.
      </p>
    </div>`;
}

function renderScoreBar(part, points) {
  const width = (points / SCORE_PART_MAX) * 100;
  return `
    <div class="score">
      <span>${part.label}</span>
      <span class="score__track"><span class="score__fill" style="width:${width}%"></span></span>
      <span class="score__value numeric">${points}/${SCORE_PART_MAX}</span>
    </div>`;
}
