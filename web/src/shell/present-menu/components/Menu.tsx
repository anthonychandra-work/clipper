'use client';

import { type ReactNode, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

import { useShell } from '../../frame-screens';
import { useMenuKeys } from '../hooks/use-menu-keys';
import { placeMenu } from '../lib/place-menu';

interface MenuProps {
  label: string;
  anchorId: string;
  onClose: () => void;
  children: ReactNode;
}

interface MenuItemProps {
  id: string;
  isDestructive?: boolean;
  onSelect: () => void;
  children: ReactNode;
}

export function Menu({ label, anchorId, onClose, children }: MenuProps) {
  const { menuLayer } = useShell();
  useMenuKeys(menuLayer, anchorId, onClose);

  useLayoutEffect(() => {
    const anchor = document.getElementById(anchorId);
    if (menuLayer === null || anchor === null) return undefined;
    showBeside(menuLayer, anchor);
    return () => {
      menuLayer.hidden = true;
      anchor.focus();
    };
  }, [menuLayer, anchorId]);

  if (menuLayer === null) return null;
  return createPortal(
    <div className="menu" role="menu" aria-label={label} data-anchor={anchorId}>
      {children}
    </div>,
    menuLayer,
  );
}

export function MenuItem({ id, isDestructive, onSelect, children }: MenuItemProps) {
  return (
    <button
      type="button"
      className={isDestructive ? 'menu__item menu__item--destructive' : 'menu__item'}
      id={id}
      role="menuitem"
      onClick={onSelect}
    >
      {children}
    </button>
  );
}

function showBeside(layer: HTMLDivElement, anchor: HTMLElement): void {
  layer.hidden = false;
  const placement = placeMenu({
    anchor: anchor.getBoundingClientRect(),
    menuWidth: layer.offsetWidth,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
  });
  Object.assign(layer.style, placement);
  const firstChoice = layer.querySelector<HTMLElement>('[aria-checked="true"], [role^="menuitem"]');
  firstChoice?.focus();
}
