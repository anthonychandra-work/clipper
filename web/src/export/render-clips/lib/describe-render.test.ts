import { describe, expect, it } from 'vitest';

import { describeFirstClip, describeSecondClip, describeTalkExport } from '../../export.fixtures';
import type { ClipRender, RenderState } from '../../export.types';
import { describeRenderButton, describeRow, isRendering } from './describe-render';

const DOWNLOAD = '/api/projects/a1b2c3d4e5f6/clips/c01/export';
const DISK_FULL = 'Not enough free disk space to finish. Free some space, then retry.';
const NOT_RENDERED = 'This clip could not be rendered. Retry to render it again.';

function renderAs(state: RenderState, percent = 0, reason: string | null = null): ClipRender {
  return { state, percent, reason };
}

describe('the Render button', () => {
  it('counts one kept clip', () => {
    const one = describeTalkExport({ clips: [describeFirstClip()] });

    expect(describeRenderButton(one)).toEqual({ label: 'Render 1 Clip', isBusy: false, isDisabled: false });
  });

  it('counts several kept clips, finished ones among them', () => {
    const done = describeFirstClip({ render: renderAs('done', 100), download: DOWNLOAD });
    const two = describeTalkExport({ clips: [done, describeSecondClip()] });

    expect(describeRenderButton(two)).toEqual({ label: 'Render 2 Clips', isBusy: false, isDisabled: false });
  });

  it.each<RenderState>(['waiting', 'rendering'])('reads Rendering… and is switched off while a clip is %s', (state) => {
    const queued = describeTalkExport({ clips: [describeFirstClip({ render: renderAs(state) }), describeSecondClip()] });

    expect(describeRenderButton(queued)).toEqual({ label: 'Rendering…', isBusy: true, isDisabled: true });
  });

  it('keeps its words and is switched off when the source is gone', () => {
    const withoutSource = describeTalkExport({ hasSource: false });

    expect(describeRenderButton(withoutSource)).toEqual({ label: 'Render 2 Clips', isBusy: false, isDisabled: true });
  });
});

describe('whether a project is rendering', () => {
  it('is not, before its export is fetched', () => {
    expect(isRendering(null)).toBe(false);
  });

  it.each<[RenderState, boolean]>([
    ['none', false],
    ['waiting', true],
    ['rendering', true],
    ['done', false],
    ['failed', false],
  ])('with a clip whose render is %s: %s', (state, isBusy) => {
    const shown = describeTalkExport({ clips: [describeFirstClip(), describeSecondClip({ render: renderAs(state) })] });

    expect(isRendering(shown)).toBe(isBusy);
  });
});

describe('what the row of a clip shows', () => {
  it('reads Not rendered for a clip that was never queued', () => {
    expect(describeRow(describeFirstClip(), true)).toEqual({ kind: 'not-rendered' });
  });

  it('shows a bar labelled Waiting for a waiting clip', () => {
    const waiting = describeFirstClip({ render: renderAs('waiting') });

    expect(describeRow(waiting, true)).toEqual({ kind: 'progress', label: 'Waiting', percent: 0 });
  });

  it('shows a bar labelled Rendering with the percent of a rendering clip', () => {
    const rendering = describeFirstClip({ render: renderAs('rendering', 41.3), download: DOWNLOAD });

    expect(describeRow(rendering, true)).toEqual({ kind: 'progress', label: 'Rendering', percent: 41.3 });
  });

  it('shows the reason of a failed clip', () => {
    const failed = describeFirstClip({ render: renderAs('failed', 0, DISK_FULL) });

    expect(describeRow(failed, true)).toEqual({ kind: 'failed', reason: DISK_FULL });
  });

  it('gives a failed clip without a reason the sentence for any other failure', () => {
    const failed = describeFirstClip({ render: renderAs('failed') });

    expect(describeRow(failed, true)).toEqual({ kind: 'failed', reason: NOT_RENDERED });
  });

  it('offers the download of a finished clip', () => {
    const done = describeFirstClip({ render: renderAs('done', 100), download: DOWNLOAD });

    expect(describeRow(done, true)).toEqual({ kind: 'download', address: DOWNLOAD });
  });

  it.each<RenderState>(['none', 'waiting', 'rendering', 'done', 'failed'])(
    'with the source gone, offers the download of a clip that has a finished file, whatever its render: %s',
    (state) => {
      const withFile = describeFirstClip({ render: renderAs(state), download: DOWNLOAD });

      expect(describeRow(withFile, false)).toEqual({ kind: 'download', address: DOWNLOAD });
    },
  );

  it('with the source gone, a clip without a finished file reads Not rendered or shows its reason', () => {
    const failed = describeFirstClip({ render: renderAs('failed', 0, DISK_FULL) });

    expect(describeRow(describeFirstClip(), false)).toEqual({ kind: 'not-rendered' });
    expect(describeRow(failed, false)).toEqual({ kind: 'failed', reason: DISK_FULL });
  });
});
