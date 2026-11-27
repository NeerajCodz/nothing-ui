import * as React from 'react';
import {
  computeBarTooltipMetrics,
  formatSignedPercent,
  type BarDatum,
  type BarLayoutMode,
  type BarSeriesKey,
  type BarSeriesVisibility,
  type PeakIntervalResult,
} from './bar-series-logic';

export interface BarTooltipThemeStyles {
  bg: string;
  border: string;
  text: string;
  muted: string;
  divider: string;
  highlightBg: string;
  peakAccent: string;
}

export interface BarChartTooltipProps {
  active?: boolean;
  label?: string | number;
  data: readonly BarDatum[];
  visibility: BarSeriesVisibility;
  layoutMode: BarLayoutMode;
  hoveredSeriesKey: BarSeriesKey | null;
  peak: PeakIntervalResult | null;
  labels: Record<BarSeriesKey, string>;
  colors: Record<BarSeriesKey, string>;
  unit: string;
  themeStyles: BarTooltipThemeStyles;
}

/**
 * Custom interactive Recharts tooltip for the ChartsHub responsive bar chart.
 * Spotlights the exact hovered bar with its precise data value, delta vs. average,
 * share of interval total, and comparison rows for all visible series.
 */
export function BarChartTooltip({
  active,
  label,
  data,
  visibility,
  layoutMode,
  hoveredSeriesKey,
  peak,
  labels,
  colors,
  unit,
  themeStyles,
}: BarChartTooltipProps) {
  if (!active || label === undefined || label === null) {
    return null;
  }

  const metrics = computeBarTooltipMetrics({
    data,
    period: String(label),
    visibility,
    layoutMode,
    hoveredSeriesKey,
    peak,
    labels,
    colors,
    peakColor: themeStyles.peakAccent,
    unit,
  });

  if (!metrics || !metrics.focusedEntry) {
    return null;
  }

  const { focusedEntry } = metrics;

  return (
    <div
      data-testid="bar-chart-tooltip"
      data-period={metrics.period}
      data-focused-series={focusedEntry.seriesKey}
      role="status"
      aria-live="polite"
      className="min-w-[216px] rounded-xl p-3 font-mono shadow-xl backdrop-blur-sm"
      style={{
        backgroundColor: themeStyles.bg,
        border: `1px solid ${themeStyles.border}`,
        color: themeStyles.text,
      }}
    >
      {/* Interval Header */}
      <div
        className="flex items-center justify-between gap-3 pb-2 text-[10px] uppercase tracking-[0.12em]"
        style={{ borderBottom: `1px solid ${themeStyles.divider}` }}
      >
        <span style={{ color: themeStyles.text, fontWeight: 600 }}>
          {metrics.period}
        </span>
        <div className="flex items-center gap-1.5">
          {focusedEntry.isPeak && (
            <span
              data-testid="bar-tooltip-peak-badge"
              className="rounded px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.1em]"
              style={{
                backgroundColor: themeStyles.peakAccent,
                color: '#FFFFFF',
              }}
            >
              PEAK
            </span>
          )}
          <span style={{ color: themeStyles.muted }}>
            {metrics.isStacked ? 'Stacked' : 'Grouped'}
          </span>
        </div>
      </div>

      {/* Focused / Individually Hovered Bar Spotlight */}
      <div className="py-2.5">
        <div className="flex items-center gap-2 text-[11px]" style={{ color: themeStyles.muted }}>
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
            style={{ backgroundColor: focusedEntry.color }}
          />
          <span className="truncate">{focusedEntry.label}</span>
        </div>
        <div
          data-testid="bar-tooltip-focused-value"
          className="mt-1 flex items-baseline gap-1.5 text-xl font-semibold tabular-nums"
          style={{ color: focusedEntry.isPeak ? themeStyles.peakAccent : themeStyles.text }}
        >
          <span>{focusedEntry.value.toLocaleString()}</span>{' '}
          <span className="text-xs font-normal" style={{ color: themeStyles.muted }}>
            {metrics.unit}
          </span>
        </div>
        <div
          data-testid="bar-tooltip-focused-meta"
          className="mt-1 flex items-center justify-between gap-2 text-[10px] tabular-nums"
          style={{ color: themeStyles.muted }}
        >
          <span>{formatSignedPercent(focusedEntry.deltaVsAvgPct)} vs avg</span>
          {metrics.entries.length > 1 && <span>{focusedEntry.sharePct.toFixed(1)}% share</span>}
        </div>
      </div>

      {/* Per-Series Precise Value Breakdown */}
      {metrics.entries.length > 1 && (
        <div
          className="space-y-1 pt-2"
          style={{ borderTop: `1px solid ${themeStyles.divider}` }}
        >
          {metrics.entries.map((entry) => (
            <div
              key={entry.seriesKey}
              data-testid={`bar-tooltip-row-${entry.seriesKey}`}
              className="flex items-center justify-between gap-3 rounded-md px-1.5 py-1 text-[11px] tabular-nums"
              style={{
                backgroundColor: entry.isHovered ? themeStyles.highlightBg : 'transparent',
              }}
            >
              <span className="flex items-center gap-1.5 truncate">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: entry.color }}
                />
                <span
                  className="truncate"
                  style={{
                    color: entry.isHovered ? themeStyles.text : themeStyles.muted,
                    fontWeight: entry.isHovered ? 600 : 400,
                  }}
                >
                  {entry.label}
                </span>
              </span>
              <span
                style={{
                  color: entry.isPeak ? themeStyles.peakAccent : themeStyles.text,
                  fontWeight: entry.isHovered ? 600 : 500,
                }}
              >
                {entry.value.toLocaleString()} {metrics.unit}
              </span>
            </div>
          ))}

          <div
            data-testid="bar-tooltip-combined-total"
            className="flex items-center justify-between gap-3 px-1.5 pt-1.5 text-[10px] uppercase tracking-[0.08em] tabular-nums"
            style={{
              borderTop: `1px dashed ${themeStyles.divider}`,
              color: themeStyles.muted,
            }}
          >
            <span>Interval Total</span>
            <span style={{ color: themeStyles.text, fontWeight: 600 }}>
              {metrics.combinedTotal.toLocaleString()} {metrics.unit}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
