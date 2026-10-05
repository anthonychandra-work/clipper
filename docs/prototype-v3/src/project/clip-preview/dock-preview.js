const DOCK_BELOW_VISIBLE_SHARE = 0.25;

export function paintPreviewDock() {
  const preview = document.querySelector('.preview');
  const isAway = Boolean(preview) && isMostlyScrolledAway(preview);
  document.getElementById('app').dataset.preview = isAway ? 'docked' : 'inline';
}

function isMostlyScrolledAway(preview) {
  const box = preview.getBoundingClientRect();
  if (box.height === 0) return false;
  const ceiling = document.querySelector('.toolbar').getBoundingClientRect().bottom;
  const visibleHeight = Math.min(box.bottom, window.innerHeight) - Math.max(box.top, ceiling);
  return visibleHeight / box.height < DOCK_BELOW_VISIBLE_SHARE;
}
