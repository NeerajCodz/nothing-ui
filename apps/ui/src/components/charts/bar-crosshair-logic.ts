import type {
  BarDatum,
  BarLayoutMode,
  BarSeriesKey,
  BarSeriesVisibility,
  PeakIntervalResult,
} from './bar-series-logic';

export interface MagneticCrosshairTarget {
  /** Index inside the currently visible (possibly zoomed) dataset slice */
  localIndex: number;
  /** X-axis interval label (e.g. 'Fri', 'W5') */
  period: string;
  /** Snapped data series key */
  seriesKey: BarSeriesKey;
  /** Raw series value for this datum (e.g. 620) */
  value: number;
  /** Plotted Y-axis value (equals `value` in grouped mode, cumulative stack height in stacked mode) */
  yValue: number;
  /** Whether the snapped point is the active Peak Interval highlight */
  isPeak: boolean;
}

export interface ComputeMagneticCrosshairParams {
  visibleData: readonly BarDatum[];
  visibility: BarSeriesVisibility;
  layoutMode: BarLayoutMode;
  hoveredBar: { index: number; seriesKey: BarSeriesKey } | null;
  /** Normalized horizontal pointer coordinate across the plot area (0..1) */
  pointerXRatio: number | null;
  /** Pointer vertical coordinate converted into chart data units (0..yDomainMax) */
  pointerYValue: number | null;
  peak: PeakIntervalResult | null;
}

/**
 * Computes a clean, deterministic upper Y-axis domain bound matching Recharts ticks
 * so pointer Y pixel-to-data conversion aligns accurately with the rendered bars.
 */
export function computeBarYAxisDomainMax(
  visibleData: readonly BarDatum[],
  visibility: BarSeriesVisibility,
  layoutMode: BarLayoutMode,
): number {
  if (visibleData.length === 0 || (!visibility.web && !visibility.native)) {
    return 100;
  }

  const isStacked = layoutMode === 'stacked' && visibility.web && visibility.native;
  let maxVal = 0;

  for (const row of visibleData) {
    if (isStacked) {
      maxVal = Math.max(maxVal, row.web + row.native);
    } else {
      if (visibility.web) maxVal = Math.max(maxVal, row.web);
      if (visibility.native) maxVal = Math.max(maxVal, row.native);
    }
  }

  if (maxVal <= 0) return 100;

  // Pick a clean rounded ceiling with slight headroom so top bars never clip
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
  const normalized = maxVal / magnitude;

  let niceStep: number;
  if (normalized <= 2) {
    niceStep = 0.25 * magnitude;
  } else if (normalized <= 5) {
    niceStep = 0.5 * magnitude;
  } else {
    niceStep = magnitude;
  }

  const step = Math.max(1, niceStep);
  const rounded = Math.ceil(maxVal / step) * step;
  return rounded === maxVal ? rounded + step : rounded;
}

/**
 * Magnetically snaps pointer hover coordinates (or direct bar hover) to the nearest
 * visible data point `(period, yValue)` on the responsive bar chart.
 */
export function computeMagneticCrosshairTarget({
  visibleData,
  visibility,
  layoutMode,
  hoveredBar,
  pointerXRatio,
  pointerYValue,
  peak,
}: ComputeMagneticCrosshairParams): MagneticCrosshairTarget | null {
  if (visibleData.length === 0) return null;
  if (!visibility.web && !visibility.native) return null;
  if (!hoveredBar && pointerXRatio === null) return null;

  // 1. Magnetic X-axis snap to nearest visible interval
  let localIndex: number;
  if (hoveredBar && hoveredBar.index >= 0 && hoveredBar.index < visibleData.length) {
    localIndex = hoveredBar.index;
  } else {
    const clampedRatio = Math.max(0, Math.min(0.9999, pointerXRatio ?? 0));
    localIndex = Math.min(
      visibleData.length - 1,
      Math.max(0, Math.floor(clampedRatio * visibleData.length)),
    );
  }

  const row = visibleData[localIndex];
  if (!row) return null;

  const isStacked = layoutMode === 'stacked' && visibility.web && visibility.native;
  const candidates: Array<{ seriesKey: BarSeriesKey; value: number; yValue: number }> = [];

  if (visibility.web) {
    candidates.push({
      seriesKey: 'web',
      value: row.web,
      yValue: row.web,
    });
  }
  if (visibility.native) {
    candidates.push({
      seriesKey: 'native',
      value: row.native,
      yValue: isStacked ? row.web + row.native : row.native,
    });
  }

  if (candidates.length === 0) return null;

  // 2. Magnetic Y-axis snap to nearest visible data point value
  let chosen = candidates[0];
  if (hoveredBar) {
    const exactMatch = candidates.find((c) => c.seriesKey === hoveredBar.seriesKey);
    if (exactMatch) {
      chosen = exactMatch;
    }
  } else if (pointerYValue !== null && Number.isFinite(pointerYValue)) {
    let bestDistance = Math.abs(candidates[0].yValue - pointerYValue);
    for (let i = 1; i < candidates.length; i += 1) {
      const dist = Math.abs(candidates[i].yValue - pointerYValue);
      if (dist < bestDistance) {
        bestDistance = dist;
        chosen = candidates[i];
      }
    }
  } else {
    // Fallback to highest visible bar top when Y coordinate is unavailable
    for (let i = 1; i < candidates.length; i += 1) {
      if (candidates[i].yValue > chosen.yValue) {
        chosen = candidates[i];
      }
    }
  }

  const isPeak = Boolean(
    peak &&
      peak.index === localIndex &&
      (isStacked || peak.highlightSeries === chosen.seriesKey),
  );

  return {
    localIndex,
    period: row.period,
    seriesKey: chosen.seriesKey,
    value: chosen.value,
    yValue: chosen.yValue,
    isPeak,
  };
}
