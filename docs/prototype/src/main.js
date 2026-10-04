import { state, subscribe } from './app-state.js';
import { rememberFocus, restoreFocus } from './keep-focus.js';
import {
  createLibraryState, libraryActions, libraryInputs, renderLibrary, resumeProcessing,
} from './library/index.js';
import { navigationActions, readViewFromHash } from './navigate.js';
import {
  createProjectState, paintPlayhead, projectActions, projectInputs, renderProject,
} from './project/index.js';
import {
  createSettingsState, renderSettings, settingsActions, settingsInputs,
} from './render-settings.js';
import { renderShell } from './render-shell.js';

const VIEWS = { library: renderLibrary, project: renderProject, settings: renderSettings };
const actions = { ...navigationActions, ...libraryActions, ...projectActions, ...settingsActions };
const inputs = { ...libraryInputs, ...projectInputs, ...settingsInputs };

start();

function start() {
  Object.assign(state, createLibraryState(), createProjectState(), {
    view: readViewFromHash(),
    settings: createSettingsState(),
  });
  document.addEventListener('click', runAction);
  document.addEventListener('input', runInput);
  document.addEventListener('submit', runSubmit);
  subscribe(render);
  render();
  resumeProcessing();
}

function render() {
  const focused = rememberFocus();
  document.getElementById('app').innerHTML = renderShell(state, VIEWS[state.view](state));
  restoreFocus(focused);
  paintPlayhead();
}

function runAction(event) {
  const trigger = event.target.closest('[data-action]');
  if (trigger && !trigger.disabled) actions[trigger.dataset.action](trigger.dataset);
}

function runInput(event) {
  const field = event.target.closest('[data-input]');
  if (field) inputs[field.dataset.input](field);
}

function runSubmit(event) {
  event.preventDefault();
  actions[event.target.dataset.submit](event.target.dataset);
}
