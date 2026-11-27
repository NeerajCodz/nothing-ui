import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GLYPH_PRESETS,
  applyDragDelta,
  clampRotaryValue,
  clear,
  contrastRatio,
  countAddressable,
  countLitCells,
  createEmptyGrid,
  fill,
  getPreset,
  invert,
  isValidPattern,
  loopFrames,
  mirrorPattern,
  paintCells,
  parsePattern,
  patternToSvgString,
  resizePattern,
  rotatePattern,
  serializePattern,
  shiftPattern,
  toggleCell,
  valueToKnobAngle,
} from '../index';

test('circular masks produce exact 481 addressable (25x25) and 121 addressable (13x13) cells', () => {
  assert.equal(countAddressable(25), 481);
  assert.equal(625 - countAddressable(25), 144);
  assert.equal(countAddressable(13), 121);
  assert.equal(169 - countAddressable(13), 48);

  const empty25 = createEmptyGrid(25);
  assert.equal(empty25.length, 625);
  assert.equal(empty25[0], 'void');
  assert.equal(empty25[12 * 25 + 12], 'off');

  const empty13 = createEmptyGrid(13);
  assert.equal(empty13.length, 169);
  assert.equal(empty13[0], 'void');
  assert.equal(empty13[6 * 13 + 6], 'off');
});

test('all 8 glyph presets validate cleanly and render non-empty lit dots at both 25x25 and 13x13', () => {
  assert.equal(GLYPH_PRESETS.length, 8);
  for (const preset of GLYPH_PRESETS) {
    for (const res of [25, 13] as const) {
      const cells = getPreset(preset.id, res);
      assert.equal(cells.length, res * res);
      assert.ok(countLitCells(cells) > 0, `${preset.id} @ ${res}x${res} should light LEDs`);
      assert.equal(
        isValidPattern({ version: 1, resolution: res, cells, name: preset.label }),
        true,
        `${preset.id} @ ${res}x${res} must pass GlyphPatternV1 validation`
      );
    }
  }
});

test('grid mutations respect void masks, undo invariants, transforms, and resampling', () => {
  const g13 = createEmptyGrid(13);
  const centerIdx = 6 * 13 + 6;
  const cornerIdx = 0;

  // Corner stays void
  assert.equal(toggleCell(g13, cornerIdx, 'on')[cornerIdx], 'void');
  // Center toggles cleanly
  const lit = toggleCell(g13, centerIdx, 'signal');
  assert.equal(lit[centerIdx], 'signal');
  assert.equal(countLitCells(lit), 1);

  const painted = paintCells(g13, [cornerIdx, centerIdx, centerIdx + 1], 'on');
  assert.equal(painted[cornerIdx], 'void');
  assert.equal(countLitCells(painted), 2);

  assert.equal(countLitCells(fill(g13, 'on')), 121);
  assert.equal(countLitCells(clear(fill(g13, 'on'))), 0);
  assert.equal(countLitCells(invert(lit)), 120);

  // Transforms preserve valid mask
  const heart25 = getPreset('heart', 25);
  assert.equal(isValidPattern({ version: 1, resolution: 25, cells: mirrorPattern(heart25, 25) }), true);
  assert.equal(isValidPattern({ version: 1, resolution: 25, cells: rotatePattern(heart25, 25, 'cw') }), true);
  assert.equal(isValidPattern({ version: 1, resolution: 25, cells: shiftPattern(heart25, 25, 2, -1) }), true);

  // Resampling between 25x25 and 13x13 preserves validity and lit energy
  const downsampled = resizePattern(heart25, 25, 13, 'area');
  assert.equal(downsampled.length, 169);
  assert.equal(isValidPattern({ version: 1, resolution: 13, cells: downsampled }), true);
  assert.ok(countLitCells(downsampled) > 10);

  const upsampled = resizePattern(downsampled, 13, 25, 'nearest');
  assert.equal(upsampled.length, 625);
  assert.equal(isValidPattern({ version: 1, resolution: 25, cells: upsampled }), true);
});

test('GlyphPatternV1 serialize/parse round-trips and rejects malformed or void-violating payloads', () => {
  const cells = getPreset('power', 13);
  const raw = serializePattern({
    version: 1,
    resolution: 13,
    name: 'Power Pulse',
    cells,
    frames: [
      { cells, durationMs: 300 },
      { cells: clear(cells), durationMs: 200 },
    ],
  });
  const parsed = parsePattern(raw);
  assert.equal(parsed.errors.length, 0);
  assert.equal(parsed.pattern?.resolution, 13);
  assert.equal(parsed.pattern?.frames?.length, 2);

  // Reject void violation (corner set to "on")
  const bad = [...cells];
  bad[0] = 'on';
  const badRes = parsePattern(JSON.stringify({ version: 1, resolution: 13, cells: bad }));
  assert.ok(badRes.errors.length > 0);

  // Reject wrong resolution length mismatch (13x13 array labeled as 25)
  const mismatch = parsePattern(JSON.stringify({ version: 1, resolution: 25, cells }));
  assert.ok(mismatch.errors.length > 0);

  // Animation loop & SVG export
  const looped = loopFrames(parsed.pattern!.frames!, 350);
  assert.equal(looped.frameIndex, 1);
  const svg = patternToSvgString(cells, 13);
  assert.ok(svg.includes('<svg') && svg.includes('viewBox="0 0 130 130"'));
});

test('rotary control math and WCAG color contrast ratio calculate accurately', () => {
  assert.equal(clampRotaryValue(140, 0, 100, 1), 100);
  assert.equal(valueToKnobAngle(50, 0, 100), 0);
  assert.equal(applyDragDelta(50, -80, 0, 100, 1, 1.6), 100);
  assert.equal(contrastRatio('#FFFFFF', '#000000'), 21);
  assert.ok(contrastRatio('#D71921', '#000000') > 3.5);
});
