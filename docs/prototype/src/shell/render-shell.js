import { escapeHtml } from '../escape-html.js';
import { renderSidebar } from '../library/index.js';
import { isCompact, isSidebarDocked } from '../read-layout.js';
import { renderTabBar } from './render-tab-bar.js';
import { renderToolbar } from './render-toolbar.js';

const SIDEBAR_SCRIM = `
  <button type="button" class="sidebar-scrim" data-action="toggle-sidebar" tabindex="-1"
    aria-label="Hide sidebar"></button>`;

let previousScreen = null;

export function renderShell(state, screen) {
  return isCompact() ? renderCompactShell(state, screen) : renderRegularShell(state, screen);
}

export function describeShell(state, screen) {
  const enter = describeTransition(screen);
  previousScreen = { key: screen.key, depth: screen.depth };
  return { layout: isCompact() ? 'compact' : 'regular', enter };
}

function describeTransition(screen) {
  if (!previousScreen || screen.key === previousScreen.key) return 'none';
  if (screen.depth === previousScreen.depth) return 'swap';
  return screen.depth > previousScreen.depth ? 'push' : 'pop';
}

function renderRegularShell(state, screen) {
  const isOverlaid = state.isSidebarOpen && !isSidebarDocked();
  return `
    ${state.isSidebarOpen ? renderSidebar(state) : ''}
    ${isOverlaid ? SIDEBAR_SCRIM : ''}
    <div class="main">
      ${renderToolbar(state, screen)}
      <main class="screen" id="screen" tabindex="-1">${screen.body}</main>
    </div>`;
}

function renderCompactShell(state, screen) {
  const bottomBar = screen.bottomBar ? `<div class="bottom-bar">${screen.bottomBar}</div>` : renderTabBar(state.view);
  return `
    <div class="main">
      ${renderToolbar(state, screen)}
      <main class="screen" id="screen" tabindex="-1">
        ${screen.hasLargeTitle ? renderScreenHead(screen) : ''}
        ${screen.body}
      </main>
    </div>
    ${bottomBar}`;
}

function renderScreenHead(screen) {
  const size = screen.titleStyle === 'title' ? ' large-title--title' : '';
  const subtitle = screen.subtitle ? `<p class="screen-head__subtitle">${escapeHtml(screen.subtitle)}</p>` : '';
  return `
    <header class="screen-head">
      <h1 class="large-title${size}">${escapeHtml(screen.title)}</h1>
      ${subtitle}
      ${screen.centre ?? ''}
    </header>`;
}
