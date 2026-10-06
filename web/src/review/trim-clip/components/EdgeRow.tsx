import { formatPreciseTimecode } from '@/shared/lib/format-timecode';
import { Icon } from '@/shared/ui';

import type { ClipEdge } from '../../review.types';
import { type EdgeLimits, NUDGE_STEP_SECONDS } from '../../time-clips';

const EDGE_NAMES: Record<ClipEdge, string> = { start: 'In', end: 'Out' };

interface Stepper {
  kind: 'move-edge' | 'nudge-edge';
  unit: string;
  spoken: string;
  earlier: keyof EdgeLimits;
  later: keyof EdgeLimits;
}

const STEPPERS: readonly Stepper[] = [
  { kind: 'move-edge', unit: 'Sentence', spoken: 'one sentence', earlier: 'canMoveEarlier', later: 'canMoveLater' },
  {
    kind: 'nudge-edge',
    unit: `${NUDGE_STEP_SECONDS} s`,
    spoken: `${NUDGE_STEP_SECONDS} seconds`,
    earlier: 'canNudgeEarlier',
    later: 'canNudgeLater',
  },
];

export interface EdgeStep {
  edge: ClipEdge;
  kind: Stepper['kind'];
  step: -1 | 1;
}

interface EdgeRowProps {
  edge: ClipEdge;
  seconds: number;
  limits: EdgeLimits;
  onStep: (step: EdgeStep) => void;
}

export function EdgeRow({ edge, seconds, limits, onStep }: EdgeRowProps) {
  return (
    <div className="edge">
      <span className="edge__name">{EDGE_NAMES[edge]}</span>
      <span className="edge__time numeric">{formatPreciseTimecode(seconds)}</span>
      <div className="edge__steppers">
        {STEPPERS.map((stepper) => (
          <span
            key={stepper.kind}
            className="stepper"
            role="group"
            aria-label={`${EDGE_NAMES[edge]} point by ${stepper.spoken}`}
          >
            <span className="stepper__unit">{stepper.unit}</span>
            <span className="stepper__buttons">
              <StepButton edge={edge} stepper={stepper} step={-1} isAllowed={limits[stepper.earlier]} onStep={onStep} />
              <StepButton edge={edge} stepper={stepper} step={1} isAllowed={limits[stepper.later]} onStep={onStep} />
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

interface StepButtonProps {
  edge: ClipEdge;
  stepper: Stepper;
  step: -1 | 1;
  isAllowed: boolean;
  onStep: (step: EdgeStep) => void;
}

function StepButton({ edge, stepper, step, isAllowed, onStep }: StepButtonProps) {
  const direction = step < 0 ? 'earlier' : 'later';
  return (
    <button
      type="button"
      className="stepper__step"
      id={`${edge}-${stepper.kind}-${direction}`}
      aria-label={`${EDGE_NAMES[edge]} point ${stepper.spoken} ${direction}`}
      disabled={!isAllowed}
      onClick={() => onStep({ edge, kind: stepper.kind, step })}
    >
      <Icon name={step < 0 ? 'chevron-left' : 'chevron-right'} />
    </button>
  );
}
