'use client';

import { type RefObject, useCallback, useEffect, useState } from 'react';

import type { ClipRange } from '../../time-clips';

export type VideoRef = RefObject<HTMLVideoElement | null>;

export interface Playback {
  seconds: number;
  isPlaying: boolean;
  toggle: () => void;
  seek: (seconds: number) => void;
  follow: () => void;
  showEnd: () => void;
  showPlaying: () => void;
  showPaused: () => void;
}

export function usePlayback(videoRef: VideoRef, { start, end, duration }: ClipRange): Playback {
  const [isPlaying, setIsPlaying] = useState(false);
  const [placed, setPlaced] = useState({ start, end, seconds: 0 });
  const seconds = placed.start === start && placed.end === end ? placed.seconds : 0;

  useEffect(() => {
    const video = videoRef.current;
    if (video === null) return;
    video.pause();
    video.currentTime = start;
  }, [videoRef, start, end]);

  const follow = useCallback(() => {
    const video = videoRef.current;
    if (video === null || video.paused) return;
    const reached = video.currentTime - start;
    if (reached < duration) return setPlaced({ start, end, seconds: Math.max(0, reached) });
    video.pause();
    video.currentTime = end;
    setPlaced({ start, end, seconds: duration });
  }, [videoRef, start, end, duration]);

  useEffect(() => {
    if (!isPlaying) return undefined;
    let frame = requestAnimationFrame(function followFrame() {
      follow();
      frame = requestAnimationFrame(followFrame);
    });
    return () => cancelAnimationFrame(frame);
  }, [isPlaying, follow]);

  function seek(wanted: number): void {
    if (videoRef.current !== null) videoRef.current.currentTime = start + wanted;
    setPlaced({ start, end, seconds: wanted });
  }

  function toggle(): void {
    const video = videoRef.current;
    if (video === null) return;
    if (!video.paused) return video.pause();
    if (seconds >= duration) seek(0);
    // A play that fails on a source it cannot read leaves the video marked as playing.
    video.play().catch(() => video.pause());
  }

  return {
    seconds,
    isPlaying,
    toggle,
    seek,
    follow,
    showEnd: () => setPlaced({ start, end, seconds: duration }),
    showPlaying: () => setIsPlaying(true),
    showPaused: () => setIsPlaying(false),
  };
}
