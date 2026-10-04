import { update } from '../app-state.js';
import { escapeHtml } from '../escape-html.js';
import { formatTimecode } from '../format-timecode.js';
import { keptClips } from './clip-review.js';
import { renderExport } from './export/index.js';
import { renderResults } from './render-results.js';
import { renderReview } from './review/index.js';

const TABS = [
  { value: 'review', label: 'Review', render: renderReview },
  { value: 'export', label: 'Export', render: renderExport },
  { value: 'results', label: 'Results', render: renderResults },
];

export const tabActions = {
  'set-tab': ({ value }) => update((state) => {
    state.tab = value;
  }),
};

export function renderProject(state) {
  const project = state.projects.find((candidate) => candidate.id === state.openProjectId);
  const openTab = TABS.find((tab) => tab.value === state.tab);
  return `
    <div class="project-head">
      <button type="button" class="button button--quiet" data-action="navigate" data-view="library">
        ‹ Library
      </button>
      <div class="project-head__title">
        <h1>${escapeHtml(project.title)}</h1>
        <p class="project__meta">
          <span>${project.source}</span>
          <span class="timecode">${formatTimecode(project.durationSeconds)}</span>
          <span>${state.clips.length} candidates</span>
        </p>
      </div>
    </div>
    <nav class="tabs" aria-label="Project steps">${TABS.map((tab) => renderTab(tab, state)).join('')}</nav>
    ${openTab.render(state)}`;
}

function renderTab(tab, state) {
  const keptCount = tab.value === 'export' ? ` (${keptClips(state).length})` : '';
  return `
    <button type="button" class="tab" id="tab-${tab.value}" data-action="set-tab" data-value="${tab.value}"
      aria-current="${tab.value === state.tab ? 'page' : 'false'}">${tab.label}${keptCount}</button>`;
}
