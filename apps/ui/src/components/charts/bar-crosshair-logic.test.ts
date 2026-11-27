import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeBarYAxisDomainMax,
  computeMagneticCrosshairTarget,
} from './bar-crosshair-logic';
import { computePeakInterval, type BarDatum } from './bar-series-logic';

const SAMPLE_DATA: BarDatum[] = [
  { period: 'Mon', web: 420, native: 310 },
  { period: 'Tue', web: 510, native: 390 },
  { period: 'Wed', web: 640, native: 470 },
  { period: 'Thu', web: 590, native: 440 },
  { period: 'Fri', web: 780, native: 620 },
];

test('computeBarYAxisDomainMax computes clean headroom bounds for grouped, stacked, and empty datasets', () => {
  assert.equal(
    computeBarYAxisDomainMax(SAMPLE_DATA, { web: true, native: true }, 'grouped'),
    800,
  );
  assert.equal(
    computeBarYAxisDomainMax(SAMPLE_DATA, { web: true, native: true }, 'stacked'),
    1500,
  );
  assert.equal(
    computeBarYAxisDomainMax(SAMPLE_DATA, { web: false, native: true }, 'grouped'),
    700,
  );
  assert.equal(
    computeBarYAxisDomainMax([], { web: true, native: true }, 'grouped'),
    100,
  );
  assert.equal(
    computeBarYAxisDomainMax(SAMPLE_DATA, { web: false, native: false }, 'grouped'),
    100,
  );
});

test('computeMagneticCrosshairTarget snaps magnetically on X and Y to the closest visible bar', () => {
  const visibility = { web: true, native: true };
  const peak = computePeakInterval(SAMPLE_DATA, 'grouped', visibility);

  // Near Fri (rightmost interval, ratio 0.92), hovering high at y=760 snaps to Web (780, peak)
  const highSnap = computeMagneticCrosshairTarget({
    visibleData: SAMPLE_DATA,
    visibility,
    layoutMode: 'grouped',
    hoveredBar: null,
    pointerXRatio: 0.92,
    pointerYValue: 760,
    peak,
  });
  assert.deepEqual(highSnap, {
    localIndex: 4,
    period: 'Fri',
    seriesKey: 'web',
    value: 780,
    yValue: 780,
    isPeak: true,
  });

  // Same Fri interval, hovering lower at y=580 magnetically snaps to Native (620, not peak)
  const lowSnap = computeMagneticCrosshairTarget({
    visibleData: SAMPLE_DATA,
    visibility,
    layoutMode: 'grouped',
    hoveredBar: null,
    pointerXRatio: 0.92,
    pointerYValue: 580,
    peak,
  });
  assert.deepEqual(lowSnap, {
    localIndex: 4,
    period: 'Fri',
    seriesKey: 'native',
    value: 620,
    yValue: 620,
    isPeak: false,
  });
});

test('computeMagneticCrosshairTarget honors direct bar hover and stacked cumulative Y coordinates', () => {
  const visibility = { web: true, native: true };
  const stackedPeak = computePeakInterval(SAMPLE_DATA, 'stacked', visibility);

  // Direct hover on Fri Native bar in stacked mode snaps yValue to cumulative 780 + 620 = 1400
  const stackedSnap = computeMagneticCrosshairTarget({
    visibleData: SAMPLE_DATA,
    visibility,
    layoutMode: 'stacked',
    hoveredBar: { index: 4, seriesKey: 'native' },
    pointerXRatio: 0.1,
    pointerYValue: 100,
    peak: stackedPeak,
  });
  assert.deepEqual(stackedSnap, {
    localIndex: 4,
    period: 'Fri',
    seriesKey: 'native',
    value: 620,
    yValue: 1400,
    isPeak: true,
  });

  // When only Native is visible, snaps exclusively to Native regardless of pointer height
  const singleSeries = computeMagneticCrosshairTarget({
    visibleData: SAMPLE_DATA,
    visibility: { web: false, native: true },
    layoutMode: 'grouped',
    hoveredBar: null,
    pointerXRatio: 0.05,
    pointerYValue: 750,
    peak: computePeakInterval(SAMPLE_DATA, 'grouped', { web: false, native: true }),
  });
  assert.deepEqual(singleSeries, {
    localIndex: 0,
    period: 'Mon',
    seriesKey: 'native',
    value: 310,
    yValue: 310,
    isPeak: false,
  });

  // Returns null when no hover or all series hidden
  assert.equal(
    computeMagneticCrosshairTarget({
      visibleData: SAMPLE_DATA,
      visibility: { web: false, native: false },
      layoutMode: 'grouped',
      hoveredBar: null,
      pointerXRatio: 0.5,
      pointerYValue: 400,
      peak: null,
    }),
    null,
  );
  assert.equal(
    computeMagneticCrosshairTarget({
      visibleData: SAMPLE_DATA,
      visibility,
      layoutMode: 'grouped',
      hoveredBar: null,
      pointerXRatio: null,
      pointerYValue: null,
      peak: null,
    }),
    null,
  );
});
