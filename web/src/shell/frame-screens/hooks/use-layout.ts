'use client';

import { useSyncExternalStore } from 'react';

import type { ShellLayout } from '../lib/shell-context';

const COMPACT_WIDTH = '(max-width: 719px)';
const DOCKED_SIDEBAR_WIDTH = '(min-width: 1000px)';

export function useLayout(): ShellLayout | null {
  return useSyncExternalStore(watchWidth, readLayout, readUnknownLayout);
}

function watchWidth(onChange: () => void): () => void {
  const widths = [window.matchMedia(COMPACT_WIDTH), window.matchMedia(DOCKED_SIDEBAR_WIDTH)];
  widths.forEach((width) => width.addEventListener('change', onChange));
  return () => widths.forEach((width) => width.removeEventListener('change', onChange));
}

function readLayout(): ShellLayout {
  if (window.matchMedia(COMPACT_WIDTH).matches) return 'compact';
  return window.matchMedia(DOCKED_SIDEBAR_WIDTH).matches ? 'docked' : 'overlaid';
}

function readUnknownLayout(): null {
  return null;
}
