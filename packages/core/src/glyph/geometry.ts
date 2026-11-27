import type { GlyphGeometry, GlyphResolution } from './types';

export const GLYPH_GEOMETRIES: Record<GlyphResolution, GlyphGeometry> = {
  25: {
    resolution: 25,
    center: 12,
    radius: 12.3,
    totalCells: 625,
    addressableCount: 481,
    voidCount: 144,
  },
  13: {
    resolution: 13,
    center: 6,
    radius: 6.15,
    totalCells: 169,
    addressableCount: 121,
    voidCount: 48,
  },
};

export function getGlyphGeometry(resolution: GlyphResolution): GlyphGeometry {
  return GLYPH_GEOMETRIES[resolution];
}

export function isInsideCircle(x: number, y: number, resolution: GlyphResolution): boolean {
  if (x < 0 || y < 0 || x >= resolution || y >= resolution) {
    return false;
  }
  const { center, radius } = GLYPH_GEOMETRIES[resolution];
  return Math.hypot(x - center, y - center) <= radius;
}

export function createMask(resolution: GlyphResolution): boolean[] {
  const mask: boolean[] = new Array(resolution * resolution);
  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      mask[y * resolution + x] = isInsideCircle(x, y, resolution);
    }
  }
  return mask;
}

export function countAddressable(resolution: GlyphResolution): number {
  let count = 0;
  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      if (isInsideCircle(x, y, resolution)) count++;
    }
  }
  return count;
}

export function coordsToIndex(x: number, y: number, resolution: GlyphResolution): number {
  return y * resolution + x;
}

export function indexToCoords(index: number, resolution: GlyphResolution): { x: number; y: number } {
  return {
    x: index % resolution,
    y: Math.floor(index / resolution),
  };
}
