import * as React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceArea,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { EyeSlash } from '@phosphor-icons/react';
import type { ThemeMode } from '@nothing-ui/tokens';
import { cn, useTheme } from '@nothing-ui/ui';
import {
  DEFAULT_BAR_SERIES_VISIBILITY,
  computePeakInterval,
  countVisibleSeries,
  showAllSeries,
  toggleSeriesVisibility,
  type BarDatum,
  type BarLayoutMode,
  type BarSeriesKey,
  type BarSeriesVisibility,
} from './bar-series-logic';
import {
  createFullZoomRange,
  isZoomedRange,
  panZoomRange,
  sliceDataByZoomRange,
  zoomRangeAroundRatio,
  zoomToSelectionRange,
  type BarZoomRange,
} from './bar-zoom-logic';
import { BarSeriesLegend, type BarSeriesLegendItem } from './bar-series-legend';
import { BarChartTooltip, type BarTooltipThemeStyles } from './bar-chart-tooltip';
import { BarZoomControls, type BarDragInteractionMode } from './bar-zoom-controls';
import {
  computeBarYAxisDomainMax,
  computeMagneticCrosshairTarget,
} from './bar-crosshair-logic';

type DatasetKey = 'throughput' | 'latency' | 'adoption';

const DATASETS: Readonly<
  Record<
    DatasetKey,
    {
      label: string;
      unit: string;
      primaryLabel: string;
      secondaryLabel: string;
      data: BarDatum[];
    }
  >
> = {
  throughput: {
    label: 'Throughput',
    unit: 'req/s',
    primaryLabel: 'Web (nthgui)',
    secondaryLabel: 'Native (RN)',
    data: [
      { period: 'Mon', web: 420, native: 310 },
      { period: 'Tue', web: 510, native: 390 },
      { period: 'Wed', web: 640, native: 470 },
      { period: 'Thu', web: 590, native: 440 },
      { period: 'Fri', web: 780, native: 620 },
      { period: 'Sat', web: 490, native: 360 },
      { period: 'Sun', web: 530, native: 410 },
    ],
  },
  latency: {
    label: 'P95 Latency',
    unit: 'ms',
    primaryLabel: 'Edge Cache',
    secondaryLabel: 'Origin API',
    data: [
      { period: 'Mon', web: 28, native: 46 },
      { period: 'Tue', web: 24, native: 42 },
      { period: 'Wed', web: 31, native: 54 },
      { period: 'Thu', web: 22, native: 39 },
      { period: 'Fri', web: 35, native: 61 },
      { period: 'Sat', web: 19, native: 34 },
      { period: 'Sun', web: 21, native: 37 },
    ],
  },
  adoption: {
    label: 'CLI Installs',
    unit: 'k',
    primaryLabel: 'Components',
    secondaryLabel: 'Widgets',
    data: [
      { period: 'W1', web: 14, native: 6 },
      { period: 'W2', web: 21, native: 11 },
      { period: 'W3', web: 29, native: 16 },
      { period: 'W4', web: 36, native: 22 },
      { period: 'W5', web: 48, native: 29 },
      { period: 'W6', web: 54, native: 35 },
      { period: 'W7', web: 67, native: 44 },
    ],
  },
};

interface ChartThemePalette {
  grid: string;
  axis: string;
  primaryBar: string;
  secondaryBar: string;
  peakBar: string;
  tooltip: BarTooltipThemeStyles;
  cursorFill: string;
  hoverStroke: string;
  selectionFill: string;
  crosshairStroke: string;
  crosshairBadgeBg: string;
  crosshairBadgeText: string;
}

function getRechartsPalette(theme: ThemeMode): ChartThemePalette {
  if (theme === 'light') {
    return {
      grid: '#E2E2E2',
      axis: '#525252',
      primaryBar: '#111111',
      secondaryBar: '#9A9A9A',
      peakBar: '#D71921',
      tooltip: {
        bg: '#FFFFFF',
        border: '#D4D4D4',
        text: '#0A0A0A',
        muted: '#525252',
        divider: '#E5E5E5',
        highlightBg: 'rgba(0, 0, 0, 0.05)',
        peakAccent: '#D71921',
      },
      cursorFill: 'rgba(0, 0, 0, 0.05)',
      hoverStroke: '#0A0A0A',
      selectionFill: 'rgba(215, 25, 33, 0.14)',
      crosshairStroke: '#111111',
      crosshairBadgeBg: '#0A0A0A',
      crosshairBadgeText: '#FFFFFF',
    };
  }
  if (theme === 'high-contrast') {
    return {
      grid: '#525252',
      axis: '#FFFFFF',
      primaryBar: '#FFFFFF',
      secondaryBar: '#A3A3A3',
      peakBar: '#FF2A32',
      tooltip: {
        bg: '#000000',
        border: '#FFFFFF',
        text: '#FFFFFF',
        muted: '#D4D4D4',
        divider: '#404040',
        highlightBg: 'rgba(255, 255, 255, 0.16)',
        peakAccent: '#FF2A32',
      },
      cursorFill: 'rgba(255, 255, 255, 0.14)',
      hoverStroke: '#FFFFFF',
      selectionFill: 'rgba(255, 42, 50, 0.24)',
      crosshairStroke: '#FFFFFF',
      crosshairBadgeBg: '#FFFFFF',
      crosshairBadgeText: '#000000',
    };
  }
  // dark (OLED)
  return {
    grid: '#242424',
    axis: '#A3A3A3',
    primaryBar: '#F5F5F5',
    secondaryBar: '#5C5C5C',
    peakBar: '#D71921',
    tooltip: {
      bg: '#0D0D0D',
      border: '#2E2E2E',
      text: '#FFFFFF',
      muted: '#A3A3A3',
      divider: '#222222',
      highlightBg: 'rgba(255, 255, 255, 0.08)',
      peakAccent: '#D71921',
    },
    cursorFill: 'rgba(255, 255, 255, 0.06)',
    hoverStroke: '#FFFFFF',
    selectionFill: 'rgba(215, 25, 33, 0.18)',
    crosshairStroke: '#E5E5E5',
    crosshairBadgeBg: '#F5F5F5',
    crosshairBadgeText: '#0A0A0A',
  };
}

export function RechartsBarPlaceholder() {
  const { theme } = useTheme();
  const [datasetKey, setDatasetKey] = React.useState<DatasetKey>('throughput');
  const [layoutMode, setLayoutMode] = React.useState<BarLayoutMode>('grouped');
  const [seriesVisibility, setSeriesVisibility] = React.useState<BarSeriesVisibility>(
    () => ({ ...DEFAULT_BAR_SERIES_VISIBILITY }),
  );
  const [hoveredBar, setHoveredBar] = React.useState<{
    index: number;
    seriesKey: BarSeriesKey;
  } | null>(null);

  const dataset = DATASETS[datasetKey];
  const totalCount = dataset.data.length;

  const [zoomRange, setZoomRange] = React.useState<BarZoomRange>(() =>
    createFullZoomRange(DATASETS.throughput.data.length),
  );
  const [interactionMode, setInteractionMode] = React.useState<BarDragInteractionMode>('select');
  const [selectionDrag, setSelectionDrag] = React.useState<{
    startLocalIndex: number;
    currentLocalIndex: number;
  } | null>(null);
  const [isPanning, setIsPanning] = React.useState(false);
  const [crosshairEnabled, setCrosshairEnabled] = React.useState(true);
  const [pointerHover, setPointerHover] = React.useState<{
    xRatio: number;
    yValue: number;
  } | null>(null);

  const chartCanvasRef = React.useRef<HTMLDivElement | null>(null);
  const pointerSessionRef = React.useRef<{
    pointerId: number;
    mode: 'pan' | 'select';
    startX: number;
    initialRange: BarZoomRange;
    plotWidth: number;
    startLocalIndex: number;
    activated: boolean;
  } | null>(null);

  const palette = React.useMemo(() => getRechartsPalette(theme), [theme]);

  const visibleData = React.useMemo(
    () => sliceDataByZoomRange(dataset.data, zoomRange),
    [dataset.data, zoomRange],
  );
  const periods = React.useMemo(() => dataset.data.map((row) => row.period), [dataset.data]);
  const isZoomed = isZoomedRange(zoomRange, totalCount);

  const peak = React.useMemo(
    () => computePeakInterval(visibleData, layoutMode, seriesVisibility),
    [visibleData, layoutMode, seriesVisibility],
  );

  const yDomainMax = React.useMemo(
    () => computeBarYAxisDomainMax(visibleData, seriesVisibility, layoutMode),
    [visibleData, seriesVisibility, layoutMode],
  );

  const crosshairTarget = React.useMemo(() => {
    if (!crosshairEnabled || isPanning || selectionDrag) return null;
    return computeMagneticCrosshairTarget({
      visibleData,
      visibility: seriesVisibility,
      layoutMode,
      hoveredBar,
      pointerXRatio: pointerHover?.xRatio ?? null,
      pointerYValue: pointerHover?.yValue ?? null,
      peak,
    });
  }, [
    crosshairEnabled,
    hoveredBar,
    isPanning,
    layoutMode,
    peak,
    pointerHover,
    selectionDrag,
    seriesVisibility,
    visibleData,
  ]);

  const totalPrimary = React.useMemo(
    () => visibleData.reduce((sum, row) => sum + row.web, 0),
    [visibleData],
  );
  const totalSecondary = React.useMemo(
    () => visibleData.reduce((sum, row) => sum + row.native, 0),
    [visibleData],
  );

  const visibleCount = countVisibleSeries(seriesVisibility);

  const handleSelectDataset = React.useCallback((key: DatasetKey) => {
    setDatasetKey(key);
    setZoomRange(createFullZoomRange(DATASETS[key].data.length));
    setInteractionMode('select');
    setSelectionDrag(null);
    setHoveredBar(null);
    setPointerHover(null);
  }, []);

  const handleToggleSeries = React.useCallback((key: BarSeriesKey) => {
    setSeriesVisibility((prev) => toggleSeriesVisibility(prev, key));
  }, []);

  const handleShowAllSeries = React.useCallback(() => {
    setSeriesVisibility(showAllSeries());
  }, []);

  const handleZoomIn = React.useCallback(() => {
    setZoomRange((prev) => {
      const next = zoomRangeAroundRatio(prev, totalCount, 'in', 0.5);
      if (isZoomedRange(next, totalCount)) {
        setInteractionMode('pan');
      }
      return next;
    });
  }, [totalCount]);

  const handleZoomOut = React.useCallback(() => {
    setZoomRange((prev) => {
      const next = zoomRangeAroundRatio(prev, totalCount, 'out', 0.5);
      if (!isZoomedRange(next, totalCount)) {
        setInteractionMode('select');
      }
      return next;
    });
  }, [totalCount]);

  const handlePanLeft = React.useCallback(() => {
    setZoomRange((prev) => panZoomRange(prev, totalCount, -1));
  }, [totalCount]);

  const handlePanRight = React.useCallback(() => {
    setZoomRange((prev) => panZoomRange(prev, totalCount, 1));
  }, [totalCount]);

  const handleResetZoom = React.useCallback(() => {
    setZoomRange(createFullZoomRange(totalCount));
    setInteractionMode('select');
    setSelectionDrag(null);
  }, [totalCount]);

  // Native non-passive wheel listener so mouse-wheel zooming over the chart never scrolls the page
  React.useEffect(() => {
    const el = chartCanvasRef.current;
    if (!el) return;

    const handleWheel = (event: WheelEvent) => {
      if (visibleCount === 0 || Math.abs(event.deltaY) < 0.5) return;
      event.preventDefault();
      const rect = el.getBoundingClientRect();
      const focusRatio = Math.max(
        0,
        Math.min(1, (event.clientX - rect.left) / Math.max(1, rect.width)),
      );
      const direction = event.deltaY < 0 ? 'in' : 'out';
      setZoomRange((prev) => {
        const next = zoomRangeAroundRatio(prev, totalCount, direction, focusRatio);
        if (isZoomedRange(next, totalCount)) {
          setInteractionMode('pan');
        } else {
          setInteractionMode('select');
        }
        return next;
      });
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [totalCount, visibleCount]);

  const getLocalIndexFromClientX = React.useCallback(
    (clientX: number): number => {
      const el = chartCanvasRef.current;
      if (!el || visibleData.length === 0) return 0;
      const rect = el.getBoundingClientRect();
      // Account for Y-axis left gutter (~48px) and right margin (~16px)
      const plotLeft = rect.left + 48;
      const plotWidth = Math.max(1, rect.width - 64);
      const ratio = Math.max(0, Math.min(0.9999, (clientX - plotLeft) / plotWidth));
      return Math.min(visibleData.length - 1, Math.max(0, Math.floor(ratio * visibleData.length)));
    },
    [visibleData.length],
  );

  const handleCanvasPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || visibleCount === 0 || !chartCanvasRef.current) return;
    const rect = chartCanvasRef.current.getBoundingClientRect();
    const shouldPan = interactionMode === 'pan' && isZoomed && !event.shiftKey;

    pointerSessionRef.current = {
      pointerId: event.pointerId,
      mode: shouldPan ? 'pan' : 'select',
      startX: event.clientX,
      initialRange: zoomRange,
      plotWidth: Math.max(1, rect.width - 64),
      startLocalIndex: getLocalIndexFromClientX(event.clientX),
      activated: false,
    };
  };

  const updatePointerHoverFromEvent = React.useCallback(
    (clientX: number, clientY: number) => {
      const el = chartCanvasRef.current;
      if (!el || visibleCount === 0 || visibleData.length === 0) return;
      const rect = el.getBoundingClientRect();
      // Account for canvas padding (16px), Y-axis gutter (44px), right margin (16px),
      // top margin (12px), and bottom X-axis tick height (~34px)
      const plotLeft = rect.left + 60;
      const plotWidth = Math.max(1, rect.width - 92);
      const plotTop = rect.top + 28;
      const plotHeight = Math.max(1, rect.height - 82);

      const xRatio = Math.max(0, Math.min(0.9999, (clientX - plotLeft) / plotWidth));
      const yRatioFromBottom = Math.max(0, Math.min(1, 1 - (clientY - plotTop) / plotHeight));
      const yValue = yRatioFromBottom * yDomainMax;

      setPointerHover({ xRatio, yValue });
    },
    [visibleCount, visibleData.length, yDomainMax],
  );

  const handleCanvasPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const session = pointerSessionRef.current;
    if (!session) {
      if (crosshairEnabled) {
        updatePointerHoverFromEvent(event.clientX, event.clientY);
      }
      return;
    }

    const dx = event.clientX - session.startX;
    // Wait for a 4px drag threshold before capturing pointer so click & double-click fire natively
    if (!session.activated) {
      if (Math.abs(dx) < 4) return;
      session.activated = true;
      event.currentTarget.setPointerCapture?.(session.pointerId);
      setHoveredBar(null);
      setPointerHover(null);
      if (session.mode === 'pan') {
        setIsPanning(true);
      } else {
        setSelectionDrag({
          startLocalIndex: session.startLocalIndex,
          currentLocalIndex: getLocalIndexFromClientX(event.clientX),
        });
      }
    }

    if (session.mode === 'pan') {
      const windowSize = session.initialRange.endIndex - session.initialRange.startIndex + 1;
      const stepPx = Math.max(18, session.plotWidth / Math.max(1, windowSize));
      const deltaSteps = -Math.round(dx / stepPx);
      const next = panZoomRange(session.initialRange, totalCount, deltaSteps);
      setZoomRange((prev) =>
        prev.startIndex === next.startIndex && prev.endIndex === next.endIndex ? prev : next,
      );
      return;
    }

    const nextLocalIdx = getLocalIndexFromClientX(event.clientX);
    setSelectionDrag((prev) =>
      prev && prev.currentLocalIndex !== nextLocalIdx
        ? { ...prev, currentLocalIndex: nextLocalIdx }
        : prev,
    );
  };

  const handleCanvasPointerLeave = () => {
    setPointerHover(null);
    setHoveredBar(null);
  };

  const handleCanvasPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const session = pointerSessionRef.current;
    if (!session) return;
    pointerSessionRef.current = null;

    if (session.activated) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }

    if (session.mode === 'pan') {
      setIsPanning(false);
    } else if (session.activated && selectionDrag) {
      if (Math.abs(selectionDrag.currentLocalIndex - selectionDrag.startLocalIndex) >= 1) {
        const next = zoomToSelectionRange(
          zoomRange,
          totalCount,
          selectionDrag.startLocalIndex,
          selectionDrag.currentLocalIndex,
        );
        setZoomRange(next);
        if (isZoomedRange(next, totalCount)) {
          setInteractionMode('pan');
        }
      }
      setSelectionDrag(null);
    } else {
      setSelectionDrag(null);
    }
  };

  const legendItems = React.useMemo<BarSeriesLegendItem[]>(
    () => [
      {
        key: 'web',
        label: dataset.primaryLabel,
        color: palette.primaryBar,
        total: totalPrimary,
        unit: dataset.unit,
        visible: seriesVisibility.web,
      },
      {
        key: 'native',
        label: dataset.secondaryLabel,
        color: palette.secondaryBar,
        total: totalSecondary,
        unit: dataset.unit,
        visible: seriesVisibility.native,
      },
    ],
    [
      dataset.primaryLabel,
      dataset.secondaryLabel,
      dataset.unit,
      palette.primaryBar,
      palette.secondaryBar,
      seriesVisibility.native,
      seriesVisibility.web,
      totalPrimary,
      totalSecondary,
    ],
  );

  const isStacked = layoutMode === 'stacked' && seriesVisibility.web && seriesVisibility.native;

  const selectionX1 =
    selectionDrag && visibleData[Math.min(selectionDrag.startLocalIndex, selectionDrag.currentLocalIndex)]?.period;
  const selectionX2 =
    selectionDrag && visibleData[Math.max(selectionDrag.startLocalIndex, selectionDrag.currentLocalIndex)]?.period;

  return (
    <div
      data-testid="recharts-bar-placeholder"
      data-chart-theme={theme}
      data-zoomed={String(isZoomed)}
      className="rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5 sm:p-6 space-y-5"
    >
      {/* Top Toolbar: Title, Dataset Selector & Layout Mode */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--nt-line)] pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
            <span className="text-[var(--nt-accent)]">Recharts Placeholder</span>
            <span aria-hidden="true">·</span>
            <span>ResponsiveContainer</span>
            <span aria-hidden="true">·</span>
            <span>Theme: {theme}</span>
            {isZoomed && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[var(--nt-display)]">
                  Zoomed ({visibleData[0]?.period}–{visibleData[visibleData.length - 1]?.period})
                </span>
              </>
            )}
          </div>
          <h3 className="font-display text-xl sm:text-2xl text-[var(--nt-display)]">
            Responsive Bar Chart — {dataset.label}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Bar chart dataset"
            className="inline-flex items-center gap-0.5 rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] p-0.5 font-mono text-[11px]"
          >
            {(Object.keys(DATASETS) as DatasetKey[]).map((key) => {
              const active = datasetKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => handleSelectDataset(key)}
                  className={cn(
                    'rounded-md px-2.5 py-1 transition-colors cursor-pointer whitespace-nowrap',
                    active
                      ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                      : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
                  )}
                >
                  {DATASETS[key].label}
                </button>
              );
            })}
          </div>

          <div
            role="group"
            aria-label="Bar chart layout mode"
            className="inline-flex items-center gap-0.5 rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] p-0.5 font-mono text-[11px]"
          >
            {(['grouped', 'stacked'] as const).map((mode) => {
              const active = layoutMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setLayoutMode(mode)}
                  className={cn(
                    'rounded-md px-2.5 py-1 capitalize transition-colors cursor-pointer',
                    active
                      ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                      : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
                  )}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live KPI Summary Strip */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 font-mono">
        <div
          className={cn(
            'rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] px-3.5 py-2.5 transition-opacity',
            !seriesVisibility.web && 'opacity-50',
          )}
        >
          <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
            <span>{dataset.primaryLabel} Total</span>
            {!seriesVisibility.web && <span>Hidden</span>}
          </div>
          <div className="mt-1 text-lg tabular-nums text-[var(--nt-display)]">
            {totalPrimary.toLocaleString()} <span className="text-xs text-[var(--nt-muted)]">{dataset.unit}</span>
          </div>
        </div>
        <div
          className={cn(
            'rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] px-3.5 py-2.5 transition-opacity',
            !seriesVisibility.native && 'opacity-50',
          )}
        >
          <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
            <span>{dataset.secondaryLabel} Total</span>
            {!seriesVisibility.native && <span>Hidden</span>}
          </div>
          <div className="mt-1 text-lg tabular-nums text-[var(--nt-display)]">
            {totalSecondary.toLocaleString()} <span className="text-xs text-[var(--nt-muted)]">{dataset.unit}</span>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] px-3.5 py-2.5">
          <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
            Peak Interval (Signal Red)
          </div>
          <div
            data-testid="recharts-peak-kpi"
            className="mt-1 text-lg tabular-nums text-[var(--nt-accent)]"
          >
            {peak ? `${peak.period} · ${peak.value} ${dataset.unit}` : 'None visible'}
          </div>
        </div>
      </div>

      {/* Responsive Recharts Canvas with Magnetic Crosshairs, Mouse Wheel Zoom & Drag Pan/Select */}
      <div
        ref={chartCanvasRef}
        data-testid="recharts-bar-canvas"
        data-crosshair-enabled={String(crosshairEnabled)}
        data-crosshair-period={crosshairTarget?.period ?? ''}
        data-crosshair-value={crosshairTarget ? String(crosshairTarget.yValue) : ''}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
        onPointerCancel={handleCanvasPointerUp}
        onPointerLeave={handleCanvasPointerLeave}
        onDoubleClick={handleResetZoom}
        className={cn(
          'relative w-full min-w-0 select-none rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-3 sm:p-4 touch-none',
          interactionMode === 'pan' && isZoomed
            ? isPanning
              ? 'cursor-grabbing'
              : 'cursor-grab'
            : 'cursor-crosshair',
        )}
        aria-label={`Responsive Recharts ${dataset.label} bar chart`}
      >
        {crosshairTarget && (
          <div
            data-testid="bar-crosshair-readout"
            className="pointer-events-none absolute top-2.5 right-3 z-10 inline-flex items-center gap-2 rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-surface)]/95 px-2.5 py-1 font-mono text-[10px] shadow-sm backdrop-blur-xs"
          >
            <span
              aria-hidden="true"
              className="h-2 w-2 shrink-0 rounded-full"
              style={{
                backgroundColor: crosshairTarget.isPeak
                  ? palette.peakBar
                  : crosshairTarget.seriesKey === 'web'
                    ? palette.primaryBar
                    : palette.secondaryBar,
              }}
            />
            <span className="uppercase tracking-[0.08em] text-[var(--nt-muted)]">
              {crosshairTarget.period}
            </span>
            <span aria-hidden="true" className="text-[var(--nt-muted)]">·</span>
            <span className="text-[var(--nt-secondary)]">
              {crosshairTarget.seriesKey === 'web' ? dataset.primaryLabel : dataset.secondaryLabel}
            </span>
            <span
              className={cn(
                'font-semibold tabular-nums',
                crosshairTarget.isPeak ? 'text-[var(--nt-accent)]' : 'text-[var(--nt-display)]',
              )}
            >
              {crosshairTarget.value.toLocaleString()} {dataset.unit}
            </span>
          </div>
        )}

        {visibleCount === 0 ? (
          <div
            data-testid="recharts-bar-empty"
            className="flex h-[290px] flex-col items-center justify-center gap-3 text-center font-mono"
          >
            <EyeSlash className="h-6 w-6 text-[var(--nt-muted)]" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-xs text-[var(--nt-display)]">All data series are hidden</p>
              <p className="text-[11px] text-[var(--nt-muted)]">
                Toggle a series in the legend below or restore all series to render the bar chart.
              </p>
            </div>
            <button
              type="button"
              onClick={handleShowAllSeries}
              className="rounded-lg bg-[var(--nt-inverse-bg)] px-3 py-1.5 text-xs text-[var(--nt-inverse-fg)] transition-opacity hover:opacity-90 cursor-pointer"
            >
              Restore all series
            </button>
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height={290}
            minWidth={240}
            minHeight={260}
            initialDimension={{ width: 640, height: 290 }}
          >
            <BarChart
              data={visibleData}
              margin={{ top: 18, right: 16, left: 0, bottom: 4 }}
              barGap={6}
              onMouseLeave={() => setHoveredBar(null)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
              <XAxis
                dataKey="period"
                stroke={palette.axis}
                tick={{ fill: palette.axis, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                axisLine={{ stroke: palette.grid }}
                tickLine={false}
              />
              <YAxis
                domain={[0, yDomainMax]}
                stroke={palette.axis}
                tick={{ fill: palette.axis, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                axisLine={false}
                tickLine={false}
                width={44}
              />
              <Tooltip
                cursor={{ fill: palette.cursorFill, stroke: 'none' }}
                offset={14}
                isAnimationActive={false}
                content={(tooltipProps) =>
                  isPanning || selectionDrag ? null : (
                    <BarChartTooltip
                      active={tooltipProps.active}
                      label={tooltipProps.label}
                      data={visibleData}
                      visibility={seriesVisibility}
                      layoutMode={layoutMode}
                      hoveredSeriesKey={crosshairTarget?.seriesKey ?? hoveredBar?.seriesKey ?? null}
                      peak={peak}
                      labels={{
                        web: dataset.primaryLabel,
                        native: dataset.secondaryLabel,
                      }}
                      colors={{
                        web: palette.primaryBar,
                        native: palette.secondaryBar,
                      }}
                      unit={dataset.unit}
                      themeStyles={palette.tooltip}
                    />
                  )
                }
              />
              {selectionX1 && selectionX2 && (
                <ReferenceArea
                  x1={selectionX1}
                  x2={selectionX2}
                  fill={palette.selectionFill}
                  stroke={palette.peakBar}
                  strokeOpacity={0.7}
                  strokeDasharray="3 3"
                />
              )}
              {seriesVisibility.web && (
                <Bar
                  dataKey="web"
                  name={dataset.primaryLabel}
                  fill={palette.primaryBar}
                  stackId={isStacked ? 'metrics' : undefined}
                  radius={isStacked ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                  maxBarSize={44}
                  isAnimationActive={false}
                  onMouseEnter={(_barData, index) => setHoveredBar({ index, seriesKey: 'web' })}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {visibleData.map((entry, idx) => {
                    const isPeakCell =
                      peak && peak.highlightSeries === 'web' && idx === peak.index;
                    const activeIndex = hoveredBar?.index ?? crosshairTarget?.localIndex ?? null;
                    const activeSeries = hoveredBar?.seriesKey ?? crosshairTarget?.seriesKey ?? null;
                    const isFocused = activeIndex === idx && activeSeries === 'web';
                    const isDimmed = activeIndex !== null && !isFocused;
                    return (
                      <Cell
                        key={`primary-${entry.period}`}
                        cursor={interactionMode === 'pan' && isZoomed ? 'grab' : 'pointer'}
                        fill={isPeakCell ? palette.peakBar : palette.primaryBar}
                        fillOpacity={isDimmed ? 0.45 : 1}
                        stroke={isFocused ? palette.hoverStroke : 'none'}
                        strokeWidth={isFocused ? 1.5 : 0}
                      />
                    );
                  })}
                </Bar>
              )}
              {seriesVisibility.native && (
                <Bar
                  dataKey="native"
                  name={dataset.secondaryLabel}
                  fill={palette.secondaryBar}
                  stackId={isStacked ? 'metrics' : undefined}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={44}
                  isAnimationActive={false}
                  onMouseEnter={(_barData, index) => setHoveredBar({ index, seriesKey: 'native' })}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {visibleData.map((entry, idx) => {
                    const isPeakCell =
                      peak && peak.highlightSeries === 'native' && idx === peak.index;
                    const activeIndex = hoveredBar?.index ?? crosshairTarget?.localIndex ?? null;
                    const activeSeries = hoveredBar?.seriesKey ?? crosshairTarget?.seriesKey ?? null;
                    const isFocused = activeIndex === idx && activeSeries === 'native';
                    const isDimmed = activeIndex !== null && !isFocused;
                    return (
                      <Cell
                        key={`secondary-${entry.period}`}
                        cursor={interactionMode === 'pan' && isZoomed ? 'grab' : 'pointer'}
                        fill={isPeakCell ? palette.peakBar : palette.secondaryBar}
                        fillOpacity={isDimmed ? 0.45 : 1}
                        stroke={isFocused ? palette.hoverStroke : 'none'}
                        strokeWidth={isFocused ? 1.5 : 0}
                      />
                    );
                  })}
                </Bar>
              )}
              {/* Magnetic Crosshair X/Y Guide Lines & Snapped Data-Point Reticle */}
              {crosshairTarget && (
                <ReferenceLine
                  x={crosshairTarget.period}
                  stroke={crosshairTarget.isPeak ? palette.peakBar : palette.crosshairStroke}
                  strokeOpacity={0.75}
                  strokeDasharray="3 3"
                  strokeWidth={1.25}
                  ifOverflow="extendDomain"
                  label={(labelProps) => {
                    const vb = labelProps?.viewBox as
                      | { x?: number; y?: number; width?: number; height?: number }
                      | undefined;
                    if (!vb || typeof vb.x !== 'number' || typeof vb.y !== 'number') return null;
                    const badgeW = 36;
                    const badgeH = 16;
                    const bg = crosshairTarget.isPeak ? palette.peakBar : palette.crosshairBadgeBg;
                    const fg = crosshairTarget.isPeak ? '#FFFFFF' : palette.crosshairBadgeText;
                    return (
                      <g pointerEvents="none">
                        <rect
                          x={vb.x - badgeW / 2}
                          y={vb.y - badgeH + 2}
                          width={badgeW}
                          height={badgeH}
                          rx={4}
                          fill={bg}
                        />
                        <text
                          x={vb.x}
                          y={vb.y - badgeH / 2 + 5}
                          textAnchor="middle"
                          fill={fg}
                          fontSize={9}
                          fontWeight={600}
                          fontFamily="JetBrains Mono, monospace"
                        >
                          {crosshairTarget.period.toUpperCase()}
                        </text>
                      </g>
                    );
                  }}
                />
              )}
              {crosshairTarget && (
                <ReferenceLine
                  y={crosshairTarget.yValue}
                  stroke={crosshairTarget.isPeak ? palette.peakBar : palette.crosshairStroke}
                  strokeOpacity={0.8}
                  strokeDasharray="3 3"
                  strokeWidth={1.25}
                  ifOverflow="extendDomain"
                  label={(labelProps) => {
                    const vb = labelProps?.viewBox as
                      | { x?: number; y?: number; width?: number; height?: number }
                      | undefined;
                    if (!vb || typeof vb.x !== 'number' || typeof vb.y !== 'number') return null;
                    const text = crosshairTarget.yValue.toLocaleString();
                    const badgeW = Math.max(34, text.length * 7 + 10);
                    const badgeH = 16;
                    const bg = crosshairTarget.isPeak ? palette.peakBar : palette.crosshairBadgeBg;
                    const fg = crosshairTarget.isPeak ? '#FFFFFF' : palette.crosshairBadgeText;
                    return (
                      <g pointerEvents="none">
                        <rect
                          x={Math.max(2, vb.x - badgeW - 4)}
                          y={vb.y - badgeH / 2}
                          width={badgeW}
                          height={badgeH}
                          rx={4}
                          fill={bg}
                        />
                        <text
                          x={Math.max(2, vb.x - badgeW - 4) + badgeW / 2}
                          y={vb.y + 3.5}
                          textAnchor="middle"
                          fill={fg}
                          fontSize={9}
                          fontWeight={600}
                          fontFamily="JetBrains Mono, monospace"
                        >
                          {text}
                        </text>
                      </g>
                    );
                  }}
                />
              )}
              {crosshairTarget && (
                <ReferenceDot
                  x={crosshairTarget.period}
                  y={crosshairTarget.yValue}
                  r={5}
                  fill={crosshairTarget.isPeak ? palette.peakBar : palette.crosshairStroke}
                  stroke={palette.tooltip.bg}
                  strokeWidth={2}
                  ifOverflow="extendDomain"
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Mouse Zoom, Pan & Magnetic Crosshair Toolbar + Draggable Overview Scrubber */}
      <BarZoomControls
        periods={periods}
        range={zoomRange}
        interactionMode={interactionMode}
        onInteractionModeChange={setInteractionMode}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onPanLeft={handlePanLeft}
        onPanRight={handlePanRight}
        onResetZoom={handleResetZoom}
        onRangeChange={setZoomRange}
        crosshairEnabled={crosshairEnabled}
        onToggleCrosshair={() => {
          setCrosshairEnabled((prev) => {
            if (prev) setPointerHover(null);
            return !prev;
          });
        }}
      />

      {/* Interactive Series Legend */}
      <BarSeriesLegend
        items={legendItems}
        onToggle={handleToggleSeries}
        onShowAll={handleShowAllSeries}
      />
    </div>
  );
}
