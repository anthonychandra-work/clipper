import { escapeHtml } from '../escape-html.js';

export function renderSegmented({ name, label, action, selected, options }) {
  const segments = options.map((option) => renderSegment(option, { name, action, selected })).join('');
  return `<div class="segmented" role="group" aria-label="${escapeHtml(label)}">${segments}</div>`;
}

function renderSegment(option, { name, action, selected }) {
  const count = option.count === undefined ? '' : `<span class="segmented__count">${option.count}</span>`;
  return `
    <button type="button" class="segmented__option" id="${name}-${option.value}" data-action="${action}"
      data-value="${option.value}" aria-pressed="${option.value === selected}">${escapeHtml(option.label)}${count}</button>`;
}
