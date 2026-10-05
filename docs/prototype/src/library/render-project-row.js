import { escapeHtml } from '../escape-html.js';
import { formatLength } from '../format-timecode.js';
import { isCompact } from '../read-layout.js';
import { renderIcon } from '../controls/index.js';
import { isInPipeline, renderProcessingStatus } from './render-processing.js';

const STATUS_LABELS = {
  ready: 'Ready to review',
  exported: 'Exported',
};

export function renderProjectRow(project, state) {
  const isSelected = !isCompact() && state.view !== 'settings' && project.id === state.openProjectId;
  return `
    <li>
      <button type="button" class="project-row" id="project-${project.id}" data-action="open-project"
        data-project-id="${project.id}" aria-current="${isSelected}">
        <span class="project-row__text">
          <span class="project-row__title">${escapeHtml(project.title)}</span>
          <span class="project-row__meta numeric">${project.source} · ${formatLength(project.durationSeconds)}</span>
          ${isInPipeline(project) ? renderProcessingStatus(project) : renderStatus(project, state)}
        </span>
        ${renderIcon('chevron-right')}
      </button>
    </li>`;
}

function renderStatus(project, state) {
  const symbol = project.status === 'exported' ? renderIcon('checkmark') : '';
  return `
    <span class="project-row__status project-row__status--${project.status}">
      ${symbol}<span>${STATUS_LABELS[project.status]} · ${describeProgress(project, state)}</span>
    </span>`;
}

function describeProgress(project, state) {
  if (project.summary) return escapeHtml(project.summary);
  const decisions = Object.values(state.reviews).map((review) => review.decision);
  const kept = decisions.filter((decision) => decision === 'keep').length;
  const rejected = decisions.filter((decision) => decision === 'reject').length;
  return `${decisions.length} candidates, ${kept} kept, ${rejected} rejected`;
}
