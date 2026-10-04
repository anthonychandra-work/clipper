const NAV_ITEMS = [
  { view: 'library', label: 'Library', covers: ['library', 'project'] },
  { view: 'settings', label: 'Settings', covers: ['settings'] },
];

export function renderShell(state, content) {
  return `
    <header class="masthead">
      <button type="button" class="brand" data-action="navigate" data-view="library" aria-label="Clipper library">
        <span class="brand__bracket" aria-hidden="true">[</span>Clipper<span class="brand__bracket" aria-hidden="true">]</span>
      </button>
      <nav class="masthead__nav" aria-label="Sections">
        ${NAV_ITEMS.map((item) => renderNavItem(item, state.view)).join('')}
      </nav>
      <span class="disk-chip timecode">${state.settings.freeDiskGb} GB free on this Mac</span>
    </header>
    <p class="notice">
      Prototype with sample data. Nothing is downloaded, transcribed or rendered,
      and every project opens the same sample clips.
    </p>
    <main>${content}</main>`;
}

function renderNavItem(item, currentView) {
  const current = item.covers.includes(currentView) ? 'page' : 'false';
  return `
    <button type="button" class="masthead__link" data-action="navigate"
      data-view="${item.view}" aria-current="${current}">${item.label}</button>`;
}
