'use client';

import { useEffect, useState } from 'react';

import type { ShellLayout } from '../lib/shell-context';

interface SidebarState {
  layout: ShellLayout;
  pathname: string;
  isOpen: boolean;
}

export interface Sidebar {
  isOpen: boolean;
  isOverlaid: boolean;
  toggle: () => void;
}

export function useSidebar(layout: ShellLayout, pathname: string): Sidebar {
  const [sidebar, setSidebar] = useState<SidebarState>({ layout, pathname, isOpen: layout === 'docked' });
  if (sidebar.layout !== layout) {
    setSidebar({ layout, pathname, isOpen: layout === 'docked' });
  } else if (sidebar.pathname !== pathname) {
    setSidebar({ layout, pathname, isOpen: layout === 'docked' && sidebar.isOpen });
  }
  const isOverlaid = sidebar.isOpen && layout === 'overlaid';
  const toggle = () => setSidebar((current) => ({ ...current, isOpen: !current.isOpen }));

  useEffect(() => {
    if (!isOverlaid) return undefined;
    const closeOnEscape = (event: KeyboardEvent) => {
      const isSheetOpen = document.querySelector('dialog[open]') !== null;
      if (event.key === 'Escape' && !isSheetOpen) setSidebar((current) => ({ ...current, isOpen: false }));
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isOverlaid]);

  return { isOpen: sidebar.isOpen && layout !== 'compact', isOverlaid, toggle };
}
