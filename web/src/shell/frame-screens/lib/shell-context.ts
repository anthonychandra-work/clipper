'use client';

import { createContext, useContext } from 'react';

import type { ScreenPlace } from './describe-transition';

export type ShellLayout = 'compact' | 'overlaid' | 'docked';
export type LargeTitleState = 'visible' | 'scrolled' | 'none';

export interface Shell {
  layout: ShellLayout;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  announceScreen: (screen: ScreenPlace) => void;
  reportLargeTitle: (state: LargeTitleState) => void;
  sheetElement: HTMLDialogElement | null;
  menuLayer: HTMLDivElement | null;
}

export const ShellContext = createContext<Shell | null>(null);

export function useShell(): Shell {
  const shell = useContext(ShellContext);
  if (shell === null) throw new Error('This component must be rendered inside the app shell.');
  return shell;
}
