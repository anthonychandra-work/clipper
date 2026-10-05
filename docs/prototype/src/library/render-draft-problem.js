import { escapeHtml } from '../escape-html.js';
import { renderIcon } from '../controls/index.js';

const PROBLEM_ID = 'draft-problem';

export function renderDraftProblem(draft, section) {
  if (draft.problem?.section !== section) return '';
  return `
    <p class="field-error" id="${PROBLEM_ID}" role="alert">
      ${renderIcon('warning')}${escapeHtml(draft.problem.message)}
    </p>`;
}

export function markInvalid(draft, section) {
  return draft.problem?.section === section ? `aria-invalid="true" aria-describedby="${PROBLEM_ID}"` : '';
}
