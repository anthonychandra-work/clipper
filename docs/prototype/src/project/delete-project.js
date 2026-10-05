import { update } from '../app-state.js';
import { escapeHtml } from '../escape-html.js';
import { renderIcon } from '../controls/index.js';
import { findOpenProject } from '../library/index.js';
import { showToast } from '../show-toast.js';

export const deleteActions = {
  'ask-delete-project': () => update((current) => {
    current.menu = null;
    current.sheet = 'delete-project';
  }),
  'delete-project': () => deleteOpenProject(),
};

export function renderProjectMoreButton(state) {
  return `
    <button type="button" class="bar-button bar-button--icon" id="project-more" data-action="open-menu"
      data-menu="project" aria-haspopup="menu" aria-expanded="${state.menu === 'project'}"
      aria-label="More">${renderIcon('ellipsis')}</button>`;
}

export function renderProjectMenu() {
  return `
    <div class="menu" role="menu" aria-label="Project" data-anchor="project-more">
      <button type="button" class="menu__item menu__item--destructive" id="project-delete" role="menuitem"
        data-action="ask-delete-project">Delete Project…</button>
    </div>`;
}

export function renderDeleteProjectSheet(state) {
  return `
    <div class="alert">
      <h2 class="alert__title" id="sheet-title">Delete “${escapeHtml(findOpenProject(state).title)}”?</h2>
      <p class="alert__message">
        This removes the video, its clips and its exports from this Mac. It cannot be undone.
      </p>
      <div class="alert__actions">
        <button type="button" class="button" id="delete-cancel" data-action="close-sheet">Cancel</button>
        <button type="button" class="button button--destructive" id="delete-confirm"
          data-action="delete-project">Delete</button>
      </div>
    </div>`;
}

function deleteOpenProject() {
  update((current) => {
    current.projects = current.projects.filter((project) => project.id !== current.openProjectId);
    current.openProjectId = current.projects[0]?.id ?? null;
    current.sheet = null;
    current.view = 'library';
    current.tab = 'review';
    current.isDetailOpen = false;
  });
  showToast('Project deleted');
}
