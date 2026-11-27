import { coordsToIndex, isInsideCircle } from './geometry';
import { createEmptyGrid } from './grid';
import type { GlyphCellState, GlyphResampleMode, GlyphResolution } from './types';

export function resizePattern(
  cells: readonly GlyphCellState[],
  from: GlyphResolution,
  to: GlyphResolution,
  mode: GlyphResampleMode = 'area'
): GlyphCellState[] {
  if (from === to) {
    return [...cells];
  }
  const out = createEmptyGrid(to);
  const scale = from / to;

  for (let y = 0; y < to; y++) {
    for (let x = 0; x < to; x++) {
      const dstIdx = coordsToIndex(x, y, to);
      if (out[dstIdx] === 'void') continue;

      if (mode === 'nearest') {
        const sx = Math.min(from - 1, Math.max(0, Math.round((x + 0.5) * scale - 0.5)));
        const sy = Math.min(from - 1, Math.max(0, Math.round((y + 0.5) * scale - 0.5)));
        const src = cells[coordsToIndex(sx, sy, from)];
        out[dstIdx] = src === 'void' ? 'off' : src;
      } else {
        const x0 = Math.floor(x * scale);
        const x1 = Math.max(x0, Math.ceil((x + 1) * scale) - 1);
        const y0 = Math.floor(y * scale);
        const y1 = Math.max(y0, Math.ceil((y + 1) * scale) - 1);

        let validSamples = 0;
        let onCount = 0;
        let signalCount = 0;

        for (let sy = y0; sy <= y1; sy++) {
          for (let sx = x0; sx <= x1; sx++) {
            if (sx < 0 || sy < 0 || sx >= from || sy >= from) continue;
            const src = cells[coordsToIndex(sx, sy, from)];
            if (src === 'void') continue;
            validSamples++;
            if (src === 'on') onCount++;
            else if (src === 'signal') signalCount++;
          }
        }

        const lit = onCount + signalCount;
        if (validSamples > 0 && lit / validSamples >= 0.4) {
          out[dstIdx] = signalCount >= onCount && signalCount > 0 ? 'signal' : 'on';
        } else {
          out[dstIdx] = 'off';
        }
      }
    }
  }

  return out;
}

export function mirrorPattern(
  cells: readonly GlyphCellState[],
  resolution: GlyphResolution,
  axis: 'horizontal' | 'vertical' = 'horizontal'
): GlyphCellState[] {
  const out = createEmptyGrid(resolution);
  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      if (!isInsideCircle(x, y, resolution)) continue;
      const sx = axis === 'horizontal' ? resolution - 1 - x : x;
      const sy = axis === 'vertical' ? resolution - 1 - y : y;
      const src = cells[coordsToIndex(sx, sy, resolution)];
      out[coordsToIndex(x, y, resolution)] = src === 'void' ? 'off' : src;
    }
  }
  return out;
}

export function rotatePattern(
  cells: readonly GlyphCellState[],
  resolution: GlyphResolution,
  direction: 'cw' | 'ccw' = 'cw'
): GlyphCellState[] {
  const out = createEmptyGrid(resolution);
  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      if (!isInsideCircle(x, y, resolution)) continue;
      const sx = direction === 'cw' ? y : resolution - 1 - y;
      const sy = direction === 'cw' ? resolution - 1 - x : x;
      const src = cells[coordsToIndex(sx, sy, resolution)];
      out[coordsToIndex(x, y, resolution)] = src === 'void' ? 'off' : src;
    }
  }
  return out;
}

export function shiftPattern(
  cells: readonly GlyphCellState[],
  resolution: GlyphResolution,
  dx: number,
  dy: number
): GlyphCellState[] {
  const out = createEmptyGrid(resolution);
  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      if (!isInsideCircle(x, y, resolution)) continue;
      const sx = x - dx;
      const sy = y - dy;
      if (sx < 0 || sy < 0 || sx >= resolution || sy >= resolution) {
        out[coordsToIndex(x, y, resolution)] = 'off';
        continue;
      }
      const src = cells[coordsToIndex(sx, sy, resolution)];
      out[coordsToIndex(x, y, resolution)] = src === 'void' ? 'off' : src;
    }
  }
  return out;
}
