import { escapeHtml } from '../escape-html.js';
import { formatLength } from '../format-timecode.js';
import { renderNewProjectForm } from './render-new-project-form.js';
import { STAGES } from './simulate-processing.js';

const STATUS_LABELS = {
  processing: 'Processing',
  ready: 'Ready to review',
  exported: 'Exported',
};

export function renderLibrary(state) {
  return `
    <div class="library">
      <section class="panel" aria-labelledby="new-project-heading">${renderNewProjectForm(state.draft)}</section>
      <section aria-labelledby="projects-heading">
        <h2 id="projects-heading" class="section-title">Projects</h2>
        <ul class="project-list">${state.projects.map((project) => renderProjectRow(project, state)).join('')}</ul>
      </section>
    </div>`;
}

function renderProjectRow(project, state) {
  const isProcessing = project.status === 'processing';
  return `
    <li class="project">
      <div class="project__main">
        <h3 class="project__title">${escapeHtml(project.title)}</h3>
        <p class="project__meta">
          <span>${project.source}</span>
          <span class="timecode">${formatLength(project.durationSeconds)}</span>
        </p>
        ${isProcessing ? renderStages(project) : `<p class="project__summary">${describeProgress(project, state)}</p>`}
      </div>
      <div class="project__side">
        <span class="pill pill--${project.status}">${STATUS_LABELS[project.status]}</span>
        ${isProcessing ? '' : renderOpenButton(project)}
      </div>
    </li>`;
}

function renderOpenButton(project) {
  return `
    <button type="button" class="button" data-action="open-project" data-project-id="${project.id}">
      Open
    </button>`;
}

function describeProgress(project, state) {
  if (project.summary) return escapeHtml(project.summary);
  const decisions = Object.values(state.reviews).map((review) => review.decision);
  const kept = decisions.filter((decision) => decision === 'keep').length;
  const rejected = decisions.filter((decision) => decision === 'reject').length;
  return `${decisions.length} candidates, ${kept} kept, ${rejected} rejected`;
}

function renderStages(project) {
  const stages = STAGES.map((stage, index) => renderStage(stage, index, project)).join('');
  return `<ol class="stages">${stages}</ol>`;
}

function renderStage(stage, index, project) {
  const status = stageStatus(index, project.stageIndex);
  const bar = `<span class="meter"><span id="stage-bar-${project.id}" style="width:${project.stagePercent}%"></span></span>`;
  return `
    <li class="stage stage--${status}">
      <span>${stage.label}</span>
      ${status === 'current' ? bar : ''}
    </li>`;
}

function stageStatus(index, currentIndex) {
  if (index < currentIndex) return 'done';
  return index === currentIndex ? 'current' : 'pending';
}
