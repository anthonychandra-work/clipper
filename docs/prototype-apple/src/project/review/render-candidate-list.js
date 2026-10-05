import { escapeHtml } from '../../escape-html.js';
import { formatDuration, formatTimecode } from '../../format-timecode.js';
import { renderIcon, renderSegmented } from '../../controls/index.js';
import { isFlagOpen, rankOf, totalScore, visibleClips } from '../clip-review.js';
import { clipRange } from '../clip-timing.js';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'undecided', label: 'To Do' },
  { value: 'keep', label: 'Kept' },
  { value: 'reject', label: 'Rejected' },
];

const DECISION_TAGS = {
  undecided: '',
  keep: `<span class="tag tag--keep">${renderIcon('checkmark')}Kept</span>`,
  reject: `<span class="tag tag--reject">${renderIcon('xmark')}Rejected</span>`,
};

const REPLAY_TAG = `<span class="tag">${renderIcon('replay')}Replay peak</span>`;
const EMPTY_ROW = '<li class="candidate-list__empty">No clips in this group.</li>';

export function renderCandidateList(state) {
  const rows = visibleClips(state).map((clip) => renderCandidate(clip, state)).join('');
  const filter = renderSegmented({
    name: 'filter', label: 'Show', action: 'set-filter', selected: state.filter, options: countFilters(state),
  });
  return `
    <section class="group-section" aria-labelledby="candidates-heading">
      <h2 class="list-header" id="candidates-heading">Candidates</h2>
      ${filter}
      <ol class="group divided">${rows || EMPTY_ROW}</ol>
    </section>`;
}

function countFilters(state) {
  const decisions = Object.values(state.reviews).map((review) => review.decision);
  return FILTERS.map((filter) => {
    const matching = decisions.filter((decision) => filter.value === 'all' || decision === filter.value);
    return { ...filter, count: matching.length };
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
        <span class="candidate__rank numeric">${String(rankOf(clip, state.clips)).padStart(2, '0')}</span>
        <span class="candidate__body">
          <span class="candidate__title">${escapeHtml(review.title)}</span>
          <span class="candidate__meta numeric">${formatTimecode(range.start)} · ${formatDuration(range.duration)}</span>
          <span class="candidate__tags">${renderTags(clip, review)}</span>
        </span>
        <span class="candidate__score numeric">${totalScore(clip)}</span>
        ${renderIcon('chevron-right')}
      </button>
    </li>`;
}

function renderTags(clip, review) {
  const replay = clip.signals.includes('replay') ? REPLAY_TAG : '';
  const flag = isFlagOpen(clip, review)
    ? `<span class="tag tag--warn">${renderIcon('warning')}${clip.flag.label}</span>`
    : '';
  return `<span class="tag">${clip.hookType}</span>${replay}${flag}${DECISION_TAGS[review.decision]}`;
}
