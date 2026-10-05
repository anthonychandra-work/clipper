import { state, subscribe, update } from './app-state.js';
import { rememberFocus, restoreFocus } from './keep-focus.js';
import { rememberScroll, restoreScroll } from './keep-scroll.js';
import {
  createLibraryState, libraryActions, libraryInputs, renderLibraryScreen, renderNewProjectSheet, resumeProcessing,
} from './library/index.js';
import { followHashChanges, navigationActions, readViewFromHash } from './navigate.js';
import {
  createProjectState, paintPlayhead, paintPreviewDock, projectActions, projectDrags, projectInputs,
  renderDeleteProjectSheet, renderProjectMenu, renderProjectScreen, renderRejectMenu,
} from './project/index.js';
import { isCompact, isSidebarDocked, onLayoutChange } from './read-layout.js';
import { routeEvents } from './route-events.js';
import {
  createSettingsState, renderSettingsScreen, settingsActions, settingsInputs,
} from './settings/index.js';
import {
  createShellState, describeShell, presentMenu, presentSheet, renderShell, shellActions, shellDrags,
  watchLargeTitle, watchSheet,
} from './shell/index.js';

const SCREENS = { library: renderLibraryScreen, project: renderProjectScreen, settings: renderSettingsScreen };
const SHEETS = { 'new-project': renderNewProjectSheet, 'delete-project': renderDeleteProjectSheet };
const MENUS = { reject: renderRejectMenu, project: renderProjectMenu };

const actions = { ...navigationActions, ...shellActions, ...libraryActions, ...projectActions, ...settingsActions };
const inputs = { ...libraryInputs, ...projectInputs, ...settingsInputs };
const drags = { ...shellDrags, ...projectDrags };

start();

function start() {
  Object.assign(state, createShellState(), createLibraryState(), createProjectState(), {
    view: readViewFromHash(),
    settings: createSettingsState(),
  });
  routeEvents({ actions, inputs, drags });
  window.addEventListener('scroll', paintPreviewDock, { passive: true });
  watchSheet(actions['close-sheet']);
  onLayoutChange(adaptToLayout);
  followHashChanges();
  subscribe(render);
  render();
  resumeProcessing();
}

function render() {
  const focused = rememberFocus();
  const scrolled = rememberScroll();
  const screen = SCREENS[visibleView()](state);
  const shell = describeShell(state, screen);
  const app = document.getElementById('app');
  Object.assign(app.dataset, shell);
  app.innerHTML = renderShell(state, screen);
  presentSheet(state.sheet ? SHEETS[state.sheet](state) : '', focused);
  restoreScroll(scrolled);
  restoreFocus(focused);
  presentMenu(state.menu ? MENUS[state.menu](state) : '');
  if (shell.enter !== 'none') focusScreenIfFocusWasLost();
  paintPlayhead();
  paintPreviewDock();
  watchLargeTitle();
}

function visibleView() {
  const isLibraryInSidebar = !isCompact() && state.view === 'library';
  return isLibraryInSidebar ? 'project' : state.view;
}

function focusScreenIfFocusWasLost() {
  if (document.activeElement === document.body) document.getElementById('screen').focus({ preventScroll: true });
}

function adaptToLayout() {
  update((current) => {
    current.isSidebarOpen = isSidebarDocked();
    current.menu = null;
  });
}
