const EDGE_MARGIN = 8;
const ANCHOR_GAP = 8;

export interface AnchorBox {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface MenuSpace {
  anchor: AnchorBox;
  menuWidth: number;
  windowWidth: number;
  windowHeight: number;
}

export interface MenuPlacement {
  left: string;
  top: string;
  bottom: string;
  transformOrigin: string;
}

export function placeMenu({ anchor, menuWidth, windowWidth, windowHeight }: MenuSpace): MenuPlacement {
  const opensUpward = anchor.top > windowHeight / 2;
  const alignsRight = (anchor.left + anchor.right) / 2 > windowWidth / 2;
  const wantedLeft = alignsRight ? anchor.right - menuWidth : anchor.left;
  const furthestLeft = windowWidth - menuWidth - EDGE_MARGIN;
  return {
    left: `${Math.max(EDGE_MARGIN, Math.min(wantedLeft, furthestLeft))}px`,
    top: opensUpward ? 'auto' : `${anchor.bottom + ANCHOR_GAP}px`,
    bottom: opensUpward ? `${windowHeight - anchor.top + ANCHOR_GAP}px` : 'auto',
    transformOrigin: `${alignsRight ? 'right' : 'left'} ${opensUpward ? 'bottom' : 'top'}`,
  };
}
