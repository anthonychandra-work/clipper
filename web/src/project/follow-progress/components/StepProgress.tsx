import { ProgressBar } from '@/shared/ui';

interface StepProgressProps {
  projectId: string;
  bar: { percent: number; label: string };
}

export function StepProgress({ projectId, bar }: StepProgressProps) {
  return <ProgressBar name={`processing-${projectId}`} percent={bar.percent} label={bar.label} />;
}
