export type BarSeriesKey = 'web' | 'native';
export type BarLayoutMode = 'grouped' | 'stacked';

export interface BarDatum {
  period: string;
  web: number;
  native: number;
}

export type BarSeriesVisibility = Record<BarSeriesKey, boolean>;

export interface PeakIntervalResult {
  index: number;
  period: string;
  value: number;
  /** Which bar series carries the Signal Red highlight (null if none visible). */
  highlightSeries: BarSeriesKey;
}

export const DEFAULT_BAR_SERIES_VISIBILITY: Readonly<BarSeriesVisibility> = {
  web: true,
  native: true,
};

export function toggleSeriesVisibility(
  current: BarSeriesVisibility,
  key: BarSeriesKey,
): BarSeriesVisibility {
  return {
    ...current,
    [key]: !current[key],
  };
}

export function showAllSeries(): BarSeriesVisibility {
  return { web: true, native: true };
}

export function countVisibleSeries(visibility: BarSeriesVisibility): number {
  let count = 0;
  if (visibility.web) count += 1;
  if (visibility.native) count += 1;
  return count;
}

/**
 * Computes the peak interval across only the currently visible series.
 * - Both visible + grouped: highlights peak `web` bar
 * - Both visible + stacked: highlights peak combined `web + native` bar
 * - Single series visible: highlights peak of that visible series
 * - Zero series visible: returns null
 */
export function computePeakInterval(
  data: readonly BarDatum[],
  layoutMode: BarLayoutMode,
  visibility: BarSeriesVisibility,
): PeakIntervalResult | null {
  if (data.length === 0 || (!visibility.web && !visibility.native)) {
    return null;
  }

  const highlightSeries: BarSeriesKey = visibility.web ? 'web' : 'native';

  let bestIdx = 0;
  let bestVal = -Infinity;

  data.forEach((row, idx) => {
    let score: number;
    if (visibility.web && visibility.native) {
      score = layoutMode === 'stacked' ? row.web + row.native : row.web;
    } else if (visibility.web) {
      score = row.web;
    } else {
      score = row.native;
    }

    if (score > bestVal) {
      bestVal = score;
      bestIdx = idx;
    }
  });

  return {
    index: bestIdx,
    period: data[bestIdx].period,
    value: bestVal,
    highlightSeries,
  };
}

export interface BarTooltipEntry {
  seriesKey: BarSeriesKey;
  label: string;
  value: number;
  color: string;
  isPeak: boolean;
  isHovered: boolean;
  sharePct: number;
  deltaVsAvgPct: number;
}

export interface BarTooltipMetrics {
  period: string;
  unit: string;
  entries: BarTooltipEntry[];
  focusedEntry: BarTooltipEntry | null;
  combinedTotal: number;
  isStacked: boolean;
}

export function formatSignedPercent(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  if (Object.is(rounded, -0) || rounded === 0) return '0.0%';
  return `${rounded > 0 ? '+' : ''}${rounded.toFixed(1)}%`;
}

/**
 * Computes precise tooltip metrics for a hovered interval & individual bar.
 * Respects current series visibility, layout mode, Signal Red peak status,
 * share of visible interval total, and delta vs each series average.
 */
export function computeBarTooltipMetrics(params: {
  data: readonly BarDatum[];
  period: string;
  visibility: BarSeriesVisibility;
  layoutMode: BarLayoutMode;
  hoveredSeriesKey: BarSeriesKey | null;
  peak: PeakIntervalResult | null;
  labels: Record<BarSeriesKey, string>;
  colors: Record<BarSeriesKey, string>;
  peakColor: string;
  unit: string;
}): BarTooltipMetrics | null {
  const {
    data,
    period,
    visibility,
    layoutMode,
    hoveredSeriesKey,
    peak,
    labels,
    colors,
    peakColor,
    unit,
  } = params;

  const rowIndex = data.findIndex((d) => d.period === period);
  if (rowIndex === -1) return null;

  const row = data[rowIndex];
  const visibleKeys: BarSeriesKey[] = [];
  if (visibility.web) visibleKeys.push('web');
  if (visibility.native) visibleKeys.push('native');
  if (visibleKeys.length === 0) return null;

  const combinedTotal = visibleKeys.reduce((sum, key) => sum + row[key], 0);

  const entries: BarTooltipEntry[] = visibleKeys.map((key) => {
    const value = row[key];
    const seriesAvg =
      data.reduce((sum, item) => sum + item[key], 0) / Math.max(1, data.length);
    const deltaVsAvgPct =
      seriesAvg === 0 ? 0 : Math.round(((value - seriesAvg) / seriesAvg) * 1000) / 10;
    const sharePct =
      combinedTotal === 0 ? 0 : Math.round((value / combinedTotal) * 1000) / 10;
    const isPeak = Boolean(
      peak && peak.index === rowIndex && peak.highlightSeries === key,
    );

    return {
      seriesKey: key,
      label: labels[key],
      value,
      color: isPeak ? peakColor : colors[key],
      isPeak,
      isHovered: hoveredSeriesKey === key,
      sharePct,
      deltaVsAvgPct,
    };
  });

  const focusedEntry =
    entries.find((entry) => entry.isHovered) ??
    entries[0] ??
    null;

  return {
    period: row.period,
    unit,
    entries,
    focusedEntry,
    combinedTotal,
    isStacked: layoutMode === 'stacked' && visibleKeys.length > 1,
  };
}
