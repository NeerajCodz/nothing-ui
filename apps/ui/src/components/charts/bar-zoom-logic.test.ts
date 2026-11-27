import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MIN_BAR_ZOOM_WINDOW,
  clampZoomRange,
  createFullZoomRange,
  getZoomMultiplier,
  getZoomWindowSize,
  isZoomedRange,
  panZoomRange,
  sliceDataByZoomRange,
  zoomRangeAroundRatio,
  zoomToSelectionRange,
} from './bar-zoom-logic';

const PERIODS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

test('createFullZoomRange, isZoomedRange, and getZoomMultiplier report accurate window metrics', () => {
  const full = createFullZoomRange(PERIODS.length);
  assert.deepEqual(full, { startIndex: 0, endIndex: 6 });
  assert.equal(isZoomedRange(full, PERIODS.length), false);
  assert.equal(getZoomWindowSize(full, PERIODS.length), 7);
  assert.equal(getZoomMultiplier(full, PERIODS.length), 1);

  const zoomed = { startIndex: 2, endIndex: 4 };
  assert.equal(isZoomedRange(zoomed, PERIODS.length), true);
  assert.equal(getZoomWindowSize(zoomed, PERIODS.length), 3);
  assert.equal(getZoomMultiplier(zoomed, PERIODS.length), 2.3);
  assert.deepEqual(sliceDataByZoomRange(PERIODS, zoomed), ['Wed', 'Thu', 'Fri']);
});

test('zoomRangeAroundRatio zooms in toward focus point and zooms out smoothly to full bounds', () => {
  const full = createFullZoomRange(7);

  // Zoom in anchored at center (0.5): 7 -> 5 (1..5)
  const z1 = zoomRangeAroundRatio(full, 7, 'in', 0.5);
  assert.equal(getZoomWindowSize(z1, 7), 5);
  assert.deepEqual(z1, { startIndex: 1, endIndex: 5 });

  // Zoom in anchored near right edge (1.0): trims left side
  const zRight = zoomRangeAroundRatio(z1, 7, 'in', 1);
  assert.equal(zRight.endIndex, 5);
  assert.ok(zRight.startIndex > z1.startIndex);

  // Zooming repeatedly stops cleanly at MIN_BAR_ZOOM_WINDOW (2)
  let current = full;
  for (let i = 0; i < 8; i += 1) {
    current = zoomRangeAroundRatio(current, 7, 'in', 0.5);
  }
  assert.equal(getZoomWindowSize(current, 7), MIN_BAR_ZOOM_WINDOW);

  // Zooming out repeatedly restores full range
  for (let i = 0; i < 8; i += 1) {
    current = zoomRangeAroundRatio(current, 7, 'out', 0.5);
  }
  assert.deepEqual(current, full);
  assert.equal(isZoomedRange(current, 7), false);
});

test('panZoomRange preserves window size and clamps cleanly at left/right dataset boundaries', () => {
  const win = { startIndex: 2, endIndex: 4 }; // size 3

  const right1 = panZoomRange(win, 7, 1);
  assert.deepEqual(right1, { startIndex: 3, endIndex: 5 });
  assert.equal(getZoomWindowSize(right1, 7), 3);

  // Overshoot right clamps to [4, 6]
  const rightClamped = panZoomRange(win, 7, 10);
  assert.deepEqual(rightClamped, { startIndex: 4, endIndex: 6 });
  assert.equal(getZoomWindowSize(rightClamped, 7), 3);

  // Overshoot left clamps to [0, 2]
  const leftClamped = panZoomRange(win, 7, -10);
  assert.deepEqual(leftClamped, { startIndex: 0, endIndex: 2 });
  assert.equal(getZoomWindowSize(leftClamped, 7), 3);

  // Panning on full range is a no-op
  const full = createFullZoomRange(7);
  assert.deepEqual(panZoomRange(full, 7, 2), full);
});

test('zoomToSelectionRange handles forward/reverse drags and enforces minimum window size', () => {
  const full = createFullZoomRange(7);

  // Forward drag Wed(2) -> Fri(4)
  assert.deepEqual(zoomToSelectionRange(full, 7, 2, 4), { startIndex: 2, endIndex: 4 });

  // Reverse drag Fri(4) -> Tue(1)
  assert.deepEqual(zoomToSelectionRange(full, 7, 4, 1), { startIndex: 1, endIndex: 4 });

  // Nested zoom inside an already zoomed slice [1, 5] selecting local [1, 3] -> global [2, 4]
  assert.deepEqual(zoomToSelectionRange({ startIndex: 1, endIndex: 5 }, 7, 1, 3), {
    startIndex: 2,
    endIndex: 4,
  });

  // Single-bar selection expands to MIN_BAR_ZOOM_WINDOW (2) within bounds
  const singleRight = clampZoomRange({ startIndex: 6, endIndex: 6 }, 7, 2);
  assert.deepEqual(singleRight, { startIndex: 5, endIndex: 6 });
});
