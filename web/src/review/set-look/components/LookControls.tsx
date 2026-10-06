'use client';

import { SegmentedControl, Switch } from '@/shared/ui';

import type { Look } from '../../review.types';
import { CAPTION_STYLES, flipSwitch, FRAMINGS, LOOK_SWITCHES } from '../lib/look-options';

interface LookControlsProps {
  look: Look;
  onChange: (look: Look) => void;
}

export function LookControls({ look, onChange }: LookControlsProps) {
  return (
    <div className="group-section">
      <h2 className="list-header">Look</h2>
      <div className="group divided">
        <div className="row row--stack">
          <span className="row__label">Captions</span>
          <SegmentedControl
            name="captions"
            label="Caption style"
            selected={look.captionStyle}
            options={CAPTION_STYLES}
            onSelect={(captionStyle) => onChange({ ...look, captionStyle })}
          />
        </div>
        <div className="row row--stack">
          <span className="row__label">Framing</span>
          <SegmentedControl
            name="framing"
            label="Framing"
            selected={look.framing}
            options={FRAMINGS}
            onSelect={(framing) => onChange({ ...look, framing })}
          />
        </div>
        {LOOK_SWITCHES.map(({ option, label }) => (
          <label key={option} className="row" htmlFor={`look-${option}`}>
            <span className="row__label">{label}</span>
            <Switch id={`look-${option}`} isOn={look[option]} onToggle={() => onChange(flipSwitch(look, option))} />
          </label>
        ))}
      </div>
      <p className="list-footer">The look applies to every clip in this project.</p>
    </div>
  );
}
