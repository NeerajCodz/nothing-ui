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

export interface DotIconProps extends Omit<React.SVGProps<SVGSVGElement>, 'children'> {
  name: DotIconName;
  /** Rendered icon size in px (longest dimension for non-square grids). */
  size?: number;
  /** Active lit dot color (CSS color, hex, token, or currentColor). */
  color?: string;
  /** Single-dot scale relative to cell width (0.2–1.2, default 0.78). */
  dotScale?: number;
  /** Explicit dot radius inside each unit cell (legacy override; takes precedence over dotScale). */
  dotRadius?: number;
  /** Extra inter-dot spacing inset (0–0.5, default 0). */
  dotGap?: number;
  /** Dot geometry inside each cell ('circle' | 'rounded' | 'square' | 'diamond'). */
  dotShape?: DotShape;
  /** Shorthand square dot grid dimension (5–25). */
  gridSize?: number;
  /** Independent horizontal dot count (5–25). */
  gridCols?: number;
  /** Independent vertical dot count (5–25). */
  gridRows?: number;
  /** How the canonical 9×9 bitmap maps onto custom grid sizes ('scale' | 'center'). */
  gridMode?: DotGridMode;
  /** Uniform unlit padding cells around the icon inside the grid (0–4). */
  gridPadding?: number;
  /** Direct custom '#' / '.' dot-grid override. */
  grid?: readonly string[];
  /** Render the unlit background dot matrix behind lit dots. */
  showGrid?: boolean;
  /** Fill color for unlit matrix dots when showGrid is enabled. */
  inactiveColor?: string;
  /** Opacity for unlit matrix dots when showGrid is enabled (default 0.14). */
  inactiveOpacity?: number;
  /** Optional SVG canvas background color. */
  backgroundColor?: string;
  /** Marks icon decorative with aria-hidden="true". */
  decorative?: boolean;
}

export const DotIcon = React.forwardRef<SVGSVGElement, DotIconProps>(
  (
    {
      name,
      size = 20,
      color = 'currentColor',
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
      backgroundColor,
      decorative = false,
      className,
      'aria-label': ariaLabel,
      style,
      ...rest
    },
    ref,
  ) => {
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

    const { width, height } = computeSvgDimensions(size, cols, rows);
    const isDecorative = decorative || ariaLabel === '';
    const unlitFill = inactiveColor ?? color;

    const renderDot = (
      x: number,
      y: number,
      fill: string,
      opacity?: number,
    ) => {
      const cx = x + 0.5;
      const cy = y + 0.5;
      const key = `${x}-${y}`;

      if (dotShape === 'square' || dotShape === 'rounded') {
        const side = radius * 2;
        const rx = dotShape === 'rounded' ? radius * 0.52 : 0;
        return (
          <rect
            key={key}
            x={cx - radius}
            y={cy - radius}
            width={side}
            height={side}
            rx={rx > 0 ? rx : undefined}
            fill={fill}
            opacity={opacity}
          />
        );
      }

      if (dotShape === 'diamond') {
        const pts = `${cx},${cy - radius} ${cx + radius},${cy} ${cx},${cy + radius} ${cx - radius},${cy}`;
        return <polygon key={key} points={pts} fill={fill} opacity={opacity} />;
      }

      return (
        <circle
          key={key}
          cx={cx}
          cy={cy}
          r={radius}
          fill={fill}
          opacity={opacity}
        />
      );
    };

    return (
      <svg
        ref={ref}
        width={width}
        height={height}
        viewBox={`0 0 ${cols} ${rows}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role={isDecorative ? undefined : 'img'}
        aria-hidden={isDecorative ? true : undefined}
        aria-label={isDecorative ? undefined : ariaLabel ?? `${canonical} dot icon`}
        data-grid={`${cols}x${rows}`}
        className={className}
        style={{ display: 'inline-block', flexShrink: 0, ...style }}
        {...rest}
      >
        {backgroundColor && <rect width={cols} height={rows} fill={backgroundColor} />}
        {cells.map((cell) => {
          if (cell.lit) {
            return renderDot(cell.x, cell.y, color);
          }
          if (showGrid) {
            return renderDot(cell.x, cell.y, unlitFill, inactiveOpacity);
          }
          return null;
        })}
      </svg>
    );
  },
);

DotIcon.displayName = 'DotIcon';
