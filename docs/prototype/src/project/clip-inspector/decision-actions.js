import { state, update } from '../../app-state.js';

export const decisionActions = {
  decide: ({ decision }) => update((current) => applyDecision(selectedReview(current), decision)),
  'set-reject-reason': ({ reason }) => update((current) => {
    selectedReview(current).rejectReason = reason;
  }),
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
