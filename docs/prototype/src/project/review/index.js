import { inspectorActions, inspectorInputs } from '../clip-inspector/index.js';
import { previewActions, previewInputs } from '../clip-preview/index.js';
import { selectionActions } from './selection-actions.js';

export { renderReview } from './render-review.js';

export const reviewActions = {
  ...selectionActions,
  ...inspectorActions,
  ...previewActions,
};

export const reviewInputs = {
  ...inspectorInputs,
  ...previewInputs,
};
