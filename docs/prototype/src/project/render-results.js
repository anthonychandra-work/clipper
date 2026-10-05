import { state } from '../app-state.js';
import { escapeHtml } from '../escape-html.js';
import { renderIcon, renderPage } from '../controls/index.js';
import { keptClips, rankOf } from './clip-review.js';

const MIN_MEASURED_CLIPS = 2;

const NO_KEPT_CLIPS = `
  <div class="empty">
    ${renderIcon('chart')}
    <h2 class="empty__title">No Results Yet</h2>
    <p>Results appear here after you keep clips and post them.</p>
    <button type="button" class="button" id="results-go-review" data-action="set-tab" data-value="review">
      Go to Review
    </button>
  </div>`;

export const resultsInputs = {
  'edit-views': (field) => recordViews(field.dataset.clipId, Number(field.value)),
};

export function renderResults(current) {
  const kept = keptClips(current);
  if (kept.length === 0) return { body: renderPage('results', NO_KEPT_CLIPS) };
  return {
    body: renderPage('results', `
      <section class="group-section">
        <h2 class="list-header">Views After 7 Days</h2>
        <ol class="group divided">${kept.map((clip) => renderViewsRow(clip, current)).join('')}</ol>
        <p class="list-footer">
          Enter each clip’s views a week after posting. The selector compares them with its own
          ranking and adjusts what it favours on your next video. These figures are examples.
        </p>
      </section>
      <section class="group-section">
        <h2 class="list-header">Ranking Against Outcome</h2>
        <div class="group group--padded" id="outcome">${renderOutcome(current)}</div>
      </section>`),
  };
}

function renderViewsRow(clip, current) {
  const review = current.reviews[clip.id];
  return `
    <li class="views-row">
      <span class="views-row__rank numeric">${String(rankOf(clip, current.clips)).padStart(2, '0')}</span>
      <label for="views-${clip.id}">${escapeHtml(review.title)}</label>
      <input class="number-field" type="number" id="views-${clip.id}" inputmode="numeric" min="0" step="100"
        value="${review.views ?? ''}" data-input="edit-views" data-clip-id="${clip.id}">
    </li>`;
}

function recordViews(clipId, views) {
  state.reviews[clipId].views = views > 0 ? views : null;
  document.getElementById('outcome').innerHTML = renderOutcome(state);
}

function renderOutcome(current) {
  const measured = keptClips(current)
    .filter((clip) => current.reviews[clip.id].views !== null)
    .sort((first, second) => current.reviews[second.id].views - current.reviews[first.id].views);
  if (measured.length < MIN_MEASURED_CLIPS) {
    return '<p class="list-footer">Enter views for at least two clips.</p>';
  }
  const mostViews = current.reviews[measured[0].id].views;
  const bars = measured.map((clip) => renderOutcomeBar(clip, current, mostViews)).join('');
  return `<p>${describeOutcome(measured, current)}</p><ol class="outcome">${bars}</ol>`;
}

function describeOutcome(measured, current) {
  const topRank = rankOf(measured[0], current.clips);
  const ranks = measured.map((clip) => rankOf(clip, current.clips)).join(', ');
  const verdict = topRank === 1
    ? 'The selector’s first pick performed best.'
    : `The best performer was the selector’s pick number ${topRank}.`;
  return `${verdict} Ranks in order of views: ${ranks}.`;
}

function renderOutcomeBar(clip, current, mostViews) {
  const review = current.reviews[clip.id];
  const width = (review.views / mostViews) * 100;
  return `
    <li class="outcome__row">
      <div class="outcome__head">
        <span>${escapeHtml(review.title)}</span>
        <span class="numeric">${review.views.toLocaleString('en-US')}</span>
      </div>
      <div class="outcome__track"><span class="outcome__fill" style="width:${width.toFixed(1)}%"></span></div>
    </li>`;
}
