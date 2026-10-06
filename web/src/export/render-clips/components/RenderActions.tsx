import type { ProjectExport } from '../../export.types';
import { describeRenderButton } from '../lib/describe-render';

interface RenderActionsProps {
  projectExport: ProjectExport;
  onRender: () => void;
  onCancel: () => void;
}

export function RenderActions({ projectExport, onRender, onCancel }: RenderActionsProps) {
  const button = describeRenderButton(projectExport);
  return (
    <>
      {button.isBusy ? (
        <button type="button" className="bar-button" id="cancel-render" onClick={onCancel}>
          Cancel
        </button>
      ) : null}
      <button
        type="button"
        className="bar-button bar-button--tinted"
        id="render-kept"
        disabled={button.isDisabled}
        onClick={onRender}
      >
        {button.isBusy ? <span className="spinner" aria-hidden="true" /> : null}
        {button.label}
      </button>
    </>
  );
}
