'use client';

import { type RefObject, useEffect } from 'react';

import { useShell } from '@/shell';

import { measureShownShare } from '../lib/measure-shown-share';

const DOCK_BELOW_SHOWN_SHARE = 0.25;
const TOP_BAR = '.toolbar';

export function usePreviewDock(previewRef: RefObject<HTMLElement | null>): void {
  const { layout, reportPreviewPlace } = useShell();

  useEffect(() => {
    if (layout !== 'compact') return undefined;
    const placePreview = () => {
      const preview = previewRef.current?.getBoundingClientRect();
      const topBar = document.querySelector(TOP_BAR)?.getBoundingClientRect();
      if (preview === undefined || topBar === undefined) return;
      const shownShare = measureShownShare(preview, { top: topBar.bottom, bottom: window.innerHeight });
      reportPreviewPlace(shownShare < DOCK_BELOW_SHOWN_SHARE ? 'docked' : 'inline');
    };
    placePreview();
    window.addEventListener('scroll', placePreview, { passive: true });
    window.addEventListener('resize', placePreview);
    return () => {
      window.removeEventListener('scroll', placePreview);
      window.removeEventListener('resize', placePreview);
      reportPreviewPlace('inline');
    };
  }, [layout, previewRef, reportPreviewPlace]);
}
