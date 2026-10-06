import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const HOMEBREW_FFMPEG_DIR = '/opt/homebrew/opt/ffmpeg-full/bin';
const ASK_FOR_STREAMS = ['-v', 'error', '-show_streams', '-show_format', '-of', 'json'];

interface ProbedStream {
  codec_type: string;
  codec_name: string;
  width?: number;
  height?: number;
  r_frame_rate: string;
}

interface ProbeReport {
  streams: ProbedStream[];
  format: { format_name: string; duration: string };
}

export interface ProbedFile {
  picture: string;
  sound: string;
  isMp4: boolean;
  seconds: number;
}

export function probeSavedFile(file: string): ProbedFile {
  const ffprobe = join(process.env.CLIPPER_FFMPEG_DIR ?? HOMEBREW_FFMPEG_DIR, 'ffprobe');
  const report: ProbeReport = JSON.parse(execFileSync(ffprobe, [...ASK_FOR_STREAMS, file], { encoding: 'utf8' }));
  const pictures = report.streams.filter((stream) => stream.codec_type === 'video');
  const sounds = report.streams.filter((stream) => stream.codec_type === 'audio');
  return {
    picture: pictures
      .map((stream) => `${stream.codec_name} ${stream.width} x ${stream.height} at ${stream.r_frame_rate}`)
      .join(', '),
    sound: sounds.map((stream) => stream.codec_name).join(', '),
    isMp4: report.format.format_name.split(',').includes('mp4'),
    seconds: Number(report.format.duration),
  };
}
