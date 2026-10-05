import { formatLength } from '../format-timecode.js';
import { renderPage, renderProgress } from '../controls/index.js';
import { STAGES, overallPercent } from './simulate-processing.js';

export function renderProcessingStatus(project) {
  return `
    ${renderStageProgress(project)}
    <span class="project-row__status">${STAGES[project.stageIndex].label}</span>`;
}

export function renderProcessingScreen(project) {
  return {
    key: 'project',
    depth: 1,
    title: project.title,
    subtitle: `${project.source} · ${formatLength(project.durationSeconds)}`,
    titleStyle: 'title',
    hasLargeTitle: true,
    back: { label: 'Library', action: 'navigate', view: 'library' },
    body: renderPage('processing', renderStatusCard(project)),
  };
}

function renderStatusCard(project) {
  return `
    <section class="status-card" aria-label="Processing">
      <h2 class="status-card__title">Finding Clips</h2>
      ${renderStageProgress(project)}
      <p class="status-card__stage">${STAGES[project.stageIndex].label}</p>
      <p class="list-footer">
        Step ${project.stageIndex + 1} of ${STAGES.length}. The clips appear here when it finishes.
      </p>
    </section>`;
}

function renderStageProgress(project) {
  return renderProgress({
    name: `processing-${project.id}`,
    percent: overallPercent(project),
    label: 'Processing',
  });
}
