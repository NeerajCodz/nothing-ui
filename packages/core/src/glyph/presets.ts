import { getGlyphGeometry, isInsideCircle } from './geometry';
import type { GlyphCellState, GlyphPresetId, GlyphResolution } from './types';

export interface GlyphPresetDefinition {
  id: GlyphPresetId;
  label: string;
  signal: boolean;
  description: string;
  predicate25: (x: number, y: number, c: number) => boolean;
  predicate13: (x: number, y: number, c: number) => boolean;
}

export const GLYPH_PRESETS: GlyphPresetDefinition[] = [
  {
    id: 'power',
    label: 'Power',
    signal: false,
    description: 'Standby ring with top vertical stem.',
    predicate25: (x, y, c) => {
      const d = Math.hypot(x - c, y - c);
      const ring = d >= 6.5 && d <= 8.4 && !(y < c - 1 && Math.abs(x - c) <= 2.3);
      const bar = Math.abs(x - c) <= 1 && y >= c - 9 && y <= c - 0.5;
      return ring || bar;
    },
    predicate13: (x, y, c) => {
      const d = Math.hypot(x - c, y - c);
      const ring = d >= 3.2 && d <= 4.35 && !(y < c && Math.abs(x - c) <= 1.2);
      const bar = x === c && y >= c - 4 && y <= c;
      return ring || bar;
    },
  },
  {
    id: 'play',
    label: 'Play',
    signal: false,
    description: 'Directional playback triangle.',
    predicate25: (x, y, c) => {
      const rx = x - (c - 6);
      if (rx < 0 || x > c + 7) return false;
      return Math.abs(y - c) <= ((13 - rx) / 13) * 7;
    },
    predicate13: (x, y, c) => {
      const rx = x - (c - 3);
      if (rx < 0 || x > c + 3) return false;
      return Math.abs(y - c) <= ((6.5 - rx) / 6.5) * 3.5;
    },
  },
  {
    id: 'heart',
    label: 'Heart',
    signal: false,
    description: 'Symmetric dot-matrix heart emblem.',
    predicate25: (x, y, c) => {
      const X = (x - c) / 7.6;
      const Y = -(y - c - 1.6) / 7.6;
      return Math.pow(X * X + Y * Y - 1, 3) - X * X * Y * Y * Y <= 0;
    },
    predicate13: (x, y, c) => {
      const X = (x - c) / 3.9;
      const Y = -(y - c - 0.85) / 3.9;
      return Math.pow(X * X + Y * Y - 1, 3) - X * X * Y * Y * Y <= 0.04;
    },
  },
  {
    id: 'live',
    label: 'Live',
    signal: true,
    description: 'Signal Red active recording disc.',
    predicate25: (x, y, c) => Math.hypot(x - c, y - c) <= 6,
    predicate13: (x, y, c) => Math.hypot(x - c, y - c) <= 3.1,
  },
  {
    id: 'arrow',
    label: 'Arrow',
    signal: false,
    description: 'Upward navigation indicator.',
    predicate25: (x, y, c) => {
      const bar = Math.abs(x - c) <= 1 && y >= c - 3 && y <= c + 8;
      const head = y >= c - 9 && y <= c - 3 && Math.abs(x - c) <= y - (c - 9);
      return bar || head;
    },
    predicate13: (x, y, c) => {
      const bar = x === c && y >= c - 1 && y <= c + 4;
      const head = y >= c - 4 && y <= c - 1 && Math.abs(x - c) <= y - (c - 4);
      return bar || head;
    },
  },
  {
    id: 'sound',
    label: 'Sound',
    signal: false,
    description: 'Five-band equalizer columns.',
    predicate25: (x, y, c) => {
      const cols: Record<number, number> = {
        [c - 8]: 4,
        [c - 4]: 8,
        [c]: 6,
        [c + 4]: 9,
        [c + 8]: 3,
      };
      for (const k of Object.keys(cols)) {
        const colX = Number(k);
        if (Math.abs(x - colX) <= 1 && y <= c + 8 && y >= c + 8 - cols[colX]) {
          return true;
        }
      }
      return false;
    },
    predicate13: (x, y, c) => {
      const cols: Record<number, number> = {
        [c - 4]: 2,
        [c - 2]: 5,
        [c]: 4,
        [c + 2]: 6,
        [c + 4]: 2,
      };
      const height = cols[x];
      return height !== undefined && y <= c + 3 && y >= c + 3 - height;
    },
  },
  {
    id: 'smiley',
    label: 'Smiley',
    signal: false,
    description: 'Circular face with two dot eyes and smile arc.',
    predicate25: (x, y, c) => {
      const d = Math.hypot(x - c, y - c);
      const ring = d >= 9.5 && d <= 11;
      const eyes =
        Math.hypot(x - (c - 4), y - (c - 3)) <= 1.4 ||
        Math.hypot(x - (c + 4), y - (c - 3)) <= 1.4;
      const md = Math.hypot(x - c, y - (c - 2));
      const smile = md >= 6 && md <= 7.3 && y > c + 1;
      return ring || eyes || smile;
    },
    predicate13: (x, y, c) => {
      const d = Math.hypot(x - c, y - c);
      const ring = d >= 4.75 && d <= 5.6;
      const eyes = (y === c - 1 && (x === c - 2 || x === c + 2));
      const smile = (y === c + 2 && Math.abs(x - c) <= 2) || (y === c + 1 && Math.abs(x - c) === 2);
      return ring || eyes || smile;
    },
  },
  {
    id: 'plus',
    label: 'Plus',
    signal: false,
    description: 'Centered orthogonal crosshair.',
    predicate25: (x, y, c) =>
      (Math.abs(x - c) <= 1 && Math.abs(y - c) <= 8) ||
      (Math.abs(y - c) <= 1 && Math.abs(x - c) <= 8),
    predicate13: (x, y, c) =>
      (x === c && Math.abs(y - c) <= 4) ||
      (y === c && Math.abs(x - c) <= 4),
  },
];

export function getPreset(
  presetId: GlyphPresetId,
  resolution: GlyphResolution = 25
): GlyphCellState[] {
  const preset = GLYPH_PRESETS.find((p) => p.id === presetId) ?? GLYPH_PRESETS[0];
  const { center } = getGlyphGeometry(resolution);
  const predicate = resolution === 25 ? preset.predicate25 : preset.predicate13;
  const cells: GlyphCellState[] = [];
  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      if (!isInsideCircle(x, y, resolution)) {
        cells.push('void');
      } else if (predicate(x, y, center)) {
        cells.push(preset.signal ? 'signal' : 'on');
      } else {
        cells.push('off');
      }
    }
  }
  return cells;
}
