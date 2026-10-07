'use client';

import { type RefObject, useLayoutEffect, useRef } from 'react';

import type { LargeTitleState } from '../lib/shell-context';

const BAR_CLEARANCE = '-60px 0px 0px 0px';

export function useLargeTitle(report: (state: LargeTitleState) => void): RefObject<HTMLHeadingElement | null> {
  const title = useRef<HTMLHeadingElement | null>(null);

  useLayoutEffect(() => {
    if (title.current === null) return undefined;
    const observer = new IntersectionObserver(
      (entries) => report(entries[entries.length - 1].isIntersecting ? 'visible' : 'scrolled'),
      { rootMargin: BAR_CLEARANCE },
    );
    report('visible');
    observer.observe(title.current);
    return () => {
      observer.disconnect();
      report('none');
    };
  }, [report]);

  return title;
}
