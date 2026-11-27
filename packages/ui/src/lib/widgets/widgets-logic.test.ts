import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computePowerHubSummary,
  computeScreenTimeSummary,
  computeStepMetrics,
  evaluateLinkQuality,
} from './hardware-widget-logic';
import {
  computeHabitStats,
  convertUnitValue,
  cyclePlaybackSpeed,
  formatCountdownSeconds,
  generateDeterministicHabitMatrix,
  serializeNotesToMarkdown,
} from './utility-widget-logic';

test('pedometer metrics compute progress, distance in km/mi, and goal completion', () => {
  const km = computeStepMetrics(8000, 10000, 'km');
  assert.equal(km.progressPct, 80);
  assert.equal(km.goalMet, false);
  assert.equal(km.distanceLabel, '6.08 km');

  const mi = computeStepMetrics(10500, 10000, 'mi');
  assert.equal(mi.progressPct, 100);
  assert.equal(mi.goalMet, true);
  assert.ok(mi.distanceLabel.endsWith('mi'));
});

test('battery power hub summarizes multi-device telemetry and low battery warnings', () => {
  const summary = computePowerHubSummary([
    { id: 'p', name: 'Phone (3)', kind: 'phone', level: 82, charging: true, healthPct: 98, watts: 45 },
    { id: 'e', name: 'Ear (3)', kind: 'earbuds', level: 18, charging: false, healthPct: 95 },
  ]);
  assert.equal(summary.averagePct, 50);
  assert.equal(summary.chargingCount, 1);
  assert.equal(summary.lowDevices.length, 1);
  assert.equal(summary.totalWatts, 45);
});

test('screen time summary and network quality evaluate thresholds accurately', () => {
  const screen = computeScreenTimeSummary(
    [
      { id: 'dev', label: 'Build', minutes: 90, budgetMinutes: 120 },
      { id: 'msg', label: 'Comms', minutes: 45, budgetMinutes: 60 },
    ],
    240,
    90,
  );
  assert.equal(screen.totalMinutes, 135);
  assert.equal(screen.formattedTotal, '2h 15m');
  assert.equal(screen.overBudget, false);
  assert.ok(screen.focusScore >= 60);

  const goodNet = evaluateLinkQuality(640, 120, 11, 2.1);
  assert.equal(goodNet.grade, 'Optimal');
  assert.equal(goodNet.signalBars, 5);

  const poorNet = evaluateLinkQuality(18, 4, 95, 19);
  assert.equal(poorNet.grade, 'Degraded');
});

test('precision unit and FX converter handles temperature, length, data, and currency', () => {
  assert.equal(convertUnitValue('temperature', 'C', 'F', 100), 212);
  assert.equal(convertUnitValue('temperature', 'F', 'C', 32), 0);
  assert.equal(convertUnitValue('temperature', 'C', 'K', 0), 273.15);
  assert.equal(convertUnitValue('length', 'km', 'm', 1.5), 1500);
  assert.equal(convertUnitValue('data', 'Gbps', 'Mbps', 1), 1000);
  assert.ok(convertUnitValue('currency', 'EUR', 'USD', 100) > 100);
});

test('90-day habit matrix computes streaks, milestones, and markdown export', () => {
  const days = generateDeterministicHabitMatrix(42, 90);
  assert.equal(days.length, 90);
  const stats = computeHabitStats([true, true, true, true, true, true, true, false, true, true]);
  assert.equal(stats.longestStreak, 7);
  assert.equal(stats.currentStreak, 2);
  assert.equal(stats.milestoneIndices.has(6), true);

  const md = serializeNotesToMarkdown('Sprint Notes', 'Ship all clocks.', [
    { id: '1', text: 'Verify analog dials', done: true },
    { id: '2', text: 'Verify word clock', done: false },
  ]);
  assert.ok(md.includes('# Sprint Notes'));
  assert.ok(md.includes('- [x] Verify analog dials'));
  assert.ok(md.includes('- [ ] Verify word clock'));

  assert.equal(formatCountdownSeconds(1500), '25:00');
  assert.equal(cyclePlaybackSpeed(1), 1.25);
  assert.equal(cyclePlaybackSpeed(2), 1);
});
