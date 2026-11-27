/**
 * Authentic 25x25 circular-masked Glyph Matrix (Phone (3) canonical LED grid).
 * Coordinates (x, y) range 0..24 with center c = 12 and circular mask radius R = 12.3.
 */
export const GLYPH_GRID_SIZE = 25;
export const GLYPH_CENTER = 12;
export const GLYPH_RADIUS = 12.3;

export type GlyphCellState = 'void' | 'off' | 'on' | 'signal';

export type GlyphPresetId =
  | 'power'
  | 'play'
  | 'heart'
  | 'live'
  | 'arrow'
  | 'sound'
  | 'smiley'
  | 'plus';

export interface GlyphPreset {
  id: GlyphPresetId;
  label: string;
  signal: boolean;
  predicate: (x: number, y: number, c: number) => boolean;
}

export const GLYPH_PRESETS: GlyphPreset[] = [
  {
    id: 'power',
    label: 'Power',
    signal: false,
    predicate: (x, y, c) => {
      const d = Math.hypot(x - c, y - c);
      const ring = d >= 6.5 && d <= 8.4 && !(y < c - 1 && Math.abs(x - c) <= 2.3);
      const bar = Math.abs(x - c) <= 1 && y >= c - 9 && y <= c - 0.5;
      return ring || bar;
    },
  },
  {
    id: 'play',
    label: 'Play',
    signal: false,
    predicate: (x, y, c) => {
      const rx = x - (c - 6);
      if (rx < 0 || x > c + 7) return false;
      return Math.abs(y - c) <= ((13 - rx) / 13) * 7;
    },
  },
  {
    id: 'heart',
    label: 'Heart',
    signal: false,
    predicate: (x, y, c) => {
      const X = (x - c) / 7.6;
      const Y = -(y - c - 1.6) / 7.6;
      return Math.pow(X * X + Y * Y - 1, 3) - X * X * Y * Y * Y <= 0;
    },
  },
  {
    id: 'live',
    label: 'Live',
    signal: true,
    predicate: (x, y, c) => Math.hypot(x - c, y - c) <= 6,
  },
  {
    id: 'arrow',
    label: 'Arrow',
    signal: false,
    predicate: (x, y, c) => {
      const bar = Math.abs(x - c) <= 1 && y >= c - 3 && y <= c + 8;
      const head = y >= c - 9 && y <= c - 3 && Math.abs(x - c) <= y - (c - 9);
      return bar || head;
    },
  },
  {
    id: 'sound',
    label: 'Sound',
    signal: false,
    predicate: (x, y, c) => {
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
  },
  {
    id: 'smiley',
    label: 'Smiley',
    signal: false,
    predicate: (x, y, c) => {
      const d = Math.hypot(x - c, y - c);
      const ring = d >= 9.5 && d <= 11;
      const eyes =
        Math.hypot(x - (c - 4), y - (c - 3)) <= 1.4 ||
        Math.hypot(x - (c + 4), y - (c - 3)) <= 1.4;
      const md = Math.hypot(x - c, y - (c - 2));
      const smile = md >= 6 && md <= 7.3 && y > c + 1;
      return ring || eyes || smile;
    },
  },
  {
    id: 'plus',
    label: 'Plus',
    signal: false,
    predicate: (x, y, c) =>
      (Math.abs(x - c) <= 1 && Math.abs(y - c) <= 8) ||
      (Math.abs(y - c) <= 1 && Math.abs(x - c) <= 8),
  },
];

export function isInsideGlyphCircle(x: number, y: number): boolean {
  return Math.hypot(x - GLYPH_CENTER, y - GLYPH_CENTER) <= GLYPH_RADIUS;
}

export function buildPresetMatrix(presetId: GlyphPresetId): GlyphCellState[] {
  const preset = GLYPH_PRESETS.find((p) => p.id === presetId) ?? GLYPH_PRESETS[0];
  const cells: GlyphCellState[] = [];
  for (let y = 0; y < GLYPH_GRID_SIZE; y++) {
    for (let x = 0; x < GLYPH_GRID_SIZE; x++) {
      if (!isInsideGlyphCircle(x, y)) {
        cells.push('void');
      } else if (preset.predicate(x, y, GLYPH_CENTER)) {
        cells.push(preset.signal ? 'signal' : 'on');
      } else {
        cells.push('off');
      }
    }
  }
  return cells;
}

export function toggleGlyphCell(
  cells: GlyphCellState[],
  index: number,
  paintMode: 'on' | 'signal' = 'on'
): GlyphCellState[] {
  if (index < 0 || index >= cells.length || cells[index] === 'void') {
    return cells;
  }
  const next = [...cells];
  next[index] = next[index] === 'off' ? paintMode : 'off';
  return next;
}

export function clearGlyphMatrix(cells: GlyphCellState[]): GlyphCellState[] {
  return cells.map((cell) => (cell === 'void' ? 'void' : 'off'));
}

export function countLitGlyphDots(cells: GlyphCellState[]): number {
  let count = 0;
  for (const cell of cells) {
    if (cell === 'on' || cell === 'signal') count++;
  }
  return count;
}

export function countAddressableGlyphDots(): number {
  let count = 0;
  for (let y = 0; y < GLYPH_GRID_SIZE; y++) {
    for (let x = 0; x < GLYPH_GRID_SIZE; x++) {
      if (isInsideGlyphCircle(x, y)) count++;
    }
  }
  return count;
}
