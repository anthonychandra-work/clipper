import { update } from './app-state.js';

const VIEWS_REACHABLE_BY_LINK = ['library', 'settings'];

export function readViewFromHash() {
  const token = location.hash.replace('#', '');
  return VIEWS_REACHABLE_BY_LINK.includes(token) ? token : 'library';
}

export function showView(view) {
  update((state) => {
    state.view = view;
  });
  if (VIEWS_REACHABLE_BY_LINK.includes(view)) location.hash = view;
  window.scrollTo(0, 0);
}

export const navigationActions = {
  navigate: ({ view }) => showView(view),
};
