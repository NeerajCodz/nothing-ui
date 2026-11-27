import * as React from 'react';
import {
  GLYPH_PRESETS,
  clear,
  coordsToIndex,
  createEmptyGrid,
  getGlyphGeometry,
  getPreset,
  indexToCoords,
  invert,
  isInsideCircle,
  loopFrames,
  mirrorPattern,
  paintCells,
  toggleCell,
  type GlyphCellState,
  type GlyphFrame,
  type GlyphPaintState,
  type GlyphPresetId,
  type GlyphResolution,
} from '@nothing-ui/core';
import { cn } from '../lib/cn';

export interface GlyphMatrixProps {
  resolution?: GlyphResolution;
  preset?: GlyphPresetId;
  cells?: readonly GlyphCellState[];
  defaultCells?: readonly GlyphCellState[];
  onCellsChange?: (cells: GlyphCellState[]) => void;
  interactive?: boolean;
  paintState?: GlyphPaintState;
  size?: number;
  brightness?: number;
  color?: 'mono' | 'signal';
  label?: string;
  className?: string;
}

export function GlyphMatrix({
  resolution = 25,
  preset = 'power',
  cells: controlledCells,
  defaultCells,
  onCellsChange,
  interactive = false,
  paintState = 'on',
  size = 240,
  brightness = 1,
  color = 'mono',
  label,
  className,
}: GlyphMatrixProps) {
  const expectedLength = resolution * resolution;
  const fallbackGrid = React.useMemo(
    () => (defaultCells && defaultCells.length === expectedLength ? [...defaultCells] : getPreset(preset, resolution)),
    [defaultCells, expectedLength, preset, resolution]
  );

  const [internalCells, setInternalCells] = React.useState<GlyphCellState[]>(fallbackGrid);
  const [focusedIndex, setFocusedIndex] = React.useState<number>(() => {
    const { center } = getGlyphGeometry(resolution);
    return coordsToIndex(center, center, resolution);
  });
  const isPaintingRef = React.useRef(false);
  const strokeValueRef = React.useRef<GlyphPaintState>(paintState);

  React.useEffect(() => {
    if (!controlledCells) {
      setInternalCells(fallbackGrid);
    }
  }, [controlledCells, fallbackGrid]);

  React.useEffect(() => {
    const onPointerUp = () => {
      isPaintingRef.current = false;
    };
    window.addEventListener('pointerup', onPointerUp);
    return () => window.removeEventListener('pointerup', onPointerUp);
  }, []);

  const activeCells =
    controlledCells && controlledCells.length === expectedLength
      ? controlledCells
      : internalCells;

  const commit = React.useCallback(
    (next: GlyphCellState[]) => {
      if (!controlledCells) {
        setInternalCells(next);
      }
      onCellsChange?.(next);
    },
    [controlledCells, onCellsChange]
  );

  const handleCellPointerDown = (index: number) => {
    if (!interactive || activeCells[index] === 'void') return;
    isPaintingRef.current = true;
    setFocusedIndex(index);
    if (paintState === 'off') {
      strokeValueRef.current = 'off';
      commit(paintCells(activeCells, [index], 'off'));
    } else {
      const next = toggleCell(activeCells, index, paintState);
      strokeValueRef.current = next[index] === 'off' ? 'off' : paintState;
      commit(next);
    }
  };

  const handleCellPointerEnter = (index: number) => {
    if (!interactive || !isPaintingRef.current || activeCells[index] === 'void') return;
    setFocusedIndex(index);
    commit(paintCells(activeCells, [index], strokeValueRef.current));
  };

  const handleKeyDown = (e: React.KeyboardEvent<SVGSVGElement>) => {
    if (!interactive) return;
    const { x, y } = indexToCoords(focusedIndex, resolution);
    let nx = x;
    let ny = y;
    if (e.key === 'ArrowRight') nx = Math.min(resolution - 1, x + 1);
    else if (e.key === 'ArrowLeft') nx = Math.max(0, x - 1);
    else if (e.key === 'ArrowDown') ny = Math.min(resolution - 1, y + 1);
    else if (e.key === 'ArrowUp') ny = Math.max(0, y - 1);
    else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (paintState === 'off') {
        commit(paintCells(activeCells, [focusedIndex], 'off'));
      } else {
        commit(toggleCell(activeCells, focusedIndex, paintState));
      }
      return;
    } else {
      return;
    }

    e.preventDefault();
    if (isInsideCircle(nx, ny, resolution)) {
      setFocusedIndex(coordsToIndex(nx, ny, resolution));
    }
  };

  const viewBox = resolution * 10;
  const dotRadius = resolution === 13 ? 3.35 : 3.15;
  const clampedBrightness = Math.min(1, Math.max(0.2, brightness));

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${viewBox} ${viewBox}`}
      role={interactive ? 'application' : 'img'}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={handleKeyDown}
      aria-label={
        label ?? `Nothing Glyph Matrix ${resolution}x${resolution} (${preset})`
      }
      className={cn(
        'select-none touch-none rounded-full border border-[var(--nt-line)] bg-[#080808] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nt-focus-ring)]',
        interactive && 'cursor-crosshair',
        className
      )}
    >
      {activeCells.map((state, idx) => {
        if (state === 'void') return null;
        const row = Math.floor(idx / resolution);
        const col = idx % resolution;
        const cx = col * 10 + 5;
        const cy = row * 10 + 5;
        const isLit = state === 'on' || state === 'signal';
        const isSignal = state === 'signal' || (state === 'on' && color === 'signal');
        const fill = isSignal
          ? 'var(--nt-accent)'
          : isLit
            ? '#FFFFFF'
            : 'rgba(255,255,255,0.12)';
        const isFocused = interactive && idx === focusedIndex;

        return (
          <g key={idx}>
            {isFocused && (
              <circle
                cx={cx}
                cy={cy}
                r={dotRadius + 1.4}
                fill="none"
                stroke="var(--nt-accent)"
                strokeWidth={0.9}
              />
            )}
            <circle
              cx={cx}
              cy={cy}
              r={dotRadius}
              fill={fill}
              fillOpacity={isLit ? clampedBrightness : 1}
              aria-label={`LED row ${row + 1} col ${col + 1} ${state}`}
              onPointerDown={(e) => {
                e.preventDefault();
                handleCellPointerDown(idx);
              }}
              onPointerEnter={() => handleCellPointerEnter(idx)}
              style={{
                transition: 'fill 110ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </g>
        );
      })}
    </svg>
  );
}

export function GlyphMatrix25(props: Omit<GlyphMatrixProps, 'resolution'>) {
  return <GlyphMatrix {...props} resolution={25} />;
}

export function GlyphMatrix13(props: Omit<GlyphMatrixProps, 'resolution'>) {
  return <GlyphMatrix {...props} resolution={13} />;
}

export function GlyphPatternPreview({
  resolution = 25,
  cells,
  preset,
  size = 84,
  className,
}: {
  resolution?: GlyphResolution;
  cells?: readonly GlyphCellState[];
  preset?: GlyphPresetId;
  size?: number;
  className?: string;
}) {
  return (
    <GlyphMatrix
      resolution={resolution}
      cells={cells}
      preset={preset}
      size={size}
      interactive={false}
      className={className}
    />
  );
}

/**
 * Circular ring LED progress visualizer on 13x13 or 25x25 matrix geometry.
 */
export function GlyphProgress({
  value,
  resolution = 13,
  size = 140,
  signal = false,
  label,
}: {
  value: number;
  resolution?: GlyphResolution;
  size?: number;
  signal?: boolean;
  label?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  const cells = React.useMemo(() => {
    const grid = createEmptyGrid(resolution);
    const { center, radius } = getGlyphGeometry(resolution);
    const inner = radius - (resolution === 25 ? 2.4 : 1.55);
    const maxAngle = (clamped / 100) * Math.PI * 2;

    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        const idx = coordsToIndex(x, y, resolution);
        if (grid[idx] === 'void') continue;
        const d = Math.hypot(x - center, y - center);
        if (d >= inner && d <= radius) {
          let angle = Math.atan2(y - center, x - center) + Math.PI / 2;
          if (angle < 0) angle += Math.PI * 2;
          if (angle <= maxAngle && clamped > 0) {
            grid[idx] = signal ? 'signal' : 'on';
          }
        }
      }
    }
    return grid;
  }, [clamped, resolution, signal]);

  return (
    <GlyphMatrix
      resolution={resolution}
      cells={cells}
      size={size}
      label={label ?? `Glyph progress ${Math.round(clamped)}%`}
    />
  );
}

/**
 * Controlled frame animator with prefers-reduced-motion compliance.
 */
export function GlyphAnimator({
  resolution = 25,
  frames,
  playing = true,
  size = 180,
  label,
}: {
  resolution?: GlyphResolution;
  frames: readonly GlyphFrame[];
  playing?: boolean;
  size?: number;
  label?: string;
}) {
  const [elapsedMs, setElapsedMs] = React.useState(0);
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  React.useEffect(() => {
    if (!playing || reducedMotion || frames.length <= 1) return;
    const id = window.setInterval(() => {
      setElapsedMs((prev) => prev + 60);
    }, 60);
    return () => window.clearInterval(id);
  }, [playing, reducedMotion, frames.length]);

  const current = React.useMemo(() => {
    if (frames.length === 0) return createEmptyGrid(resolution);
    if (reducedMotion) return frames[0].cells;
    return loopFrames(frames, elapsedMs).cells;
  }, [frames, elapsedMs, reducedMotion, resolution]);

  return (
    <GlyphMatrix
      resolution={resolution}
      cells={current}
      size={size}
      label={label ?? `Animated glyph matrix (${frames.length} frames)`}
    />
  );
}

/**
 * 14.4 GlyphCell — Standalone addressable LED cell primitive for custom matrix layouts or legends.
 */
export interface GlyphCellProps {
  state: GlyphCellState;
  size?: number;
  interactive?: boolean;
  onToggle?: () => void;
  label?: string;
  className?: string;
}

export function GlyphCell({
  state,
  size = 18,
  interactive = false,
  onToggle,
  label,
  className,
}: GlyphCellProps) {
  const isVoid = state === 'void';
  const fillClass =
    state === 'signal'
      ? 'bg-[var(--nt-accent)] shadow-[0_0_8px_rgba(215,25,33,0.65)]'
      : state === 'on'
        ? 'bg-[var(--nt-display)] shadow-[0_0_6px_rgba(255,255,255,0.4)]'
        : state === 'off'
          ? 'bg-[var(--nt-line-2)] opacity-45'
          : 'border border-dashed border-[var(--nt-line)] bg-transparent opacity-30';

  if (interactive && !isVoid) {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-label={label ?? `Glyph LED ${state}`}
        aria-pressed={state === 'on' || state === 'signal'}
        style={{ width: size, height: size }}
        className={cn(
          'inline-block rounded-full transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nt-focus-ring)]',
          fillClass,
          className,
        )}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={label ?? `Glyph LED ${state}`}
      style={{ width: size, height: size }}
      className={cn('inline-block rounded-full transition-all', fillClass, className)}
    />
  );
}

/**
 * 14.6 GlyphPatternPicker — Interactive 8-preset selector with live mini circular matrix thumbnails.
 */
export function GlyphPatternPicker({
  value,
  onValueChange,
  resolution = 13,
  className,
}: {
  value: GlyphPresetId;
  onValueChange: (preset: GlyphPresetId) => void;
  resolution?: GlyphResolution;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Glyph pattern presets"
      className={cn('grid grid-cols-2 gap-2 sm:grid-cols-4', className)}
    >
      {GLYPH_PRESETS.map((preset) => {
        const selected = value === preset.id;
        return (
          <button
            key={preset.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onValueChange(preset.id)}
            className={cn(
              'flex flex-col items-center gap-2 rounded-xl border p-2.5 transition-colors cursor-pointer',
              selected
                ? 'border-[var(--nt-display)] bg-[var(--nt-raised)]'
                : 'border-[var(--nt-line)] bg-[var(--nt-surface)] hover:border-[var(--nt-line-2)]',
            )}
          >
            <GlyphPatternPreview preset={preset.id} resolution={resolution} size={56} />
            <span className="font-mono text-[11px] text-[var(--nt-display)]">{preset.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * 14.9 GlyphEditor — Reusable embeddable interactive Glyph grid editor with brush mode & transforms.
 */
export function GlyphEditor({
  resolution = 13,
  initialPreset = 'heart',
  size = 200,
  onChange,
  className,
}: {
  resolution?: GlyphResolution;
  initialPreset?: GlyphPresetId;
  size?: number;
  onChange?: (cells: GlyphCellState[]) => void;
  className?: string;
}) {
  const [cells, setCells] = React.useState<GlyphCellState[]>(() => getPreset(initialPreset, resolution));
  const [paintState, setPaintState] = React.useState<GlyphPaintState>('on');

  const update = (next: GlyphCellState[]) => {
    setCells(next);
    onChange?.(next);
  };

  return (
    <div className={cn('inline-flex flex-col items-center gap-4 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5', className)}>
      <div className="flex flex-wrap items-center justify-center gap-1.5 font-mono text-[11px]">
        {(['on', 'signal', 'off'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setPaintState(mode)}
            className={cn(
              'rounded-md border px-2.5 py-1 capitalize cursor-pointer',
              paintState === mode
                ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                : 'border-[var(--nt-line)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
            )}
          >
            {mode === 'on' ? 'White' : mode === 'signal' ? 'Signal' : 'Erase'}
          </button>
        ))}
        <button
          type="button"
          onClick={() => update(invert(cells))}
          className="rounded-md border border-[var(--nt-line)] px-2.5 py-1 text-[var(--nt-secondary)] hover:text-[var(--nt-display)] cursor-pointer"
        >
          Invert
        </button>
        <button
          type="button"
          onClick={() => update(mirrorPattern(cells, resolution))}
          className="rounded-md border border-[var(--nt-line)] px-2.5 py-1 text-[var(--nt-secondary)] hover:text-[var(--nt-display)] cursor-pointer"
        >
          Mirror
        </button>
        <button
          type="button"
          onClick={() => update(clear(cells))}
          className="rounded-md border border-[var(--nt-line)] px-2.5 py-1 text-[var(--nt-secondary)] hover:text-[var(--nt-display)] cursor-pointer"
        >
          Clear
        </button>
      </div>
      <GlyphMatrix
        resolution={resolution}
        cells={cells}
        onCellsChange={update}
        interactive
        paintState={paintState}
        size={size}
        label={`Interactive ${resolution}x${resolution} Glyph Editor`}
      />
    </div>
  );
}

/**
 * 14.10 GlyphTimeline — Multi-frame Glyph sequence strip with frame selection & playback toggle.
 */
export function GlyphTimeline({
  frames,
  resolution = 13,
  activeIndex,
  onSelectFrame,
  playing = false,
  onTogglePlay,
  className,
}: {
  frames: readonly GlyphFrame[];
  resolution?: GlyphResolution;
  activeIndex: number;
  onSelectFrame: (index: number) => void;
  playing?: boolean;
  onTogglePlay?: () => void;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-4', className)}>
      <div className="flex items-center justify-between gap-3 font-mono text-xs">
        <span className="text-[var(--nt-display)] tabular-nums">
          Timeline · Frame {activeIndex + 1}/{frames.length}
        </span>
        {onTogglePlay && (
          <button
            type="button"
            onClick={onTogglePlay}
            className="rounded-md bg-[var(--nt-inverse-bg)] px-3 py-1 text-[11px] text-[var(--nt-inverse-fg)] cursor-pointer"
          >
            {playing ? 'Pause' : 'Play'}
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {frames.map((frame, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelectFrame(index)}
            className={cn(
              'flex shrink-0 flex-col items-center gap-1 rounded-xl border p-2 transition-colors cursor-pointer',
              index === activeIndex
                ? 'border-[var(--nt-display)] bg-[var(--nt-raised)]'
                : 'border-[var(--nt-line)] hover:border-[var(--nt-line-2)]',
            )}
          >
            <GlyphPatternPreview cells={frame.cells} resolution={resolution} size={52} />
            <span className="font-mono text-[10px] tabular-nums text-[var(--nt-muted)]">
              F{index + 1} · {frame.durationMs}ms
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

