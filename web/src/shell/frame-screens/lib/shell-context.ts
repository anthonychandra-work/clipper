'use client';

import { createContext, useContext } from 'react';

import type { ScreenPlace } from './describe-transition';

export type ShellLayout = 'compact' | 'overlaid' | 'docked';
export type LargeTitleState = 'visible' | 'scrolled' | 'none';
export type PreviewPlace = 'inline' | 'docked';

export interface Shell {
  layout: ShellLayout;
  previousAddress: string | null;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  announceScreen: (screen: ScreenPlace) => void;
  reportLargeTitle: (state: LargeTitleState) => void;
  reportPreviewPlace: (place: PreviewPlace) => void;
  sheetElement: HTMLDialogElement | null;
  menuLayer: HTMLDivElement | null;
  readOpenerId: () => string | null;
}

export const ShellContext = createContext<Shell | null>(null);

export function useShell(): Shell {
  const shell = useContext(ShellContext);
  if (shell === null) throw new Error('This component must be rendered inside the app shell.');
  return shell;
}
