const COMPACT_WIDTH = window.matchMedia('(max-width: 719px)');
const DOCKED_SIDEBAR_WIDTH = window.matchMedia('(min-width: 1000px)');

export function isCompact() {
  return COMPACT_WIDTH.matches;
}

export function isSidebarDocked() {
  return DOCKED_SIDEBAR_WIDTH.matches;
}

export function onLayoutChange(listener) {
  COMPACT_WIDTH.addEventListener('change', listener);
  DOCKED_SIDEBAR_WIDTH.addEventListener('change', listener);
}
