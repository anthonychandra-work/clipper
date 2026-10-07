interface ProgressBarProps {
  name: string;
  percent: number;
  label: string;
}

export function ProgressBar({ name, percent, label }: ProgressBarProps) {
  return (
    <span
      className="progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
    >
      <span data-progress={name} style={{ width: `${percent.toFixed(1)}%` }} />
    </span>
  );
}
