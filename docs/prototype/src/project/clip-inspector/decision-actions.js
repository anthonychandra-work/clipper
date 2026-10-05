import { state, update } from '../../app-state.js';

export const decisionActions = {
  decide: ({ decision }) => update((current) => applyDecision(selectedReview(current), decision)),
  'reject-clip': ({ reason }) => update((current) => rejectClip(current, reason)),
  'clear-decision': () => update((current) => clearDecision(current)),
};

export const decisionInputs = {
  'edit-title': (field) => {
    selectedReview(state).title = field.value;
  },
};

function selectedReview(current) {
  return current.reviews[current.selectedClipId];
}

function applyDecision(review, decision) {
  review.decision = review.decision === decision ? 'undecided' : decision;
  if (review.decision !== 'reject') review.rejectReason = null;
}

function rejectClip(current, reason) {
  const review = selectedReview(current);
  review.decision = 'reject';
  review.rejectReason = reason || null;
  current.menu = null;
}

function clearDecision(current) {
  const review = selectedReview(current);
  review.decision = 'undecided';
  review.rejectReason = null;
  current.menu = null;
}
