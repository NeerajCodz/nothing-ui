import * as React from 'react';
import {
  ArrowCounterClockwise,
  CaretLeft,
  CaretRight,
  Copy,
  DownloadSimple,
  Eye,
  EyeSlash,
  Image as ImageIcon,
  Pause,
  Play,
  PushPin,
  PushPinSlash,
  SlidersHorizontal,
  Table,
  X,
} from '@phosphor-icons/react';
import { appToaster } from '@/components/nothing/Overlays';
import { cn } from '../../lib/cn';
import {
  CHART_PALETTES,
  type ChartCurveMode,
  type ChartGridMode,
  type ChartPaletteId,
  type ChartStyleConfig,
  copyTextSafely,
  exportCsvFile,
  exportSvgElementToPng,
  exportSvgElementToSvg,
  resolveSeriesColor,
  serializeChartCsv,
} from '../../lib/chart-engine';

export interface ChartLegendSeries {
  id: string;
  label: string;
  defaultColor?: string;
  valueHint?: string;
}

export interface ChartBreakdownStat {
  label: string;
  value: string;
  accent?: boolean;
}

export interface ChartTooltipRow {
  label: string;
  value: string;
  color: string;
}

export interface ChartTooltipPayload {
  title: string;
  subtitle?: string;
  rows: ChartTooltipRow[];
  xPct: number;
  yPct: number;
  pinned?: boolean;
}

export interface ChartScrubberProps {
  index: number;
  max: number;
  label: string;
  onChange: (nextIndex: number) => void;
}

export interface ChartConfigCapabilities {
  curve?: boolean;
  strokeWidth?: boolean;
  fillOpacity?: boolean;
  dotSize?: boolean;
  grid?: boolean;
  labels?: boolean;
  area?: boolean;
  threshold?: boolean;
}

export interface InteractiveChartFrameProps {
  title: string;
  subtitle?: string;
  exportName: string;
  svgRef: React.RefObject<SVGSVGElement | null>;
  series: readonly ChartLegendSeries[];
  hiddenSeries: ReadonlySet<string>;
  onToggleSeries: (id: string) => void;
  onSoloSeries?: (id: string) => void;
  onShowAllSeries?: () => void;
  styleConfig: ChartStyleConfig;
  onStyleChange: React.Dispatch<React.SetStateAction<ChartStyleConfig>>;
  capabilities?: ChartConfigCapabilities;
  extraToolbar?: React.ReactNode;
  extraConfig?: React.ReactNode;
  isLive?: boolean;
  onToggleLive?: () => void;
  isZoomed?: boolean;
  onResetZoom?: () => void;
  tooltip?: ChartTooltipPayload | null;
  pinnedLabel?: string | null;
  onUnpin?: () => void;
  breakdownStats?: readonly ChartBreakdownStat[];
  scrubber?: ChartScrubberProps;
  getCsvData: () => { headers: string[]; rows: Array<Array<string | number>> };
  defaultConfigOpen?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function ChartFloatingTooltip({ payload }: { payload: ChartTooltipPayload | null | undefined }) {
  if (!payload) return null;
  const alignRight = payload.xPct > 62;
  const clampedX = Math.max(4, Math.min(96, payload.xPct));
  const clampedY = Math.max(8, Math.min(82, payload.yPct));

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="chart-floating-tooltip"
      className="pointer-events-none absolute z-20 min-w-[168px] max-w-[236px] rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)]/95 px-3 py-2.5 shadow-lg backdrop-blur-md transition-[left,top,opacity] duration-100"
      style={{
        left: `${clampedX}%`,
        top: `${clampedY}%`,
        transform: alignRight ? 'translate(calc(-100% - 12px), -50%)' : 'translate(12px, -50%)',
      }}
    >
      <div className="flex items-center justify-between gap-2 border-b border-[var(--nt-line)] pb-1.5 font-mono text-[11px]">
        <span className="truncate font-medium text-[var(--nt-display)]">{payload.title}</span>
        {payload.pinned && (
          <span className="shrink-0 text-[9px] uppercase tracking-[0.1em] text-[var(--nt-accent)]">
            Pinned
          </span>
        )}
      </div>
      {payload.subtitle && (
        <div className="mt-1 font-mono text-[10px] text-[var(--nt-muted)]">{payload.subtitle}</div>
      )}
      <div className="mt-1.5 space-y-1 font-mono text-[11px] tabular-nums">
        {payload.rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 truncate text-[var(--nt-secondary)]">
              <span
                className="h-2 w-2 shrink-0 rounded-full border border-[var(--nt-line-2)]"
                style={{ backgroundColor: row.color }}
              />
              <span className="truncate">{row.label}</span>
            </span>
            <span className="shrink-0 font-medium text-[var(--nt-display)]">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InteractiveChartFrame({
  title,
  subtitle,
  exportName,
  svgRef,
  series,
  hiddenSeries,
  onToggleSeries,
  onSoloSeries,
  onShowAllSeries,
  styleConfig,
  onStyleChange,
  capabilities = {
    curve: true,
    strokeWidth: true,
    fillOpacity: true,
    dotSize: true,
    grid: true,
    labels: true,
    area: true,
    threshold: true,
  },
  extraToolbar,
  extraConfig,
  isLive = false,
  onToggleLive,
  isZoomed = false,
  onResetZoom,
  tooltip,
  pinnedLabel,
  onUnpin,
  breakdownStats,
  scrubber,
  getCsvData,
  defaultConfigOpen = false,
  className,
  children,
}: InteractiveChartFrameProps) {
  const [configOpen, setConfigOpen] = React.useState(defaultConfigOpen);
  const [exportOpen, setExportOpen] = React.useState(false);

  const handleExportSvg = () => {
    setExportOpen(false);
    if (!svgRef.current) return;
    exportSvgElementToSvg(svgRef.current, `${exportName}.svg`);
    appToaster('Exported SVG', { description: `${exportName}.svg downloaded with resolved theme colors.` });
  };

  const handleExportPng = async () => {
    setExportOpen(false);
    if (!svgRef.current) return;
    const ok = await exportSvgElementToPng(svgRef.current, `${exportName}.png`, 2);
    if (ok) {
      appToaster('Exported PNG', { description: `${exportName}.png saved at 2× retina resolution.` });
    } else {
      appToaster('PNG Export Unavailable', { description: 'Fallback: use SVG or CSV export.' });
    }
  };

  const handleExportCsv = () => {
    setExportOpen(false);
    const { headers, rows } = getCsvData();
    const csv = serializeChartCsv(headers, rows);
    exportCsvFile(csv, `${exportName}.csv`);
    appToaster('Exported CSV', { description: `${rows.length} rows exported to ${exportName}.csv.` });
  };

  const handleCopyCsv = async () => {
    setExportOpen(false);
    const { headers, rows } = getCsvData();
    const csv = serializeChartCsv(headers, rows);
    await copyTextSafely(csv);
    appToaster('Copied!', { description: `Copied ${rows.length} rows of ${title} CSV data.` });
  };

  const handleResetStyle = () => {
    onStyleChange((prev) => ({
      ...prev,
      palette: 'monochrome',
      seriesColors: {},
      curve: 'smooth',
      strokeWidth: 2,
      fillOpacity: 0.16,
      dotSize: 3.5,
      gridMode: 'horizontal',
      showLabels: false,
      showArea: true,
    }));
  };

  const handleSetPalette = (palette: ChartPaletteId) => {
    onStyleChange((prev) => ({
      ...prev,
      palette,
      seriesColors: palette === 'custom' ? prev.seriesColors : {},
    }));
  };

  const handleSeriesColorChange = (id: string, hex: string) => {
    onStyleChange((prev) => ({
      ...prev,
      palette: 'custom',
      seriesColors: { ...prev.seriesColors, [id]: hex },
    }));
  };

  const visibleCount = series.filter((s) => !hiddenSeries.has(s.id)).length;

  return (
    <div
      data-testid={`chart-frame-${exportName}`}
      className={cn(
        'w-full space-y-3 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-4 text-[var(--nt-primary)]',
        className,
      )}
    >
      {/* 1. Toolbar Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--nt-line)] pb-3">
        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-2 font-mono text-xs text-[var(--nt-display)]">
            <span className="truncate font-medium">{title}</span>
            {isLive && (
              <span className="inline-flex items-center gap-1.5 text-[10px] text-[var(--nt-accent)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--nt-accent)] animate-pulse" aria-hidden="true" />
                LIVE
              </span>
            )}
          </div>
          {subtitle && (
            <div className="truncate font-mono text-[10px] text-[var(--nt-muted)]">{subtitle}</div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
          {extraToolbar}

          {onToggleLive && (
            <button
              type="button"
              aria-pressed={isLive}
              onClick={onToggleLive}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer',
                isLive
                  ? 'border-[var(--nt-accent)] bg-[var(--nt-accent)]/10 text-[var(--nt-accent)]'
                  : 'border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
              )}
            >
              {isLive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {isLive ? 'Pause' : 'Live'}
            </button>
          )}

          {isZoomed && onResetZoom && (
            <button
              type="button"
              onClick={onResetZoom}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--nt-accent)]/60 bg-[var(--nt-surface)] px-2.5 py-1.5 text-[var(--nt-display)] hover:border-[var(--nt-display)] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ArrowCounterClockwise className="h-3.5 w-3.5" />
              Reset Zoom
            </button>
          )}

          <button
            type="button"
            aria-expanded={configOpen}
            onClick={() => setConfigOpen((v) => !v)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer',
              configOpen
                ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                : 'border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Customize
          </button>

          {/* Export Menu */}
          <div className="relative">
            <button
              type="button"
              aria-expanded={exportOpen}
              aria-haspopup="menu"
              onClick={() => setExportOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] px-2.5 py-1.5 text-[var(--nt-secondary)] hover:text-[var(--nt-display)] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <DownloadSimple className="h-3.5 w-3.5" />
              Export
            </button>

            {exportOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-30 mt-1.5 w-40 rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)] p-1 shadow-xl"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleExportSvg}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[11px] text-[var(--nt-display)] hover:bg-[var(--nt-raised)] cursor-pointer"
                >
                  <DownloadSimple className="h-3.5 w-3.5 text-[var(--nt-muted)]" />
                  Export SVG
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleExportPng}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[11px] text-[var(--nt-display)] hover:bg-[var(--nt-raised)] cursor-pointer"
                >
                  <ImageIcon className="h-3.5 w-3.5 text-[var(--nt-muted)]" />
                  Export PNG (2×)
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleExportCsv}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[11px] text-[var(--nt-display)] hover:bg-[var(--nt-raised)] cursor-pointer"
                >
                  <Table className="h-3.5 w-3.5 text-[var(--nt-muted)]" />
                  Export CSV
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleCopyCsv}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[11px] text-[var(--nt-display)] hover:bg-[var(--nt-raised)] cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5 text-[var(--nt-muted)]" />
                  Copy Dataset
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Interactive Series Legend */}
      {series.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
            {series.map((s, idx) => {
              const hidden = hiddenSeries.has(s.id);
              const color = resolveSeriesColor(s.id, idx, styleConfig, s.defaultColor);
              return (
                <div
                  key={s.id}
                  className={cn(
                    'inline-flex items-center rounded-lg border transition-colors',
                    hidden
                      ? 'border-[var(--nt-line)] bg-[var(--nt-bg)] opacity-50'
                      : 'border-[var(--nt-line)] bg-[var(--nt-surface)]',
                  )}
                >
                  <button
                    type="button"
                    aria-pressed={!hidden}
                    onClick={() => onToggleSeries(s.id)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[var(--nt-display)] hover:text-[var(--nt-accent)] cursor-pointer whitespace-nowrap"
                    title={hidden ? `Show ${s.label}` : `Hide ${s.label}`}
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full border border-[var(--nt-line-2)]"
                      style={{ backgroundColor: hidden ? 'transparent' : color }}
                    />
                    <span className={cn(hidden && 'line-through text-[var(--nt-muted)]')}>
                      {s.label}
                    </span>
                    {s.valueHint && !hidden && (
                      <span className="tabular-nums text-[10px] text-[var(--nt-muted)]">
                        {s.valueHint}
                      </span>
                    )}
                    {hidden ? (
                      <EyeSlash className="h-3 w-3 text-[var(--nt-muted)]" />
                    ) : (
                      <Eye className="h-3 w-3 text-[var(--nt-muted)] opacity-60" />
                    )}
                  </button>
                  {onSoloSeries && series.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onSoloSeries(s.id)}
                      className="border-l border-[var(--nt-line)] px-1.5 py-1 text-[9px] uppercase tracking-wider text-[var(--nt-muted)] hover:text-[var(--nt-display)] cursor-pointer"
                      title={`Solo ${s.label}`}
                    >
                      Solo
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {hiddenSeries.size > 0 && onShowAllSeries && (
            <button
              type="button"
              onClick={onShowAllSeries}
              className="font-mono text-[10px] text-[var(--nt-accent)] hover:underline cursor-pointer whitespace-nowrap"
            >
              Show All ({visibleCount}/{series.length})
            </button>
          )}
        </div>
      )}

      {/* 3. Collapsible Per-Chart Config Panel */}
      {configOpen && (
        <div
          data-testid="chart-config-panel"
          className="space-y-4 rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)] p-4 font-mono text-xs"
        >
          <div className="flex items-center justify-between border-b border-[var(--nt-line)] pb-2.5">
            <span className="text-[11px] uppercase tracking-[0.12em] text-[var(--nt-display)]">
              Chart Configuration &amp; Custom Colors
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetStyle}
                className="text-[10px] text-[var(--nt-muted)] hover:text-[var(--nt-display)] cursor-pointer"
              >
                Reset Defaults
              </button>
              <button
                type="button"
                aria-label="Close configuration panel"
                onClick={() => setConfigOpen(false)}
                className="text-[var(--nt-muted)] hover:text-[var(--nt-display)] cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Color Palette Presets */}
          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
              Color Palette Preset
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CHART_PALETTES.map((p) => {
                const active = styleConfig.palette === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => handleSetPalette(p.id)}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[11px] transition-colors cursor-pointer whitespace-nowrap',
                      active
                        ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                        : 'border-[var(--nt-line)] bg-[var(--nt-bg)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
                    )}
                  >
                    <span className="flex items-center gap-0.5">
                      {p.colors.slice(0, 3).map((hex, idx) => (
                        <span
                          key={idx}
                          className="h-2.5 w-2.5 rounded-full border border-black/30"
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </span>
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Per-Series Custom Hex Color Pickers */}
          {series.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
                Custom Series Colors (Pick Any Color)
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {series.map((s, idx) => {
                  const resolved = resolveSeriesColor(s.id, idx, styleConfig, s.defaultColor);
                  return (
                    <label
                      key={s.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] px-2.5 py-1.5 cursor-pointer"
                    >
                      <span className="truncate text-[11px] text-[var(--nt-display)]">{s.label}</span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        <span className="text-[10px] uppercase tabular-nums text-[var(--nt-muted)]">
                          {resolved}
                        </span>
                        <input
                          type="color"
                          aria-label={`Color for ${s.label}`}
                          value={resolved}
                          onChange={(e) => handleSeriesColorChange(s.id, e.target.value)}
                          className="h-5 w-6 cursor-pointer rounded border border-[var(--nt-line-2)] bg-transparent p-0"
                        />
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Geometry, Grid, and Threshold Controls */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.curve && (
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">Curve</div>
                <div className="inline-flex w-full rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] p-0.5 text-[11px]">
                  {(['linear', 'smooth', 'step'] as ChartCurveMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      aria-pressed={styleConfig.curve === mode}
                      onClick={() => onStyleChange((prev) => ({ ...prev, curve: mode }))}
                      className={cn(
                        'flex-1 rounded-md px-2 py-1 capitalize cursor-pointer',
                        styleConfig.curve === mode
                          ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                          : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {capabilities.grid && (
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">Gridlines</div>
                <div className="inline-flex w-full rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] p-0.5 text-[11px]">
                  {(['horizontal', 'both', 'none'] as ChartGridMode[]).map((gm) => (
                    <button
                      key={gm}
                      type="button"
                      aria-pressed={styleConfig.gridMode === gm}
                      onClick={() => onStyleChange((prev) => ({ ...prev, gridMode: gm }))}
                      className={cn(
                        'flex-1 rounded-md px-2 py-1 capitalize cursor-pointer',
                        styleConfig.gridMode === gm
                          ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                          : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
                      )}
                    >
                      {gm === 'horizontal' ? 'Horiz' : gm}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {capabilities.strokeWidth && (
              <label className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
                  <span>Stroke Width</span>
                  <span className="tabular-nums text-[var(--nt-display)]">{styleConfig.strokeWidth}px</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={0.5}
                  value={styleConfig.strokeWidth}
                  onChange={(e) =>
                    onStyleChange((prev) => ({ ...prev, strokeWidth: Number(e.target.value) }))
                  }
                  className="w-full accent-[var(--nt-accent)]"
                />
              </label>
            )}

            {capabilities.fillOpacity && (
              <label className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
                  <span>Fill Opacity</span>
                  <span className="tabular-nums text-[var(--nt-display)]">
                    {Math.round(styleConfig.fillOpacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={0.8}
                  step={0.05}
                  value={styleConfig.fillOpacity}
                  onChange={(e) =>
                    onStyleChange((prev) => ({ ...prev, fillOpacity: Number(e.target.value) }))
                  }
                  className="w-full accent-[var(--nt-accent)]"
                />
              </label>
            )}

            {capabilities.dotSize && (
              <label className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
                  <span>Marker Radius</span>
                  <span className="tabular-nums text-[var(--nt-display)]">{styleConfig.dotSize}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={7}
                  step={0.5}
                  value={styleConfig.dotSize}
                  onChange={(e) =>
                    onStyleChange((prev) => ({ ...prev, dotSize: Number(e.target.value) }))
                  }
                  className="w-full accent-[var(--nt-accent)]"
                />
              </label>
            )}

            {/* Toggle chips */}
            <div className="flex flex-wrap items-end gap-1.5">
              {capabilities.labels && (
                <button
                  type="button"
                  aria-pressed={styleConfig.showLabels}
                  onClick={() =>
                    onStyleChange((prev) => ({ ...prev, showLabels: !prev.showLabels }))
                  }
                  className={cn(
                    'rounded-lg border px-2.5 py-1.5 text-[11px] cursor-pointer whitespace-nowrap',
                    styleConfig.showLabels
                      ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                      : 'border-[var(--nt-line)] bg-[var(--nt-bg)] text-[var(--nt-secondary)]',
                  )}
                >
                  Data Labels: {styleConfig.showLabels ? 'ON' : 'OFF'}
                </button>
              )}
              {capabilities.area && (
                <button
                  type="button"
                  aria-pressed={styleConfig.showArea}
                  onClick={() =>
                    onStyleChange((prev) => ({ ...prev, showArea: !prev.showArea }))
                  }
                  className={cn(
                    'rounded-lg border px-2.5 py-1.5 text-[11px] cursor-pointer whitespace-nowrap',
                    styleConfig.showArea
                      ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                      : 'border-[var(--nt-line)] bg-[var(--nt-bg)] text-[var(--nt-secondary)]',
                  )}
                >
                  Area Fill: {styleConfig.showArea ? 'ON' : 'OFF'}
                </button>
              )}
              {capabilities.threshold && (
                <button
                  type="button"
                  aria-pressed={styleConfig.showThreshold}
                  onClick={() =>
                    onStyleChange((prev) => ({ ...prev, showThreshold: !prev.showThreshold }))
                  }
                  className={cn(
                    'rounded-lg border px-2.5 py-1.5 text-[11px] cursor-pointer whitespace-nowrap',
                    styleConfig.showThreshold
                      ? 'border-[var(--nt-accent)] bg-[var(--nt-accent)]/15 text-[var(--nt-display)]'
                      : 'border-[var(--nt-line)] bg-[var(--nt-bg)] text-[var(--nt-secondary)]',
                  )}
                >
                  Threshold: {styleConfig.showThreshold ? 'ON' : 'OFF'}
                </button>
              )}
            </div>
          </div>

          {capabilities.threshold && styleConfig.showThreshold && (
            <div className="flex flex-wrap items-center gap-4 border-t border-[var(--nt-line)] pt-3">
              <label className="flex flex-1 min-w-[160px] items-center gap-3">
                <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)] whitespace-nowrap">
                  Threshold Level
                </span>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={1}
                  value={styleConfig.thresholdValue}
                  onChange={(e) =>
                    onStyleChange((prev) => ({ ...prev, thresholdValue: Number(e.target.value) }))
                  }
                  className="flex-1 accent-[var(--nt-accent)]"
                />
                <span className="tabular-nums text-[var(--nt-display)]">
                  {styleConfig.thresholdValue}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
                  Color
                </span>
                <input
                  type="color"
                  aria-label="Threshold line color"
                  value={styleConfig.thresholdColor}
                  onChange={(e) =>
                    onStyleChange((prev) => ({ ...prev, thresholdColor: e.target.value }))
                  }
                  className="h-5 w-6 cursor-pointer rounded border border-[var(--nt-line-2)] bg-transparent p-0"
                />
              </label>
            </div>
          )}

          {extraConfig && (
            <div className="border-t border-[var(--nt-line)] pt-3">{extraConfig}</div>
          )}
        </div>
      )}

      {/* 4. Interactive SVG Plot Surface + Floating Tooltip */}
      <div className="relative overflow-hidden rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)]/40 p-3">
        {children}
        <ChartFloatingTooltip payload={tooltip} />
      </div>

      {/* 5. Playhead Scrubber */}
      {scrubber && (
        <div className="flex items-center gap-2.5 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] px-3 py-2 font-mono text-[11px]">
          <button
            type="button"
            aria-label="Previous sample"
            onClick={() => scrubber.onChange(Math.max(0, scrubber.index - 1))}
            className="rounded-md border border-[var(--nt-line)] bg-[var(--nt-bg)] p-1 text-[var(--nt-secondary)] hover:text-[var(--nt-display)] cursor-pointer"
          >
            <CaretLeft className="h-3.5 w-3.5" />
          </button>
          <input
            type="range"
            aria-label={`Scrub ${title} playhead`}
            min={0}
            max={Math.max(0, scrubber.max)}
            value={Math.min(scrubber.max, Math.max(0, scrubber.index))}
            onChange={(e) => scrubber.onChange(Number(e.target.value))}
            className="flex-1 accent-[var(--nt-accent)]"
          />
          <button
            type="button"
            aria-label="Next sample"
            onClick={() => scrubber.onChange(Math.min(scrubber.max, scrubber.index + 1))}
            className="rounded-md border border-[var(--nt-line)] bg-[var(--nt-bg)] p-1 text-[var(--nt-secondary)] hover:text-[var(--nt-display)] cursor-pointer"
          >
            <CaretRight className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-[82px] text-right tabular-nums text-[var(--nt-display)]">
            {scrubber.label}
          </span>
        </div>
      )}

      {/* 6. Pinned / Active Datapoint Detail Breakdown Bar */}
      {breakdownStats && breakdownStats.length > 0 && (
        <div
          data-testid="chart-breakdown-bar"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] px-3.5 py-2.5 font-mono text-xs"
        >
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
            {breakdownStats.map((stat) => (
              <div key={stat.label} className="flex items-baseline gap-1.5">
                <span className="text-[10px] uppercase tracking-[0.1em] text-[var(--nt-muted)]">
                  {stat.label}
                </span>
                <span
                  className={cn(
                    'tabular-nums font-medium',
                    stat.accent ? 'text-[var(--nt-accent)]' : 'text-[var(--nt-display)]',
                  )}
                >
                  {stat.value}
                </span>
              </div>
            ))}
          </div>

          {pinnedLabel ? (
            <button
              type="button"
              onClick={onUnpin}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--nt-accent)]/60 bg-[var(--nt-bg)] px-2.5 py-1 text-[10px] text-[var(--nt-display)] hover:border-[var(--nt-display)] cursor-pointer whitespace-nowrap"
            >
              <PushPinSlash className="h-3 w-3 text-[var(--nt-accent)]" />
              Unpin ({pinnedLabel})
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] text-[var(--nt-muted)] whitespace-nowrap">
              <PushPin className="h-3 w-3" />
              Click any point to pin
            </span>
          )}
        </div>
      )}
    </div>
  );
}
