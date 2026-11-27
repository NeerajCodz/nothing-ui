import assert from 'node:assert/strict';
import test from 'node:test';
import { createEmptyGrid, getPreset } from '../../core/src/index';
import {
  NATIVE_CATALOG_SPECS,
  NATIVE_COMPATIBILITY_MATRIX,
  NATIVE_COMPONENT_SNIPPETS,
  buildNativeGlyphPoints,
  createNativeTheme,
  filterNativeSpecs,
  getAllNativeSpecs,
  getNativeSpecBySlug,
  hasNativeSpec,
} from '../src/index';

test('createNativeTheme defaults to OLED dark mode and supports light and high-contrast', () => {
  const dark = createNativeTheme();
  assert.equal(dark.mode, 'dark');
  assert.equal(dark.colors.background.toLowerCase(), '#000000');
  assert.equal(dark.colors.signal.toLowerCase(), '#d71921');

  const light = createNativeTheme('light');
  assert.equal(light.mode, 'light');
  assert.notEqual(light.colors.background, dark.colors.background);

  const hc = createNativeTheme('high-contrast');
  assert.equal(hc.mode, 'high-contrast');
  assert.ok(NATIVE_COMPATIBILITY_MATRIX.platforms.includes('iOS 15+'));
  assert.ok(NATIVE_COMPATIBILITY_MATRIX.coverage.includes('136 / 136'));
});

test('buildNativeGlyphPoints projects exact circular LED counts for 25x25 (481) and 13x13 (121)', () => {
  const g25 = buildNativeGlyphPoints({ resolution: 25, preset: 'power', mode: 'dark' });
  assert.equal(g25.viewBoxSize, 250);
  assert.equal(g25.points.length, 481, '25x25 circular mask must project exactly 481 addressable LEDs');
  assert.ok(g25.points.some((p) => p.state === 'on' || p.state === 'signal'));
  assert.ok(g25.points.every((p) => p.cx > 0 && p.cy > 0 && p.r > 0));

  const g13 = buildNativeGlyphPoints({ resolution: 13, preset: 'heart', mode: 'dark' });
  assert.equal(g13.viewBoxSize, 130);
  assert.equal(g13.points.length, 121, '13x13 circular mask must project exactly 121 addressable LEDs');
});

test('buildNativeGlyphPoints respects custom cell grids and maps signal cells to theme signal color', () => {
  const custom = createEmptyGrid(13);
  const firstAddressable = custom.findIndex((c) => c === 'off');
  assert.ok(firstAddressable >= 0);
  custom[firstAddressable] = 'signal';

  const result = buildNativeGlyphPoints({ resolution: 13, cells: custom, mode: 'dark' });
  assert.equal(result.points.length, 121);
  const signalPoint = result.points.find((p) => p.index === firstAddressable);
  assert.ok(signalPoint);
  assert.equal(signalPoint.state, 'signal');
  assert.equal(signalPoint.fill.toLowerCase(), '#d71921');

  // Invalid length cell arrays safely fall back to preset
  const fallback = buildNativeGlyphPoints({ resolution: 13, cells: ['on'], preset: 'play' });
  assert.equal(fallback.points.length, 121);
  assert.equal(getPreset('play', 13).filter((c) => c !== 'void').length, 121);
});

test('all 9 interactive charts have upgraded React Native specs with touch inspection and configurable colors', () => {
  const chartSlugs = [
    'charts',
    'sparkline-strip',
    'radar-chart',
    'pie-chart',
    'timeseries',
    'sankey',
    'map-chart',
    'flow',
    'custom-chart',
  ];

  for (const slug of chartSlugs) {
    assert.equal(hasNativeSpec(slug), true, `Missing native spec for ${slug}`);
    const spec = getNativeSpecBySlug(slug);
    assert.ok(spec);
    assert.ok(spec.nativeName.startsWith('Interactive'), `${slug} nativeName should reflect interactive parity`);
    assert.ok(spec.code.includes('react-native-svg'), `${slug} must render vector SVG via react-native-svg`);
    assert.ok(spec.code.includes('onPress'), `${slug} must support interactive touch selection`);
    assert.ok(
      spec.code.includes('seriesColors') || spec.code.includes('strokeColor') || spec.code.includes('accentColor') || spec.code.includes('color: string'),
      `${slug} must expose configurable color props`,
    );
  }

  const primarySpecs = getAllNativeSpecs();
  assert.equal(primarySpecs.length, 111, 'getAllNativeSpecs() must return all 111 deduplicated primary live catalog modules');
  assert.equal(Object.keys(NATIVE_CATALOG_SPECS).length, primarySpecs.length + 5, 'NATIVE_CATALOG_SPECS includes 5 backwards-compatible aliases');

  for (const alias of ['text', 'badge', 'separator', 'glyph-matrix-13', 'glyph-matrix-25']) {
    assert.equal(hasNativeSpec(alias), true, `Expected alias "${alias}" to resolve in NATIVE_CATALOG_SPECS`);
  }

  assert.ok(NATIVE_COMPONENT_SNIPPETS['glyph-matrix'] === NATIVE_COMPONENT_SNIPPETS['glyph-matrix-25']);
  assert.ok(filterNativeSpecs('timeseries').some((s) => s.slug === 'timeseries'));
  assert.equal(filterNativeSpecs('', 'Charts').length, 9, 'Expected all 9 interactive charts in native Charts category');
  assert.equal(filterNativeSpecs('', 'Widgets').length, 35, 'Expected all 35 widgets in native Widgets category');
  assert.equal(filterNativeSpecs('', 'Glyph System').length, 1, 'Expected standalone Glyph Matrix in native Glyph System category');
  assert.ok(
    filterNativeSpecs('', 'Data & Hardware').every((s) => s.category === 'Data & Hardware' && !chartSlugs.includes(s.slug)),
    'Category filtering must strictly match requested NativeCategory and keep Charts out of Data & Hardware',
  );
  assert.equal(filterNativeSpecs('nonexistent-xyz-component-999').length, 0);
});
