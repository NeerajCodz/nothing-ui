import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildMonthGrid,
  computeGridProximity,
  computeMagneticOffset,
  countDaysInclusive,
  formatAccessibleDateLabel,
  formatMonthDotoLabel,
  getIsoWeekNumber,
  getWeekdayHeaders,
  isIsoDateInRange,
  parseIsoDate,
  shiftCalendarMonth,
  shiftIsoDay,
} from './calendar-widget-logic';
import {
  computeMagneticStutterSecondDeg,
  computeStutterHandAngles,
  generateAnalogRingTicks,
} from './analog-clock-physics';

test('buildMonthGrid produces exact 42-cell matrices for Mon/Sun starts and leap-year February', () => {
  const novMon = buildMonthGrid(2026, 10, 1); // Nov 2026 (Nov 1 is Sunday)
  assert.equal(novMon.length, 42);
  assert.equal(novMon[0].dayOfWeek, 1, 'Monday-start grid must begin on Monday');
  assert.equal(novMon[6].iso, '2026-11-01');
  assert.equal(novMon.filter((c) => c.inCurrentMonth).length, 30);

  const novSun = buildMonthGrid(2026, 10, 0);
  assert.equal(novSun.length, 42);
  assert.equal(novSun[0].iso, '2026-11-01');
  assert.deepEqual(getWeekdayHeaders(1).slice(0, 2), ['MO', 'TU']);
  assert.deepEqual(getWeekdayHeaders(0).slice(0, 2), ['SU', 'MO']);

  // Leap year Feb 2024 has 29 days
  const leapFeb = buildMonthGrid(2024, 1, 1);
  assert.equal(leapFeb.filter((c) => c.inCurrentMonth).length, 29);
  assert.ok(leapFeb.some((c) => c.iso === '2024-02-29' && c.inCurrentMonth));

  assert.equal(formatMonthDotoLabel(2026, 10), 'NOV 2026');
  assert.equal(formatAccessibleDateLabel('2026-11-25'), 'Wednesday, November 25, 2026');
  assert.equal(getIsoWeekNumber(2026, 10, 25), 48);
  assert.deepEqual(shiftCalendarMonth(2026, 11, 1), { year: 2027, month: 0 });
  assert.equal(shiftIsoDay('2026-11-30', 1), '2026-12-01');
  assert.equal(parseIsoDate('2026-02-30'), null);
});

test('CalendarWidget range helpers and magnetic hover physics stay bounded and symmetric', () => {
  assert.equal(isIsoDateInRange('2026-11-15', '2026-11-10', '2026-11-20'), true);
  assert.equal(isIsoDateInRange('2026-11-15', '2026-11-20', '2026-11-10'), true);
  assert.equal(isIsoDateInRange('2026-11-25', '2026-11-10', '2026-11-20'), false);
  assert.equal(countDaysInclusive('2026-11-10', '2026-11-14'), 5);

  const rect = { left: 100, top: 200, width: 44, height: 44 };
  const center = computeMagneticOffset(122, 222, rect, 5);
  assert.equal(center.x, 0);
  assert.equal(center.y, 0);
  assert.equal(center.intensity, 0);

  const rightEdge = computeMagneticOffset(144, 222, rect, 5);
  assert.ok(rightEdge.x > 0 && rightEdge.x <= 5);
  assert.equal(rightEdge.y, 0);

  const topLeftCorner = computeMagneticOffset(100, 200, rect, 5);
  assert.ok(topLeftCorner.x < 0 && topLeftCorner.x >= -5);
  assert.ok(topLeftCorner.y < 0 && topLeftCorner.y >= -5);

  // Neighbor proximity inside 7-column grid
  assert.equal(computeGridProximity(10, 10, 7), 1);
  assert.ok(computeGridProximity(10, 11, 7) > 0.3);
  assert.ok(computeGridProximity(10, 17, 7) > 0.3);
  assert.equal(computeGridProximity(10, 35, 7), 0);
});

test('computeMagneticStutterSecondDeg produces snap-overshoot, damped rebound, and detent lock', () => {
  // At t=0.02s: snapping forward from previous tick
  const snapStart = computeMagneticStutterSecondDeg(15, 20, 1.0);
  assert.ok(snapStart.secondDeg < 90, `Expected snap start before 90deg, got ${snapStart.secondDeg}`);

  // At t=0.095s: right after snap peak, should exhibit positive magnetic overshoot above 90deg
  const overshoot = computeMagneticStutterSecondDeg(15, 95, 1.0);
  assert.ok(overshoot.secondDeg > 90, `Expected magnetic overshoot > 90deg, got ${overshoot.secondDeg}`);
  assert.ok(overshoot.magneticPulse > 0.7, 'Expected high magnetic detent pulse right after snap');

  // At t=0.55s: settled & magnetically locked on exact detent (90deg)
  const locked = computeMagneticStutterSecondDeg(15, 550, 1.0);
  assert.equal(locked.secondDeg, 90);
  assert.equal(locked.magneticPulse, 0);

  // At t=0.98s: subtle pre-tension pull before next second
  const prePull = computeMagneticStutterSecondDeg(15, 980, 1.0);
  assert.ok(prePull.secondDeg > 90 && prePull.secondDeg < 90.5);
});

test('computeStutterHandAngles and generateAnalogRingTicks support all motions and customizable ring tick presets', () => {
  const stutter = computeStutterHandAngles({
    hours24: 10,
    minutes: 10,
    seconds: 30,
    milliseconds: 500,
    motion: 'magnetic-stutter',
  });
  assert.equal(stutter.secondDeg, 180);
  assert.equal(stutter.activeSecondIndex, 30);

  const sweep = computeStutterHandAngles({
    hours24: 10,
    minutes: 10,
    seconds: 30,
    milliseconds: 500,
    motion: 'sweep',
  });
  assert.equal(sweep.secondDeg, 183);

  const beat = computeStutterHandAngles({
    hours24: 10,
    minutes: 10,
    seconds: 30,
    milliseconds: 520,
    motion: 'mechanical-beat',
    beatsPerSecond: 4,
  });
  assert.ok(beat.secondDeg >= 183 && beat.secondDeg <= 183.5);

  for (const density of [12, 24, 60, 120] as const) {
    const ticks = generateAnalogRingTicks({ tickCount: density, tickStyle: 'hybrid' });
    assert.equal(ticks.length, density);
    assert.equal(ticks[0].isTwelve, true);
    assert.equal(ticks[0].shape, 'line', 'Hybrid style renders cardinal ticks as crisp lines');
    assert.ok(ticks.some((t) => t.shape === 'dot'), 'Hybrid style renders non-cardinal ticks as dots');
  }

  const allDots = generateAnalogRingTicks({ tickCount: 60, tickStyle: 'dots' });
  assert.ok(allDots.every((t) => t.shape === 'dot'));

  const allBatons = generateAnalogRingTicks({ tickCount: 24, tickStyle: 'batons' });
  assert.ok(allBatons.every((t) => t.shape === 'line'));
});
