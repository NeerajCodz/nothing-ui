import { createMask } from './geometry';
import type { GlyphCellState, GlyphPaintState, GlyphResolution } from './types';

export function createEmptyGrid(resolution: GlyphResolution): GlyphCellState[] {
  const mask = createMask(resolution);
  return mask.map((inside) => (inside ? 'off' : 'void'));
}

export function toggleCell(
  cells: readonly GlyphCellState[],
  index: number,
  paintState: Exclude<GlyphPaintState, 'off'> = 'on'
): GlyphCellState[] {
  if (index < 0 || index >= cells.length || cells[index] === 'void') {
    return [...cells];
  }
  const next = [...cells];
  next[index] = next[index] === paintState ? 'off' : paintState;
  return next;
}

export function paintCells(
  cells: readonly GlyphCellState[],
  indices: readonly number[],
  paintState: GlyphPaintState
): GlyphCellState[] {
  let changed = false;
  const next = [...cells];
  for (const idx of indices) {
    if (idx >= 0 && idx < next.length && next[idx] !== 'void' && next[idx] !== paintState) {
      next[idx] = paintState;
      changed = true;
    }
  }
  return changed ? next : [...cells];
}

export function fill(
  cells: readonly GlyphCellState[],
  paintState: Exclude<GlyphPaintState, 'off'> = 'on'
): GlyphCellState[] {
  return cells.map((cell) => (cell === 'void' ? 'void' : paintState));
}

export function erase(cells: readonly GlyphCellState[], indices: readonly number[]): GlyphCellState[] {
  return paintCells(cells, indices, 'off');
}

export function clear(cells: readonly GlyphCellState[]): GlyphCellState[] {
  return cells.map((cell) => (cell === 'void' ? 'void' : 'off'));
}

export function invert(
  cells: readonly GlyphCellState[],
  fillState: Exclude<GlyphPaintState, 'off'> = 'on'
): GlyphCellState[] {
  return cells.map((cell) => {
    if (cell === 'void') return 'void';
    return cell === 'off' ? fillState : 'off';
  });
}

export function countLitCells(cells: readonly GlyphCellState[]): number {
  let count = 0;
  for (const cell of cells) {
    if (cell === 'on' || cell === 'signal') count++;
  }
  return count;
}

export function countSignalCells(cells: readonly GlyphCellState[]): number {
  let count = 0;
  for (const cell of cells) {
    if (cell === 'signal') count++;
  }
  return count;
}
