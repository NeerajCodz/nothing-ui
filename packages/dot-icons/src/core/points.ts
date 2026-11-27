import {
  DOT_ICON_ALIASES,
  DOT_ICON_BITMAPS,
  DOT_ICON_NAMES,
  LUCIDE_DOT_GRID_SIZE,
  NOTHING_ORIGINAL_ICON_NAMES,
  type DotIconAliasName,
  type DotIconCanonicalName,
  type DotIconName,
} from '../data/bitmaps';
import {
  DOT_ICON_LIST,
  DOT_ICON_METADATA,
  type DotIconMetadata,
  type DotIconSource,
} from '../data/metadata';

export const DOT_GRID_MIN = 5;
export const DOT_GRID_MAX = 25;
export const DOT_GRID_DEFAULT = 9;
export const DOT_GRID_PRESETS = [7, 9, 11, 13, 15, 17, 21, 25] as const;

export const DOT_SCALE_MIN = 0.2;
export const DOT_SCALE_MAX = 1.2;
export const DOT_SCALE_DEFAULT = 0.78;

export const DOT_GAP_MIN = 0;
export const DOT_GAP_MAX = 0.5;
export const DOT_GAP_DEFAULT = 0;

export type DotShape = 'circle' | 'rounded' | 'square' | 'diamond';
export type DotGridMode = 'scale' | 'center';

export interface DotPoint {
  x: number;
  y: number;
}

export interface DotCell {
  x: number;
  y: number;
  lit: boolean;
}

export interface DotIconGridOptions {
  /** Shorthand square dot grid dimension (5–25). Overridden by explicit gridCols / gridRows. */
  gridSize?: number;
  /** Horizontal dot count (5–25). Defaults to gridSize or 9. */
  gridCols?: number;
  /** Vertical dot count (5–25). Defaults to gridSize or 9. */
  gridRows?: number;
  /** How the canonical 9×9 icon maps onto non-9×9 grids ('scale' resamples proportionally, 'center' pads/crops). */
  gridMode?: DotGridMode;
  /** Uniform unlit margin cells around the icon inside the grid (0–4). */
  gridPadding?: number;
  /** Direct custom '#' / '.' dot-grid override (takes precedence over icon bitmap resampling). */
  grid?: readonly string[];
}

export interface DotIconRenderOptions extends DotIconGridOptions {
  /** Rendered icon size in px (longest side for non-square grids). */
  size?: number;
  /** Active lit dot fill color (hex, rgb, or CSS token / currentColor). */
  color?: string;
  /** Single-dot scale relative to cell width (0.2–1.2, default 0.78 => radius 0.39). */
  dotScale?: number;
  /** Legacy explicit dot radius override inside the unit cell (0.08–0.58). */
  dotRadius?: number;
  /** Additional inter-dot spacing inset (0–0.5, default 0). */
  dotGap?: number;
  /** Geometry for each matrix dot ('circle' | 'rounded' | 'square' | 'diamond'). */
  dotShape?: DotShape;
  /** Render the unlit background dot matrix behind active dots. */
  showGrid?: boolean;
  /** Fill color for unlit dots when showGrid is enabled. */
  inactiveColor?: string;
  /** Opacity for unlit dots when showGrid is enabled (0–1, default 0.14). */
  inactiveOpacity?: number;
  /** Optional SVG backdrop fill color. */
  backgroundColor?: string;
}

export interface ResolvedDotGrid {
  rows: string[];
  cols: number;
  rowCount: number;
}

export function clampGridDimension(value: number | undefined, fallback = DOT_GRID_DEFAULT): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(DOT_GRID_MIN, Math.min(DOT_GRID_MAX, Math.round(value)));
}

export function clampGridPadding(value: number | undefined, dimension: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return 0;
  const maxPad = Math.max(0, Math.floor((dimension - 3) / 2));
  return Math.max(0, Math.min(maxPad, Math.round(value)));
}

export function clampDotScale(value: number | undefined, fallback = DOT_SCALE_DEFAULT): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(DOT_SCALE_MIN, Math.min(DOT_SCALE_MAX, value));
}

export function clampDotGap(value: number | undefined, fallback = DOT_GAP_DEFAULT): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(DOT_GAP_MIN, Math.min(DOT_GAP_MAX, value));
}

export function resolveDotRadius(options?: {
  dotRadius?: number;
  dotScale?: number;
  dotGap?: number;
}): number {
  if (typeof options?.dotRadius === 'number' && Number.isFinite(options.dotRadius)) {
    const clamped = Math.max(0.08, Math.min(0.58, options.dotRadius));
    return Math.round(clamped * 10000) / 10000;
  }
  const scale = clampDotScale(options?.dotScale, DOT_SCALE_DEFAULT);
  const gap = clampDotGap(options?.dotGap, DOT_GAP_DEFAULT);
  const raw = 0.5 * scale * (1 - gap);
  const clamped = Math.max(0.08, Math.min(0.58, raw));
  return Math.round(clamped * 10000) / 10000;
}

export function resolveDotIconName(name: DotIconName): DotIconCanonicalName {
  if (name in DOT_ICON_ALIASES) {
    return DOT_ICON_ALIASES[name as DotIconAliasName];
  }
  return name as DotIconCanonicalName;
}

export function getDotIconBitmap(name: DotIconName): readonly string[] {
  return DOT_ICON_BITMAPS[resolveDotIconName(name)];
}

export function normalizeCustomGrid(grid: readonly string[]): ResolvedDotGrid {
  const slicedRows = grid.slice(0, DOT_GRID_MAX);
  const rowCount = Math.max(1, slicedRows.length);
  const cols = Math.max(
    1,
    Math.min(
      DOT_GRID_MAX,
      slicedRows.reduce((max, row) => Math.max(max, row.length), 1),
    ),
  );

  const rows = slicedRows.map((row) => {
    let normalized = '';
    for (let x = 0; x < cols; x++) {
      normalized += row[x] === '#' ? '#' : '.';
    }
    return normalized;
  });

  if (rows.length === 0) {
    return { rows: ['.'], cols: 1, rowCount: 1 };
  }

  return { rows, cols, rowCount };
}

export function resampleDotBitmap(
  sourceRows: readonly string[],
  targetCols: number,
  targetRows: number,
  mode: DotGridMode = 'scale',
  padding = 0,
): string[] {
  const cols = clampGridDimension(targetCols, DOT_GRID_DEFAULT);
  const rowsCount = clampGridDimension(targetRows, DOT_GRID_DEFAULT);
  const padX = clampGridPadding(padding, cols);
  const padY = clampGridPadding(padding, rowsCount);

  const srcH = sourceRows.length;
  const srcW = sourceRows[0]?.length ?? DOT_GRID_DEFAULT;

  if (cols === srcW && rowsCount === srcH && padX === 0 && padY === 0) {
    return [...sourceRows];
  }

  const innerW = cols - padX * 2;
  const innerH = rowsCount - padY * 2;
  const result: string[] = [];

  if (mode === 'center') {
    const offsetX = Math.floor((innerW - srcW) / 2);
    const offsetY = Math.floor((innerH - srcH) / 2);

    for (let y = 0; y < rowsCount; y++) {
      let line = '';
      for (let x = 0; x < cols; x++) {
        if (x < padX || x >= cols - padX || y < padY || y >= rowsCount - padY) {
          line += '.';
          continue;
        }
        const sx = x - padX - offsetX;
        const sy = y - padY - offsetY;
        const lit = sy >= 0 && sy < srcH && sx >= 0 && sx < srcW && sourceRows[sy][sx] === '#';
        line += lit ? '#' : '.';
      }
      result.push(line);
    }
    return result;
  }

  // 'scale' mode: proportional resampling with downscale stroke preservation
  for (let y = 0; y < rowsCount; y++) {
    let line = '';
    for (let x = 0; x < cols; x++) {
      if (x < padX || x >= cols - padX || y < padY || y >= rowsCount - padY) {
        line += '.';
        continue;
      }

      const ix = x - padX;
      const iy = y - padY;

      if (innerW >= srcW && innerH >= srcH) {
        const sx = Math.min(srcW - 1, Math.floor(((ix + 0.5) / innerW) * srcW));
        const sy = Math.min(srcH - 1, Math.floor(((iy + 0.5) / innerH) * srcH));
        line += sourceRows[sy]?.[sx] === '#' ? '#' : '.';
      } else {
        const x0 = Math.floor((ix / innerW) * srcW);
        const x1 = Math.max(x0 + 1, Math.ceil(((ix + 1) / innerW) * srcW));
        const y0 = Math.floor((iy / innerH) * srcH);
        const y1 = Math.max(y0 + 1, Math.ceil(((iy + 1) / innerH) * srcH));
        const cx = Math.min(srcW - 1, Math.floor(((ix + 0.5) / innerW) * srcW));
        const cy = Math.min(srcH - 1, Math.floor(((iy + 0.5) / innerH) * srcH));

        let litCount = 0;
        let totalCount = 0;
        for (let sy = y0; sy < Math.min(srcH, y1); sy++) {
          for (let sx = x0; sx < Math.min(srcW, x1); sx++) {
            totalCount++;
            if (sourceRows[sy]?.[sx] === '#') litCount++;
          }
        }
        const centerLit = sourceRows[cy]?.[cx] === '#';
        const lit = centerLit || (totalCount > 0 && litCount / totalCount >= 0.45);
        line += lit ? '#' : '.';
      }
    }
    result.push(line);
  }

  return result;
}

export function getDotIconGrid(
  name: DotIconName,
  options?: DotIconGridOptions,
): ResolvedDotGrid {
  if (options?.grid && options.grid.length > 0) {
    return normalizeCustomGrid(options.grid);
  }

  const sourceBitmap = getDotIconBitmap(name);
  const nativeRows = sourceBitmap.length || DOT_GRID_DEFAULT;
  const nativeCols = sourceBitmap[0]?.length ?? nativeRows;

  const baseSize = options?.gridSize;
  const cols = clampGridDimension(options?.gridCols ?? baseSize, nativeCols);
  const rowCount = clampGridDimension(options?.gridRows ?? baseSize, nativeRows);
  const rows = resampleDotBitmap(
    sourceBitmap,
    cols,
    rowCount,
    options?.gridMode ?? 'scale',
    options?.gridPadding ?? 0,
  );

  return { rows, cols, rowCount };
}

export function getDotIconCells(
  name: DotIconName,
  options?: DotIconGridOptions,
): { cells: DotCell[]; cols: number; rows: number } {
  const resolved = getDotIconGrid(name, options);
  const cells: DotCell[] = [];
  for (let y = 0; y < resolved.rowCount; y++) {
    const row = resolved.rows[y];
    for (let x = 0; x < resolved.cols; x++) {
      cells.push({ x, y, lit: row[x] === '#' });
    }
  }
  return { cells, cols: resolved.cols, rows: resolved.rowCount };
}

export function getDotIconPoints(
  name: DotIconName,
  options?: DotIconGridOptions,
): DotPoint[] {
  const resolved = getDotIconGrid(name, options);
  const points: DotPoint[] = [];
  for (let y = 0; y < resolved.rowCount; y++) {
    const row = resolved.rows[y];
    for (let x = 0; x < resolved.cols; x++) {
      if (row[x] === '#') {
        points.push({ x, y });
      }
    }
  }
  return points;
}

export function toggleDotGridCell(rows: readonly string[], x: number, y: number): string[] {
  return rows.map((row, rowIdx) => {
    if (rowIdx !== y) return row;
    if (x < 0 || x >= row.length) return row;
    const nextChar = row[x] === '#' ? '.' : '#';
    return row.slice(0, x) + nextChar + row.slice(x + 1);
  });
}

export function invertDotGrid(rows: readonly string[]): string[] {
  return rows.map((row) =>
    row
      .split('')
      .map((ch) => (ch === '#' ? '.' : '#'))
      .join(''),
  );
}

export function clearDotGrid(cols: number, rowsCount: number): string[] {
  const c = clampGridDimension(cols, DOT_GRID_DEFAULT);
  const r = clampGridDimension(rowsCount, DOT_GRID_DEFAULT);
  return Array.from({ length: r }, () => '.'.repeat(c));
}

export function computeSvgDimensions(
  size: number,
  cols: number,
  rowsCount: number,
): { width: number; height: number } {
  const safeSize = Math.max(8, size);
  if (cols === rowsCount) {
    return { width: safeSize, height: safeSize };
  }
  if (cols > rowsCount) {
    return {
      width: safeSize,
      height: Math.max(8, Math.round((safeSize * rowsCount) / cols)),
    };
  }
  return {
    width: Math.max(8, Math.round((safeSize * cols) / rowsCount)),
    height: safeSize,
  };
}

const ORIGINAL_NAME_SET = new Set<string>(NOTHING_ORIGINAL_ICON_NAMES);

export function validateDotIconBitmaps(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const seenOriginalBitmaps = new Map<string, string>();

  for (const name of DOT_ICON_NAMES) {
    const rows = DOT_ICON_BITMAPS[name];
    const isOriginal = ORIGINAL_NAME_SET.has(name);
    const expectedSize = isOriginal ? DOT_GRID_DEFAULT : LUCIDE_DOT_GRID_SIZE;
    const rowPattern = isOriginal ? /^[#.]{9}$/ : /^[#.]{15}$/;

    if (rows.length !== expectedSize) {
      errors.push(`${name}: expected ${expectedSize} rows, got ${rows.length}`);
      continue;
    }
    let litCount = 0;
    rows.forEach((row, idx) => {
      if (row.length !== expectedSize) {
        errors.push(`${name}[${idx}]: expected ${expectedSize} columns, got ${row.length}`);
      }
      if (!rowPattern.test(row)) {
        errors.push(`${name}[${idx}]: contains characters other than '#' and '.'`);
      }
      for (let i = 0; i < row.length; i++) {
        if (row[i] === '#') litCount++;
      }
    });
    if (litCount === 0) {
      errors.push(`${name}: bitmap has zero lit dots`);
    }
    if (isOriginal) {
      const key = rows.join('|');
      const existing = seenOriginalBitmaps.get(key);
      if (existing) {
        errors.push(`${name}: duplicate original bitmap matches "${existing}"`);
      } else {
        seenOriginalBitmaps.set(key, name);
      }
    }
    if (!(name in DOT_ICON_METADATA)) {
      errors.push(`${name}: missing metadata entry`);
    }
  }

  for (const [alias, target] of Object.entries(DOT_ICON_ALIASES)) {
    if (!(target in DOT_ICON_BITMAPS)) {
      errors.push(`alias "${alias}" points to unknown icon "${target}"`);
    }
  }

  return { valid: errors.length === 0, errors };
}

function renderSvgDotElement(
  x: number,
  y: number,
  radius: number,
  shape: DotShape,
  fill: string,
  opacity?: number,
): string {
  const cx = x + 0.5;
  const cy = y + 0.5;
  const opacityAttr = opacity !== undefined ? ` opacity="${opacity}"` : '';

  if (shape === 'square' || shape === 'rounded') {
    const side = Math.round(radius * 2 * 10000) / 10000;
    const rx = shape === 'rounded' ? Math.round(radius * 0.52 * 10000) / 10000 : 0;
    const ox = Math.round((cx - radius) * 10000) / 10000;
    const oy = Math.round((cy - radius) * 10000) / 10000;
    const rxAttr = rx > 0 ? ` rx="${rx}"` : '';
    return `  <rect x="${ox}" y="${oy}" width="${side}" height="${side}"${rxAttr} fill="${fill}"${opacityAttr} />`;
  }

  if (shape === 'diamond') {
    const pts = `${cx},${Math.round((cy - radius) * 10000) / 10000} ${Math.round((cx + radius) * 10000) / 10000},${cy} ${cx},${Math.round((cy + radius) * 10000) / 10000} ${Math.round((cx - radius) * 10000) / 10000},${cy}`;
    return `  <polygon points="${pts}" fill="${fill}"${opacityAttr} />`;
  }

  return `  <circle cx="${cx}" cy="${cy}" r="${radius}" fill="${fill}"${opacityAttr} />`;
}

export function dotIconToSvgString(
  name: DotIconName,
  options?: DotIconRenderOptions,
): string {
  const canonical = resolveDotIconName(name);
  const size = options?.size ?? 24;
  const color = options?.color ?? 'currentColor';
  const dotShape: DotShape = options?.dotShape ?? 'circle';
  const radius = resolveDotRadius(options);
  const showGrid = Boolean(options?.showGrid);
  const inactiveColor = options?.inactiveColor ?? color;
  const inactiveOpacity = options?.inactiveOpacity ?? 0.14;

  const { cells, cols, rows } = getDotIconCells(canonical, options);
  const { width, height } = computeSvgDimensions(size, cols, rows);

  const lines: string[] = [];
  if (options?.backgroundColor) {
    lines.push(`  <rect width="${cols}" height="${rows}" fill="${options.backgroundColor}" />`);
  }

  for (const cell of cells) {
    if (cell.lit) {
      lines.push(renderSvgDotElement(cell.x, cell.y, radius, dotShape, color));
    } else if (showGrid) {
      lines.push(
        renderSvgDotElement(cell.x, cell.y, radius, dotShape, inactiveColor, inactiveOpacity),
      );
    }
  }

  const label = DOT_ICON_METADATA[canonical]?.title ?? canonical;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${cols} ${rows}" fill="none" role="img" aria-label="${label}">\n${lines.join('\n')}\n</svg>`;
}

export function searchDotIcons(
  query: string,
  category?: string,
  source?: 'all' | DotIconSource,
): DotIconMetadata[] {
  const q = query.trim().toLowerCase();
  const matched: Array<{ icon: DotIconMetadata; score: number }> = [];

  for (const icon of DOT_ICON_LIST) {
    if (category && category !== 'All' && icon.category !== category) {
      continue;
    }
    if (source && source !== 'all' && icon.source !== source) {
      continue;
    }
    if (!q) {
      matched.push({ icon, score: 0 });
      continue;
    }

    const idLower = icon.id.toLowerCase();
    const titleLower = icon.title.toLowerCase();
    const aliasMatch = icon.aliases?.some((a) => a.toLowerCase() === q) ?? false;
    const aliasIncludes = icon.aliases?.some((a) => a.toLowerCase().includes(q)) ?? false;

    let score = -1;
    if (idLower === q || aliasMatch) {
      score = 0;
    } else if (idLower.startsWith(q) || titleLower.startsWith(q)) {
      score = 1;
    } else if (idLower.includes(q) || titleLower.includes(q) || aliasIncludes) {
      score = 2;
    } else if (icon.tags.some((t) => t.toLowerCase().includes(q))) {
      score = 3;
    } else if (icon.category.toLowerCase().includes(q)) {
      score = 4;
    }

    if (score >= 0) {
      matched.push({ icon, score });
    }
  }

  if (q) {
    matched.sort((a, b) => a.score - b.score || a.icon.id.length - b.icon.id.length);
  }

  return matched.map((item) => item.icon);
}

function formatCommonSnippetProps(
  name: DotIconName,
  options: DotIconRenderOptions,
  defaultColor: string,
): string[] {
  const props: string[] = [`name="${name}"`, `size={${options.size ?? 24}}`];
  const color = options.color ?? defaultColor;
  props.push(`color="${color}"`);

  if (options.dotRadius !== undefined) {
    props.push(`dotRadius={${options.dotRadius}}`);
  } else if (options.dotScale !== undefined && Math.abs(options.dotScale - DOT_SCALE_DEFAULT) > 0.001) {
    props.push(`dotScale={${Number(options.dotScale.toFixed(2))}}`);
  }

  if (options.dotGap !== undefined && options.dotGap > 0.001) {
    props.push(`dotGap={${Number(options.dotGap.toFixed(2))}}`);
  }

  if (options.dotShape && options.dotShape !== 'circle') {
    props.push(`dotShape="${options.dotShape}"`);
  }

  if (options.grid && options.grid.length > 0) {
    const gridLiteral = JSON.stringify(options.grid);
    props.push(`grid={${gridLiteral}}`);
  } else {
    const nativeDim = getDotIconBitmap(name).length || DOT_GRID_DEFAULT;
    const cols = options.gridCols ?? options.gridSize;
    const rows = options.gridRows ?? options.gridSize;
    if (cols !== undefined && rows !== undefined && cols === rows && cols !== nativeDim) {
      props.push(`gridSize={${cols}}`);
    } else {
      if (cols !== undefined && cols !== nativeDim) {
        props.push(`gridCols={${cols}}`);
      }
      if (rows !== undefined && rows !== nativeDim) {
        props.push(`gridRows={${rows}}`);
      }
    }
    if (options.gridMode && options.gridMode !== 'scale') {
      props.push(`gridMode="${options.gridMode}"`);
    }
    if (options.gridPadding && options.gridPadding > 0) {
      props.push(`gridPadding={${options.gridPadding}}`);
    }
  }

  if (options.showGrid) {
    props.push('showGrid');
    if (options.inactiveColor) {
      props.push(`inactiveColor="${options.inactiveColor}"`);
    }
  }

  return props;
}

export function buildDotIconReactSnippet(
  name: DotIconName,
  sizeOrOptions: number | DotIconRenderOptions = 24,
): string {
  const options: DotIconRenderOptions =
    typeof sizeOrOptions === 'number' ? { size: sizeOrOptions } : sizeOrOptions;
  const propList = formatCommonSnippetProps(name, options, 'currentColor');
  const multiline = propList.length > 4 || propList.some((p) => p.length > 48);
  const jsx = multiline
    ? `<DotIcon\n      ${propList.join('\n      ')}\n    />`
    : `<DotIcon ${propList.join(' ')} />`;
  return `import { DotIcon } from "nthgui/icons"\n\nexport function Example() {\n  return (\n    ${jsx}\n  )\n}`;
}

export function buildDotIconNativeSnippet(
  name: DotIconName,
  sizeOrOptions: number | DotIconRenderOptions = 24,
): string {
  const options: DotIconRenderOptions =
    typeof sizeOrOptions === 'number' ? { size: sizeOrOptions } : sizeOrOptions;
  const propList = formatCommonSnippetProps(name, options, '#FFFFFF');
  const multiline = propList.length > 4 || propList.some((p) => p.length > 48);
  const jsx = multiline
    ? `<DotIcon\n      ${propList.join('\n      ')}\n    />`
    : `<DotIcon ${propList.join(' ')} />`;
  return `import { DotIcon } from "nthgui/native"\n\nexport function Example() {\n  return (\n    ${jsx}\n  )\n}`;
}
