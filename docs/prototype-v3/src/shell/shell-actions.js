import { update } from '../app-state.js';
import { isSidebarDocked } from '../read-layout.js';

export const shellActions = {
  'toggle-sidebar': () => update((state) => {
    state.isSidebarOpen = !state.isSidebarOpen;
  }),
  'open-sheet': ({ sheet }) => update((state) => {
    state.sheet = sheet;
  }),
  'close-sheet': () => update((state) => {
    state.sheet = null;
  }),
  'open-menu': ({ menu }) => update((state) => {
    state.menu = state.menu === menu ? null : menu;
  }),
  'close-menu': () => update((state) => {
    state.menu = null;
  }),
};

export function createShellState() {
  return { isSidebarOpen: isSidebarDocked(), sheet: null, menu: null };
}
