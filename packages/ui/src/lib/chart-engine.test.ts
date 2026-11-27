import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CHART_PALETTES,
  DEFAULT_CHART_STYLE,
  buildAreaPath,
  buildLinePath,
  clampBrushDomain,
  computeNiceDomain,
  computeSeriesStats,
  describeDonutSlicePath,
  formatMetricNumber,
  polarToCartesian,
  resolveSeriesColor,
  serializeChartCsv,
} from './chart-engine';

test('computeNiceDomain calculates clean rounded ticks including zero', () => {
  const domain = computeNiceDomain([14, 48, 83], { tickCount: 4, includeZero: true });
  assert.equal(domain.min, 0);
  assert.ok(domain.max >= 83);
  assert.ok(domain.ticks.length >= 2);
  assert.equal(domain.ticks[0], 0);
  assert.equal(domain.ticks[domain.ticks.length - 1], domain.max);
});

test('computeNiceDomain handles flat and empty series gracefully', () => {
  const empty = computeNiceDomain([]);
  assert.equal(empty.min, 0);
  assert.equal(empty.max, 100);

  const flat = computeNiceDomain([50, 50, 50], { tickCount: 4, includeZero: false });
  assert.ok(flat.min < 50 && flat.max > 50);
});

test('buildLinePath generates valid linear, smooth, and step SVG paths', () => {
  const pts = [
    { x: 0, y: 100 },
    { x: 50, y: 40 },
    { x: 100, y: 80 },
  ];

  const linear = buildLinePath(pts, 'linear');
  assert.ok(linear.startsWith('M 0.00 100.00'));
  assert.ok(linear.includes('L 50.00 40.00'));
  assert.ok(linear.includes('L 100.00 80.00'));

  const smooth = buildLinePath(pts, 'smooth');
  assert.ok(smooth.startsWith('M 0.00 100.00'));
  assert.ok(smooth.includes('C '), 'smooth curve should emit cubic Bezier commands');

  const step = buildLinePath(pts, 'step');
  assert.ok(step.includes('H '), 'step curve should emit horizontal segments');
  assert.ok(step.includes('V '), 'step curve should emit vertical segments');

  assert.equal(buildLinePath([], 'smooth'), '');
});

test('buildAreaPath closes line path cleanly along baselineY', () => {
  const pts = [
    { x: 10, y: 60 },
    { x: 90, y: 20 },
  ];
  const area = buildAreaPath(pts, 120, 'linear');
  assert.ok(area.startsWith('M 10.00 60.00'));
  assert.ok(area.endsWith('L 90.00 120.00 L 10.00 120.00 Z'));
  assert.equal(buildAreaPath([{ x: 10, y: 20 }], 100, 'linear'), '');
});

test('computeSeriesStats returns accurate min, max, avg, delta, and deltaPct', () => {
  const stats = computeSeriesStats([20, 40, 60, 40]);
  assert.equal(stats.min, 20);
  assert.equal(stats.max, 60);
  assert.equal(stats.avg, 40);
  assert.equal(stats.latest, 40);
  assert.equal(stats.delta, 20);
  assert.equal(stats.deltaPct, 100);

  const empty = computeSeriesStats([]);
  assert.equal(empty.avg, 0);
  assert.equal(empty.delta, 0);
});

test('clampBrushDomain normalizes reversed drags and enforces minimum span', () => {
  assert.deepEqual(clampBrushDomain(8, 2, 12), [2, 8]);
  assert.deepEqual(clampBrushDomain(-5, 99, 10), [0, 9]);
  const [s, e] = clampBrushDomain(4, 4, 10);
  assert.ok(e - s >= 1);
});

test('polarToCartesian and describeDonutSlicePath produce closed SVG arc paths', () => {
  const top = polarToCartesian(100, 100, 50, 0);
  assert.ok(Math.abs(top.x - 100) < 0.001);
  assert.ok(Math.abs(top.y - 50) < 0.001);

  const donutPath = describeDonutSlicePath(100, 100, 60, 34, 0, 90);
  assert.ok(donutPath.includes('A 60.00 60.00'));
  assert.ok(donutPath.includes('A 34.00 34.00'));
  assert.ok(donutPath.endsWith('Z'));

  const solidPath = describeDonutSlicePath(100, 100, 60, 0, 0, 120);
  assert.ok(solidPath.startsWith('M 100.00 100.00'));
  assert.ok(solidPath.endsWith('Z'));
});

test('resolveSeriesColor respects preset palettes and user custom hex overrides', () => {
  const spectral = resolveSeriesColor('s1', 0, { ...DEFAULT_CHART_STYLE, palette: 'spectral' });
  const spectralPreset = CHART_PALETTES.find((p) => p.id === 'spectral');
  assert.equal(spectral, spectralPreset?.colors[0]);

  const customOverride = resolveSeriesColor('s1', 0, {
    ...DEFAULT_CHART_STYLE,
    palette: 'spectral',
    seriesColors: { s1: '#00FFAA' },
  });
  assert.equal(customOverride, '#00FFAA');
});

test('serializeChartCsv escapes commas, quotes, and newlines per RFC-4180', () => {
  const csv = serializeChartCsv(
    ['Timestamp', 'Label', 'Value'],
    [
      ['12:00', 'Glyph, "Main"', 42.5],
      ['12:05', 'Line1\nLine2', ''],
    ],
  );
  const lines = csv.split('\n');
  assert.equal(lines[0], 'Timestamp,Label,Value');
  assert.equal(lines[1], '12:00,"Glyph, ""Main""",42.5');
  assert.ok(csv.includes('"Line1\nLine2",'));
  assert.equal(formatMetricNumber(42.345, 'ms', 1), '42.3ms');
});
