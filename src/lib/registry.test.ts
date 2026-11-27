import test from 'node:test';
import assert from 'node:assert/strict';
import {
  REGISTRY_COMPONENTS,
  buildCliInstallCommand,
  filterRegistryComponents,
  getComponentById,
} from './registry';
import { DOT_ICON_NAMES, buildDotIconUsageSnippet, getDotIconPoints } from './dot-icons';
import {
  GLYPH_GRID_SIZE,
  GLYPH_PRESETS,
  buildPresetMatrix,
  clearGlyphMatrix,
  countAddressableGlyphDots,
  countLitGlyphDots,
  isInsideGlyphCircle,
  toggleGlyphCell,
} from './glyph-matrix';
import { applyDragDelta, clampRotaryValue, valueToKnobAngle } from './rotary';

test('registry exposes unique component IDs and CLI install commands for all package managers', () => {
  const ids = new Set(REGISTRY_COMPONENTS.map((c) => c.id));
  assert.equal(ids.size, REGISTRY_COMPONENTS.length);
  assert.ok(REGISTRY_COMPONENTS.length >= 20);

  assert.equal(
    buildCliInstallCommand('slider', 'npm'),
    'npx nthgui add slider'
  );
  assert.equal(
    buildCliInstallCommand('slider', 'pnpm'),
    'pnpm dlx nthgui add slider'
  );
  assert.equal(
    buildCliInstallCommand('slider', 'bun'),
    'bunx --bun nthgui add slider'
  );
  assert.equal(
    buildCliInstallCommand('slider', 'yarn'),
    'yarn dlx nthgui add slider'
  );
});

test('filterRegistryComponents filters by query, category, and ui-sdk primitive', () => {
  const sliders = filterRegistryComponents('slider');
  assert.equal(sliders.length, 1);
  assert.equal(sliders[0].id, 'slider');

  const uiSdkOtp = filterRegistryComponents('otp-input');
  assert.equal(uiSdkOtp.length, 1);
  assert.equal(uiSdkOtp[0].id, 'otp-input');

  const overlays = filterRegistryComponents('', 'Overlays & Feedback');
  assert.ok(overlays.length >= 5);
  assert.ok(overlays.every((c) => c.category === 'Overlays & Feedback'));

  const emptyResult = filterRegistryComponents('nonexistent-xyz-widget');
  assert.equal(emptyResult.length, 0);

  assert.equal(getComponentById('glyph-matrix')?.name, 'Glyph Matrix (25×25)');
});

test('dot icons provide 35 valid 9x9 bitmaps with in-bounds dot points', () => {
  assert.equal(DOT_ICON_NAMES.length, 35);
  for (const name of DOT_ICON_NAMES) {
    const pts = getDotIconPoints(name);
    assert.ok(pts.length > 0, `icon ${name} must have active dots`);
    for (const pt of pts) {
      assert.ok(pt.x >= 0 && pt.x < 9);
      assert.ok(pt.y >= 0 && pt.y < 9);
    }
  }
  const snippet = buildDotIconUsageSnippet('wifi', 24);
  assert.ok(snippet.includes('name="wifi"'));
  assert.ok(snippet.includes('size={24}'));
});

test('glyph matrix 25x25 circular mask excludes corners and toggles addressable LEDs only', () => {
  assert.equal(isInsideGlyphCircle(0, 0), false);
  assert.equal(isInsideGlyphCircle(24, 24), false);
  assert.equal(isInsideGlyphCircle(12, 12), true);

  const addressable = countAddressableGlyphDots();
  assert.ok(addressable > 450 && addressable < GLYPH_GRID_SIZE * GLYPH_GRID_SIZE);

  for (const preset of GLYPH_PRESETS) {
    const matrix = buildPresetMatrix(preset.id);
    assert.equal(matrix.length, GLYPH_GRID_SIZE * GLYPH_GRID_SIZE);
    assert.equal(matrix[0], 'void');
    assert.ok(countLitGlyphDots(matrix) > 10, `preset ${preset.id} should light dots`);
  }

  const liveMatrix = buildPresetMatrix('live');
  assert.ok(liveMatrix.includes('signal'));

  const cleared = clearGlyphMatrix(liveMatrix);
  assert.equal(countLitGlyphDots(cleared), 0);
  assert.equal(cleared[0], 'void');

  // Toggling corner void cell must be a no-op
  const afterVoidToggle = toggleGlyphCell(cleared, 0, 'on');
  assert.equal(afterVoidToggle[0], 'void');

  // Toggling center cell turns it on then off
  const centerIdx = 12 * GLYPH_GRID_SIZE + 12;
  const afterCenterOn = toggleGlyphCell(cleared, centerIdx, 'signal');
  assert.equal(afterCenterOn[centerIdx], 'signal');
  const afterCenterOff = toggleGlyphCell(afterCenterOn, centerIdx, 'signal');
  assert.equal(afterCenterOff[centerIdx], 'off');
});

test('rotary knob math clamps bounds, maps 270deg sweep, and applies vertical drag delta', () => {
  assert.equal(clampRotaryValue(150, 0, 100, 5), 100);
  assert.equal(clampRotaryValue(-20, 0, 100, 5), 0);
  assert.equal(clampRotaryValue(52, 0, 100, 5), 50);

  assert.equal(valueToKnobAngle(0, 0, 100), -135);
  assert.equal(valueToKnobAngle(50, 0, 100), 0);
  assert.equal(valueToKnobAngle(100, 0, 100), 135);

  const draggedUp = applyDragDelta(50, -80, 0, 100, 1);
  assert.ok(draggedUp > 50 && draggedUp <= 100);
  const draggedDown = applyDragDelta(50, 80, 0, 100, 1);
  assert.ok(draggedDown < 50 && draggedDown >= 0);
});
