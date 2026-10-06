'use client';

import { type CSSProperties, Fragment, useMemo, useRef, useState } from 'react';

import type { Caption, CaptionStyle, ClipCaptions, Framing, Look, ReviewClip } from '../../review.types';
import type { Playback, VideoRef } from '../hooks/use-playback';
import { useSecondPicture } from '../hooks/use-second-picture';
import { findCaption } from '../lib/find-caption';
import { framePicture, measureWholePictureWidth, type PicturePart } from '../lib/frame-picture';

const HOOK_TITLE_SECONDS = 3;
const USUAL_SOURCE_ASPECT = 16 / 9;

interface FrameStyles {
  player: string;
  video: string;
  second?: string;
}

const FRAME_STYLES: Record<Framing, FrameStyles> = {
  'follow-speaker': { player: 'player player--follow', video: 'scene__picture' },
  'stack-two': {
    player: 'player player--stacked',
    video: 'scene__half scene__half--top',
    second: 'scene__half scene__half--bottom',
  },
  'whole-frame': { player: 'player player--fit', video: 'scene__wide', second: 'scene__backdrop' },
};
const CAPTION_STYLES: Record<CaptionStyle, string> = {
  keyword: 'player__caption caption--keyword',
  'word-by-word': 'player__caption caption--pop',
  plain: 'player__caption caption--clean',
};
const CAPTION_LISTS: Record<CaptionStyle, keyof ClipCaptions> = {
  keyword: 'keyword',
  'word-by-word': 'wordByWord',
  plain: 'plain',
};

interface PlayerPictureProps {
  source: string;
  clip: ReviewClip;
  look: Look;
  videoRef: VideoRef;
  playback: Playback;
}

export function PlayerPicture({ source, clip, look, videoRef, playback }: PlayerPictureProps) {
  const caption = findCaption(clip.captions[CAPTION_LISTS[look.captionStyle]], playback.seconds);
  return (
    <div className={FRAME_STYLES[look.framing].player}>
      <Scene source={source} framing={look.framing} videoRef={videoRef} playback={playback} />
      {look.showSafeZones ? <SafeZones /> : null}
      {look.showHookTitle ? (
        <p className="player__hook" id="preview-hook" hidden={playback.seconds >= HOOK_TITLE_SECONDS}>
          {clip.hookTitle}
        </p>
      ) : null}
      <p className={CAPTION_STYLES[look.captionStyle]} id="preview-caption">
        {caption === null ? null : <CaptionWords caption={caption} />}
      </p>
      <button type="button" className="player__surface" tabIndex={-1} aria-hidden="true" onClick={playback.toggle} />
      <span className="player__dim" />
    </div>
  );
}

interface SceneProps {
  source: string;
  framing: Framing;
  videoRef: VideoRef;
  playback: Playback;
}

function Scene({ source, framing, videoRef, playback }: SceneProps) {
  const [sourceAspect, setSourceAspect] = useState(USUAL_SOURCE_ASPECT);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framed = useMemo(() => framePicture(framing, sourceAspect), [framing, sourceAspect]);
  useSecondPicture(videoRef, canvasRef, framed.second);
  const styles = FRAME_STYLES[framing];
  return (
    <div className="scene">
      {framed.second === null ? null : (
        <div className={styles.second}>
          <canvas ref={canvasRef} id="preview-second-picture" />
        </div>
      )}
      <div className={styles.video} style={framing === 'whole-frame' ? fitWholePicture(sourceAspect) : undefined}>
        <video
          ref={videoRef}
          id="preview-video"
          src={source}
          preload="auto"
          playsInline
          style={showPart(framed.video)}
          onLoadedMetadata={({ currentTarget }) => setSourceAspect(currentTarget.videoWidth / currentTarget.videoHeight)}
          onPlay={playback.showPlaying}
          onPause={playback.showPaused}
          onTimeUpdate={playback.follow}
          onEnded={playback.showEnd}
        />
      </div>
    </div>
  );
}

function SafeZones() {
  return (
    <>
      <span className="safe-zone safe-zone--rail">Platform buttons</span>
      <span className="safe-zone safe-zone--footer">Caption and sound</span>
    </>
  );
}

function CaptionWords({ caption }: { caption: Caption }) {
  return caption.words.map((word, place) => (
    <Fragment key={place}>
      {place > 0 ? ' ' : null}
      {word.isHighlighted ? <mark>{word.text}</mark> : word.text}
    </Fragment>
  ));
}

function showPart(part: PicturePart): CSSProperties {
  return {
    left: `${(-100 * part.left) / part.width}%`,
    top: `${(-100 * part.top) / part.height}%`,
    width: `${100 / part.width}%`,
    height: `${100 / part.height}%`,
  };
}

function fitWholePicture(sourceAspect: number): CSSProperties {
  const sideInset = `${50 * (1 - measureWholePictureWidth(sourceAspect))}%`;
  return { left: sideInset, right: sideInset, aspectRatio: String(sourceAspect) };
}
