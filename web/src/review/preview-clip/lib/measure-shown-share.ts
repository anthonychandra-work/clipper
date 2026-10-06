export interface Span {
  top: number;
  bottom: number;
}

export function measureShownShare(box: Span, view: Span): number {
  const height = box.bottom - box.top;
  if (height <= 0) return 1;
  const shown = Math.min(box.bottom, view.bottom) - Math.max(box.top, view.top);
  return Math.max(0, shown) / height;
}
