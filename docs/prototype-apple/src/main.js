import { state, subscribe, update } from './app-state.js';
import { rememberFocus, restoreFocus } from './keep-focus.js';
import { rememberScroll, restoreScroll } from './keep-scroll.js';
import {
  createLibraryState, libraryActions, libraryInputs, renderLibraryScreen, renderNewProjectSheet, resumeProcessing,
} from './library/index.js';
import { navigationActions, readViewFromHash } from './navigate.js';
import {
  createProjectState, paintPlayhead, projectActions, projectDrags, projectInputs, renderProjectScreen,
  renderRejectMenu,
} from './project/index.js';
import { isCompact, isSidebarDocked, onLayoutChange } from './read-layout.js';
import {
  createSettingsState, renderSettingsScreen, settingsActions, settingsInputs,
} from './render-settings.js';
import {
  createShellState, describeShell, moveMenuFocus, presentMenu, presentSheet, renderShell, shellActions,
  shellDrags, watchLargeTitle, watchSheet,
} from './shell/index.js';

const SCREENS = { library: renderLibraryScreen, project: renderProjectScreen, settings: renderSettingsScreen };
const SHEETS = { 'new-project': renderNewProjectSheet };
const MENUS = { reject: renderRejectMenu };
const ARROW_STEPS = { ArrowLeft: -1, ArrowRight: 1 };

const actions = { ...navigationActions, ...shellActions, ...libraryActions, ...projectActions, ...settingsActions };
const inputs = { ...libraryInputs, ...projectInputs, ...settingsInputs };
const drags = { ...shellDrags, ...projectDrags };

start();

function start() {
  Object.assign(state, createShellState(), createLibraryState(), createProjectState(), {
    view: readViewFromHash(),
    settings: createSettingsState(),
  });
  document.addEventListener('click', runAction);
  document.addEventListener('input', runInput);
  document.addEventListener('submit', runSubmit);
  document.addEventListener('pointerdown', runDrag);
  document.addEventListener('keydown', runKey);
  window.addEventListener('resize', dismissMenu);
  watchSheet(actions['close-sheet']);
  onLayoutChange(adaptToLayout);
  subscribe(render);
  render();
  resumeProcessing();
}

function render() {
  const focused = rememberFocus();
  const scrolled = rememberScroll();
  const screen = SCREENS[visibleView()](state);
  const app = document.getElementById('app');
  Object.assign(app.dataset, describeShell(state, screen));
  app.innerHTML = renderShell(state, screen);
  presentSheet(state.sheet ? SHEETS[state.sheet](state) : '', focused);
  restoreScroll(scrolled);
  restoreFocus(focused);
  presentMenu(state.menu ? MENUS[state.menu](state) : '');
  paintPlayhead();
  watchLargeTitle();
}

function visibleView() {
  const isLibraryInSidebar = !isCompact() && state.view === 'library';
  return isLibraryInSidebar ? 'project' : state.view;
}

function runAction(event) {
  const trigger = event.target.closest('[data-action]');
  if (state.menu && !event.target.closest('#menu, [data-menu]')) dismissMenu();
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

function runDrag(event) {
  const handle = event.target.closest('[data-drag]');
  if (handle) drags[handle.dataset.drag](event, handle);
}

function runKey(event) {
  if (event.key === 'Escape') return dismissMenu();
  if (event.target.closest('[role="menu"]')) return moveMenuFocus(event);
  const step = ARROW_STEPS[event.key];
  const stepper = step && event.target.closest('[data-step-action]');
  if (!stepper) return;
  event.preventDefault();
  actions[stepper.dataset.stepAction]({ ...stepper.dataset, step });
}

function dismissMenu() {
  if (state.menu) actions['close-menu']();
}

function adaptToLayout() {
  update((current) => {
    current.isSidebarOpen = isSidebarDocked();
    current.menu = null;
  });
}
