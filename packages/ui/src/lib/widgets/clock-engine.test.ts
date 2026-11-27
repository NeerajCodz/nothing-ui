import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ANALOG_DIAL_PRESETS,
  WORD_CLOCK_ROWS,
  WORLD_CLOCK_CITIES,
  applyHourOffset,
  computeAnalogAngles,
  computeRadialClockProgress,
  encodeBinaryClock,
  formatStopwatchMs,
  getZonedTimeParts,
  resolveWordClockState,
} from './clock-engine';

test('analog clock hand angles calculate exact sweep and quartz positions', () => {
  const noon = computeAnalogAngles(12, 0, 0, 0, false);
  assert.equal(noon.hourDeg, 0);
  assert.equal(noon.minuteDeg, 0);
  assert.equal(noon.secondDeg, 0);

  const threeThirty = computeAnalogAngles(15, 30, 0, 0, false);
  assert.equal(threeThirty.hourDeg, 105);
  assert.equal(threeThirty.minuteDeg, 180);
  assert.equal(threeThirty.secondDeg, 0);

  const sweepHalfSec = computeAnalogAngles(0, 0, 15, 500, true);
  assert.equal(sweepHalfSec.secondDeg, 93);
  assert.equal(ANALOG_DIAL_PRESETS.length, 5);
});

test('binary & BCD clock encoders produce exact bit weights', () => {
  const bcd = encodeBinaryClock(21, 45, 9, 'bcd');
  assert.equal(bcd.length, 6);
  assert.deepEqual(
    bcd[0].bits.map((b) => (b.active ? b.weight : 0)).filter(Boolean),
    [2],
  );
  assert.deepEqual(
    bcd[5].bits.map((b) => (b.active ? b.weight : 0)).filter(Boolean),
    [8, 1],
  );

  const binary = encodeBinaryClock(23, 59, 42, 'binary');
  assert.equal(binary.length, 3);
  assert.equal(binary[2].bits.reduce((s, b) => s + (b.active ? b.weight : 0), 0), 42);
});

test('word clock matrix illuminates accurate English phrases and corner minute dots', () => {
  assert.equal(WORD_CLOCK_ROWS.length, 10);
  for (const row of WORD_CLOCK_ROWS) {
    assert.equal(row.length, 11);
  }

  const tenOhZero = resolveWordClockState(10, 0);
  assert.equal(tenOhZero.phrase, "IT IS TEN O'CLOCK");
  assert.equal(tenOhZero.minuteDots, 0);

  const tenTwentySeven = resolveWordClockState(10, 27);
  assert.equal(tenTwentySeven.phrase, 'IT IS TWENTY FIVE PAST TEN');
  assert.equal(tenTwentySeven.minuteDots, 2);

  const quarterToFour = resolveWordClockState(15, 48);
  assert.equal(quarterToFour.phrase, 'IT IS A QUARTER TO FOUR');
  assert.equal(quarterToFour.minuteDots, 3);
  assert.ok(quarterToFour.activeCells.size > 10);
});

test('radial clock progress and stopwatch formatters are bounded and tabular', () => {
  const noon = computeRadialClockProgress(12, 0, 0);
  assert.equal(noon.dayPct, 50);
  assert.equal(noon.solarPct, 50);

  const halfMin = computeRadialClockProgress(12, 0, 30);
  assert.equal(halfMin.secondPct, 50);

  const sw = formatStopwatchMs(65432);
  assert.equal(sw.formatted, '01:05.43');
});

test('world clock timezone helpers shift offsets deterministically', () => {
  const base = new Date('2026-06-15T12:00:00.000Z');
  const shifted = applyHourOffset(base, 3);
  assert.equal(shifted.toISOString(), '2026-06-15T15:00:00.000Z');
  const parts = getZonedTimeParts(base, 'UTC');
  assert.equal(parts.hours24, 12);
  assert.equal(parts.isDaytime, true);
  assert.ok(WORLD_CLOCK_CITIES.length >= 6);
});
