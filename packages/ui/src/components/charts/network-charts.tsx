import * as React from 'react';
import { cn } from '../../lib/cn';
import {
  DEFAULT_CHART_STYLE,
  resolveSeriesColor,
  type ChartStyleConfig,
} from '../../lib/chart-engine';
import {
  InteractiveChartFrame,
  type ChartLegendSeries,
  type ChartTooltipPayload,
} from './chart-frame';
import type { BaseInteractiveChartProps } from './cartesian-charts';

function useNetworkStyle(props: BaseInteractiveChartProps, defaults?: Partial<ChartStyleConfig>) {
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
 * 7. InteractiveSankeyChart (`sankey`: Multi-Stage Flow Path Highlighting)
 * ─────────────────────────────────────────────────────────────────────────── */
interface SankeyFlow {
  id: string;
  stageGroup: 'display' | 'glyph' | 'radio';
  from: string;
  to: string;
  out: string;
  watts: number;
  y1: number;
  y2: number;
  y3: number;
}

const INITIAL_SANKEY_FLOWS: SankeyFlow[] = [
  { id: 'oled-ui', stageGroup: 'display', from: 'Battery 5000mAh', to: 'OLED 120Hz', out: 'Active UI', watts: 4.4, y1: 42, y2: 34, y3: 38 },
  { id: 'glyph-led', stageGroup: 'glyph', from: 'Battery 5000mAh', to: 'Glyph 481 LED', out: 'Signal Alerts', watts: 3.1, y1: 86, y2: 96, y3: 94 },
  { id: 'radio-5g', stageGroup: 'radio', from: 'USB-C PD Bus', to: '5G + LDAC', out: 'Telemetry Sync', watts: 2.5, y1: 148, y2: 158, y3: 156 },
];

const SANKEY_LEGEND: readonly ChartLegendSeries[] = [
  { id: 'display', label: 'OLED Display', defaultColor: '#F5F5F5' },
  { id: 'glyph', label: 'Glyph Matrix', defaultColor: '#D71921' },
  { id: 'radio', label: '5G + Audio', defaultColor: '#8A8A8A' },
];

export function InteractiveSankeyChart(props: BaseInteractiveChartProps) {
  const [flows, setFlows] = React.useState<SankeyFlow[]>(INITIAL_SANKEY_FLOWS);
  const [style, setStyle] = useNetworkStyle(props, { showLabels: true });
  const [hidden, setHidden] = React.useState<Set<string>>(() => new Set());
  const [isLive, setIsLive] = React.useState(props.defaultLive ?? false);
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const [pinnedId, setPinnedId] = React.useState<string | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
    if (!isLive) return;
    const id = window.setInterval(() => {
      setFlows((prev) =>
        prev.map((f) => ({
          ...f,
          watts: Number(Math.max(1.2, Math.min(6.5, f.watts + (Math.random() - 0.5) * 0.7)).toFixed(1)),
        })),
      );
    }, 1050);
    return () => window.clearInterval(id);
  }, [isLive]);

  const visibleFlows = flows.filter((f) => !hidden.has(f.stageGroup));
  const totalWatts = visibleFlows.reduce((acc, f) => acc + f.watts, 0) || 1;
  const activeId = pinnedId ?? hoveredId ?? visibleFlows[0]?.id ?? null;
  const activeFlow = visibleFlows.find((f) => f.id === activeId) ?? visibleFlows[0];
  const activeIdx = Math.max(0, visibleFlows.findIndex((f) => f.id === activeFlow?.id));

  const toggleGroup = (id: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (SANKEY_LEGEND.length - next.size > 1) next.add(id);
      return next;
    });
  };
  const soloGroup = (id: string) => {
    setHidden((prev) => {
      const isSolo = SANKEY_LEGEND.every((s) => s.id === id || prev.has(s.id)) && !prev.has(id);
      return isSolo ? new Set() : new Set(SANKEY_LEGEND.filter((s) => s.id !== id).map((s) => s.id));
    });
  };

  const tooltip: ChartTooltipPayload | null =
    (hoveredId !== null || pinnedId !== null) && activeFlow
      ? {
          title: `${activeFlow.from} → ${activeFlow.to}`,
          subtitle: `Downstream: ${activeFlow.out}`,
          pinned: pinnedId !== null,
          xPct: 50,
          yPct: (activeFlow.y2 / 196) * 100,
          rows: [
            {
              label: 'Throughput',
              value: `${activeFlow.watts.toFixed(1)} W`,
              color: resolveSeriesColor(
                activeFlow.stageGroup,
                SANKEY_LEGEND.findIndex((l) => l.id === activeFlow.stageGroup),
                style,
              ),
            },
            {
              label: 'System Share',
              value: `${((activeFlow.watts / totalWatts) * 100).toFixed(1)}%`,
              color: '#A3A3A3',
            },
          ],
        }
      : null;

  return (
    <InteractiveChartFrame
      title="Multi-Stage Sankey Flow"
      subtitle="Hover ribbons to trace upstream & downstream paths · Click to pin"
      exportName="nothing-sankey-chart"
      svgRef={svgRef}
      series={SANKEY_LEGEND.map((l) => {
        const f = flows.find((x) => x.stageGroup === l.id);
        return { ...l, valueHint: f ? `${f.watts.toFixed(1)}W` : undefined };
      })}
      hiddenSeries={hidden}
      onToggleSeries={toggleGroup}
      onSoloSeries={soloGroup}
      onShowAllSeries={() => setHidden(new Set())}
      styleConfig={style}
      onStyleChange={setStyle}
      capabilities={{
        curve: false,
        strokeWidth: false,
        fillOpacity: true,
        dotSize: false,
        grid: false,
        labels: true,
        area: false,
        threshold: false,
      }}
      isLive={isLive}
      onToggleLive={() => setIsLive((v) => !v)}
      isZoomed={zoom !== 1}
      onResetZoom={() => setZoom(1)}
      tooltip={tooltip}
      pinnedLabel={pinnedId && activeFlow ? activeFlow.to : null}
      onUnpin={() => setPinnedId(null)}
      defaultConfigOpen={props.defaultConfigOpen}
      className={props.className}
      extraToolbar={
        <div className="inline-flex rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] p-0.5">
          <button type="button" onClick={() => setZoom((z) => Math.max(0.8, Number((z - 0.1).toFixed(2))))} className="rounded-md px-2 py-1 text-[var(--nt-secondary)] hover:text-[var(--nt-display)] cursor-pointer" aria-label="Zoom out Sankey">−</button>
          <button type="button" onClick={() => setZoom((z) => Math.min(1.25, Number((z + 0.1).toFixed(2))))} className="rounded-md px-2 py-1 text-[var(--nt-secondary)] hover:text-[var(--nt-display)] cursor-pointer" aria-label="Zoom in Sankey">+</button>
        </div>
      }
      scrubber={{
        index: activeIdx,
        max: Math.max(0, visibleFlows.length - 1),
        label: activeFlow?.to ?? '—',
        onChange: (idx) => {
          setIsLive(false);
          const f = visibleFlows[idx];
          if (f) setPinnedId(f.id);
        },
      }}
      breakdownStats={[
        { label: 'Path', value: activeFlow ? `${activeFlow.to} → ${activeFlow.out}` : '—' },
        { label: 'Load', value: activeFlow ? `${activeFlow.watts.toFixed(1)} W` : '—', accent: true },
        {
          label: 'Share',
          value: activeFlow ? `${((activeFlow.watts / totalWatts) * 100).toFixed(1)}%` : '—',
        },
        { label: 'Total Bus', value: `${totalWatts.toFixed(1)} W` },
      ]}
      getCsvData={() => ({
        headers: ['Source', 'Subsystem', 'Output', 'Watts', 'Share (%)'],
        rows: visibleFlows.map((f) => [
          f.from,
          f.to,
          f.out,
          f.watts.toFixed(1),
          ((f.watts / totalWatts) * 100).toFixed(1),
        ]),
      })}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 540 196"
        className="h-56 w-full select-none"
        role="img"
        aria-label="Interactive multi-stage Sankey flow diagram"
        onMouseLeave={() => setHoveredId(null)}
      >
        <g transform={`translate(${270 * (1 - zoom)} ${98 * (1 - zoom)}) scale(${zoom})`}>
          {/* Column 1: Power Sources */}
          <rect x="12" y="18" width="96" height="92" rx="8" fill="var(--nt-bg)" stroke="var(--nt-line-2)" />
          <text x="60" y="61" textAnchor="middle" fill="var(--nt-display)" fontSize="9.5" fontFamily="monospace">BATTERY</text>
          <text x="60" y="75" textAnchor="middle" fill="var(--nt-muted)" fontSize="8.5" fontFamily="monospace">5000 mAh</text>

          <rect x="12" y="126" width="96" height="48" rx="8" fill="var(--nt-bg)" stroke="var(--nt-line-2)" />
          <text x="60" y="153" textAnchor="middle" fill="var(--nt-display)" fontSize="9.5" fontFamily="monospace">USB-C PD</text>

          {/* Ribbons & Stage 2/3 Nodes */}
          {visibleFlows.map((f) => {
            const groupIdx = SANKEY_LEGEND.findIndex((l) => l.id === f.stageGroup);
            const color = resolveSeriesColor(f.stageGroup, groupIdx, style, SANKEY_LEGEND[groupIdx]?.defaultColor);
            const isFocus = f.id === activeFlow?.id;
            const ribbonW = Math.max(7, (f.watts / totalWatts) * 34);
            const dimOther = (hoveredId !== null || pinnedId !== null) && !isFocus;
            const opacity = dimOther ? 0.18 : Math.max(0.45, Math.min(0.95, style.fillOpacity + 0.65));

            return (
              <g
                key={f.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredId(f.id)}
                onClick={() => setPinnedId((p) => (p === f.id ? null : f.id))}
              >
                <path
                  d={`M 108 ${f.y1} C 154 ${f.y1}, 168 ${f.y2}, 212 ${f.y2}`}
                  fill="none"
                  stroke={color}
                  strokeWidth={ribbonW}
                  strokeOpacity={opacity}
                  className="transition-opacity duration-150"
                />
                <path
                  d={`M 326 ${f.y2} C 368 ${f.y2}, 382 ${f.y3}, 422 ${f.y3}`}
                  fill="none"
                  stroke={color}
                  strokeWidth={ribbonW * 0.85}
                  strokeOpacity={opacity}
                  className="transition-opacity duration-150"
                />

                {/* Stage 2 Subsystem Node */}
                <rect
                  x="212"
                  y={f.y2 - 19}
                  width="114"
                  height="38"
                  rx="8"
                  fill="var(--nt-bg)"
                  stroke={isFocus ? color : 'var(--nt-line-2)'}
                  strokeWidth={isFocus ? 1.8 : 1}
                />
                <text x="269" y={f.y2 - 2} textAnchor="middle" fill="var(--nt-display)" fontSize="9.5" fontFamily="monospace">
                  {f.to}
                </text>
                {style.showLabels && (
                  <text x="269" y={f.y2 + 11} textAnchor="middle" fill="var(--nt-muted)" fontSize="8.5" fontFamily="monospace">
                    {f.watts.toFixed(1)}W · {((f.watts / totalWatts) * 100).toFixed(0)}%
                  </text>
                )}

                {/* Stage 3 Output Sink Node */}
                <rect
                  x="422"
                  y={f.y3 - 17}
                  width="106"
                  height="34"
                  rx="8"
                  fill="var(--nt-bg)"
                  stroke={isFocus ? color : 'var(--nt-line-2)'}
                  strokeWidth={isFocus ? 1.8 : 1}
                />
                <text x="475" y={f.y3 + 3} textAnchor="middle" fill="var(--nt-display)" fontSize="9" fontFamily="monospace">
                  {f.out}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </InteractiveChartFrame>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 8. InteractiveMapChart (`map-chart`: Zoom/Pan Dot-Matrix Global Telemetry)
 * ─────────────────────────────────────────────────────────────────────────── */
interface MapNode {
  id: string;
  region: 'americas' | 'europe' | 'apac';
  code: string;
  name: string;
  x: number;
  y: number;
  ping: number;
  units: number;
  load: number;
}

const INITIAL_MAP_NODES: MapNode[] = [
  { id: 'sfo', region: 'americas', code: 'SFO', name: 'San Francisco', x: 84, y: 88, ping: 24, units: 14.2, load: 62 },
  { id: 'nyc', region: 'americas', code: 'NYC', name: 'New York', x: 148, y: 82, ping: 18, units: 18.6, load: 71 },
  { id: 'lon', region: 'europe', code: 'LON', name: 'London HQ', x: 248, y: 66, ping: 11, units: 29.8, load: 84 },
  { id: 'ber', region: 'europe', code: 'BER', name: 'Berlin', x: 286, y: 68, ping: 16, units: 11.4, load: 55 },
  { id: 'sgp', region: 'apac', code: 'SGP', name: 'Singapore', x: 398, y: 132, ping: 29, units: 19.1, load: 76 },
  { id: 'tyo', region: 'apac', code: 'TYO', name: 'Tokyo', x: 458, y: 84, ping: 31, units: 22.6, load: 81 },
];

const MAP_REGIONS: readonly ChartLegendSeries[] = [
  { id: 'americas', label: 'Americas', defaultColor: '#F5F5F5' },
  { id: 'europe', label: 'Europe HQ', defaultColor: '#D71921' },
  { id: 'apac', label: 'Asia-Pacific', defaultColor: '#38BDF8' },
];

export function InteractiveMapChart(props: BaseInteractiveChartProps) {
  const [nodes, setNodes] = React.useState<MapNode[]>(INITIAL_MAP_NODES);
  const [metric, setMetric] = React.useState<'ping' | 'units' | 'load'>('ping');
  const [style, setStyle] = useNetworkStyle(props, { showLabels: true, dotSize: 5 });
  const [hidden, setHidden] = React.useState<Set<string>>(() => new Set());
  const [isLive, setIsLive] = React.useState(props.defaultLive ?? false);
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const [pinnedId, setPinnedId] = React.useState<string | null>(null);
  const [viewport, setViewport] = React.useState({ scale: 1, tx: 0, ty: 0 });
  const panOrigin = React.useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
    if (!isLive) return;
    const id = window.setInterval(() => {
      setNodes((prev) =>
        prev.map((n) => ({
          ...n,
          ping: Math.max(8, Math.min(58, Math.round(n.ping + (Math.random() - 0.5) * 6))),
          load: Math.max(30, Math.min(98, Math.round(n.load + (Math.random() - 0.5) * 10))),
        })),
      );
    }, 1050);
    return () => window.clearInterval(id);
  }, [isLive]);

  const visibleNodes = nodes.filter((n) => !hidden.has(n.region));
  const activeId = pinnedId ?? hoveredId ?? visibleNodes[0]?.id ?? null;
  const activeNode = visibleNodes.find((n) => n.id === activeId) ?? visibleNodes[0];
  const activeIdx = Math.max(0, visibleNodes.findIndex((n) => n.id === activeNode?.id));

  const toggleRegion = (id: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (MAP_REGIONS.length - next.size > 1) next.add(id);
      return next;
    });
  };
  const soloRegion = (id: string) => {
    setHidden((prev) => {
      const isSolo = MAP_REGIONS.every((r) => r.id === id || prev.has(r.id)) && !prev.has(id);
      return isSolo ? new Set() : new Set(MAP_REGIONS.filter((r) => r.id !== id).map((r) => r.id));
    });
  };

  const tooltip: ChartTooltipPayload | null =
    (hoveredId !== null || pinnedId !== null) && activeNode
      ? {
          title: `${activeNode.name} (${activeNode.code})`,
          subtitle: `Region: ${activeNode.region.toUpperCase()}`,
          pinned: pinnedId !== null,
          xPct: ((activeNode.x * viewport.scale + viewport.tx) / 540) * 100,
          yPct: ((activeNode.y * viewport.scale + viewport.ty) / 196) * 100,
          rows: [
            { label: 'Latency', value: `${activeNode.ping} ms`, color: '#D71921' },
            { label: 'Active Units', value: `${activeNode.units}k`, color: '#F5F5F5' },
            { label: 'Node Load', value: `${activeNode.load}%`, color: '#38BDF8' },
          ],
        }
      : null;

  const isZoomed = viewport.scale !== 1 || viewport.tx !== 0 || viewport.ty !== 0;

  return (
    <InteractiveChartFrame
      title="Global Dot-Matrix Telemetry Map"
      subtitle="Drag to pan · Zoom +/- · Hover nodes · Click to pin region telemetry"
      exportName="nothing-map-chart"
      svgRef={svgRef}
      series={MAP_REGIONS}
      hiddenSeries={hidden}
      onToggleSeries={toggleRegion}
      onSoloSeries={soloRegion}
      onShowAllSeries={() => setHidden(new Set())}
      styleConfig={style}
      onStyleChange={setStyle}
      capabilities={{
        curve: false,
        strokeWidth: true,
        fillOpacity: false,
        dotSize: true,
        grid: false,
        labels: true,
        area: false,
        threshold: false,
      }}
      isLive={isLive}
      onToggleLive={() => setIsLive((v) => !v)}
      isZoomed={isZoomed}
      onResetZoom={() => setViewport({ scale: 1, tx: 0, ty: 0 })}
      tooltip={tooltip}
      pinnedLabel={pinnedId && activeNode ? activeNode.code : null}
      onUnpin={() => setPinnedId(null)}
      defaultConfigOpen={props.defaultConfigOpen}
      className={props.className}
      extraToolbar={
        <div className="flex items-center gap-1.5">
          <div className="inline-flex rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] p-0.5">
            {([
              { id: 'ping', label: 'Ping' },
              { id: 'units', label: 'Units' },
              { id: 'load', label: 'Load' },
            ] as const).map((m) => (
              <button
                key={m.id}
                type="button"
                aria-pressed={metric === m.id}
                onClick={() => setMetric(m.id)}
                className={cn(
                  'rounded-md px-2 py-1 cursor-pointer',
                  metric === m.id ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]' : 'text-[var(--nt-muted)]',
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
          <div className="inline-flex rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] p-0.5">
            <button type="button" onClick={() => setViewport((v) => ({ ...v, scale: Math.max(0.8, Number((v.scale - 0.2).toFixed(2))) }))} className="rounded-md px-2 py-1 text-[var(--nt-secondary)] hover:text-[var(--nt-display)] cursor-pointer" aria-label="Zoom out map">−</button>
            <button type="button" onClick={() => setViewport((v) => ({ ...v, scale: Math.min(2, Number((v.scale + 0.2).toFixed(2))) }))} className="rounded-md px-2 py-1 text-[var(--nt-secondary)] hover:text-[var(--nt-display)] cursor-pointer" aria-label="Zoom in map">+</button>
          </div>
        </div>
      }
      scrubber={{
        index: activeIdx,
        max: Math.max(0, visibleNodes.length - 1),
        label: activeNode?.code ?? '—',
        onChange: (idx) => {
          setIsLive(false);
          const n = visibleNodes[idx];
          if (n) setPinnedId(n.id);
        },
      }}
      breakdownStats={[
        { label: 'Node', value: activeNode ? `${activeNode.name}` : '—' },
        { label: 'Latency', value: activeNode ? `${activeNode.ping}ms` : '—', accent: true },
        { label: 'Units', value: activeNode ? `${activeNode.units}k` : '—' },
        { label: 'Load', value: activeNode ? `${activeNode.load}%` : '—' },
        { label: 'Zoom', value: `${Math.round(viewport.scale * 100)}%` },
      ]}
      getCsvData={() => ({
        headers: ['Code', 'Name', 'Region', 'Latency (ms)', 'Active Units (k)', 'Load (%)'],
        rows: visibleNodes.map((n) => [n.code, n.name, n.region, n.ping, n.units, n.load]),
      })}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 540 196"
        className="h-56 w-full select-none cursor-grab active:cursor-grabbing"
        role="img"
        aria-label="Interactive global dot-matrix telemetry map"
        onMouseDown={(e) => {
          panOrigin.current = { x: e.clientX, y: e.clientY, tx: viewport.tx, ty: viewport.ty };
        }}
        onMouseMove={(e) => {
          if (!panOrigin.current) return;
          const dx = e.clientX - panOrigin.current.x;
          const dy = e.clientY - panOrigin.current.y;
          setViewport((v) => ({ ...v, tx: panOrigin.current!.tx + dx, ty: panOrigin.current!.ty + dy }));
        }}
        onMouseUp={() => {
          panOrigin.current = null;
        }}
        onMouseLeave={() => {
          panOrigin.current = null;
          setHoveredId(null);
        }}
      >
        <g transform={`translate(${viewport.tx} ${viewport.ty}) scale(${viewport.scale})`}>
          {/* World Dot Field */}
          {Array.from({ length: 28 }, (_, col) =>
            Array.from({ length: 9 }, (_, row) => (
              <circle
                key={`${col}-${row}`}
                cx={20 + col * 18.5}
                cy={18 + row * 19}
                r="1.35"
                fill="var(--nt-line-2)"
              />
            )),
          )}

          {/* Curved Telemetry Routes */}
          {visibleNodes.slice(0, -1).map((n, i) => {
            const next = visibleNodes[i + 1];
            const mx = (n.x + next.x) / 2;
            const my = Math.min(n.y, next.y) - 26;
            return (
              <path
                key={`${n.id}-${next.id}`}
                d={`M ${n.x} ${n.y} Q ${mx} ${my} ${next.x} ${next.y}`}
                fill="none"
                stroke="var(--nt-muted)"
                strokeWidth={Math.max(1, style.strokeWidth * 0.65)}
                strokeDasharray="4 4"
                strokeOpacity={0.65}
              />
            );
          })}

          {/* Region Nodes */}
          {visibleNodes.map((n) => {
            const regIdx = MAP_REGIONS.findIndex((r) => r.id === n.region);
            const color = resolveSeriesColor(n.region, regIdx, style, MAP_REGIONS[regIdx]?.defaultColor);
            const isFocus = n.id === activeNode?.id;
            const metricScale = metric === 'units' ? n.units / 18 : metric === 'load' ? n.load / 65 : 1;
            const r = Math.max(3.5, style.dotSize * metricScale);

            return (
              <g
                key={n.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredId(n.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  setPinnedId((p) => (p === n.id ? null : n.id));
                }}
              >
                {isFocus && <circle cx={n.x} cy={n.y} r={r + 8} fill={color} fillOpacity={0.22} />}
                <circle cx={n.x} cy={n.y} r={isFocus ? r + 1.5 : r} fill={color} stroke="var(--nt-bg)" strokeWidth={1.5} />
                {style.showLabels && (
                  <text x={n.x} y={n.y - r - 5} textAnchor="middle" fill={isFocus ? 'var(--nt-display)' : 'var(--nt-secondary)'} fontSize="9" fontFamily="monospace">
                    {n.code} {metric === 'ping' ? `${n.ping}ms` : metric === 'units' ? `${n.units}k` : `${n.load}%`}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </InteractiveChartFrame>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 9. InteractiveFlowChart (`flow`: Draggable Pipeline Nodes + Live Telemetry)
 * ─────────────────────────────────────────────────────────────────────────── */
interface FlowNode {
  id: string;
  label: string;
  x: number;
  y: number;
  throughput: number;
  latency: number;
  defaultColor: string;
}

const INITIAL_FLOW_NODES: FlowNode[] = [
  { id: 'sensor', label: '01 · SENSOR', x: 24, y: 76, throughput: 60, latency: 1.2, defaultColor: '#F5F5F5' },
  { id: 'mask', label: '02 · LUT MASK', x: 184, y: 42, throughput: 481, latency: 2.8, defaultColor: '#D71921' },
  { id: 'driver', label: '03 · PWM BUS', x: 184, y: 118, throughput: 240, latency: 1.9, defaultColor: '#38BDF8' },
  { id: 'glyph', label: '04 · GLYPH TX', x: 374, y: 76, throughput: 120, latency: 0.9, defaultColor: '#34D399' },
];

const FLOW_EDGES = [
  { from: 'sensor', to: 'mask', label: 'Frame Buffer' },
  { from: 'sensor', to: 'driver', label: 'Clock Sync' },
  { from: 'mask', to: 'glyph', label: '481 LED Map' },
  { from: 'driver', to: 'glyph', label: 'PWM Duty' },
];

export function InteractiveFlowChart(props: BaseInteractiveChartProps) {
  const [nodes, setNodes] = React.useState<FlowNode[]>(INITIAL_FLOW_NODES);
  const [style, setStyle] = useNetworkStyle(props, { showLabels: true, strokeWidth: 2 });
  const [hidden, setHidden] = React.useState<Set<string>>(() => new Set());
  const [isLive, setIsLive] = React.useState(props.defaultLive ?? true);
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const [pinnedId, setPinnedId] = React.useState<string | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const draggingNode = React.useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
    if (!isLive) return;
    const id = window.setInterval(() => {
      setNodes((prev) =>
        prev.map((n) => ({
          ...n,
          latency: Number(Math.max(0.4, Math.min(8, n.latency + (Math.random() - 0.5) * 0.5)).toFixed(1)),
          throughput: Math.max(30, Math.round(n.throughput + (Math.random() - 0.5) * 14)),
        })),
      );
    }, 1000);
    return () => window.clearInterval(id);
  }, [isLive]);

  const visibleNodes = nodes.filter((n) => !hidden.has(n.id));
  const nodeById = new Map(visibleNodes.map((n) => [n.id, n]));
  const activeId = pinnedId ?? hoveredId ?? visibleNodes[0]?.id ?? null;
  const activeNode = visibleNodes.find((n) => n.id === activeId) ?? visibleNodes[0];
  const activeIdx = Math.max(0, visibleNodes.findIndex((n) => n.id === activeNode?.id));

  const toggleNode = (id: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (nodes.length - next.size > 1) next.add(id);
      return next;
    });
  };
  const soloNode = (id: string) => {
    setHidden((prev) => {
      const isSolo = nodes.every((n) => n.id === id || prev.has(n.id)) && !prev.has(id);
      return isSolo ? new Set() : new Set(nodes.filter((n) => n.id !== id).map((n) => n.id));
    });
  };

  const tooltip: ChartTooltipPayload | null =
    (hoveredId !== null || pinnedId !== null) && activeNode
      ? {
          title: activeNode.label,
          subtitle: 'Drag node to reposition · Click to pin',
          pinned: pinnedId !== null,
          xPct: ((activeNode.x + 64) / 540) * 100,
          yPct: ((activeNode.y + 22) / 196) * 100,
          rows: [
            { label: 'Rate', value: `${activeNode.throughput} ops/s`, color: resolveSeriesColor(activeNode.id, nodes.findIndex((x) => x.id === activeNode.id), style, activeNode.defaultColor) },
            { label: 'Latency', value: `${activeNode.latency} ms`, color: '#A3A3A3' },
            { label: 'Position', value: `${Math.round(activeNode.x)}, ${Math.round(activeNode.y)}`, color: '#737373' },
          ],
        }
      : null;

  const isModified = zoom !== 1 || nodes.some((n, i) => n.x !== INITIAL_FLOW_NODES[i].x || n.y !== INITIAL_FLOW_NODES[i].y);

  return (
    <InteractiveChartFrame
      title="Interactive Pipeline Flow Graph"
      subtitle="Drag any node to rearrange · Hover edges & stages · Live packet stream"
      exportName="nothing-flow-graph"
      svgRef={svgRef}
      series={nodes.map((n) => ({
        id: n.id,
        label: n.label,
        defaultColor: n.defaultColor,
        valueHint: `${n.latency}ms`,
      }))}
      hiddenSeries={hidden}
      onToggleSeries={toggleNode}
      onSoloSeries={soloNode}
      onShowAllSeries={() => setHidden(new Set())}
      styleConfig={style}
      onStyleChange={setStyle}
      capabilities={{
        curve: false,
        strokeWidth: true,
        fillOpacity: false,
        dotSize: false,
        grid: false,
        labels: true,
        area: false,
        threshold: false,
      }}
      isLive={isLive}
      onToggleLive={() => setIsLive((v) => !v)}
      isZoomed={isModified}
      onResetZoom={() => {
        setZoom(1);
        setNodes(INITIAL_FLOW_NODES);
      }}
      tooltip={tooltip}
      pinnedLabel={pinnedId && activeNode ? activeNode.label : null}
      onUnpin={() => setPinnedId(null)}
      defaultConfigOpen={props.defaultConfigOpen}
      className={props.className}
      extraToolbar={
        <div className="inline-flex rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] p-0.5">
          <button type="button" onClick={() => setZoom((z) => Math.max(0.8, Number((z - 0.1).toFixed(2))))} className="rounded-md px-2 py-1 text-[var(--nt-secondary)] hover:text-[var(--nt-display)] cursor-pointer" aria-label="Zoom out flow">−</button>
          <button type="button" onClick={() => setZoom((z) => Math.min(1.25, Number((z + 0.1).toFixed(2))))} className="rounded-md px-2 py-1 text-[var(--nt-secondary)] hover:text-[var(--nt-display)] cursor-pointer" aria-label="Zoom in flow">+</button>
        </div>
      }
      scrubber={{
        index: activeIdx,
        max: Math.max(0, visibleNodes.length - 1),
        label: activeNode?.label ?? '—',
        onChange: (idx) => {
          const n = visibleNodes[idx];
          if (n) setPinnedId(n.id);
        },
      }}
      breakdownStats={[
        { label: 'Stage', value: activeNode?.label ?? '—' },
        { label: 'Rate', value: activeNode ? `${activeNode.throughput} ops/s` : '—', accent: true },
        { label: 'Latency', value: activeNode ? `${activeNode.latency} ms` : '—' },
        { label: 'Signal', value: isLive ? 'Streaming' : 'Paused' },
      ]}
      getCsvData={() => ({
        headers: ['Stage', 'Throughput (ops/s)', 'Latency (ms)', 'X', 'Y'],
        rows: visibleNodes.map((n) => [n.label, n.throughput, n.latency, Math.round(n.x), Math.round(n.y)]),
      })}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 540 196"
        className="h-56 w-full select-none"
        role="img"
        aria-label="Interactive draggable node pipeline flow graph"
        onMouseMove={(e) => {
          if (!draggingNode.current || !svgRef.current) return;
          const rect = svgRef.current.getBoundingClientRect();
          const scaleX = 540 / rect.width / zoom;
          const scaleY = 196 / rect.height / zoom;
          const dx = (e.clientX - draggingNode.current.startX) * scaleX;
          const dy = (e.clientY - draggingNode.current.startY) * scaleY;
          const targetId = draggingNode.current.id;
          const nextX = Math.max(10, Math.min(400, draggingNode.current.origX + dx));
          const nextY = Math.max(10, Math.min(142, draggingNode.current.origY + dy));
          setNodes((prev) => prev.map((n) => (n.id === targetId ? { ...n, x: nextX, y: nextY } : n)));
        }}
        onMouseUp={() => {
          draggingNode.current = null;
        }}
        onMouseLeave={() => {
          draggingNode.current = null;
          setHoveredId(null);
        }}
      >
        <g transform={`translate(${270 * (1 - zoom)} ${98 * (1 - zoom)}) scale(${zoom})`}>
          {/* Directed Curved Edges */}
          {FLOW_EDGES.map((edge) => {
            const fromNode = nodeById.get(edge.from);
            const toNode = nodeById.get(edge.to);
            if (!fromNode || !toNode) return null;
            const x1 = fromNode.x + 128;
            const y1 = fromNode.y + 22;
            const x2 = toNode.x;
            const y2 = toNode.y + 22;
            const mx = (x1 + x2) / 2;
            const connected = fromNode.id === activeNode?.id || toNode.id === activeNode?.id;
            const toIdx = nodes.findIndex((n) => n.id === toNode.id);
            const edgeColor = connected
              ? resolveSeriesColor(toNode.id, toIdx, style, toNode.defaultColor)
              : 'var(--nt-line-2)';
            return (
              <g key={`${edge.from}-${edge.to}`}>
                <path
                  d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                  fill="none"
                  stroke={edgeColor}
                  strokeWidth={connected ? Math.max(2, style.strokeWidth) : 1.5}
                  strokeDasharray={isLive ? '5 4' : undefined}
                />
                {style.showLabels && (
                  <text x={mx} y={(y1 + y2) / 2 - 5} textAnchor="middle" fill="var(--nt-muted)" fontSize="8" fontFamily="monospace">
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Draggable Nodes */}
          {visibleNodes.map((node) => {
            const idx = nodes.findIndex((n) => n.id === node.id);
            const color = resolveSeriesColor(node.id, idx, style, node.defaultColor);
            const isFocus = node.id === activeNode?.id;
            return (
              <g
                key={node.id}
                className="cursor-grab active:cursor-grabbing"
                onMouseEnter={() => setHoveredId(node.id)}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  draggingNode.current = {
                    id: node.id,
                    startX: e.clientX,
                    startY: e.clientY,
                    origX: node.x,
                    origY: node.y,
                  };
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setPinnedId((p) => (p === node.id ? null : node.id));
                }}
              >
                <rect
                  x={node.x}
                  y={node.y}
                  width="128"
                  height="44"
                  rx="10"
                  fill="var(--nt-bg)"
                  stroke={isFocus ? color : 'var(--nt-line-2)'}
                  strokeWidth={isFocus ? 2 : 1}
                />
                <circle cx={node.x + 14} cy={node.y + 16} r="3.5" fill={color} />
                <text x={node.x + 24} y={node.y + 19} fill="var(--nt-display)" fontSize="9.5" fontFamily="monospace" fontWeight="600">
                  {node.label}
                </text>
                <text x={node.x + 14} y={node.y + 34} fill="var(--nt-muted)" fontSize="8.5" fontFamily="monospace">
                  {node.throughput} ops/s · {node.latency}ms
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </InteractiveChartFrame>
  );
}
