'use client';

import { usePathname } from 'next/navigation';
import { type ReactNode, useState } from 'react';

import { ToastHost } from '../../show-toast';
import { useLayout } from '../hooks/use-layout';
import { useOpenerMemory } from '../hooks/use-opener-memory';
import { usePreviousAddress } from '../hooks/use-previous-address';
import { useScreenTransition } from '../hooks/use-screen-transition';
import { useSidebar } from '../hooks/use-sidebar';
import { type LargeTitleState, type Shell, ShellContext, type ShellLayout } from '../lib/shell-context';
import { SidebarFrame } from './SidebarFrame';

interface AppShellProps {
  sidebar: ReactNode;
  sidebarFoot: ReactNode;
  children: ReactNode;
}

interface Overlays {
  sheetElement: HTMLDialogElement | null;
  menuLayer: HTMLDivElement | null;
  readOpenerId: () => string | null;
}

export function AppShell(props: AppShellProps) {
  const layout = useLayout();
  const readOpenerId = useOpenerMemory();
  const [sheetElement, setSheetElement] = useState<HTMLDialogElement | null>(null);
  const [menuLayer, setMenuLayer] = useState<HTMLDivElement | null>(null);
  return (
    <>
      {layout === null ? (
        <LoadingApp />
      ) : (
        <FramedApp layout={layout} overlays={{ sheetElement, menuLayer, readOpenerId }} {...props} />
      )}
      <dialog id="sheet" className="sheet" aria-labelledby="sheet-title" ref={setSheetElement} />
      <div id="menu" className="menu-layer" hidden ref={setMenuLayer} />
      <ToastHost />
    </>
  );
}

function LoadingApp() {
  return (
    <div id="app" className="app">
      <p className="loading">Loading Clipper…</p>
    </div>
  );
}

function FramedApp(props: AppShellProps & { layout: ShellLayout; overlays: Overlays }) {
  const { layout, overlays, sidebar, sidebarFoot, children } = props;
  const pathname = usePathname();
  const previousAddress = usePreviousAddress(pathname);
  const { isOpen, isOverlaid, toggle } = useSidebar(layout, pathname);
  const { enter, announceScreen } = useScreenTransition();
  const [largeTitle, reportLargeTitle] = useState<LargeTitleState>('none');
  const shell: Shell = {
    layout,
    previousAddress,
    isSidebarOpen: isOpen,
    toggleSidebar: toggle,
    announceScreen,
    reportLargeTitle,
    ...overlays,
  };
  return (
    <ShellContext value={shell}>
      <div
        id="app"
        className="app"
        data-layout={layout === 'compact' ? 'compact' : 'regular'}
        data-enter={enter}
        data-large-title={largeTitle}
      >
        {isOpen ? <SidebarFrame foot={sidebarFoot}>{sidebar}</SidebarFrame> : null}
        {isOverlaid ? <SidebarScrim onDismiss={toggle} /> : null}
        {children}
      </div>
    </ShellContext>
  );
}

function SidebarScrim({ onDismiss }: { onDismiss: () => void }) {
  return (
    <button
      type="button"
      className="sidebar-scrim"
      tabIndex={-1}
      aria-label="Hide sidebar"
      onClick={onDismiss}
    />
  );
}
