import { renderIcon, renderPage } from '../controls/index.js';
import { renderProjectRow } from './render-project-row.js';

const PROTOTYPE_NOTICE = 'Prototype with sample data. Nothing is downloaded, transcribed or rendered, '
  + 'and every project opens the same sample clips.';

const NEW_PROJECT_ICON_BUTTON = `
  <button type="button" class="bar-button bar-button--icon bar-button--tinted" id="new-project"
    data-action="open-sheet" data-sheet="new-project" aria-label="New Project">${renderIcon('plus')}</button>`;

const NO_PROJECTS = `
  <div class="empty">
    ${renderIcon('film')}
    <h2 class="empty__title">No Projects Yet</h2>
    <p>Paste a video link or upload a file, and Clipper finds its best clips.</p>
    <button type="button" class="button button--prominent" id="first-project" data-action="open-sheet"
      data-sheet="new-project">New Project</button>
  </div>`;

export function renderLibraryScreen(state) {
  return {
    key: 'library',
    depth: 0,
    title: 'Library',
    hasLargeTitle: true,
    actions: NEW_PROJECT_ICON_BUTTON,
    body: renderPage('library', state.projects.length > 0 ? renderProjectSection(state) : NO_PROJECTS),
  };
}

export function renderEmptyLibraryScreen() {
  return {
    key: 'library',
    depth: 0,
    title: 'Library',
    hasLargeTitle: false,
    body: renderPage('library', NO_PROJECTS),
  };
}

export function renderSidebar(state) {
  const settingsCurrent = state.view === 'settings' ? 'page' : 'false';
  return `
    <aside class="sidebar" id="sidebar" aria-label="Library">
      <header class="sidebar__head">
        <span class="sidebar__app">Clipper</span>
        <button type="button" class="bar-button bar-button--icon" id="sidebar-toggle" data-action="toggle-sidebar"
          aria-label="Hide sidebar">${renderIcon('sidebar')}</button>
      </header>
      <div class="sidebar__scroll" data-keep-scroll="sidebar">
        <button type="button" class="sidebar__new" id="new-project" data-action="open-sheet"
          data-sheet="new-project">${renderIcon('plus')}New Project</button>
        <h2 class="list-header">Projects</h2>
        <ul class="project-rows">${renderRows(state)}</ul>
        <p class="list-footer">${PROTOTYPE_NOTICE}</p>
      </div>
      <footer class="sidebar__foot">
        <button type="button" class="sidebar__link" id="sidebar-settings" data-action="navigate"
          data-view="settings" aria-current="${settingsCurrent}">${renderIcon('settings')}Settings</button>
        <p class="sidebar__disk numeric">${describeDisk(state)}</p>
      </footer>
    </aside>`;
}

function renderProjectSection(state) {
  return `
    <section class="group-section" aria-labelledby="projects-heading">
      <h2 class="list-header" id="projects-heading">Projects</h2>
      <ul class="group divided project-rows">${renderRows(state)}</ul>
      <p class="list-footer">${PROTOTYPE_NOTICE}</p>
      <p class="list-footer numeric">${describeDisk(state)}</p>
    </section>`;
}

function renderRows(state) {
  return state.projects.map((project) => renderProjectRow(project, state)).join('');
}

function describeDisk(state) {
  return `${state.settings.freeDiskGb} GB free on this Mac`;
}
