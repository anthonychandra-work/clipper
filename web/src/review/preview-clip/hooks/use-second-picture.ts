'use client';

import { type RefObject, useEffect } from 'react';

import type { PicturePart } from '../lib/frame-picture';
import type { VideoRef } from './use-playback';

export function useSecondPicture(
  videoRef: VideoRef,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  part: PicturePart | null,
): void {
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video === null || canvas === null || part === null) return undefined;
    let waiting = 0;
    const drawEveryFrame = () => {
      drawPart(video, canvas, part);
      waiting = video.requestVideoFrameCallback(drawEveryFrame);
    };
    drawEveryFrame();
    return () => video.cancelVideoFrameCallback(waiting);
  }, [videoRef, canvasRef, part]);
}

function drawPart(video: HTMLVideoElement, canvas: HTMLCanvasElement, part: PicturePart): void {
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
  const width = Math.round(part.width * video.videoWidth);
  const height = Math.round(part.height * video.videoHeight);
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  const left = part.left * video.videoWidth;
  const top = part.top * video.videoHeight;
  canvas.getContext('2d')?.drawImage(video, left, top, width, height, 0, 0, width, height);
}
