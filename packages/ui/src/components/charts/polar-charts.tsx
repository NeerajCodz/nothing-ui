import * as React from 'react';
import { cn } from '../../lib/cn';
import {
  DEFAULT_CHART_STYLE,
  computeSeriesStats,
  describeDonutSlicePath,
  formatMetricNumber,
  polarToCartesian,
  resolveSeriesColor,
  type ChartStyleConfig,
} from '../../lib/chart-engine';
import {
  InteractiveChartFrame,
  type ChartLegendSeries,
  type ChartTooltipPayload,
} from './chart-frame';
import type { BaseInteractiveChartProps } from './cartesian-charts';

function usePolarStyle(props: BaseInteractiveChartProps, defaults?: Partial<ChartStyleConfig>) {
  const [style, setStyle] = React.useState<ChartStyleConfig>(() => ({
    ...DEFAULT_CHART_STYLE,
    ...defaults,
    ...(props.palette !== undefined ? { palette: props.palette } : {}),
    ...(props.strokeWidth !== undefined ? { strokeWidth: props.strokeWidth } : {}),
    ...(props.fillOpacity !== undefined ? { fillOpacity: props.fillOpacity } : {}),
    ...(props.dotSize !== undefined ? { dotSize: props.dotSize } : {}),
    ...(props.showLabels !== undefined ? { showLabels: props.showLabels } : {}),
  }));

  React.useEffect(() => {
    setStyle((prev) => ({
      ...prev,
      ...(props.palette !== undefined ? { palette: props.palette } : {}),
      ...(props.strokeWidth !== undefined ? { strokeWidth: props.strokeWidth } : {}),
      ...(props.fillOpacity !== undefined ? { fillOpacity: props.fillOpacity } : {}),
      ...(props.dotSize !== undefined ? { dotSize: props.dotSize } : {}),
      ...(props.showLabels !== undefined ? { showLabels: props.showLabels } : {}),
    }));
  }, [props.palette, props.strokeWidth, props.fillOpacity, props.dotSize, props.showLabels]);

  return [style, setStyle] as const;
}

/* ───────────────────────────────────────────────────────────────────────────
 * 5. InteractiveRadarChart (`radar-chart`: Multi-Series Comparative Polygon)
 * ─────────────────────────────────────────────────────────────────────────── */
export interface InteractiveRadarChartProps extends BaseInteractiveChartProps {
  rings?: number;
}

const RADAR_AXES = ['Glyph', 'Battery', 'Thermal', 'Audio', 'Display', 'Haptics'] as const;

const INITIAL_RADAR_SERIES: Record<string, number[]> = {
  phone3: [96, 88, 84, 82, 94, 91],
  ear3: [42, 86, 92, 97, 30, 76],
  watch: [68, 94, 89, 58, 74, 82],
};

const RADAR_LEGEND: readonly ChartLegendSeries[] = [
  { id: 'phone3', label: 'Phone (3)', defaultColor: '#D71921' },
  { id: 'ear3', label: 'Ear (3)', defaultColor: '#F5F5F5' },
  { id: 'watch', label: 'Watch Pro', defaultColor: '#737373' },
];

export function InteractiveRadarChart(props: InteractiveRadarChartProps) {
  const [seriesValues, setSeriesValues] = React.useState(INITIAL_RADAR_SERIES);
  const [rings, setRings] = React.useState(props.rings ?? 4);
  const [zoomScale, setZoomScale] = React.useState(1);
  const [style, setStyle] = usePolarStyle(props, { fillOpacity: 0.22, showLabels: true });
  const [hidden, setHidden] = React.useState<Set<string>>(() => new Set(['watch']));
  const [isLive, setIsLive] = React.useState(props.defaultLive ?? false);
  const [hoveredAxis, setHoveredAxis] = React.useState<number | null>(null);
  const [pinnedAxis, setPinnedAxis] = React.useState<number | null>(null);
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
    if (props.rings !== undefined) setRings(props.rings);
  }, [props.rings]);

  React.useEffect(() => {
    if (!isLive) return;
    const id = window.setInterval(() => {
      setSeriesValues((prev) => {
        const next: Record<string, number[]> = {};
        for (const [k, vals] of Object.entries(prev)) {
          next[k] = vals.map((v) => Math.max(20, Math.min(100, Math.round(v + (Math.random() - 0.5) * 8))));
        }
        return next;
      });
    }, 1100);
    return () => window.clearInterval(id);
  }, [isLive]);

  const activeSeries = RADAR_LEGEND.filter((s) => !hidden.has(s.id));
  const activeAxisIdx = pinnedAxis ?? hoveredAxis ?? 0;
  const activeAxisLabel = RADAR_AXES[activeAxisIdx];

  const W = 420;
  const H = 260;
  const cx = W / 2;
  const cy = H / 2;
  const maxR = 92 * zoomScale;

  const angleFor = (i: number) => (Math.PI * 2 * i) / RADAR_AXES.length - Math.PI / 2;

  const toggleSeries = (id: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (RADAR_LEGEND.length - next.size > 1) next.add(id);
      return next;
    });
  };
  const soloSeries = (id: string) => {
    setHidden((prev) => {
      const isSolo = RADAR_LEGEND.every((s) => s.id === id || prev.has(s.id)) && !prev.has(id);
      return isSolo ? new Set() : new Set(RADAR_LEGEND.filter((s) => s.id !== id).map((s) => s.id));
    });
  };

  const tooltip: ChartTooltipPayload | null =
    hoveredAxis !== null || pinnedAxis !== null
      ? {
          title: `Axis · ${activeAxisLabel}`,
          subtitle: 'Multi-device benchmark score (0–100)',
          pinned: pinnedAxis !== null,
          xPct: ((cx + Math.cos(angleFor(activeAxisIdx)) * maxR * 0.65) / W) * 100,
          yPct: ((cy + Math.sin(angleFor(activeAxisIdx)) * maxR * 0.65) / H) * 100,
          rows: activeSeries.map((s, idx) => ({
            label: s.label,
            value: `${seriesValues[s.id][activeAxisIdx]} / 100`,
            color: resolveSeriesColor(s.id, idx, style, s.defaultColor),
          })),
        }
      : null;

  const primarySeriesId = activeSeries[0]?.id ?? 'phone3';
  const primaryStats = computeSeriesStats(seriesValues[primarySeriesId]);

  return (
    <InteractiveChartFrame
      title="Multi-Series Comparative Radar"
      subtitle="Overlay devices · Hover vertices · Click any axis to pin breakdown"
      exportName="nothing-radar-chart"
      svgRef={svgRef}
      series={RADAR_LEGEND.map((s) => ({
        ...s,
        valueHint: `${seriesValues[s.id][activeAxisIdx]}`,
      }))}
      hiddenSeries={hidden}
      onToggleSeries={toggleSeries}
      onSoloSeries={soloSeries}
      onShowAllSeries={() => setHidden(new Set())}
      styleConfig={style}
      onStyleChange={setStyle}
      capabilities={{
        curve: false,
        strokeWidth: true,
        fillOpacity: true,
        dotSize: true,
        grid: false,
        labels: true,
        area: false,
        threshold: false,
      }}
      isLive={isLive}
      onToggleLive={() => setIsLive((v) => !v)}
      isZoomed={zoomScale !== 1}
      onResetZoom={() => setZoomScale(1)}
      tooltip={tooltip}
      pinnedLabel={pinnedAxis !== null ? activeAxisLabel : null}
      onUnpin={() => setPinnedAxis(null)}
      defaultConfigOpen={props.defaultConfigOpen}
      className={props.className}
      extraToolbar={
        <div className="inline-flex rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] p-0.5">
          <button
            type="button"
            onClick={() => setZoomScale((z) => Math.max(0.75, Number((z - 0.15).toFixed(2))))}
            className="rounded-md px-2 py-1 text-[var(--nt-secondary)] hover:text-[var(--nt-display)] cursor-pointer"
            aria-label="Zoom out radar"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => setZoomScale((z) => Math.min(1.25, Number((z + 0.15).toFixed(2))))}
            className="rounded-md px-2 py-1 text-[var(--nt-secondary)] hover:text-[var(--nt-display)] cursor-pointer"
            aria-label="Zoom in radar"
          >
            +
          </button>
        </div>
      }
      extraConfig={
        <label className="flex items-center justify-between gap-4">
          <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
            Concentric Grid Rings ({rings})
          </span>
          <input
            type="range"
            min={2}
            max={6}
            step={1}
            value={rings}
            onChange={(e) => setRings(Number(e.target.value))}
            className="w-40 accent-[var(--nt-accent)]"
          />
        </label>
      }
      scrubber={{
        index: activeAxisIdx,
        max: RADAR_AXES.length - 1,
        label: activeAxisLabel,
        onChange: (idx) => {
          setIsLive(false);
          setPinnedAxis(idx);
        },
      }}
      breakdownStats={[
        { label: 'Axis', value: activeAxisLabel },
        ...activeSeries.map((s) => ({
          label: s.label,
          value: `${seriesValues[s.id][activeAxisIdx]}/100`,
          accent: s.id === 'phone3',
        })),
        { label: 'Avg', value: formatMetricNumber(primaryStats.avg) },
      ]}
      getCsvData={() => ({
        headers: ['Axis', ...activeSeries.map((s) => s.label)],
        rows: RADAR_AXES.map((axis, idx) => [axis, ...activeSeries.map((s) => seriesValues[s.id][idx])]),
      })}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="h-64 w-full select-none"
        role="img"
        aria-label="Interactive multi-series radar chart"
        onMouseLeave={() => setHoveredAxis(null)}
      >
        {/* Concentric grid rings */}
        {Array.from({ length: rings }, (_, rIdx) => {
          const scale = (rIdx + 1) / rings;
          const pts = RADAR_AXES.map((_, i) => {
            const a = angleFor(i);
            return `${(cx + maxR * scale * Math.cos(a)).toFixed(1)},${(cy + maxR * scale * Math.sin(a)).toFixed(1)}`;
          }).join(' ');
          return (
            <polygon
              key={rIdx}
              points={pts}
              fill="none"
              stroke="var(--nt-line-2)"
              strokeDasharray="2 3"
            />
          );
        })}

        {/* Radial Spokes & Labels */}
        {RADAR_AXES.map((axis, i) => {
          const a = angleFor(i);
          const x2 = cx + maxR * Math.cos(a);
          const y2 = cy + maxR * Math.sin(a);
          const lx = cx + (maxR + 20) * Math.cos(a);
          const ly = cy + (maxR + 20) * Math.sin(a);
          const isFocus = i === activeAxisIdx && (hoveredAxis !== null || pinnedAxis !== null);
          return (
            <g
              key={axis}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredAxis(i)}
              onClick={() => setPinnedAxis((p) => (p === i ? null : i))}
            >
              <line
                x1={cx}
                y1={cy}
                x2={x2}
                y2={y2}
                stroke={isFocus ? 'var(--nt-accent)' : 'var(--nt-line)'}
                strokeWidth={isFocus ? 1.5 : 1}
              />
              {style.showLabels && (
                <text
                  x={lx}
                  y={ly + 3}
                  textAnchor="middle"
                  fill={isFocus ? 'var(--nt-display)' : 'var(--nt-muted)'}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight={isFocus ? '600' : '400'}
                >
                  {axis}
                </text>
              )}
            </g>
          );
        })}

        {/* Series Polygons */}
        {activeSeries.map((s, sIdx) => {
          const vals = seriesValues[s.id];
          const color = resolveSeriesColor(s.id, sIdx, style, s.defaultColor);
          const polyPts = vals
            .map((v, i) => {
              const a = angleFor(i);
              const r = (v / 100) * maxR;
              return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
            })
            .join(' ');
          return (
            <g key={s.id}>
              <polygon
                points={polyPts}
                fill={color}
                fillOpacity={style.fillOpacity}
                stroke={color}
                strokeWidth={style.strokeWidth}
                className="transition-all duration-200"
              />
              {vals.map((v, i) => {
                const a = angleFor(i);
                const r = (v / 100) * maxR;
                const px = cx + r * Math.cos(a);
                const py = cy + r * Math.sin(a);
                const isFocus = i === activeAxisIdx && (hoveredAxis !== null || pinnedAxis !== null);
                return (
                  <circle
                    key={i}
                    cx={px}
                    cy={py}
                    r={isFocus ? Math.max(5, style.dotSize + 2) : Math.max(2.5, style.dotSize)}
                    fill={color}
                    stroke="var(--nt-bg)"
                    strokeWidth={1.5}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredAxis(i)}
                    onClick={() => setPinnedAxis((p) => (p === i ? null : i))}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>
    </InteractiveChartFrame>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 6. InteractivePieChart (`pie-chart`: Donut / Solid / Half-Donut + Pull-Out)
 * ─────────────────────────────────────────────────────────────────────────── */
export interface InteractivePieChartProps extends BaseInteractiveChartProps {
  innerRadiusRatio?: number;
  padAngle?: number;
  halfDonut?: boolean;
}

interface PieSlice {
  id: string;
  label: string;
  value: number;
  defaultColor: string;
}

const INITIAL_PIE_SLICES: PieSlice[] = [
  { id: 'glyph', label: 'Glyph LEDs', value: 420, defaultColor: '#D71921' },
  { id: 'display', label: 'OLED Display', value: 280, defaultColor: '#F5F5F5' },
  { id: 'radio', label: '5G Modem', value: 185, defaultColor: '#8A8A8A' },
  { id: 'audio', label: 'LDAC Audio', value: 115, defaultColor: '#454545' },
];

export function InteractivePieChart(props: InteractivePieChartProps) {
  const [slices, setSlices] = React.useState<PieSlice[]>(INITIAL_PIE_SLICES);
  const [innerRatio, setInnerRatio] = React.useState(props.innerRadiusRatio ?? 0.58);
  const [padAngle, setPadAngle] = React.useState(props.padAngle ?? 2);
  const [halfDonut, setHalfDonut] = React.useState(props.halfDonut ?? false);
  const [sortOrder, setSortOrder] = React.useState<'original' | 'desc' | 'asc'>('original');
  const [style, setStyle] = usePolarStyle(props, { showLabels: true });
  const [hidden, setHidden] = React.useState<Set<string>>(() => new Set());
  const [isLive, setIsLive] = React.useState(props.defaultLive ?? false);
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const [pinnedId, setPinnedId] = React.useState<string | null>(null);
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
    if (props.innerRadiusRatio !== undefined) setInnerRatio(props.innerRadiusRatio);
  }, [props.innerRadiusRatio]);
  React.useEffect(() => {
    if (props.padAngle !== undefined) setPadAngle(props.padAngle);
  }, [props.padAngle]);
  React.useEffect(() => {
    if (props.halfDonut !== undefined) setHalfDonut(props.halfDonut);
  }, [props.halfDonut]);

  React.useEffect(() => {
    if (!isLive) return;
    const id = window.setInterval(() => {
      setSlices((prev) =>
        prev.map((s) => ({
          ...s,
          value: Math.max(60, Math.min(600, Math.round(s.value + (Math.random() - 0.5) * 40))),
        })),
      );
    }, 1150);
    return () => window.clearInterval(id);
  }, [isLive]);

  const visibleSlices = React.useMemo(() => {
    const filtered = slices.filter((s) => !hidden.has(s.id));
    if (sortOrder === 'desc') return [...filtered].sort((a, b) => b.value - a.value);
    if (sortOrder === 'asc') return [...filtered].sort((a, b) => a.value - b.value);
    return filtered;
  }, [slices, hidden, sortOrder]);

  const total = visibleSlices.reduce((acc, s) => acc + s.value, 0) || 1;
  const maxSpan = halfDonut ? 180 : 360;
  const baseStart = halfDonut ? -90 : 0;

  let cursorAngle = baseStart;
  const geometry = visibleSlices.map((s) => {
    const idx = slices.findIndex((o) => o.id === s.id);
    const share = s.value / total;
    const sweep = share * maxSpan;
    const startA = cursorAngle + padAngle / 2;
    const endA = cursorAngle + Math.max(1, sweep - padAngle / 2);
    const midA = (startA + endA) / 2;
    cursorAngle += sweep;
    return {
      ...s,
      sharePct: share * 100,
      startA,
      endA,
      midA,
      color: resolveSeriesColor(s.id, idx, style, s.defaultColor),
    };
  });

  const activeId = pinnedId && visibleSlices.some((s) => s.id === pinnedId)
    ? pinnedId
    : hoveredId && visibleSlices.some((s) => s.id === hoveredId)
      ? hoveredId
      : geometry[0]?.id ?? null;
  const activeSlice = geometry.find((g) => g.id === activeId) ?? geometry[0];
  const activeIdx = Math.max(0, geometry.findIndex((g) => g.id === activeId));

  const W = 420;
  const H = halfDonut ? 200 : 250;
  const cx = W / 2;
  const cy = halfDonut ? 168 : H / 2;
  const outerR = 96;
  const innerR = outerR * innerRatio;

  const toggleSeries = (id: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (slices.length - next.size > 1) next.add(id);
      return next;
    });
  };
  const soloSeries = (id: string) => {
    setHidden((prev) => {
      const isSolo = slices.every((s) => s.id === id || prev.has(s.id)) && !prev.has(id);
      return isSolo ? new Set() : new Set(slices.filter((s) => s.id !== id).map((s) => s.id));
    });
  };

  const tooltip: ChartTooltipPayload | null =
    (hoveredId !== null || pinnedId !== null) && activeSlice
      ? {
          title: activeSlice.label,
          subtitle: `${activeSlice.sharePct.toFixed(1)}% of visible ${total} mW`,
          pinned: pinnedId !== null,
          xPct: ((polarToCartesian(cx, cy, outerR * 0.85, activeSlice.midA).x) / W) * 100,
          yPct: ((polarToCartesian(cx, cy, outerR * 0.85, activeSlice.midA).y) / H) * 100,
          rows: [
            { label: 'Power Draw', value: `${activeSlice.value} mW`, color: activeSlice.color },
            { label: 'Share', value: `${activeSlice.sharePct.toFixed(1)}%`, color: activeSlice.color },
            { label: 'Total', value: `${total} mW`, color: '#737373' },
          ],
        }
      : null;

  const stats = computeSeriesStats(visibleSlices.map((s) => s.value));

  return (
    <InteractiveChartFrame
      title="Interactive Pie & Donut Chart"
      subtitle="Hover to pull out slices · Click to pin · Customize inner radius & colors"
      exportName="nothing-pie-chart"
      svgRef={svgRef}
      series={slices.map((s) => ({
        id: s.id,
        label: s.label,
        defaultColor: s.defaultColor,
        valueHint: `${((s.value / total) * 100).toFixed(0)}%`,
      }))}
      hiddenSeries={hidden}
      onToggleSeries={toggleSeries}
      onSoloSeries={soloSeries}
      onShowAllSeries={() => setHidden(new Set())}
      styleConfig={style}
      onStyleChange={setStyle}
      capabilities={{
        curve: false,
        strokeWidth: false,
        fillOpacity: false,
        dotSize: false,
        grid: false,
        labels: true,
        area: false,
        threshold: false,
      }}
      isLive={isLive}
      onToggleLive={() => setIsLive((v) => !v)}
      tooltip={tooltip}
      pinnedLabel={pinnedId && activeSlice ? activeSlice.label : null}
      onUnpin={() => setPinnedId(null)}
      defaultConfigOpen={props.defaultConfigOpen}
      className={props.className}
      extraToolbar={
        <div className="inline-flex rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] p-0.5">
          {[
            { label: 'Donut', active: !halfDonut && innerRatio > 0.1, onClick: () => { setHalfDonut(false); setInnerRatio(0.58); } },
            { label: 'Pie', active: !halfDonut && innerRatio <= 0.1, onClick: () => { setHalfDonut(false); setInnerRatio(0); } },
            { label: 'Arc', active: halfDonut, onClick: () => { setHalfDonut(true); setInnerRatio(0.62); } },
          ].map((btn) => (
            <button
              key={btn.label}
              type="button"
              aria-pressed={btn.active}
              onClick={btn.onClick}
              className={cn(
                'rounded-md px-2 py-1 cursor-pointer',
                btn.active
                  ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
              )}
            >
              {btn.label}
            </button>
          ))}
        </div>
      }
      extraConfig={
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="space-y-1">
            <div className="flex justify-between text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
              <span>Inner Radius</span>
              <span className="tabular-nums text-[var(--nt-display)]">{Math.round(innerRatio * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={0.78}
              step={0.02}
              value={innerRatio}
              onChange={(e) => setInnerRatio(Number(e.target.value))}
              className="w-full accent-[var(--nt-accent)]"
            />
          </label>
          <label className="space-y-1">
            <div className="flex justify-between text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
              <span>Slice Gap</span>
              <span className="tabular-nums text-[var(--nt-display)]">{padAngle}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={8}
              step={1}
              value={padAngle}
              onChange={(e) => setPadAngle(Number(e.target.value))}
              className="w-full accent-[var(--nt-accent)]"
            />
          </label>
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">Sort Order</div>
            <div className="inline-flex w-full rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] p-0.5 text-[10px]">
              {(['original', 'desc', 'asc'] as const).map((ord) => (
                <button
                  key={ord}
                  type="button"
                  onClick={() => setSortOrder(ord)}
                  className={cn(
                    'flex-1 rounded-md py-1 capitalize cursor-pointer',
                    sortOrder === ord ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]' : 'text-[var(--nt-muted)]',
                  )}
                >
                  {ord === 'original' ? 'Orig' : ord}
                </button>
              ))}
            </div>
          </div>
        </div>
      }
      scrubber={{
        index: activeIdx,
        max: Math.max(0, geometry.length - 1),
        label: activeSlice?.label ?? '—',
        onChange: (idx) => {
          setIsLive(false);
          const target = geometry[idx];
          if (target) setPinnedId(target.id);
        },
      }}
      breakdownStats={[
        { label: 'Slice', value: activeSlice?.label ?? '—' },
        { label: 'Share', value: `${activeSlice ? activeSlice.sharePct.toFixed(1) : 0}%`, accent: true },
        { label: 'Draw', value: `${activeSlice?.value ?? 0} mW` },
        { label: 'Total', value: `${total} mW` },
        { label: 'Avg', value: `${formatMetricNumber(stats.avg)} mW` },
      ]}
      getCsvData={() => ({
        headers: ['Subsystem', 'Power (mW)', 'Share (%)'],
        rows: geometry.map((g) => [g.label, g.value, g.sharePct.toFixed(1)]),
      })}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="h-60 w-full select-none"
        role="img"
        aria-label="Interactive power breakdown pie and donut chart"
        onMouseLeave={() => setHoveredId(null)}
      >
        {geometry.map((seg) => {
          const isFocus = seg.id === activeId && (hoveredId !== null || pinnedId !== null);
          const offsetDist = isFocus ? 7 : 0;
          const offsetRad = ((seg.midA - 90) * Math.PI) / 180;
          const dx = Math.cos(offsetRad) * offsetDist;
          const dy = Math.sin(offsetRad) * offsetDist;
          const labelPt = polarToCartesian(cx + dx, cy + dy, outerR + 18, seg.midA);

          return (
            <g
              key={seg.id}
              transform={`translate(${dx.toFixed(2)} ${dy.toFixed(2)})`}
              className="transition-transform duration-150 cursor-pointer"
              onMouseEnter={() => setHoveredId(seg.id)}
              onClick={() => setPinnedId((p) => (p === seg.id ? null : seg.id))}
            >
              <path
                d={describeDonutSlicePath(cx, cy, outerR, innerR, seg.startA, seg.endA)}
                fill={seg.color}
                fillOpacity={activeId && seg.id !== activeId && (hoveredId || pinnedId) ? 0.45 : 0.95}
                stroke="var(--nt-bg)"
                strokeWidth={1.5}
              />
              {style.showLabels && seg.sharePct >= 8 && (
                <text
                  x={labelPt.x - dx}
                  y={labelPt.y - dy + 3}
                  textAnchor={labelPt.x >= cx ? 'start' : 'end'}
                  fill={isFocus ? 'var(--nt-display)' : 'var(--nt-muted)'}
                  fontSize="9.5"
                  fontFamily="monospace"
                >
                  {seg.label} {seg.sharePct.toFixed(0)}%
                </text>
              )}
            </g>
          );
        })}

        {innerRatio >= 0.35 && activeSlice && (
          <g className="pointer-events-none">
            <text
              x={cx}
              y={cy - (halfDonut ? 18 : 2)}
              textAnchor="middle"
              fill="var(--nt-display)"
              fontSize="22"
              fontFamily="monospace"
              fontWeight="600"
            >
              {activeSlice.sharePct.toFixed(1)}%
            </text>
            <text
              x={cx}
              y={cy + (halfDonut ? -2 : 16)}
              textAnchor="middle"
              fill="var(--nt-muted)"
              fontSize="10"
              fontFamily="monospace"
            >
              {activeSlice.label}
            </text>
          </g>
        )}
      </svg>
    </InteractiveChartFrame>
  );
}
