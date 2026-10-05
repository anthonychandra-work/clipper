import { state, update } from './app-state.js';
import { isSidebarDocked } from './read-layout.js';

const VIEWS_REACHABLE_BY_LINK = ['library', 'settings'];

export function readViewFromHash() {
  const token = location.hash.replace('#', '');
  return VIEWS_REACHABLE_BY_LINK.includes(token) ? token : 'library';
}

export function showView(view) {
  applyView(view);
  if (VIEWS_REACHABLE_BY_LINK.includes(view)) location.hash = view;
}

export function followHashChanges() {
  window.addEventListener('hashchange', () => {
    const linkedView = readViewFromHash();
    if (linkedView !== state.view) applyView(linkedView);
  });
}

export function leaveSidebar(current) {
  if (!isSidebarDocked()) current.isSidebarOpen = false;
}

export const navigationActions = {
  navigate: ({ view }) => showView(view),
};

function applyView(view) {
  update((current) => {
    current.view = view;
    leaveSidebar(current);
  });
  window.scrollTo(0, 0);
}
