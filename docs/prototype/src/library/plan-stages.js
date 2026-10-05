const SOURCE_STAGES = {
  link: { kind: 'fetch', label: 'Fetching video', seconds: 3 },
  file: { kind: 'upload', label: 'Uploading video', seconds: 6 },
};

const PIPELINE_STAGES = [
  { kind: 'transcribe', label: 'Transcribing on this Mac', seconds: 12 },
  { kind: 'score', label: 'Scoring 49 windows', seconds: 5 },
  { kind: 'cut', label: 'Cutting clips', seconds: 4 },
];

const MODEL_DOWNLOAD_SECONDS = 6;

export function planStages({ sourceKind, modelToDownload }) {
  const download = modelToDownload
    ? [{ kind: 'model', label: `Downloading ${modelToDownload}`, seconds: MODEL_DOWNLOAD_SECONDS }]
    : [];
  return [SOURCE_STAGES[sourceKind], ...download, ...PIPELINE_STAGES];
}
