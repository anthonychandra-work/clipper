'use client';

import { useState } from 'react';

export interface SegmentedOption<Value extends string> {
  value: Value;
  label: string;
  count?: number;
}

interface SegmentedControlProps<Value extends string> {
  name: string;
  label: string;
  selected: Value;
  options: readonly SegmentedOption<Value>[];
  onSelect: (value: Value) => void;
}

export function SegmentedControl<Value extends string>(props: SegmentedControlProps<Value>) {
  const { name, label, selected, options, onSelect } = props;
  const [freshValue, setFreshValue] = useState<Value | null>(null);

  function select(value: Value) {
    setFreshValue(value);
    onSelect(value);
  }

  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          className={option.value === freshValue ? 'segmented__option is-fresh' : 'segmented__option'}
          id={`${name}-${option.value}`}
          aria-pressed={option.value === selected}
          onClick={() => select(option.value)}
        >
          {option.label}
          {option.count === undefined ? null : <span className="segmented__count">{option.count}</span>}
        </button>
      ))}
    </div>
  );
}
