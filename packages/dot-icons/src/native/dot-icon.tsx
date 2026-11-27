import * as React from 'react';
import type { DotIconName } from '../data/bitmaps';
import {
  computeSvgDimensions,
  getDotIconCells,
  resolveDotIconName,
  resolveDotRadius,
  type DotGridMode,
  type DotShape,
} from '../core/points';

export interface NativeDotIconProps {
  name: DotIconName;
  size?: number;
  color?: string;
  dotScale?: number;
  dotRadius?: number;
  dotGap?: number;
  dotShape?: DotShape;
  gridSize?: number;
  gridCols?: number;
  gridRows?: number;
  gridMode?: DotGridMode;
  gridPadding?: number;
  grid?: readonly string[];
  showGrid?: boolean;
  inactiveColor?: string;
  inactiveOpacity?: number;
  accessibilityLabel?: string;
  SvgComponent?: React.ComponentType<Record<string, unknown>>;
  CircleComponent?: React.ComponentType<Record<string, unknown>>;
  RectComponent?: React.ComponentType<Record<string, unknown>>;
}

/**
 * React Native DotIcon adapter designed for `react-native-svg`.
 * Shares exact configurable grid and dot-scale math with web while avoiding any DOM dependency.
 */
export function DotIcon({
  name,
  size = 24,
  color = '#FFFFFF',
  dotScale,
  dotRadius,
  dotGap,
  dotShape = 'circle',
  gridSize,
  gridCols,
  gridRows,
  gridMode = 'scale',
  gridPadding = 0,
  grid,
  showGrid = false,
  inactiveColor,
  inactiveOpacity = 0.14,
  accessibilityLabel,
  SvgComponent,
  CircleComponent,
  RectComponent,
}: NativeDotIconProps) {
  const canonical = resolveDotIconName(name);
  const radius = resolveDotRadius({ dotRadius, dotScale, dotGap });
  const gridKey = grid ? grid.join('|') : '';

  const { cells, cols, rows } = React.useMemo(
    () =>
      getDotIconCells(canonical, {
        gridSize,
        gridCols,
        gridRows,
        gridMode,
        gridPadding,
        grid,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canonical, gridSize, gridCols, gridRows, gridMode, gridPadding, gridKey],
  );

  if (!SvgComponent || !CircleComponent) {
    return null;
  }

  const { width, height } = computeSvgDimensions(size, cols, rows);
  const unlitFill = inactiveColor ?? color;

  const children = cells
    .map((cell) => {
      if (!cell.lit && !showGrid) return null;
      const fill = cell.lit ? color : unlitFill;
      const opacity = cell.lit ? undefined : inactiveOpacity;
      const cx = cell.x + 0.5;
      const cy = cell.y + 0.5;

      if ((dotShape === 'square' || dotShape === 'rounded') && RectComponent) {
        const side = radius * 2;
        return React.createElement(RectComponent, {
          key: `${cell.x}-${cell.y}`,
          x: cx - radius,
          y: cy - radius,
          width: side,
          height: side,
          rx: dotShape === 'rounded' ? radius * 0.52 : 0,
          fill,
          opacity,
        });
      }

      return React.createElement(CircleComponent, {
        key: `${cell.x}-${cell.y}`,
        cx,
        cy,
        r: radius,
        fill,
        opacity,
      });
    })
    .filter(Boolean);

  return React.createElement(
    SvgComponent,
    {
      width,
      height,
      viewBox: `0 0 ${cols} ${rows}`,
      accessible: true,
      accessibilityRole: 'image',
      accessibilityLabel: accessibilityLabel ?? `${canonical} dot icon`,
    },
    children,
  );
}
