const BAR_CLEARANCE = '-60px 0px 0px 0px';

const observer = new IntersectionObserver(showInlineTitleWhenHidden, { rootMargin: BAR_CLEARANCE });

export function watchLargeTitle() {
  observer.disconnect();
  const title = document.querySelector('.large-title');
  if (title) return observer.observe(title);
  document.getElementById('app').dataset.largeTitle = 'none';
}

function showInlineTitleWhenHidden(entries) {
  const latest = entries[entries.length - 1];
  document.getElementById('app').dataset.largeTitle = latest.isIntersecting ? 'visible' : 'scrolled';
}
