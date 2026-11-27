import { createMask } from './geometry';
import type { GlyphCellState, GlyphFrame, GlyphPatternV1, GlyphResolution } from './types';

export const MAX_GLYPH_FRAMES = 64;
export const MIN_FRAME_DURATION_MS = 40;
export const MAX_FRAME_DURATION_MS = 10000;
const VALID_CELL_STATES = new Set<string>(['void', 'off', 'on', 'signal']);

export interface PatternValidationResult {
  valid: boolean;
  errors: string[];
}

function validateCellArray(
  cells: unknown,
  resolution: GlyphResolution,
  mask: boolean[],
  context: string,
  errors: string[]
): void {
  if (!Array.isArray(cells)) {
    errors.push(`${context}: cells must be an array.`);
    return;
  }
  const expected = resolution * resolution;
  if (cells.length !== expected) {
    errors.push(`${context}: expected ${expected} cells for ${resolution}x${resolution}, received ${cells.length}.`);
    return;
  }
  for (let i = 0; i < cells.length; i++) {
    const val = cells[i];
    if (typeof val !== 'string' || !VALID_CELL_STATES.has(val)) {
      errors.push(`${context}: unrecognized cell state at index ${i}.`);
      return;
    }
    if (!mask[i] && val !== 'void') {
      errors.push(`${context}: cell at index ${i} lies outside circular mask and must be "void".`);
      return;
    }
    if (mask[i] && val === 'void') {
      errors.push(`${context}: cell at index ${i} lies inside circular mask and cannot be "void".`);
      return;
    }
  }
}

export function validatePattern(input: unknown): PatternValidationResult {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['Pattern must be a JSON object.'] };
  }
  const candidate = input as Record<string, unknown>;
  if (candidate.version !== 1) {
    errors.push('Unsupported pattern version: expected version 1.');
  }
  if (candidate.resolution !== 13 && candidate.resolution !== 25) {
    errors.push('Invalid resolution: must be 13 or 25.');
    return { valid: false, errors };
  }
  const resolution = candidate.resolution as GlyphResolution;
  const mask = createMask(resolution);

  validateCellArray(candidate.cells, resolution, mask, 'root', errors);

  if (candidate.name !== undefined && (typeof candidate.name !== 'string' || candidate.name.length > 80)) {
    errors.push('Pattern name must be a string up to 80 characters.');
  }

  if (candidate.frames !== undefined) {
    if (!Array.isArray(candidate.frames)) {
      errors.push('frames must be an array.');
    } else if (candidate.frames.length > MAX_GLYPH_FRAMES) {
      errors.push(`frames cannot exceed ${MAX_GLYPH_FRAMES} frames.`);
    } else {
      candidate.frames.forEach((frame, idx) => {
        if (!frame || typeof frame !== 'object') {
          errors.push(`frame[${idx}] must be an object.`);
          return;
        }
        const f = frame as Record<string, unknown>;
        if (
          typeof f.durationMs !== 'number' ||
          !Number.isFinite(f.durationMs) ||
          f.durationMs < MIN_FRAME_DURATION_MS ||
          f.durationMs > MAX_FRAME_DURATION_MS
        ) {
          errors.push(
            `frame[${idx}].durationMs must be between ${MIN_FRAME_DURATION_MS} and ${MAX_FRAME_DURATION_MS}.`
          );
        }
        validateCellArray(f.cells, resolution, mask, `frame[${idx}]`, errors);
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

export function isValidPattern(input: unknown): input is GlyphPatternV1 {
  return validatePattern(input).valid;
}

export function serializePattern(pattern: GlyphPatternV1): string {
  const result = validatePattern(pattern);
  if (!result.valid) {
    throw new Error(`Cannot serialize invalid GlyphPatternV1: ${result.errors.join(' ')}`);
  }
  const clean: GlyphPatternV1 = {
    version: 1,
    resolution: pattern.resolution,
    cells: [...pattern.cells],
    ...(pattern.name ? { name: pattern.name } : {}),
    ...(pattern.frames && pattern.frames.length > 0
      ? {
          frames: pattern.frames.map((frame: GlyphFrame) => ({
            cells: [...frame.cells],
            durationMs: Math.round(frame.durationMs),
          })),
        }
      : {}),
  };
  return JSON.stringify(clean, null, 2);
}

export function parsePattern(rawJson: string): { pattern?: GlyphPatternV1; errors: string[] } {
  if (rawJson.length > 250_000) {
    return { errors: ['Import payload exceeds maximum allowed size (250 KB).'] };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return { errors: ['Invalid JSON syntax.'] };
  }
  const validation = validatePattern(parsed);
  if (!validation.valid) {
    return { errors: validation.errors };
  }
  return { pattern: parsed as GlyphPatternV1, errors: [] };
}

export function patternToSvgString(
  cells: readonly GlyphCellState[],
  resolution: GlyphResolution,
  options?: {
    size?: number;
    background?: string;
    onColor?: string;
    signalColor?: string;
    offColor?: string;
  }
): string {
  const size = options?.size ?? 256;
  const bg = options?.background ?? '#0A0A0A';
  const onColor = options?.onColor ?? '#FFFFFF';
  const signalColor = options?.signalColor ?? '#D71921';
  const offColor = options?.offColor ?? 'rgba(255,255,255,0.12)';
  const viewBox = resolution * 10;
  const r = resolution === 13 ? 3.4 : 3.2;

  const circles: string[] = [];
  for (let i = 0; i < cells.length; i++) {
    const state = cells[i];
    if (state === 'void') continue;
    const x = (i % resolution) * 10 + 5;
    const y = Math.floor(i / resolution) * 10 + 5;
    const fill = state === 'signal' ? signalColor : state === 'on' ? onColor : offColor;
    circles.push(`  <circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" />`);
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${viewBox} ${viewBox}" role="img" aria-label="Nothing UI Glyph Matrix ${resolution}x${resolution}">`,
    `  <circle cx="${viewBox / 2}" cy="${viewBox / 2}" r="${viewBox / 2 - 1}" fill="${bg}" />`,
    ...circles,
    '</svg>',
  ].join('\n');
}
