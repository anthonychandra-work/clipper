import { escapeHtml } from './escape-html.js';

export function renderSegmented({ label, action, selected, options }) {
  const buttons = options.map((option) => renderOption(option, { action, selected })).join('');
  return `<div class="segmented" role="group" aria-label="${escapeHtml(label)}">${buttons}</div>`;
}

function renderOption(option, { action, selected }) {
  return `
    <button type="button" class="segmented__option" data-action="${action}"
      data-value="${option.value}" aria-pressed="${option.value === selected}">
      ${escapeHtml(option.label)}
    </button>`;
}
