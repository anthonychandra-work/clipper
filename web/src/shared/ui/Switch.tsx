'use client';

import { useState } from 'react';

interface SwitchProps {
  id: string;
  isOn: boolean;
  isInvalid?: boolean;
  describedBy?: string;
  onToggle: () => void;
}

export function Switch({ id, isOn, isInvalid, describedBy, onToggle }: SwitchProps) {
  const [isFresh, setIsFresh] = useState(false);

  function toggle() {
    setIsFresh(true);
    onToggle();
  }

  return (
    <input
      type="checkbox"
      role="switch"
      className={isFresh ? 'switch is-fresh' : 'switch'}
      id={id}
      checked={isOn}
      aria-invalid={isInvalid || undefined}
      aria-describedby={describedBy}
      onChange={toggle}
    />
  );
}
