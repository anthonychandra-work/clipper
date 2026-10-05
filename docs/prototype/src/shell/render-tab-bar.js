import { renderIcon } from '../controls/index.js';

const TABS = [
  { view: 'library', label: 'Library', icon: 'library', covers: ['library', 'project'] },
  { view: 'settings', label: 'Settings', icon: 'settings', covers: ['settings'] },
];

export function renderTabBar(currentView) {
  return `
    <nav class="tab-bar" aria-label="Sections">
      <div class="tab-bar__pill">${TABS.map((tab) => renderTab(tab, currentView)).join('')}</div>
    </nav>`;
}

function renderTab(tab, currentView) {
  const current = tab.covers.includes(currentView) ? 'page' : 'false';
  return `
    <button type="button" class="tab-bar__tab" id="tab-bar-${tab.view}" data-action="navigate"
      data-view="${tab.view}" aria-current="${current}">${renderIcon(tab.icon)}${tab.label}</button>`;
}
