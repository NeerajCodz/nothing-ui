export type GlyphResolution = 13 | 25;

export type GlyphCellState = 'void' | 'off' | 'on' | 'signal';

export type GlyphPaintState = Exclude<GlyphCellState, 'void'>;

export interface GlyphFrame {
  cells: GlyphCellState[];
  durationMs: number;
}

export interface GlyphPatternV1 {
  version: 1;
  resolution: GlyphResolution;
  cells: GlyphCellState[];
  name?: string;
  frames?: GlyphFrame[];
}

export type GlyphPresetId =
  | 'power'
  | 'play'
  | 'heart'
  | 'live'
  | 'arrow'
  | 'sound'
  | 'smiley'
  | 'plus';

export type GlyphResampleMode = 'nearest' | 'area';

export interface GlyphGeometry {
  resolution: GlyphResolution;
  center: number;
  radius: number;
  totalCells: number;
  addressableCount: number;
  voidCount: number;
}
