import { boundaryActions } from './boundary-actions.js';
import { decisionActions } from './decision-actions.js';

export { decisionInputs as inspectorInputs } from './decision-actions.js';
export { renderClipInspector } from './render-clip-inspector.js';
export { REJECT_REASONS, renderDecisionBar } from './render-decision.js';

export const inspectorActions = {
  ...boundaryActions,
  ...decisionActions,
};
