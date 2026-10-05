const SAMPLE_FAILURE = {
  queuePosition: 1,
  atPercent: 40,
  reason: 'Not enough free disk space to finish. Free some space, then retry.',
};

let hasShownSampleFailure = false;

export function isSampleFailureDue(queuePosition, job) {
  const isFailingClip = queuePosition === SAMPLE_FAILURE.queuePosition;
  return !hasShownSampleFailure && isFailingClip && job.percent >= SAMPLE_FAILURE.atPercent;
}

export function failWithSampleReason(job) {
  hasShownSampleFailure = true;
  job.error = SAMPLE_FAILURE.reason;
}
