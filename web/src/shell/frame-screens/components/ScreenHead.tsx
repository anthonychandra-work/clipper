'use client';

import type { ReactNode } from 'react';

import { useLargeTitle } from '../hooks/use-large-title';
import { useShell } from '../lib/shell-context';

interface ScreenHeadProps {
  title: string;
  subtitle?: string;
  titleStyle?: 'large' | 'title';
  centre?: ReactNode;
}

export function ScreenHead({ title, subtitle, titleStyle, centre }: ScreenHeadProps) {
  const { reportLargeTitle } = useShell();
  const largeTitle = useLargeTitle(reportLargeTitle);
  return (
    <header className="screen-head">
      <h1 className={titleStyle === 'title' ? 'large-title large-title--title' : 'large-title'} ref={largeTitle}>
        {title}
      </h1>
      {subtitle ? <p className="screen-head__subtitle">{subtitle}</p> : null}
      {centre}
    </header>
  );
}
