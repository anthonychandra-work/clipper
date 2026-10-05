import { escapeHtml } from '../escape-html.js';
import { isCompact } from '../read-layout.js';
import { renderIcon } from '../controls/index.js';

const SIDEBAR_TOGGLE = `
  <button type="button" class="bar-button bar-button--icon" id="sidebar-toggle" data-action="toggle-sidebar"
    aria-label="Show sidebar">${renderIcon('sidebar')}</button>`;

export function renderToolbar(state, screen) {
  const parts = isCompact() ? compactParts(screen) : regularParts(state, screen);
  return `
    <header class="toolbar">
      <div class="toolbar__leading">${parts.leading}</div>
      <div class="toolbar__centre">${parts.centre}</div>
      <div class="toolbar__trailing">${screen.actions ?? ''}</div>
    </header>`;
}

function compactParts(screen) {
  return {
    leading: screen.back ? renderBack(screen.back) : '',
    centre: renderInlineTitle(screen),
  };
}

function regularParts(state, screen) {
  return {
    leading: `${state.isSidebarOpen ? '' : SIDEBAR_TOGGLE}${renderTitles(screen)}`,
    centre: screen.centre ?? '',
  };
}

function renderBack(back) {
  return `
    <button type="button" class="bar-button bar-button--back" id="toolbar-back" data-action="${back.action}"
      data-view="${back.view ?? ''}" aria-label="Back to ${back.label}">${renderIcon('chevron-left')}${back.label}</button>`;
}

function renderInlineTitle(screen) {
  const title = escapeHtml(screen.title);
  if (!screen.hasLargeTitle) return `<h1 class="toolbar__title">${title}</h1>`;
  return `<p class="toolbar__title toolbar__title--inline" aria-hidden="true">${title}</p>`;
}

function renderTitles(screen) {
  const subtitle = screen.subtitle ? `<p class="toolbar__subtitle">${escapeHtml(screen.subtitle)}</p>` : '';
  return `
    <div class="toolbar__titles">
      <h1 class="toolbar__title">${escapeHtml(screen.title)}</h1>
      ${subtitle}
    </div>`;
}
