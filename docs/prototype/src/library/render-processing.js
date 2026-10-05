import { escapeHtml } from '../escape-html.js';
import { formatLength } from '../format-timecode.js';
import { renderIcon, renderPage, renderProgress } from '../controls/index.js';
import { currentStage, overallPercent } from './simulate-processing.js';

const FINISHED_STATUSES = ['ready', 'exported'];

const HEADINGS = {
  uploading: 'Uploading Video',
  processing: 'Finding Clips',
  queued: 'Waiting in Queue',
  failed: 'Could Not Finish',
  stopped: 'Stopped',
};

const ROW_NOTES = {
  queued: 'Waiting in queue',
  failed: `${renderIcon('warning')}Could not finish`,
  stopped: 'Stopped',
};

const OPEN_SETTINGS = `
  <button type="button" class="button" id="halt-settings" data-action="navigate" data-view="settings">
    Open Settings
  </button>`;

export function isInPipeline(project) {
  return !FINISHED_STATUSES.includes(project.status);
}

export function renderProcessingStatus(project) {
  const note = ROW_NOTES[project.status];
  if (note) return `<span class="project-row__status project-row__status--${project.status}">${note}</span>`;
  return `
    ${renderStageProgress(project)}
    <span class="project-row__status">${currentStage(project).label}</span>`;
}

export function renderProcessingScreen(project, state) {
  return {
    key: 'project',
    depth: 1,
    title: project.title,
    subtitle: `${project.source} · ${formatLength(project.durationSeconds)}`,
    titleStyle: 'title',
    hasLargeTitle: true,
    back: { label: 'Library', action: 'navigate', view: 'library' },
    body: renderPage('processing', `
      <section class="status-card" aria-label="${HEADINGS[project.status]}">
        ${project.halt ? renderIcon('warning') : ''}
        <h2 class="status-card__title">${HEADINGS[project.status]}</h2>
        ${renderCardBody(project, state)}
      </section>`),
  };
}

function renderCardBody(project, state) {
  if (project.halt) return renderHalt(project);
  if (project.status === 'queued') return renderQueueNote(state);
  const stageCount = project.stages.length;
  const isUploading = project.status === 'uploading';
  return `
    ${renderStageProgress(project)}
    <p class="status-card__stage">${currentStage(project).label}</p>
    <p class="list-footer">
      Step ${project.stageIndex + 1} of ${stageCount}.
      ${isUploading ? 'Keep this page open until the upload finishes.' : 'The clips appear here when it finishes.'}
    </p>
    ${isUploading ? '' : renderHaltButton(project, { action: 'stop-project', label: 'Stop' })}`;
}

function renderQueueNote(state) {
  const active = state.projects.find((project) => project.status === 'processing');
  const wait = active ? `It starts when “${escapeHtml(active.title)}” finishes.` : 'It starts in a moment.';
  return `<p class="status-card__stage">${wait}</p><p class="list-footer">One video is processed at a time.</p>`;
}

function renderHalt(project) {
  const retry = project.status === 'stopped' ? 'Resume' : 'Retry';
  return `
    <p class="status-card__stage">${escapeHtml(project.halt.reason)}</p>
    <div class="status-card__actions">
      ${renderHaltButton(project, { action: 'retry-project', label: retry, isProminent: true })}
      ${project.halt.opensSettings ? OPEN_SETTINGS : ''}
    </div>`;
}

function renderHaltButton(project, { action, label, isProminent }) {
  return `
    <button type="button" class="button${isProminent ? ' button--prominent' : ''}" id="${action}"
      data-action="${action}" data-project-id="${project.id}">${label}</button>`;
}

function renderStageProgress(project) {
  return renderProgress({
    name: `processing-${project.id}`,
    percent: overallPercent(project),
    label: currentStage(project).label,
  });
}
