import { escapeHtml } from '../../escape-html.js';
import { formatDuration, formatTimecode } from '../../format-timecode.js';
import { renderSegmented } from '../../render-segmented.js';
import { isFlagOpen, rankOf, totalScore, visibleClips } from '../clip-review.js';
import { clipRange } from '../clip-timing.js';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'undecided', label: 'To review' },
  { value: 'keep', label: 'Kept' },
  { value: 'reject', label: 'Rejected' },
];

const DECISION_CHIPS = {
  undecided: '',
  keep: '<span class="chip chip--keep">Kept</span>',
  reject: '<span class="chip chip--reject">Rejected</span>',
};

export function renderCandidateList(state) {
  const rows = visibleClips(state).map((clip) => renderCandidate(clip, state)).join('');
  return `
    <section class="candidates panel" aria-label="Candidate clips">
      ${renderSegmented({ label: 'Show', action: 'set-filter', selected: state.filter, options: countFilters(state) })}
      <ol class="candidate-list">${rows || '<li class="empty">No clips in this group.</li>'}</ol>
    </section>`;
}

function countFilters(state) {
  const decisions = Object.values(state.reviews).map((review) => review.decision);
  return FILTERS.map((filter) => {
    const matching = decisions.filter((decision) => filter.value === 'all' || decision === filter.value);
    return { value: filter.value, label: `${filter.label} ${matching.length}` };
  });
}

function renderCandidate(clip, state) {
  const review = state.reviews[clip.id];
  const range = clipRange(clip, review);
  const isSelected = clip.id === state.selectedClipId;
  return `
    <li class="candidate candidate--${review.decision}${isSelected ? ' is-selected' : ''}">
      <button type="button" class="candidate__open" id="candidate-${clip.id}"
        data-action="select-clip" data-clip-id="${clip.id}" aria-current="${isSelected}">
        <span class="candidate__rank timecode">${String(rankOf(clip, state.clips)).padStart(2, '0')}</span>
        <span class="candidate__body">
          <span class="candidate__title">${escapeHtml(review.title)}</span>
          <span class="candidate__meta timecode">${formatTimecode(range.start)} · ${formatDuration(range.duration)}</span>
          <span class="candidate__chips">${renderChips(clip, review)}</span>
        </span>
        <span class="candidate__score timecode">${totalScore(clip)}</span>
      </button>
    </li>`;
}

function renderChips(clip, review) {
  const replay = clip.signals.includes('replay') ? '<span class="chip chip--replay">Replay peak</span>' : '';
  const flag = isFlagOpen(clip, review) ? `<span class="chip chip--warn">${clip.flag.label}</span>` : '';
  return `<span class="chip">${clip.hookType}</span>${replay}${flag}${DECISION_CHIPS[review.decision]}`;
}
