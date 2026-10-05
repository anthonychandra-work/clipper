'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { Icon } from '@/shared/ui';

import { SidebarToggle } from './Toolbar';

const NEW_PROJECT_ADDRESS = '/new';
const SETTINGS_ADDRESS = '/settings';

interface SidebarFrameProps {
  foot: ReactNode;
  children: ReactNode;
}

export function SidebarFrame({ foot, children }: SidebarFrameProps) {
  const isOnSettings = usePathname() === SETTINGS_ADDRESS;
  return (
    <aside className="sidebar" id="sidebar" aria-label="Library">
      <header className="sidebar__head">
        <span className="sidebar__app">Clipper</span>
        <SidebarToggle label="Hide sidebar" />
      </header>
      <div className="sidebar__scroll" data-keep-scroll="sidebar">
        <Link className="sidebar__new" id="new-project" href={NEW_PROJECT_ADDRESS}>
          <Icon name="plus" />
          New Project
        </Link>
        {children}
      </div>
      <footer className="sidebar__foot">
        <Link
          className="sidebar__link"
          id="sidebar-settings"
          href={SETTINGS_ADDRESS}
          aria-current={isOnSettings ? 'page' : 'false'}
        >
          <Icon name="settings" />
          Settings
        </Link>
        {foot}
      </footer>
    </aside>
  );
}
