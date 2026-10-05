export const NUDGE_STEP_SECONDS = 0.2;

const NUDGE_LIMIT_STEPS = 5;

export function edgeLimits(edge, review, sentenceCount) {
  const index = review[`${edge}Index`];
  const lowest = edge === 'start' ? 0 : review.startIndex;
  const highest = edge === 'start' ? review.endIndex : sentenceCount - 1;
  const nudgeSteps = countNudgeSteps(review, edge);
  return {
    canMoveEarlier: index > lowest,
    canMoveLater: index < highest,
    canNudgeEarlier: nudgeSteps > -NUDGE_LIMIT_STEPS,
    canNudgeLater: nudgeSteps < NUDGE_LIMIT_STEPS,
  };
}

export function moveEdge(review, edge, step) {
  moveEdgeTo(review, edge, review[`${edge}Index`] + step);
}

export function moveEdgeTo(review, edge, sentenceIndex) {
  review[`${edge}Index`] = sentenceIndex;
  review[`${edge}Nudge`] = 0;
}

export function nudgeEdge(review, edge, step) {
  review[`${edge}Nudge`] = (countNudgeSteps(review, edge) + step) * NUDGE_STEP_SECONDS;
}

function countNudgeSteps(review, edge) {
  return Math.round(review[`${edge}Nudge`] / NUDGE_STEP_SECONDS);
}
