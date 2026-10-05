import { renderIcon } from '../../controls/index.js';

export const REJECT_REASONS = [
  { value: 'cut-off', label: 'Cut Off Mid-Thought' },
  { value: 'dull', label: 'Not Interesting' },
  { value: 'context', label: 'Needs Earlier Context' },
  { value: 'repeat', label: 'Repeats Another Clip' },
];

const NO_REASON = { value: '', label: 'No Reason' };

const NEXT_BUTTON = `
  <button type="button" class="bar-button" id="decision-next" data-action="select-next">
    Next${renderIcon('chevron-right')}
  </button>`;

const UNDO_ITEM = `
  <hr class="menu__divider">
  <button type="button" class="menu__item menu__item--destructive" id="reject-undo" role="menuitem"
    data-action="clear-decision">${renderIcon('checkmark')}Undo Reject</button>`;

export function renderDecisionControls(state) {
  const review = state.reviews[state.selectedClipId];
  return `${renderRejectButton(review, state.menu === 'reject')}${NEXT_BUTTON}${renderKeepButton(review)}`;
}

export function renderRejectMenu(state) {
  const review = state.reviews[state.selectedClipId];
  const reasons = REJECT_REASONS.map((reason) => renderReasonItem(reason, review)).join('');
  return `
    <div class="menu" role="menu" aria-label="Reject this clip" data-anchor="decision-reject">
      <p class="menu__title">Why? The selector uses the reason when it picks clips from your next video.</p>
      ${reasons}
      <hr class="menu__divider">
      ${renderReasonItem(NO_REASON, review)}
      ${review.decision === 'reject' ? UNDO_ITEM : ''}
    </div>`;
}

function renderRejectButton(review, isMenuOpen) {
  const isRejected = review.decision === 'reject';
  return `
    <button type="button" class="bar-button${isRejected ? ' bar-button--rejected' : ''}" id="decision-reject"
      data-action="open-menu" data-menu="reject" aria-haspopup="menu" aria-expanded="${isMenuOpen}">
      ${isRejected ? `${renderIcon('xmark')}Rejected` : 'Reject'}
    </button>`;
}

function renderKeepButton(review) {
  const isKept = review.decision === 'keep';
  return `
    <button type="button" class="bar-button ${isKept ? 'bar-button--kept' : 'bar-button--tinted'}" id="decision-keep"
      data-action="decide" data-decision="keep" aria-pressed="${isKept}">
      ${isKept ? `${renderIcon('checkmark')}Kept` : 'Keep'}
    </button>`;
}

function renderReasonItem(reason, review) {
  const isChosen = review.decision === 'reject' && (review.rejectReason ?? '') === reason.value;
  return `
    <button type="button" class="menu__item" id="reject-reason-${reason.value || 'none'}" role="menuitemradio"
      aria-checked="${isChosen}" data-action="reject-clip" data-reason="${reason.value}">
      ${renderIcon('checkmark')}${reason.label}
    </button>`;
}
