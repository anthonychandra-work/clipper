'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

import { Icon } from '@/shared/ui';

import { useShell } from '../lib/shell-context';

export interface BackLink {
  label: string;
  href: string;
}

interface ToolbarProps {
  leading: ReactNode;
  centre: ReactNode;
  trailing: ReactNode;
}

export function Toolbar({ leading, centre, trailing }: ToolbarProps) {
  return (
    <header className="toolbar">
      <div className="toolbar__leading">{leading}</div>
      <div className="toolbar__centre">{centre}</div>
      <div className="toolbar__trailing">{trailing}</div>
    </header>
  );
}

export function ToolbarTitles({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="toolbar__titles">
      <h1 className="toolbar__title">{title}</h1>
      {subtitle ? <p className="toolbar__subtitle">{subtitle}</p> : null}
    </div>
  );
}

export function InlineTitle({ title, hasLargeTitle }: { title: string; hasLargeTitle: boolean }) {
  if (!hasLargeTitle) return <h1 className="toolbar__title">{title}</h1>;
  return (
    <p className="toolbar__title toolbar__title--inline" aria-hidden="true">
      {title}
    </p>
  );
}

export function BackControl({ back }: { back: BackLink }) {
  return (
    <Link
      className="bar-button bar-button--back"
      id="toolbar-back"
      href={back.href}
      aria-label={`Back to ${back.label}`}
    >
      <Icon name="chevron-left" />
      {back.label}
    </Link>
  );
}

export function SidebarToggle({ label }: { label: 'Show sidebar' | 'Hide sidebar' }) {
  const { toggleSidebar } = useShell();
  return (
    <button
      type="button"
      className="bar-button bar-button--icon"
      id="sidebar-toggle"
      aria-label={label}
      onClick={toggleSidebar}
    >
      <Icon name="sidebar" />
    </button>
  );
}
