import type { GlyphCellState, GlyphFrame } from './types';

export function getTotalDurationMs(frames: readonly GlyphFrame[]): number {
  return frames.reduce((sum, frame) => sum + Math.max(40, frame.durationMs), 0);
}

export function loopFrames(
  frames: readonly GlyphFrame[],
  elapsedMs: number
): { frameIndex: number; cells: GlyphCellState[] } {
  if (frames.length === 0) {
    return { frameIndex: 0, cells: [] };
  }
  const total = getTotalDurationMs(frames);
  const t = ((elapsedMs % total) + total) % total;
  let acc = 0;
  for (let i = 0; i < frames.length; i++) {
    acc += Math.max(40, frames[i].durationMs);
    if (t < acc) {
      return { frameIndex: i, cells: frames[i].cells };
    }
  }
  return { frameIndex: frames.length - 1, cells: frames[frames.length - 1].cells };
}

export function interpolateFrame(
  from: readonly GlyphCellState[],
  to: readonly GlyphCellState[],
  progress: number
): GlyphCellState[] {
  const clamped = Math.min(1, Math.max(0, progress));
  if (clamped < 0.5) return [...from];
  return [...to];
}
