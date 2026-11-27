import * as React from 'react';
import {
  ArrowCounterClockwise,
  CaretLeft,
  CaretRight,
  Crosshair,
  CrosshairSimple,
  HandGrabbing,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
} from '@phosphor-icons/react';
import { cn } from '@nothing-ui/ui';
import {
  MIN_BAR_ZOOM_WINDOW,
  getZoomMultiplier,
  getZoomWindowSize,
  isZoomedRange,
  panZoomRange,
  type BarZoomRange,
} from './bar-zoom-logic';

export type BarDragInteractionMode = 'select' | 'pan';

export interface BarZoomControlsProps {
  periods: readonly string[];
  range: BarZoomRange;
  interactionMode: BarDragInteractionMode;
  onInteractionModeChange: (mode: BarDragInteractionMode) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onPanLeft: () => void;
  onPanRight: () => void;
  onResetZoom: () => void;
  onRangeChange: (nextRange: BarZoomRange) => void;
  crosshairEnabled?: boolean;
  onToggleCrosshair?: () => void;
}

/**
 * Interactive zoom, pan, and draggable overview range scrubber for the ChartsHub Bar chart.
 */
export function BarZoomControls({
  periods,
  range,
  interactionMode,
  onInteractionModeChange,
  onZoomIn,
  onZoomOut,
  onPanLeft,
  onPanRight,
  onResetZoom,
  onRangeChange,
  crosshairEnabled = true,
  onToggleCrosshair,
}: BarZoomControlsProps) {
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const dragStateRef = React.useRef<{
    startX: number;
    initialRange: BarZoomRange;
    trackWidth: number;
  } | null>(null);
  const [isDraggingThumb, setIsDraggingThumb] = React.useState(false);

  const totalCount = periods.length;
  const windowSize = getZoomWindowSize(range, totalCount);
  const zoomed = isZoomedRange(range, totalCount);
  const zoomMultiplier = getZoomMultiplier(range, totalCount);

  const canZoomIn = windowSize > Math.min(MIN_BAR_ZOOM_WINDOW, totalCount);
  const canZoomOut = zoomed;
  const canPanLeft = range.startIndex > 0;
  const canPanRight = range.endIndex < totalCount - 1;

  const startLabel = periods[range.startIndex] ?? '';
  const endLabel = periods[range.endIndex] ?? '';

  const thumbLeftPct = totalCount > 0 ? (range.startIndex / totalCount) * 100 : 0;
  const thumbWidthPct = totalCount > 0 ? (windowSize / totalCount) * 100 : 100;

  const handleThumbPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!zoomed || !trackRef.current) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragStateRef.current = {
      startX: event.clientX,
      initialRange: range,
      trackWidth: Math.max(1, trackRef.current.getBoundingClientRect().width),
    };
    setIsDraggingThumb(true);
  };

  const handleThumbPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.startX;
    const stepPx = drag.trackWidth / Math.max(1, totalCount);
    const deltaSteps = Math.round(dx / stepPx);
    const next = panZoomRange(drag.initialRange, totalCount, deltaSteps);
    if (next.startIndex !== range.startIndex || next.endIndex !== range.endIndex) {
      onRangeChange(next);
    }
  };

  const handleThumbPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    dragStateRef.current = null;
    setIsDraggingThumb(false);
  };

  const handleTrackClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomed || !trackRef.current || isDraggingThumb) return;
    if ((event.target as HTMLElement).closest('[data-testid="bar-zoom-thumb"]')) {
      return;
    }
    const rect = trackRef.current.getBoundingClientRect();
    const clickRatio = Math.max(0, Math.min(1, (event.clientX - rect.left) / Math.max(1, rect.width)));
    const targetCenter = Math.round(clickRatio * (totalCount - 1));
    const currentCenter = (range.startIndex + range.endIndex) / 2;
    const deltaSteps = Math.round(targetCenter - currentCenter);
    onRangeChange(panZoomRange(range, totalCount, deltaSteps));
  };

  return (
    <div
      data-testid="bar-zoom-controls"
      className="space-y-2.5 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] px-3.5 py-2.5 font-mono"
    >
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Range & Zoom Readout */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span
            data-testid="bar-zoom-range-label"
            className="text-[var(--nt-display)] font-medium tabular-nums"
          >
            {startLabel} – {endLabel}
          </span>
          <span aria-hidden="true" className="text-[var(--nt-muted)]">·</span>
          <span data-testid="bar-zoom-window-count" className="text-[var(--nt-muted)] tabular-nums">
            {windowSize}/{totalCount} intervals
          </span>
          <span aria-hidden="true" className="text-[var(--nt-muted)]">·</span>
          <span
            data-testid="bar-zoom-multiplier"
            className={cn(
              'tabular-nums',
              zoomed ? 'text-[var(--nt-accent)] font-medium' : 'text-[var(--nt-muted)]',
            )}
          >
            {zoomMultiplier.toFixed(1)}×
          </span>
        </div>

        {/* Interactive Mode + Zoom & Pan Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div
            role="group"
            aria-label="Chart mouse drag mode"
            className="inline-flex items-center gap-0.5 rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] p-0.5 text-[10px]"
          >
            <button
              type="button"
              data-testid="bar-mode-select"
              aria-pressed={interactionMode === 'select'}
              onClick={() => onInteractionModeChange('select')}
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors cursor-pointer',
                interactionMode === 'select'
                  ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
              )}
            >
              <CrosshairSimple className="h-3 w-3" aria-hidden="true" />
              <span>Select</span>
            </button>
            <button
              type="button"
              data-testid="bar-mode-pan"
              aria-pressed={interactionMode === 'pan'}
              onClick={() => onInteractionModeChange('pan')}
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors cursor-pointer',
                interactionMode === 'pan'
                  ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
              )}
            >
              <HandGrabbing className="h-3 w-3" aria-hidden="true" />
              <span>Pan</span>
            </button>
          </div>

          {onToggleCrosshair && (
            <button
              type="button"
              data-testid="bar-crosshair-toggle"
              aria-pressed={crosshairEnabled}
              onClick={onToggleCrosshair}
              className={cn(
                'inline-flex h-7 items-center gap-1 rounded-md border px-2 text-[10px] transition-colors cursor-pointer',
                crosshairEnabled
                  ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
              )}
            >
              <Crosshair className="h-3 w-3" aria-hidden="true" />
              <span>Snap</span>
            </button>
          )}

          <div
            role="group"
            aria-label="Pan and zoom controls"
            className="inline-flex items-center gap-1"
          >
            <button
              type="button"
              data-testid="bar-pan-left"
              aria-label="Pan chart left"
              disabled={!canPanLeft}
              onClick={onPanLeft}
              className={cn(
                'inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-display)] transition-colors',
                canPanLeft
                  ? 'hover:border-[var(--nt-display)] cursor-pointer'
                  : 'opacity-35 cursor-not-allowed',
              )}
            >
              <CaretLeft className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              data-testid="bar-pan-right"
              aria-label="Pan chart right"
              disabled={!canPanRight}
              onClick={onPanRight}
              className={cn(
                'inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-display)] transition-colors',
                canPanRight
                  ? 'hover:border-[var(--nt-display)] cursor-pointer'
                  : 'opacity-35 cursor-not-allowed',
              )}
            >
              <CaretRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              data-testid="bar-zoom-out"
              aria-label="Zoom out bar chart"
              disabled={!canZoomOut}
              onClick={onZoomOut}
              className={cn(
                'inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-display)] transition-colors',
                canZoomOut
                  ? 'hover:border-[var(--nt-display)] cursor-pointer'
                  : 'opacity-35 cursor-not-allowed',
              )}
            >
              <MagnifyingGlassMinus className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              data-testid="bar-zoom-in"
              aria-label="Zoom in bar chart"
              disabled={!canZoomIn}
              onClick={onZoomIn}
              className={cn(
                'inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-display)] transition-colors',
                canZoomIn
                  ? 'hover:border-[var(--nt-display)] cursor-pointer'
                  : 'opacity-35 cursor-not-allowed',
              )}
            >
              <MagnifyingGlassPlus className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            {zoomed && (
              <button
                type="button"
                data-testid="bar-zoom-reset"
                onClick={onResetZoom}
                className="inline-flex h-7 items-center gap-1 rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-surface)] px-2 text-[11px] text-[var(--nt-display)] transition-colors hover:border-[var(--nt-display)] cursor-pointer"
              >
                <ArrowCounterClockwise className="h-3 w-3" aria-hidden="true" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Draggable Overview Viewport Scrubber */}
      <div className="space-y-1">
        <div
          ref={trackRef}
          data-testid="bar-zoom-scrubber"
          onClick={handleTrackClick}
          className="relative h-2.5 w-full overflow-hidden rounded-full border border-[var(--nt-line)] bg-[var(--nt-surface)]"
          aria-label="Zoom viewport range scrubber"
        >
          <div
            data-testid="bar-zoom-thumb"
            onPointerDown={handleThumbPointerDown}
            onPointerMove={handleThumbPointerMove}
            onPointerUp={handleThumbPointerUp}
            onPointerCancel={handleThumbPointerUp}
            className={cn(
              'absolute top-0 bottom-0 rounded-full transition-colors',
              zoomed
                ? isDraggingThumb
                  ? 'bg-[var(--nt-accent)] cursor-grabbing'
                  : 'bg-[var(--nt-display)] hover:bg-[var(--nt-accent)] cursor-grab'
                : 'bg-[var(--nt-line-2)]',
            )}
            style={{
              left: `${thumbLeftPct}%`,
              width: `${thumbWidthPct}%`,
            }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-[var(--nt-muted)]">
          <span>
            {interactionMode === 'pan'
              ? 'Scroll wheel to zoom · Drag chart or bar to pan · Double-click to reset'
              : 'Scroll wheel to zoom · Drag across bars to zoom range · Double-click to reset'}
          </span>
          <span className="hidden sm:inline tabular-nums">
            {periods[0]} → {periods[totalCount - 1]}
          </span>
        </div>
      </div>
    </div>
  );
}
