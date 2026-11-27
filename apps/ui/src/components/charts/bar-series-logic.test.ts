import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_BAR_SERIES_VISIBILITY,
  computeBarTooltipMetrics,
  computePeakInterval,
  countVisibleSeries,
  formatSignedPercent,
  showAllSeries,
  toggleSeriesVisibility,
  type BarDatum,
} from './bar-series-logic';

const SAMPLE_DATA: BarDatum[] = [
  { period: 'Mon', web: 420, native: 310 },
  { period: 'Tue', web: 510, native: 680 },
  { period: 'Wed', web: 780, native: 200 },
];

test('toggleSeriesVisibility and showAllSeries update visibility flags immutably', () => {
  assert.deepEqual(DEFAULT_BAR_SERIES_VISIBILITY, { web: true, native: true });
  assert.equal(countVisibleSeries(DEFAULT_BAR_SERIES_VISIBILITY), 2);

  const hideWeb = toggleSeriesVisibility(DEFAULT_BAR_SERIES_VISIBILITY, 'web');
  assert.deepEqual(hideWeb, { web: false, native: true });
  assert.equal(countVisibleSeries(hideWeb), 1);
  // Original state remains untouched
  assert.equal(DEFAULT_BAR_SERIES_VISIBILITY.web, true);

  const hideBoth = toggleSeriesVisibility(hideWeb, 'native');
  assert.deepEqual(hideBoth, { web: false, native: false });
  assert.equal(countVisibleSeries(hideBoth), 0);

  const restored = showAllSeries();
  assert.deepEqual(restored, { web: true, native: true });
  assert.equal(countVisibleSeries(restored), 2);
});

test('computePeakInterval adapts to visible series and grouped vs stacked layout', () => {
  // Both visible, grouped: peaks on web (Wed = 780)
  const bothGrouped = computePeakInterval(SAMPLE_DATA, 'grouped', { web: true, native: true });
  assert.deepEqual(bothGrouped, {
    index: 2,
    period: 'Wed',
    value: 780,
    highlightSeries: 'web',
  });

  // Both visible, stacked: Tue (510 + 680 = 1190) beats Wed (780 + 200 = 980)
  const bothStacked = computePeakInterval(SAMPLE_DATA, 'stacked', { web: true, native: true });
  assert.deepEqual(bothStacked, {
    index: 1,
    period: 'Tue',
    value: 1190,
    highlightSeries: 'web',
  });

  // Only native visible: highlights native bar on Tue (680)
  const onlyNative = computePeakInterval(SAMPLE_DATA, 'grouped', { web: false, native: true });
  assert.deepEqual(onlyNative, {
    index: 1,
    period: 'Tue',
    value: 680,
    highlightSeries: 'native',
  });

  // Only web visible in stacked mode: uses web only (Wed = 780)
  const onlyWebStacked = computePeakInterval(SAMPLE_DATA, 'stacked', { web: true, native: false });
  assert.deepEqual(onlyWebStacked, {
    index: 2,
    period: 'Wed',
    value: 780,
    highlightSeries: 'web',
  });

  // None visible: returns null
  assert.equal(computePeakInterval(SAMPLE_DATA, 'grouped', { web: false, native: false }), null);
  assert.equal(computePeakInterval([], 'grouped', { web: true, native: true }), null);
});

test('computeBarTooltipMetrics spotlights hovered bar with precise values, share, delta vs avg, and peak badge', () => {
  const peak = computePeakInterval(SAMPLE_DATA, 'grouped', { web: true, native: true });
  const baseArgs = {
    data: SAMPLE_DATA,
    visibility: { web: true, native: true },
    layoutMode: 'grouped' as const,
    peak,
    labels: { web: 'Web (nthgui)', native: 'Native (RN)' },
    colors: { web: '#F5F5F5', native: '#5C5C5C' },
    peakColor: '#D71921',
    unit: 'req/s',
  };

  // Hovering individual Native bar on Tue spotlights native (680)
  const tueNative = computeBarTooltipMetrics({
    ...baseArgs,
    period: 'Tue',
    hoveredSeriesKey: 'native',
  });
  assert.ok(tueNative);
  assert.equal(tueNative.period, 'Tue');
  assert.equal(tueNative.combinedTotal, 1190);
  assert.equal(tueNative.focusedEntry?.seriesKey, 'native');
  assert.equal(tueNative.focusedEntry?.value, 680);
  assert.equal(tueNative.focusedEntry?.isHovered, true);
  assert.equal(tueNative.focusedEntry?.isPeak, false);
  assert.equal(tueNative.focusedEntry?.sharePct, 57.1);
  // Native average = (310 + 680 + 200) / 3 = 396.667 -> (680 - 396.667)/396.667 = +71.4%
  assert.equal(formatSignedPercent(tueNative.focusedEntry!.deltaVsAvgPct), '+71.4%');

  // Hovering peak Web bar on Wed marks isPeak=true and applies Signal Red peakColor
  const wedWeb = computeBarTooltipMetrics({
    ...baseArgs,
    period: 'Wed',
    hoveredSeriesKey: 'web',
  });
  assert.ok(wedWeb);
  assert.equal(wedWeb.focusedEntry?.seriesKey, 'web');
  assert.equal(wedWeb.focusedEntry?.value, 780);
  assert.equal(wedWeb.focusedEntry?.isPeak, true);
  assert.equal(wedWeb.focusedEntry?.color, '#D71921');

  // When Web is hidden, tooltip only includes Native and combinedTotal equals native value
  const onlyNative = computeBarTooltipMetrics({
    ...baseArgs,
    period: 'Mon',
    visibility: { web: false, native: true },
    hoveredSeriesKey: 'web',
  });
  assert.ok(onlyNative);
  assert.equal(onlyNative.entries.length, 1);
  assert.equal(onlyNative.focusedEntry?.seriesKey, 'native');
  assert.equal(onlyNative.focusedEntry?.value, 310);
  assert.equal(onlyNative.combinedTotal, 310);

  // Unknown period or all hidden returns null
  assert.equal(
    computeBarTooltipMetrics({ ...baseArgs, period: 'Unknown', hoveredSeriesKey: null }),
    null,
  );
  assert.equal(
    computeBarTooltipMetrics({
      ...baseArgs,
      period: 'Mon',
      visibility: { web: false, native: false },
      hoveredSeriesKey: null,
    }),
    null,
  );
  assert.equal(formatSignedPercent(0), '0.0%');
  assert.equal(formatSignedPercent(-12.34), '-12.3%');
});
