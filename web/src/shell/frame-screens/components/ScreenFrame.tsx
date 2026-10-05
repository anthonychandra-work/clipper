'use client';

import { type ReactNode, useLayoutEffect } from 'react';

import { useShell } from '../lib/shell-context';
import { ScreenHead } from './ScreenHead';
import { type Section, TabBar } from './TabBar';
import { BackControl, type BackLink, InlineTitle, SidebarToggle, Toolbar, ToolbarTitles } from './Toolbar';

export interface ScreenFrameProps {
  screenKey: string;
  depth: number;
  section: Section;
  title: string;
  subtitle?: string;
  titleStyle?: 'large' | 'title';
  hasLargeTitle?: boolean;
  back?: BackLink;
  centre?: ReactNode;
  actions?: ReactNode;
  bottomBar?: ReactNode;
  children: ReactNode;
}

export function ScreenFrame(props: ScreenFrameProps) {
  const { layout, announceScreen } = useShell();
  const { screenKey, depth } = props;

  useLayoutEffect(() => {
    announceScreen({ key: screenKey, depth });
  }, [announceScreen, screenKey, depth]);

  return layout === 'compact' ? <CompactScreen {...props} /> : <RegularScreen {...props} />;
}

function RegularScreen({ title, subtitle, centre, actions, children }: ScreenFrameProps) {
  const { isSidebarOpen } = useShell();
  const leading = (
    <>
      {isSidebarOpen ? null : <SidebarToggle label="Show sidebar" />}
      <ToolbarTitles title={title} subtitle={subtitle} />
    </>
  );
  return (
    <div className="main">
      <Toolbar leading={leading} centre={centre} trailing={actions} />
      <main className="screen" id="screen" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}

function CompactScreen(props: ScreenFrameProps) {
  const { title, subtitle, titleStyle, centre, back, actions, bottomBar, section, children } = props;
  const hasLargeTitle = props.hasLargeTitle ?? false;
  const head = <ScreenHead title={title} subtitle={subtitle} titleStyle={titleStyle} centre={centre} />;
  return (
    <>
      <div className="main">
        <Toolbar
          leading={back ? <BackControl back={back} /> : null}
          centre={<InlineTitle title={title} hasLargeTitle={hasLargeTitle} />}
          trailing={actions}
        />
        <main className="screen" id="screen" tabIndex={-1}>
          {hasLargeTitle ? head : null}
          {children}
        </main>
      </div>
      {bottomBar ? <div className="bottom-bar">{bottomBar}</div> : <TabBar current={section} />}
    </>
  );
}
