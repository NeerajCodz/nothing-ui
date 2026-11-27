import * as React from 'react';
import { cn } from '../../lib/cn';
import {
  DEFAULT_CHART_STYLE,
  buildAreaPath,
  buildLinePath,
  clampBrushDomain,
  computeNiceDomain,
  computeSeriesStats,
  formatMetricNumber,
  resolveSeriesColor,
  type ChartCurveMode,
  type ChartPaletteId,
  type ChartStyleConfig,
} from '../../lib/chart-engine';
import {
  InteractiveChartFrame,
  type ChartLegendSeries,
  type ChartTooltipPayload,
} from './chart-frame';

export interface BaseInteractiveChartProps {
  palette?: ChartPaletteId;
  curve?: ChartCurveMode;
  strokeWidth?: number;
  fillOpacity?: number;
  dotSize?: number;
  showGrid?: boolean;
  showLabels?: boolean;
  showArea?: boolean;
  showThreshold?: boolean;
  thresholdValue?: number;
  defaultLive?: boolean;
  defaultConfigOpen?: boolean;
  className?: string;
}

function useSyncedStyleConfig(props: BaseInteractiveChartProps) {
  const [style, setStyle] = React.useState<ChartStyleConfig>(() => ({
    ...DEFAULT_CHART_STYLE,
    palette: props.palette ?? DEFAULT_CHART_STYLE.palette,
    curve: props.curve ?? DEFAULT_CHART_STYLE.curve,
    strokeWidth: props.strokeWidth ?? DEFAULT_CHART_STYLE.strokeWidth,
    fillOpacity: props.fillOpacity ?? DEFAULT_CHART_STYLE.fillOpacity,
    dotSize: props.dotSize ?? DEFAULT_CHART_STYLE.dotSize,
    gridMode: props.showGrid === false ? 'none' : DEFAULT_CHART_STYLE.gridMode,
    showLabels: props.showLabels ?? DEFAULT_CHART_STYLE.showLabels,
    showArea: props.showArea ?? DEFAULT_CHART_STYLE.showArea,
    showThreshold: props.showThreshold ?? DEFAULT_CHART_STYLE.showThreshold,
    thresholdValue: props.thresholdValue ?? DEFAULT_CHART_STYLE.thresholdValue,
  }));

  React.useEffect(() => {
    setStyle((prev) => ({
      ...prev,
      ...(props.palette !== undefined ? { palette: props.palette } : {}),
      ...(props.curve !== undefined ? { curve: props.curve } : {}),
      ...(props.strokeWidth !== undefined ? { strokeWidth: props.strokeWidth } : {}),
      ...(props.fillOpacity !== undefined ? { fillOpacity: props.fillOpacity } : {}),
      ...(props.dotSize !== undefined ? { dotSize: props.dotSize } : {}),
      ...(props.showGrid !== undefined ? { gridMode: props.showGrid ? 'horizontal' : 'none' } : {}),
      ...(props.showLabels !== undefined ? { showLabels: props.showLabels } : {}),
      ...(props.showArea !== undefined ? { showArea: props.showArea } : {}),
      ...(props.showThreshold !== undefined ? { showThreshold: props.showThreshold } : {}),
      ...(props.thresholdValue !== undefined ? { thresholdValue: props.thresholdValue } : {}),
    }));
  }, [
    props.palette,
    props.curve,
    props.strokeWidth,
    props.fillOpacity,
    props.dotSize,
    props.showGrid,
    props.showLabels,
    props.showArea,
    props.showThreshold,
    props.thresholdValue,
  ]);

  return [style, setStyle] as const;
}

function useLegendState(allIds: readonly string[]) {
  const [hidden, setHidden] = React.useState<Set<string>>(() => new Set());
  const toggle = React.useCallback((id: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (allIds.length - next.size > 1) next.add(id);
      return next;
    });
  }, [allIds.length]);

  const solo = React.useCallback(
    (id: string) => {
      setHidden((prev) => {
        const onlyThisVisible = allIds.every((other) => other === id || prev.has(other)) && !prev.has(id);
        if (onlyThisVisible) return new Set();
        return new Set(allIds.filter((other) => other !== id));
      });
    },
    [allIds],
  );

  const showAll = React.useCallback(() => setHidden(new Set()), []);
  return { hidden, toggle, solo, showAll };
}

/* ───────────────────────────────────────────────────────────────────────────
 * 1. InteractiveCoreCharts (`charts` slug: Multi-Series Bar, Line/Area, Radial)
 * ─────────────────────────────────────────────────────────────────────────── */
export interface InteractiveCoreChartsProps extends BaseInteractiveChartProps {
  mode?: 'bar' | 'line' | 'radial';
  stacked?: boolean;
}

interface CorePoint {
  label: string;
  telemetry: number;
  glyph: number;
  budget: number;
}

const INITIAL_CORE_DATA: CorePoint[] = [
  { label: '00:00', telemetry: 48, glyph: 32, budget: 64 },
  { label: '03:00', telemetry: 54, glyph: 38, budget: 64 },
  { label: '06:00', telemetry: 62, glyph: 44, budget: 66 },
  { label: '09:00', telemetry: 78, glyph: 61, budget: 72 },
  { label: '12:00', telemetry: 91, glyph: 76, budget: 80 },
  { label: '15:00', telemetry: 84, glyph: 69, budget: 78 },
  { label: '18:00', telemetry: 73, glyph: 58, budget: 74 },
  { label: '21:00', telemetry: 66, glyph: 49, budget: 70 },
];

const CORE_SERIES: readonly ChartLegendSeries[] = [
  { id: 'telemetry', label: 'System Load', defaultColor: '#F5F5F5' },
  { id: 'glyph', label: 'Glyph LEDs', defaultColor: '#D71921' },
  { id: 'budget', label: 'Thermal Cap', defaultColor: '#737373' },
];

export function InteractiveCoreCharts(props: InteractiveCoreChartsProps) {
  const [mode, setMode] = React.useState<'bar' | 'line' | 'radial'>(props.mode ?? 'bar');
  const [stacked, setStacked] = React.useState(props.stacked ?? false);
  const [data, setData] = React.useState<CorePoint[]>(INITIAL_CORE_DATA);
  const [style, setStyle] = useSyncedStyleConfig(props);
  const legend = useLegendState(['telemetry', 'glyph', 'budget']);
  const [isLive, setIsLive] = React.useState(props.defaultLive ?? false);
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);
  const [pinnedIdx, setPinnedIdx] = React.useState<number | null>(null);
  const [zoomRange, setZoomRange] = React.useState<[number, number] | null>(null);
  const [brushDrag, setBrushDrag] = React.useState<{ start: number; current: number } | null>(null);
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
    if (props.mode) setMode(props.mode);
  }, [props.mode]);
  React.useEffect(() => {
    if (props.stacked !== undefined) setStacked(props.stacked);
  }, [props.stacked]);

  React.useEffect(() => {
    if (!isLive) return;
    const id = window.setInterval(() => {
      setData((prev) => {
        const last = prev[prev.length - 1];
        const nextHour = (parseInt(last.label.slice(0, 2), 10) + 3) % 24;
        const label = `${String(nextHour).padStart(2, '0')}:00`;
        const telemetry = Math.max(25, Math.min(98, Math.round(last.telemetry + (Math.random() - 0.48) * 18)));
        const glyph = Math.max(15, Math.min(92, Math.round(last.glyph + (Math.random() - 0.48) * 16)));
        const budget = Math.max(55, Math.min(95, Math.round(last.budget + (Math.random() - 0.5) * 8)));
        return [...prev.slice(1), { label, telemetry, glyph, budget }];
      });
    }, 1100);
    return () => window.clearInterval(id);
  }, [isLive]);

  const [startIdx, endIdx] = zoomRange ?? [0, data.length - 1];
  const visibleData = data.slice(startIdx, endIdx + 1);
  const activeSeries = CORE_SERIES.filter((s) => !legend.hidden.has(s.id));

  const W = 560;
  const H = 220;
  const pad = { top: 18, right: 16, bottom: 28, left: 38 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const allValues = visibleData.flatMap((d) => {
    if (mode === 'bar' && stacked) {
      return [
        activeSeries.reduce((acc, s) => acc + d[s.id as keyof Omit<CorePoint, 'label'>], 0),
      ];
    }
    return activeSeries.map((s) => d[s.id as keyof Omit<CorePoint, 'label'>]);
  });
  const domain = computeNiceDomain(
    style.showThreshold ? [...allValues, style.thresholdValue] : allValues,
    { includeZero: true, tickCount: 4 },
  );

  const yToPx = (v: number) =>
    pad.top + plotH - ((v - domain.min) / (domain.max - domain.min || 1)) * plotH;
  const xAt = (i: number) =>
    visibleData.length <= 1
      ? pad.left + plotW / 2
      : pad.left + (i / (visibleData.length - 1)) * plotW;

  const focusedIdx = pinnedIdx !== null && pinnedIdx < visibleData.length
    ? pinnedIdx
    : hoveredIdx !== null && hoveredIdx < visibleData.length
      ? hoveredIdx
      : visibleData.length - 1;
  const focusedPoint = visibleData[focusedIdx] ?? visibleData[0];

  const primaryKey = (activeSeries[0]?.id ?? 'telemetry') as keyof Omit<CorePoint, 'label'>;
  const primaryStats = computeSeriesStats(visibleData.map((d) => d[primaryKey]));

  const tooltip: ChartTooltipPayload | null =
    (hoveredIdx !== null || pinnedIdx !== null) && focusedPoint
      ? {
          title: mode === 'radial' ? `${focusedPoint.label} Snapshot` : `Sample · ${focusedPoint.label}`,
          subtitle: stacked && mode === 'bar' ? 'Stacked composite load' : 'Multi-series telemetry',
          pinned: pinnedIdx !== null,
          xPct: mode === 'radial' ? 50 : ((xAt(focusedIdx) / W) * 100),
          yPct: mode === 'radial' ? 24 : 34,
          rows: activeSeries.map((s, idx) => ({
            label: s.label,
            value: `${focusedPoint[s.id as keyof Omit<CorePoint, 'label'>]}%`,
            color: resolveSeriesColor(s.id, idx, style, s.defaultColor),
          })),
        }
      : null;

  const indexFromClientX = (clientX: number): number => {
    if (!svgRef.current) return 0;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = ((clientX - rect.left) / rect.width) * W;
    const t = Math.max(0, Math.min(1, (relX - pad.left) / plotW));
    return Math.round(t * (visibleData.length - 1));
  };

  return (
    <InteractiveChartFrame
      title="Core Multi-Series Chart"
      subtitle={`${visibleData.length} samples · Drag plot to zoom · Click to pin`}
      exportName={`nothing-${mode}-chart`}
      svgRef={svgRef}
      series={CORE_SERIES.map((s) => ({
        ...s,
        valueHint: focusedPoint ? `${focusedPoint[s.id as keyof Omit<CorePoint, 'label'>]}%` : undefined,
      }))}
      hiddenSeries={legend.hidden}
      onToggleSeries={legend.toggle}
      onSoloSeries={legend.solo}
      onShowAllSeries={legend.showAll}
      styleConfig={style}
      onStyleChange={setStyle}
      isLive={isLive}
      onToggleLive={() => setIsLive((v) => !v)}
      isZoomed={zoomRange !== null}
      onResetZoom={() => {
        setZoomRange(null);
        setPinnedIdx(null);
      }}
      tooltip={tooltip}
      pinnedLabel={pinnedIdx !== null && focusedPoint ? focusedPoint.label : null}
      onUnpin={() => setPinnedIdx(null)}
      defaultConfigOpen={props.defaultConfigOpen}
      className={props.className}
      extraToolbar={
        <div className="inline-flex rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] p-0.5">
          {(['bar', 'line', 'radial'] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={cn(
                'rounded-md px-2 py-1 capitalize cursor-pointer whitespace-nowrap',
                mode === m
                  ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
              )}
            >
              {m}
            </button>
          ))}
        </div>
      }
      extraConfig={
        mode === 'bar' ? (
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
              Bar Grouping Mode
            </span>
            <button
              type="button"
              aria-pressed={stacked}
              onClick={() => setStacked((v) => !v)}
              className="rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] px-2.5 py-1 text-[11px] text-[var(--nt-display)] cursor-pointer"
            >
              {stacked ? 'Stacked Bars' : 'Grouped Bars'}
            </button>
          </div>
        ) : undefined
      }
      scrubber={{
        index: focusedIdx,
        max: visibleData.length - 1,
        label: focusedPoint?.label ?? '—',
        onChange: (next) => {
          setIsLive(false);
          setPinnedIdx(next);
        },
      }}
      breakdownStats={[
        { label: 'Sample', value: focusedPoint?.label ?? '—' },
        { label: 'Active', value: `${focusedPoint?.[primaryKey] ?? 0}%`, accent: true },
        { label: 'Min', value: `${formatMetricNumber(primaryStats.min, '%')}` },
        { label: 'Max', value: `${formatMetricNumber(primaryStats.max, '%')}` },
        { label: 'Avg', value: `${formatMetricNumber(primaryStats.avg, '%')}` },
        {
          label: 'Delta',
          value: `${primaryStats.delta >= 0 ? '+' : ''}${formatMetricNumber(primaryStats.delta, '%')}`,
        },
      ]}
      getCsvData={() => ({
        headers: ['Time', ...activeSeries.map((s) => s.label)],
        rows: visibleData.map((d) => [
          d.label,
          ...activeSeries.map((s) => d[s.id as keyof Omit<CorePoint, 'label'>]),
        ]),
      })}
    >
      {mode === 'radial' ? (
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="h-56 w-full select-none"
          role="img"
          aria-label="Multi-ring radial gauge chart"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {activeSeries.map((s, idx) => {
            const val = focusedPoint?.[s.id as keyof Omit<CorePoint, 'label'>] ?? 0;
            const r = 82 - idx * 20;
            const circ = 2 * Math.PI * r;
            const color = resolveSeriesColor(s.id, idx, style, s.defaultColor);
            return (
              <g
                key={s.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(focusedIdx)}
                onClick={() => setPinnedIdx((p) => (p === focusedIdx ? null : focusedIdx))}
              >
                <circle
                  cx={W / 2}
                  cy={H / 2}
                  r={r}
                  fill="none"
                  stroke="var(--nt-line)"
                  strokeWidth={12}
                />
                <circle
                  cx={W / 2}
                  cy={H / 2}
                  r={r}
                  fill="none"
                  stroke={color}
                  strokeWidth={12}
                  strokeLinecap="round"
                  strokeDasharray={`${(val / 100) * circ} ${circ}`}
                  transform={`rotate(-90 ${W / 2} ${H / 2})`}
                  className="transition-all duration-300"
                />
              </g>
            );
          })}
          <text
            x={W / 2}
            y={H / 2 - 2}
            textAnchor="middle"
            fill="var(--nt-display)"
            fontSize="22"
            fontFamily="monospace"
            fontWeight="600"
          >
            {focusedPoint?.[primaryKey] ?? 0}%
          </text>
          <text
            x={W / 2}
            y={H / 2 + 16}
            textAnchor="middle"
            fill="var(--nt-muted)"
            fontSize="10"
            fontFamily="monospace"
          >
            {focusedPoint?.label}
          </text>
        </svg>
      ) : (
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="h-56 w-full select-none cursor-crosshair"
          role="img"
          aria-label={`Interactive ${mode} telemetry chart`}
          onMouseMove={(e) => {
            const idx = indexFromClientX(e.clientX);
            setHoveredIdx(idx);
            if (brushDrag) setBrushDrag((b) => (b ? { ...b, current: idx } : null));
          }}
          onMouseDown={(e) => {
            const idx = indexFromClientX(e.clientX);
            setBrushDrag({ start: idx, current: idx });
          }}
          onMouseUp={() => {
            if (!brushDrag) return;
            const span = Math.abs(brushDrag.current - brushDrag.start);
            if (span >= 1) {
              const [lo, hi] = clampBrushDomain(
                startIdx + brushDrag.start,
                startIdx + brushDrag.current,
                data.length,
              );
              setZoomRange([lo, hi]);
              setPinnedIdx(null);
            } else {
              setPinnedIdx((prev) => (prev === brushDrag.start ? null : brushDrag.start));
            }
            setBrushDrag(null);
          }}
          onMouseLeave={() => {
            setHoveredIdx(null);
            setBrushDrag(null);
          }}
        >
          {/* Gridlines & Y Ticks */}
          {domain.ticks.map((tick) => {
            const y = yToPx(tick);
            return (
              <g key={tick}>
                {(style.gridMode === 'horizontal' || style.gridMode === 'both') && (
                  <line
                    x1={pad.left}
                    x2={W - pad.right}
                    y1={y}
                    y2={y}
                    stroke="var(--nt-line)"
                    strokeDasharray="3 4"
                  />
                )}
                <text
                  x={pad.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="var(--nt-muted)"
                  fontSize="9.5"
                  fontFamily="monospace"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {style.gridMode === 'both' &&
            visibleData.map((d, i) => (
              <line
                key={d.label}
                x1={xAt(i)}
                x2={xAt(i)}
                y1={pad.top}
                y2={pad.top + plotH}
                stroke="var(--nt-line)"
                strokeOpacity={0.5}
              />
            ))}

          {/* Brush selection overlay */}
          {brushDrag && Math.abs(brushDrag.current - brushDrag.start) >= 1 && (
            <rect
              x={Math.min(xAt(brushDrag.start), xAt(brushDrag.current))}
              y={pad.top}
              width={Math.abs(xAt(brushDrag.current) - xAt(brushDrag.start))}
              height={plotH}
              fill="var(--nt-accent)"
              fillOpacity={0.14}
              stroke="var(--nt-accent)"
              strokeDasharray="3 3"
            />
          )}

          {/* Threshold reference line */}
          {style.showThreshold && (
            <g>
              <line
                x1={pad.left}
                x2={W - pad.right}
                y1={yToPx(style.thresholdValue)}
                y2={yToPx(style.thresholdValue)}
                stroke={style.thresholdColor}
                strokeWidth={1.3}
                strokeDasharray="5 4"
              />
              <text
                x={W - pad.right}
                y={yToPx(style.thresholdValue) - 4}
                textAnchor="end"
                fill={style.thresholdColor}
                fontSize="9"
                fontFamily="monospace"
              >
                LIMIT {style.thresholdValue}%
              </text>
            </g>
          )}

          {/* Magnetic Crosshair */}
          {(hoveredIdx !== null || pinnedIdx !== null) && (
            <line
              x1={xAt(focusedIdx)}
              x2={xAt(focusedIdx)}
              y1={pad.top}
              y2={pad.top + plotH}
              stroke="var(--nt-accent)"
              strokeWidth={1.2}
              strokeDasharray="3 3"
            />
          )}

          {/* Bar Mode */}
          {mode === 'bar' &&
            visibleData.map((d, i) => {
              const slotW = plotW / Math.max(1, visibleData.length);
              const groupW = Math.min(38, slotW * 0.68);
              const baseX = xAt(i) - groupW / 2;
              let stackAcc = 0;

              return (
                <g key={d.label}>
                  {activeSeries.map((s, sIdx) => {
                    const val = d[s.id as keyof Omit<CorePoint, 'label'>];
                    const color = resolveSeriesColor(s.id, sIdx, style, s.defaultColor);
                    const isFocused = i === focusedIdx && (hoveredIdx !== null || pinnedIdx !== null);

                    if (stacked) {
                      const yTop = yToPx(stackAcc + val);
                      const yBot = yToPx(stackAcc);
                      stackAcc += val;
                      return (
                        <rect
                          key={s.id}
                          x={baseX}
                          y={yTop}
                          width={groupW}
                          height={Math.max(1, yBot - yTop)}
                          rx={2.5}
                          fill={color}
                          fillOpacity={isFocused ? 1 : 0.82}
                        />
                      );
                    }

                    const barW = Math.max(4, groupW / Math.max(1, activeSeries.length) - 2);
                    const bx = baseX + sIdx * (barW + 2);
                    const y = yToPx(val);
                    const h = Math.max(1, yToPx(domain.min) - y);
                    return (
                      <g key={s.id}>
                        <rect
                          x={bx}
                          y={y}
                          width={barW}
                          height={h}
                          rx={3}
                          fill={color}
                          fillOpacity={isFocused ? 1 : 0.78}
                        />
                        {style.showLabels && (
                          <text
                            x={bx + barW / 2}
                            y={y - 4}
                            textAnchor="middle"
                            fill="var(--nt-secondary)"
                            fontSize="8"
                            fontFamily="monospace"
                          >
                            {val}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            })}

          {/* Line / Area Mode */}
          {mode === 'line' &&
            activeSeries.map((s, sIdx) => {
              const color = resolveSeriesColor(s.id, sIdx, style, s.defaultColor);
              const pts = visibleData.map((d, i) => ({
                x: xAt(i),
                y: yToPx(d[s.id as keyof Omit<CorePoint, 'label'>]),
                val: d[s.id as keyof Omit<CorePoint, 'label'>],
              }));
              const lineD = buildLinePath(pts, style.curve);
              const areaD = buildAreaPath(pts, pad.top + plotH, style.curve);

              return (
                <g key={s.id}>
                  {style.showArea && style.fillOpacity > 0 && (
                    <path d={areaD} fill={color} fillOpacity={style.fillOpacity} />
                  )}
                  <path
                    d={lineD}
                    fill="none"
                    stroke={color}
                    strokeWidth={style.strokeWidth}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {pts.map((p, i) => {
                    const isFocused = i === focusedIdx && (hoveredIdx !== null || pinnedIdx !== null);
                    const r = isFocused ? Math.max(4.5, style.dotSize + 1.5) : style.dotSize;
                    return (
                      <g key={i}>
                        {r > 0 && (
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={r}
                            fill={color}
                            stroke="var(--nt-bg)"
                            strokeWidth={isFocused ? 2 : 1}
                          />
                        )}
                        {style.showLabels && (
                          <text
                            x={p.x}
                            y={p.y - 7}
                            textAnchor="middle"
                            fill="var(--nt-secondary)"
                            fontSize="8.5"
                            fontFamily="monospace"
                          >
                            {p.val}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            })}

          {/* X Axis Labels */}
          {visibleData.map((d, i) => (
            <text
              key={d.label}
              x={xAt(i)}
              y={H - 8}
              textAnchor="middle"
              fill={i === focusedIdx ? 'var(--nt-display)' : 'var(--nt-muted)'}
              fontSize="9.5"
              fontFamily="monospace"
            >
              {d.label}
            </text>
          ))}
        </svg>
      )}
    </InteractiveChartFrame>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 2. InteractiveSparklineStrip (`sparkline-strip`: Synchronized Multi-Metric)
 * ─────────────────────────────────────────────────────────────────────────── */
const SPARKLINE_PRESETS = {
  '24h': {
    labels: ['00h', '02h', '04h', '06h', '08h', '10h', '12h', '14h', '16h', '18h'],
    fps: [112, 115, 118, 119, 117, 120, 119, 118, 120, 120],
    bundle: [15.4, 15.1, 14.9, 14.8, 14.6, 14.5, 14.4, 14.3, 14.2, 14.2],
    thermal: [35.2, 35.8, 36.4, 37.1, 38.0, 38.6, 39.2, 39.4, 38.9, 38.6],
  },
  '7d': {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'],
    fps: [110, 113, 114, 116, 118, 118, 119, 117, 119, 119],
    bundle: [16.8, 16.4, 16.0, 15.6, 15.1, 14.8, 14.6, 14.5, 14.4, 14.2],
    thermal: [36.1, 36.9, 37.2, 37.8, 38.1, 37.9, 37.5, 37.8, 37.9, 37.9],
  },
  '30d': {
    labels: ['W1', 'W1+', 'W2', 'W2+', 'W3', 'W3+', 'W4', 'W4+', 'W5', 'Now'],
    fps: [106, 108, 111, 112, 115, 116, 117, 118, 118, 118],
    bundle: [19.8, 19.2, 18.5, 17.8, 17.0, 16.4, 15.8, 15.0, 14.5, 14.2],
    thermal: [40.0, 39.5, 39.1, 38.8, 38.2, 38.0, 37.9, 37.6, 37.4, 37.2],
  },
};

const SPARK_SERIES: readonly ChartLegendSeries[] = [
  { id: 'fps', label: 'Glyph FPS', defaultColor: '#F5F5F5' },
  { id: 'bundle', label: 'Bundle kB', defaultColor: '#A3A3A3' },
  { id: 'thermal', label: 'Thermal °C', defaultColor: '#D71921' },
];

export function InteractiveSparklineStrip(props: BaseInteractiveChartProps) {
  const [windowKey, setWindowKey] = React.useState<'24h' | '7d' | '30d'>('24h');
  const [seriesData, setSeriesData] = React.useState(() => SPARKLINE_PRESETS['24h']);
  const [style, setStyle] = useSyncedStyleConfig(props);
  const legend = useLegendState(['fps', 'bundle', 'thermal']);
  const [isLive, setIsLive] = React.useState(props.defaultLive ?? false);
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);
  const [pinnedIdx, setPinnedIdx] = React.useState<number | null>(null);
  const [zoomRange, setZoomRange] = React.useState<[number, number] | null>(null);
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
    setSeriesData(SPARKLINE_PRESETS[windowKey]);
    setZoomRange(null);
    setPinnedIdx(null);
  }, [windowKey]);

  React.useEffect(() => {
    if (!isLive) return;
    const id = window.setInterval(() => {
      setSeriesData((prev) => ({
        labels: [...prev.labels.slice(1), `T+${Math.floor(Math.random() * 90) + 10}`],
        fps: [
          ...prev.fps.slice(1),
          Math.max(105, Math.min(120, Math.round(prev.fps[prev.fps.length - 1] + (Math.random() - 0.5) * 4))),
        ],
        bundle: [
          ...prev.bundle.slice(1),
          Number(Math.max(13.5, Math.min(18, prev.bundle[prev.bundle.length - 1] + (Math.random() - 0.5) * 0.4)).toFixed(1)),
        ],
        thermal: [
          ...prev.thermal.slice(1),
          Number(Math.max(34, Math.min(42, prev.thermal[prev.thermal.length - 1] + (Math.random() - 0.48) * 0.9)).toFixed(1)),
        ],
      }));
    }, 1000);
    return () => window.clearInterval(id);
  }, [isLive]);

  const [startIdx, endIdx] = zoomRange ?? [0, seriesData.labels.length - 1];
  const labels = seriesData.labels.slice(startIdx, endIdx + 1);
  const metrics = [
    { id: 'fps', label: 'Glyph FPS', unit: 'Hz', values: seriesData.fps.slice(startIdx, endIdx + 1), defaultColor: '#F5F5F5' },
    { id: 'bundle', label: 'Bundle Size', unit: 'kB', values: seriesData.bundle.slice(startIdx, endIdx + 1), defaultColor: '#A3A3A3' },
    { id: 'thermal', label: 'LED Thermal', unit: '°C', values: seriesData.thermal.slice(startIdx, endIdx + 1), defaultColor: '#D71921' },
  ].filter((m) => !legend.hidden.has(m.id));

  const activeIdx = pinnedIdx !== null && pinnedIdx < labels.length
    ? pinnedIdx
    : hoveredIdx !== null && hoveredIdx < labels.length
      ? hoveredIdx
      : labels.length - 1;

  const tooltip: ChartTooltipPayload | null =
    hoveredIdx !== null || pinnedIdx !== null
      ? {
          title: `Synced Frame · ${labels[activeIdx] ?? ''}`,
          subtitle: 'Synchronized multi-metric crosshair',
          pinned: pinnedIdx !== null,
          xPct: (activeIdx / Math.max(1, labels.length - 1)) * 100,
          yPct: 30,
          rows: metrics.map((m, i) => ({
            label: m.label,
            value: `${m.values[activeIdx]} ${m.unit}`,
            color: resolveSeriesColor(m.id, i, style, m.defaultColor),
          })),
        }
      : null;

  const W = 540;
  const rowH = 62;
  const totalH = Math.max(70, metrics.length * rowH + 14);

  return (
    <InteractiveChartFrame
      title="Synchronized Sparkline Strip"
      subtitle="Hover any lane to sync crosshairs · Click to pin · Zoom slices"
      exportName="nothing-sparkline-strip"
      svgRef={svgRef}
      series={SPARK_SERIES}
      hiddenSeries={legend.hidden}
      onToggleSeries={legend.toggle}
      onSoloSeries={legend.solo}
      onShowAllSeries={legend.showAll}
      styleConfig={style}
      onStyleChange={setStyle}
      capabilities={{
        curve: true,
        strokeWidth: true,
        fillOpacity: true,
        dotSize: true,
        grid: false,
        labels: true,
        area: true,
        threshold: false,
      }}
      isLive={isLive}
      onToggleLive={() => setIsLive((v) => !v)}
      isZoomed={zoomRange !== null}
      onResetZoom={() => setZoomRange(null)}
      tooltip={tooltip}
      pinnedLabel={pinnedIdx !== null ? labels[activeIdx] : null}
      onUnpin={() => setPinnedIdx(null)}
      defaultConfigOpen={props.defaultConfigOpen}
      className={props.className}
      extraToolbar={
        <div className="inline-flex rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] p-0.5">
          {(['24h', '7d', '30d'] as const).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={windowKey === k}
              onClick={() => setWindowKey(k)}
              className={cn(
                'rounded-md px-2 py-1 uppercase cursor-pointer',
                windowKey === k
                  ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
              )}
            >
              {k}
            </button>
          ))}
        </div>
      }
      scrubber={{
        index: activeIdx,
        max: labels.length - 1,
        label: labels[activeIdx] ?? '—',
        onChange: (next) => {
          setIsLive(false);
          setPinnedIdx(next);
        },
      }}
      breakdownStats={metrics.map((m) => {
        const stats = computeSeriesStats(m.values);
        return {
          label: m.label,
          value: `${m.values[activeIdx]} ${m.unit} (${stats.delta >= 0 ? '+' : ''}${stats.delta.toFixed(1)})`,
          accent: m.id === 'thermal',
        };
      })}
      getCsvData={() => ({
        headers: ['Sample', ...metrics.map((m) => `${m.label} (${m.unit})`)],
        rows: labels.map((lbl, idx) => [lbl, ...metrics.map((m) => m.values[idx])]),
      })}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${totalH}`}
        className="w-full select-none cursor-crosshair"
        style={{ height: `${Math.max(150, metrics.length * 64)}px` }}
        role="img"
        aria-label="Synchronized telemetry sparklines"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const relX = ((e.clientX - rect.left) / rect.width) * W;
          const t = Math.max(0, Math.min(1, (relX - 135) / (W - 155)));
          setHoveredIdx(Math.round(t * (labels.length - 1)));
        }}
        onClick={() => {
          if (hoveredIdx !== null) {
            setPinnedIdx((p) => (p === hoveredIdx ? null : hoveredIdx));
          }
        }}
        onDoubleClick={() => {
          if (zoomRange) setZoomRange(null);
          else setZoomRange(clampBrushDomain(Math.max(0, activeIdx - 2), Math.min(labels.length - 1, activeIdx + 2), labels.length));
        }}
        onMouseLeave={() => setHoveredIdx(null)}
      >
        {metrics.map((m, mIdx) => {
          const y0 = 10 + mIdx * rowH;
          const color = resolveSeriesColor(m.id, mIdx, style, m.defaultColor);
          const min = Math.min(...m.values);
          const max = Math.max(...m.values);
          const span = max - min || 1;
          const plotX0 = 135;
          const plotW = W - 155;
          const pts = m.values.map((v, i) => ({
            x: plotX0 + (i / Math.max(1, m.values.length - 1)) * plotW,
            y: y0 + 44 - ((v - min) / span) * 32,
            v,
          }));
          const lineD = buildLinePath(pts, style.curve);
          const areaD = buildAreaPath(pts, y0 + 50, style.curve);
          const activePt = pts[activeIdx] ?? pts[pts.length - 1];

          return (
            <g key={m.id}>
              <rect
                x={4}
                y={y0}
                width={W - 8}
                height={rowH - 8}
                rx={10}
                fill="var(--nt-bg)"
                stroke="var(--nt-line)"
              />
              <text x={16} y={y0 + 21} fill="var(--nt-muted)" fontSize="9.5" fontFamily="monospace">
                {m.label}
              </text>
              <text
                x={16}
                y={y0 + 41}
                fill="var(--nt-display)"
                fontSize="15"
                fontFamily="monospace"
                fontWeight="600"
              >
                {m.values[activeIdx]} {m.unit}
              </text>
              {style.showArea && style.fillOpacity > 0 && (
                <path d={areaD} fill={color} fillOpacity={style.fillOpacity} />
              )}
              <path
                d={lineD}
                fill="none"
                stroke={color}
                strokeWidth={style.strokeWidth}
                strokeLinecap="round"
              />
              <line
                x1={activePt.x}
                x2={activePt.x}
                y1={y0 + 6}
                y2={y0 + rowH - 12}
                stroke="var(--nt-accent)"
                strokeDasharray="2 2"
                strokeOpacity={hoveredIdx !== null || pinnedIdx !== null ? 0.9 : 0.35}
              />
              <circle cx={activePt.x} cy={activePt.y} r={Math.max(3, style.dotSize)} fill={color} stroke="var(--nt-bg)" strokeWidth={1.5} />
              {style.showLabels && (
                <text x={activePt.x} y={activePt.y - 7} textAnchor="middle" fill="var(--nt-display)" fontSize="8.5" fontFamily="monospace">
                  {activePt.v}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </InteractiveChartFrame>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 3. InteractiveTimeseriesChart (`timeseries`: Drag-to-Brush Zoom + Live Stream)
 * ─────────────────────────────────────────────────────────────────────────── */
interface TimeseriesPoint {
  time: string;
  throughput: number;
  burst: number;
  latency: number;
}

function buildTimeseriesPreset(range: '1H' | '24H' | '7D' | '30D'): TimeseriesPoint[] {
  const count = 16;
  const seed = range === '1H' ? 1 : range === '24H' ? 2 : range === '7D' ? 3 : 4;
  return Array.from({ length: count }, (_, i) => {
    const wave = Math.sin((i + seed) * 0.65) * 18 + Math.cos(i * 0.35) * 10;
    const throughput = Math.round(52 + wave + seed * 4);
    const burst = Math.round(throughput + 14 + Math.abs(Math.sin(i * 1.1)) * 12);
    const latency = Math.round(28 - wave * 0.35 + seed * 3);
    const time =
      range === '1H'
        ? `${String(i * 4).padStart(2, '0')}m`
        : range === '24H'
          ? `${String(Math.floor((i * 24) / count)).padStart(2, '0')}:00`
          : range === '7D'
            ? `D${i + 1}`
            : `T-${count - i}d`;
    return { time, throughput, burst, latency };
  });
}

const TS_SERIES: readonly ChartLegendSeries[] = [
  { id: 'throughput', label: 'Throughput MB/s', defaultColor: '#F5F5F5' },
  { id: 'burst', label: 'Peak Burst', defaultColor: '#D71921' },
  { id: 'latency', label: 'Latency ms', defaultColor: '#737373' },
];

export function InteractiveTimeseriesChart(props: BaseInteractiveChartProps) {
  const [range, setRange] = React.useState<'1H' | '24H' | '7D' | '30D'>('24H');
  const [data, setData] = React.useState<TimeseriesPoint[]>(() => buildTimeseriesPreset('24H'));
  const [style, setStyle] = useSyncedStyleConfig({
    showThreshold: true,
    thresholdValue: 78,
    ...props,
  });
  const legend = useLegendState(['throughput', 'burst', 'latency']);
  const [isLive, setIsLive] = React.useState(props.defaultLive ?? false);
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);
  const [pinnedIdx, setPinnedIdx] = React.useState<number | null>(null);
  const [zoomRange, setZoomRange] = React.useState<[number, number] | null>(null);
  const [dragBrush, setDragBrush] = React.useState<{ start: number; current: number } | null>(null);
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
    setData(buildTimeseriesPreset(range));
    setZoomRange(null);
    setPinnedIdx(null);
  }, [range]);

  React.useEffect(() => {
    if (!isLive) return;
    const id = window.setInterval(() => {
      setData((prev) => {
        const last = prev[prev.length - 1];
        const nextTp = Math.max(22, Math.min(92, Math.round(last.throughput + (Math.random() - 0.48) * 14)));
        const nextBurst = Math.min(104, nextTp + Math.round(10 + Math.random() * 14));
        const nextLat = Math.max(10, Math.min(60, Math.round(last.latency + (Math.random() - 0.5) * 6)));
        return [...prev.slice(1), { time: `L${Math.floor(Math.random() * 90) + 10}`, throughput: nextTp, burst: nextBurst, latency: nextLat }];
      });
    }, 950);
    return () => window.clearInterval(id);
  }, [isLive]);

  const [startIdx, endIdx] = zoomRange ?? [0, data.length - 1];
  const visible = data.slice(startIdx, endIdx + 1);
  const activeSeries = TS_SERIES.filter((s) => !legend.hidden.has(s.id));

  const W = 560;
  const H = 220;
  const pad = { top: 18, right: 16, bottom: 28, left: 38 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const allVals = visible.flatMap((p) =>
    activeSeries.map((s) => p[s.id as keyof Omit<TimeseriesPoint, 'time'>]),
  );
  const domain = computeNiceDomain(
    style.showThreshold ? [...allVals, style.thresholdValue] : allVals,
    { includeZero: false, tickCount: 4 },
  );

  const yToPx = (v: number) =>
    pad.top + plotH - ((v - domain.min) / (domain.max - domain.min || 1)) * plotH;
  const xAt = (i: number) =>
    visible.length <= 1 ? pad.left + plotW / 2 : pad.left + (i / (visible.length - 1)) * plotW;

  const focusedIdx = pinnedIdx !== null && pinnedIdx < visible.length
    ? pinnedIdx
    : hoveredIdx !== null && hoveredIdx < visible.length
      ? hoveredIdx
      : Math.floor(visible.length / 2);
  const pt = visible[focusedIdx] ?? visible[0];
  const primaryId = (activeSeries[0]?.id ?? 'throughput') as keyof Omit<TimeseriesPoint, 'time'>;
  const stats = computeSeriesStats(visible.map((v) => v[primaryId]));

  const tooltip: ChartTooltipPayload | null =
    (hoveredIdx !== null || pinnedIdx !== null) && pt
      ? {
          title: `Timestamp · ${pt.time}`,
          subtitle: zoomRange ? `Zoomed slice (${visible.length}/${data.length})` : `${range} window`,
          pinned: pinnedIdx !== null,
          xPct: (xAt(focusedIdx) / W) * 100,
          yPct: 34,
          rows: activeSeries.map((s, idx) => ({
            label: s.label,
            value: String(pt[s.id as keyof Omit<TimeseriesPoint, 'time'>]),
            color: resolveSeriesColor(s.id, idx, style, s.defaultColor),
          })),
        }
      : null;

  const idxFromClientX = (clientX: number) => {
    if (!svgRef.current) return 0;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = ((clientX - rect.left) / rect.width) * W;
    const t = Math.max(0, Math.min(1, (relX - pad.left) / plotW));
    return Math.round(t * (visible.length - 1));
  };

  return (
    <InteractiveChartFrame
      title="Timeseries Telemetry"
      subtitle="Drag across plot to zoom · Mini brush below · Click to pin"
      exportName="nothing-timeseries"
      svgRef={svgRef}
      series={TS_SERIES.map((s) => ({
        ...s,
        valueHint: pt ? String(pt[s.id as keyof Omit<TimeseriesPoint, 'time'>]) : undefined,
      }))}
      hiddenSeries={legend.hidden}
      onToggleSeries={legend.toggle}
      onSoloSeries={legend.solo}
      onShowAllSeries={legend.showAll}
      styleConfig={style}
      onStyleChange={setStyle}
      isLive={isLive}
      onToggleLive={() => setIsLive((v) => !v)}
      isZoomed={zoomRange !== null}
      onResetZoom={() => {
        setZoomRange(null);
        setPinnedIdx(null);
      }}
      tooltip={tooltip}
      pinnedLabel={pinnedIdx !== null && pt ? pt.time : null}
      onUnpin={() => setPinnedIdx(null)}
      defaultConfigOpen={props.defaultConfigOpen}
      className={props.className}
      extraToolbar={
        <div className="inline-flex rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] p-0.5">
          {(['1H', '24H', '7D', '30D'] as const).map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={range === r}
              onClick={() => setRange(r)}
              className={cn(
                'rounded-md px-2 py-1 cursor-pointer',
                range === r
                  ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
              )}
            >
              {r}
            </button>
          ))}
        </div>
      }
      scrubber={{
        index: focusedIdx,
        max: visible.length - 1,
        label: pt?.time ?? '—',
        onChange: (next) => {
          setIsLive(false);
          setPinnedIdx(next);
        },
      }}
      breakdownStats={[
        { label: 'Time', value: pt?.time ?? '—' },
        { label: 'Throughput', value: `${pt?.throughput ?? 0} MB/s`, accent: true },
        { label: 'Peak', value: `${formatMetricNumber(stats.max)}` },
        { label: 'Min', value: `${formatMetricNumber(stats.min)}` },
        { label: 'Avg', value: `${formatMetricNumber(stats.avg)}` },
        { label: 'Span', value: `${visible.length}/${data.length} pts` },
      ]}
      getCsvData={() => ({
        headers: ['Time', ...activeSeries.map((s) => s.label)],
        rows: visible.map((p) => [
          p.time,
          ...activeSeries.map((s) => p[s.id as keyof Omit<TimeseriesPoint, 'time'>]),
        ]),
      })}
    >
      <div className="space-y-2">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="h-56 w-full select-none cursor-crosshair"
          role="img"
          aria-label="Interactive timeseries telemetry chart"
          onMouseMove={(e) => {
            const idx = idxFromClientX(e.clientX);
            setHoveredIdx(idx);
            if (dragBrush) setDragBrush((b) => (b ? { ...b, current: idx } : null));
          }}
          onMouseDown={(e) => {
            const idx = idxFromClientX(e.clientX);
            setDragBrush({ start: idx, current: idx });
          }}
          onMouseUp={() => {
            if (!dragBrush) return;
            if (Math.abs(dragBrush.current - dragBrush.start) >= 1) {
              setZoomRange(
                clampBrushDomain(
                  startIdx + dragBrush.start,
                  startIdx + dragBrush.current,
                  data.length,
                ),
              );
              setPinnedIdx(null);
            } else {
              setPinnedIdx((p) => (p === dragBrush.start ? null : dragBrush.start));
            }
            setDragBrush(null);
          }}
          onMouseLeave={() => {
            setHoveredIdx(null);
            setDragBrush(null);
          }}
        >
          {domain.ticks.map((tick) => {
            const y = yToPx(tick);
            return (
              <g key={tick}>
                {(style.gridMode === 'horizontal' || style.gridMode === 'both') && (
                  <line x1={pad.left} x2={W - pad.right} y1={y} y2={y} stroke="var(--nt-line)" strokeDasharray="3 4" />
                )}
                <text x={pad.left - 8} y={y + 3} textAnchor="end" fill="var(--nt-muted)" fontSize="9.5" fontFamily="monospace">
                  {tick}
                </text>
              </g>
            );
          })}

          {style.showThreshold && (
            <g>
              <rect
                x={pad.left}
                y={pad.top}
                width={plotW}
                height={Math.max(0, yToPx(style.thresholdValue) - pad.top)}
                fill={style.thresholdColor}
                fillOpacity={0.07}
              />
              <line
                x1={pad.left}
                x2={W - pad.right}
                y1={yToPx(style.thresholdValue)}
                y2={yToPx(style.thresholdValue)}
                stroke={style.thresholdColor}
                strokeDasharray="4 4"
                strokeWidth={1.25}
              />
            </g>
          )}

          {dragBrush && Math.abs(dragBrush.current - dragBrush.start) >= 1 && (
            <rect
              x={Math.min(xAt(dragBrush.start), xAt(dragBrush.current))}
              y={pad.top}
              width={Math.abs(xAt(dragBrush.current) - xAt(dragBrush.start))}
              height={plotH}
              fill="var(--nt-accent)"
              fillOpacity={0.16}
              stroke="var(--nt-accent)"
            />
          )}

          <line
            x1={xAt(focusedIdx)}
            x2={xAt(focusedIdx)}
            y1={pad.top}
            y2={pad.top + plotH}
            stroke="var(--nt-accent)"
            strokeWidth={1.2}
            strokeDasharray="3 3"
          />

          {activeSeries.map((s, sIdx) => {
            const color = resolveSeriesColor(s.id, sIdx, style, s.defaultColor);
            const pts = visible.map((p, i) => ({
              x: xAt(i),
              y: yToPx(p[s.id as keyof Omit<TimeseriesPoint, 'time'>]),
              val: p[s.id as keyof Omit<TimeseriesPoint, 'time'>],
            }));
            return (
              <g key={s.id}>
                {style.showArea && style.fillOpacity > 0 && (
                  <path d={buildAreaPath(pts, pad.top + plotH, style.curve)} fill={color} fillOpacity={style.fillOpacity} />
                )}
                <path
                  d={buildLinePath(pts, style.curve)}
                  fill="none"
                  stroke={color}
                  strokeWidth={style.strokeWidth}
                  strokeLinecap="round"
                />
                {pts.map((p, i) => {
                  const active = i === focusedIdx;
                  const r = active ? Math.max(4.5, style.dotSize + 1.5) : style.dotSize;
                  return (
                    <g key={i}>
                      {r > 0 && (
                        <circle cx={p.x} cy={p.y} r={r} fill={color} stroke="var(--nt-bg)" strokeWidth={active ? 2 : 1} />
                      )}
                      {style.showLabels && i % 2 === 0 && (
                        <text x={p.x} y={p.y - 7} textAnchor="middle" fill="var(--nt-secondary)" fontSize="8" fontFamily="monospace">
                          {p.val}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}

          {visible.map((p, i) =>
            i % Math.max(1, Math.floor(visible.length / 7)) === 0 || i === visible.length - 1 ? (
              <text key={p.time + i} x={xAt(i)} y={H - 8} textAnchor="middle" fill="var(--nt-muted)" fontSize="9" fontFamily="monospace">
                {p.time}
              </text>
            ) : null,
          )}
        </svg>

        {/* Mini Brush Overview Bar */}
        <div className="flex items-center gap-2 border-t border-[var(--nt-line)] pt-2 font-mono text-[10px] text-[var(--nt-muted)]">
          <span className="shrink-0">BRUSH</span>
          <div className="relative h-5 flex-1 rounded-md border border-[var(--nt-line)] bg-[var(--nt-bg)] overflow-hidden">
            <div
              className="absolute inset-y-0 bg-[var(--nt-accent)]/20 border-x border-[var(--nt-accent)]"
              style={{
                left: `${(startIdx / Math.max(1, data.length - 1)) * 100}%`,
                right: `${(1 - endIdx / Math.max(1, data.length - 1)) * 100}%`,
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => {
              const mid = Math.floor(data.length / 2);
              setZoomRange(zoomRange ? null : [Math.max(0, mid - 3), Math.min(data.length - 1, mid + 3)]);
            }}
            className="rounded-md border border-[var(--nt-line)] bg-[var(--nt-bg)] px-2 py-0.5 text-[var(--nt-display)] hover:border-[var(--nt-display)] cursor-pointer whitespace-nowrap"
          >
            {zoomRange ? 'Full Range' : 'Focus Center'}
          </button>
        </div>
      </div>
    </InteractiveChartFrame>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 4. InteractiveCustomChart (`custom-chart`: Composable Multi-Layer Builder)
 * ─────────────────────────────────────────────────────────────────────────── */
interface CustomPoint {
  label: string;
  bars: number;
  line: number;
  scatter: number;
}

const INITIAL_CUSTOM_POINTS: CustomPoint[] = [
  { label: 'S1', bars: 34, line: 42, scatter: 39 },
  { label: 'S2', bars: 48, line: 51, scatter: 56 },
  { label: 'S3', bars: 41, line: 49, scatter: 44 },
  { label: 'S4', bars: 67, line: 63, scatter: 71 },
  { label: 'S5', bars: 89, line: 78, scatter: 92 },
  { label: 'S6', bars: 72, line: 74, scatter: 68 },
  { label: 'S7', bars: 60, line: 66, scatter: 64 },
  { label: 'S8', bars: 78, line: 81, scatter: 84 },
];

const CUSTOM_LAYERS: readonly ChartLegendSeries[] = [
  { id: 'bars', label: 'Bars Layer', defaultColor: '#F5F5F5' },
  { id: 'line', label: 'Trend Line', defaultColor: '#D71921' },
  { id: 'scatter', label: 'Scatter Dots', defaultColor: '#38BDF8' },
];

export function InteractiveCustomChart(props: BaseInteractiveChartProps) {
  const [data, setData] = React.useState<CustomPoint[]>(INITIAL_CUSTOM_POINTS);
  const [style, setStyle] = useSyncedStyleConfig({
    showThreshold: true,
    thresholdValue: 80,
    ...props,
  });
  const legend = useLegendState(['bars', 'line', 'scatter']);
  const [isLive, setIsLive] = React.useState(props.defaultLive ?? false);
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);
  const [pinnedIdx, setPinnedIdx] = React.useState<number | null>(null);
  const [zoomRange, setZoomRange] = React.useState<[number, number] | null>(null);
  const [dragBrush, setDragBrush] = React.useState<{ start: number; current: number } | null>(null);
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
    if (!isLive) return;
    const id = window.setInterval(() => {
      setData((prev) => {
        const nextNum = parseInt(prev[prev.length - 1].label.slice(1), 10) + 1;
        const bars = Math.max(20, Math.min(96, Math.round(58 + (Math.random() - 0.5) * 52)));
        const line = Math.max(25, Math.min(92, Math.round((prev[prev.length - 1].line + bars) / 2)));
        const scatter = Math.max(18, Math.min(98, Math.round(bars + (Math.random() - 0.5) * 18)));
        return [...prev.slice(1), { label: `S${nextNum}`, bars, line, scatter }];
      });
    }, 1050);
    return () => window.clearInterval(id);
  }, [isLive]);

  const [startIdx, endIdx] = zoomRange ?? [0, data.length - 1];
  const visible = data.slice(startIdx, endIdx + 1);
  const activeLayers = CUSTOM_LAYERS.filter((l) => !legend.hidden.has(l.id));

  const W = 560;
  const H = 220;
  const pad = { top: 18, right: 16, bottom: 28, left: 38 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const domain = computeNiceDomain([0, 100, style.thresholdValue], { includeZero: true, tickCount: 4 });
  const yToPx = (v: number) => pad.top + plotH - ((v - domain.min) / (domain.max - domain.min || 1)) * plotH;
  const xAt = (i: number) =>
    visible.length <= 1 ? pad.left + plotW / 2 : pad.left + (i / (visible.length - 1)) * plotW;

  const focusedIdx = pinnedIdx !== null && pinnedIdx < visible.length
    ? pinnedIdx
    : hoveredIdx !== null && hoveredIdx < visible.length
      ? hoveredIdx
      : visible.length - 1;
  const pt = visible[focusedIdx] ?? visible[0];
  const barStats = computeSeriesStats(visible.map((p) => p.bars));

  const tooltip: ChartTooltipPayload | null =
    (hoveredIdx !== null || pinnedIdx !== null) && pt
      ? {
          title: `Composite · ${pt.label}`,
          subtitle: pt.bars > style.thresholdValue ? 'Above alert threshold' : 'Nominal composite frame',
          pinned: pinnedIdx !== null,
          xPct: (xAt(focusedIdx) / W) * 100,
          yPct: 32,
          rows: activeLayers.map((l, idx) => ({
            label: l.label,
            value: String(pt[l.id as keyof Omit<CustomPoint, 'label'>]),
            color: resolveSeriesColor(l.id, idx, style, l.defaultColor),
          })),
        }
      : null;

  const idxFromClientX = (clientX: number) => {
    if (!svgRef.current) return 0;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = ((clientX - rect.left) / rect.width) * W;
    const t = Math.max(0, Math.min(1, (relX - pad.left) / plotW));
    return Math.round(t * (visible.length - 1));
  };

  const barsColor = resolveSeriesColor('bars', 0, style, '#F5F5F5');
  const lineColor = resolveSeriesColor('line', 1, style, '#D71921');
  const scatterColor = resolveSeriesColor('scatter', 2, style, '#38BDF8');

  return (
    <InteractiveChartFrame
      title="Composable Custom Multi-Layer Chart"
      subtitle="Mix Bars + Trendline + Scatter + Threshold · Pick any color per layer"
      exportName="nothing-custom-chart"
      svgRef={svgRef}
      series={CUSTOM_LAYERS}
      hiddenSeries={legend.hidden}
      onToggleSeries={legend.toggle}
      onSoloSeries={legend.solo}
      onShowAllSeries={legend.showAll}
      styleConfig={style}
      onStyleChange={setStyle}
      isLive={isLive}
      onToggleLive={() => setIsLive((v) => !v)}
      isZoomed={zoomRange !== null}
      onResetZoom={() => {
        setZoomRange(null);
        setPinnedIdx(null);
      }}
      tooltip={tooltip}
      pinnedLabel={pinnedIdx !== null && pt ? pt.label : null}
      onUnpin={() => setPinnedIdx(null)}
      defaultConfigOpen={props.defaultConfigOpen}
      className={props.className}
      scrubber={{
        index: focusedIdx,
        max: visible.length - 1,
        label: pt?.label ?? '—',
        onChange: (next) => {
          setIsLive(false);
          setPinnedIdx(next);
        },
      }}
      breakdownStats={[
        { label: 'Slot', value: pt?.label ?? '—' },
        { label: 'Bar', value: String(pt?.bars ?? 0) },
        { label: 'Trend', value: String(pt?.line ?? 0), accent: true },
        { label: 'Scatter', value: String(pt?.scatter ?? 0) },
        { label: 'Avg', value: formatMetricNumber(barStats.avg) },
        { label: 'Limit', value: style.showThreshold ? String(style.thresholdValue) : 'OFF' },
      ]}
      getCsvData={() => ({
        headers: ['Slot', 'Bars', 'Trend Line', 'Scatter Dots'],
        rows: visible.map((p) => [p.label, p.bars, p.line, p.scatter]),
      })}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="h-56 w-full select-none cursor-crosshair"
        role="img"
        aria-label="Composable multi-layer interactive chart"
        onMouseMove={(e) => {
          const idx = idxFromClientX(e.clientX);
          setHoveredIdx(idx);
          if (dragBrush) setDragBrush((b) => (b ? { ...b, current: idx } : null));
        }}
        onMouseDown={(e) => {
          const idx = idxFromClientX(e.clientX);
          setDragBrush({ start: idx, current: idx });
        }}
        onMouseUp={() => {
          if (!dragBrush) return;
          if (Math.abs(dragBrush.current - dragBrush.start) >= 1) {
            setZoomRange(
              clampBrushDomain(startIdx + dragBrush.start, startIdx + dragBrush.current, data.length),
            );
            setPinnedIdx(null);
          } else {
            setPinnedIdx((p) => (p === dragBrush.start ? null : dragBrush.start));
          }
          setDragBrush(null);
        }}
        onMouseLeave={() => {
          setHoveredIdx(null);
          setDragBrush(null);
        }}
      >
        {domain.ticks.map((tick) => {
          const y = yToPx(tick);
          return (
            <g key={tick}>
              {(style.gridMode === 'horizontal' || style.gridMode === 'both') && (
                <line x1={pad.left} x2={W - pad.right} y1={y} y2={y} stroke="var(--nt-line)" strokeDasharray="3 4" />
              )}
              <text x={pad.left - 8} y={y + 3} textAnchor="end" fill="var(--nt-muted)" fontSize="9.5" fontFamily="monospace">
                {tick}
              </text>
            </g>
          );
        })}

        {dragBrush && Math.abs(dragBrush.current - dragBrush.start) >= 1 && (
          <rect
            x={Math.min(xAt(dragBrush.start), xAt(dragBrush.current))}
            y={pad.top}
            width={Math.abs(xAt(dragBrush.current) - xAt(dragBrush.start))}
            height={plotH}
            fill="var(--nt-accent)"
            fillOpacity={0.14}
            stroke="var(--nt-accent)"
          />
        )}

        <line
          x1={xAt(focusedIdx)}
          x2={xAt(focusedIdx)}
          y1={pad.top}
          y2={pad.top + plotH}
          stroke="var(--nt-accent)"
          strokeDasharray="3 3"
          strokeOpacity={hoveredIdx !== null || pinnedIdx !== null ? 0.9 : 0.35}
        />

        {!legend.hidden.has('bars') &&
          visible.map((p, i) => {
            const barW = Math.min(28, (plotW / Math.max(1, visible.length)) * 0.48);
            const y = yToPx(p.bars);
            const h = Math.max(1, yToPx(0) - y);
            const over = style.showThreshold && p.bars > style.thresholdValue;
            return (
              <rect
                key={p.label}
                x={xAt(i) - barW / 2}
                y={y}
                width={barW}
                height={h}
                rx={4}
                fill={over ? style.thresholdColor : barsColor}
                fillOpacity={i === focusedIdx ? 0.95 : 0.65}
              />
            );
          })}

        {!legend.hidden.has('line') && (() => {
          const pts = visible.map((p, i) => ({ x: xAt(i), y: yToPx(p.line) }));
          return (
            <g>
              {style.showArea && style.fillOpacity > 0 && (
                <path d={buildAreaPath(pts, pad.top + plotH, style.curve)} fill={lineColor} fillOpacity={style.fillOpacity} />
              )}
              <path d={buildLinePath(pts, style.curve)} fill="none" stroke={lineColor} strokeWidth={style.strokeWidth} />
            </g>
          );
        })()}

        {!legend.hidden.has('scatter') &&
          visible.map((p, i) => (
            <g key={`sc-${p.label}`}>
              <circle
                cx={xAt(i)}
                cy={yToPx(p.scatter)}
                r={i === focusedIdx ? Math.max(5.5, style.dotSize + 2) : Math.max(3, style.dotSize)}
                fill={scatterColor}
                stroke="var(--nt-bg)"
                strokeWidth={1.5}
              />
              {style.showLabels && (
                <text x={xAt(i)} y={yToPx(p.scatter) - 8} textAnchor="middle" fill="var(--nt-secondary)" fontSize="8.5" fontFamily="monospace">
                  {p.scatter}
                </text>
              )}
            </g>
          ))}

        {style.showThreshold && (
          <g>
            <line
              x1={pad.left}
              x2={W - pad.right}
              y1={yToPx(style.thresholdValue)}
              y2={yToPx(style.thresholdValue)}
              stroke={style.thresholdColor}
              strokeWidth={1.4}
              strokeDasharray="5 4"
            />
            <text x={W - pad.right} y={yToPx(style.thresholdValue) - 4} textAnchor="end" fill={style.thresholdColor} fontSize="9" fontFamily="monospace">
              THRESHOLD {style.thresholdValue}
            </text>
          </g>
        )}

        {visible.map((p, i) => (
          <text key={p.label} x={xAt(i)} y={H - 8} textAnchor="middle" fill={i === focusedIdx ? 'var(--nt-display)' : 'var(--nt-muted)'} fontSize="9.5" fontFamily="monospace">
            {p.label}
          </text>
        ))}
      </svg>
    </InteractiveChartFrame>
  );
}
