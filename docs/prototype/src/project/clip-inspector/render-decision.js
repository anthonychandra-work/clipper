export const REJECT_REASONS = [
  { value: 'cut-off', label: 'Cut off mid-thought' },
  { value: 'dull', label: 'Not interesting' },
  { value: 'context', label: 'Needs earlier context' },
  { value: 'repeat', label: 'Repeats another clip' },
];

export function renderDecision(review) {
  const isRejected = review.decision === 'reject';
  return `
    <div class="inspector__section decision${isRejected ? ' has-reasons' : ''}">
      <h2 class="label">Decision</h2>
      <div class="decision__buttons">${renderDecisionButtons(review, 'panel')}</div>
      ${isRejected ? renderRejectReasons(review) : ''}
    </div>`;
}

export function renderDecisionBar(state) {
  if (!state.isDetailOpen) return '';
  const review = state.reviews[state.selectedClipId];
  return `
    <div class="decision-bar">
      ${renderDecisionButtons(review, 'bar')}
      <button type="button" class="button" id="bar-next" data-action="select-next">Next ›</button>
    </div>`;
}

function renderDecisionButtons(review, place) {
  return `
    <button type="button" class="button button--reject" id="${place}-reject" data-action="decide"
      data-decision="reject" aria-pressed="${review.decision === 'reject'}">Reject</button>
    <button type="button" class="button button--keep" id="${place}-keep" data-action="decide"
      data-decision="keep" aria-pressed="${review.decision === 'keep'}">Keep</button>`;
}

function renderRejectReasons(review) {
  const buttons = REJECT_REASONS.map((reason) => `
    <button type="button" class="button button--small button--reject" data-action="set-reject-reason"
      data-reason="${reason.value}" aria-pressed="${review.rejectReason === reason.value}">${reason.label}</button>`);
  return `
    <p class="hint">Why? The selector uses the reason when it picks clips from your next video.</p>
    <div class="reasons">${buttons.join('')}</div>`;
}
