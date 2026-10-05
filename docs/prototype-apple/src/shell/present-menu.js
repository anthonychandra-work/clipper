const EDGE_MARGIN = 8;
const ANCHOR_GAP = 8;
const FOCUS_STEPS = { ArrowDown: 1, ArrowUp: -1 };

let shownHtml = '';
let anchorId = null;

export function presentMenu(html) {
  const layer = document.getElementById('menu');
  if (html !== shownHtml) layer.innerHTML = html;
  shownHtml = html;
  layer.hidden = !html;
  if (html) return openMenu(layer);
  closeMenu();
}

export function moveMenuFocus(event) {
  const step = FOCUS_STEPS[event.key];
  if (!step) return;
  event.preventDefault();
  const items = [...document.querySelectorAll('#menu [role^="menuitem"]')];
  const next = (items.indexOf(document.activeElement) + step + items.length) % items.length;
  items[next].focus();
}

function openMenu(layer) {
  const isNewlyOpen = anchorId === null;
  anchorId = layer.firstElementChild.dataset.anchor;
  placeBeside(layer, document.getElementById(anchorId).getBoundingClientRect());
  if (isNewlyOpen) firstChoice(layer).focus();
}

function firstChoice(layer) {
  return layer.querySelector('[aria-checked="true"]') ?? layer.querySelector('[role^="menuitem"]');
}

function closeMenu() {
  if (anchorId === null) return;
  document.getElementById(anchorId)?.focus();
  anchorId = null;
}

function placeBeside(layer, anchor) {
  const opensUpward = anchor.top > window.innerHeight / 2;
  const alignsRight = anchor.left + anchor.width / 2 > window.innerWidth / 2;
  const left = alignsRight ? anchor.right - layer.offsetWidth : anchor.left;
  const furthestLeft = window.innerWidth - layer.offsetWidth - EDGE_MARGIN;
  layer.style.left = `${Math.max(EDGE_MARGIN, Math.min(left, furthestLeft))}px`;
  layer.style.top = opensUpward ? 'auto' : `${anchor.bottom + ANCHOR_GAP}px`;
  layer.style.bottom = opensUpward ? `${window.innerHeight - anchor.top + ANCHOR_GAP}px` : 'auto';
}
