import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ACCENT_PRESETS,
  DEFAULT_CUSTOM_THEME,
  DENSITY_PROFILES,
  RADIUS_PROFILES,
  generateCustomThemeCss,
  generateCustomTokensJson,
  getAccentContrastReport,
  isValidHexColor,
  type CustomThemeConfig,
} from './theme-customizer';

test('isValidHexColor accepts strict 6-digit hex strings and rejects malformed inputs', () => {
  assert.equal(isValidHexColor('#D71921'), true);
  assert.equal(isValidHexColor(' #00ffaa '), true);
  assert.equal(isValidHexColor('#FFF'), false);
  assert.equal(isValidHexColor('D71921'), false);
  assert.equal(isValidHexColor('#GGGGGG'), false);
  assert.equal(isValidHexColor(''), false);
});

test('getAccentContrastReport computes accurate WCAG contrast ratios and foreground recommendations', () => {
  const signalReport = getAccentContrastReport(DEFAULT_CUSTOM_THEME);
  assert.ok(signalReport.onDarkBg > 4.0, `Expected Signal Red on OLED black > 4.0, got ${signalReport.onDarkBg}`);
  assert.ok(signalReport.onLightBg > 4.0, `Expected Signal Red on light bg > 4.0, got ${signalReport.onLightBg}`);
  assert.equal(signalReport.recommendedFg, '#FFFFFF');
  assert.equal(signalReport.meetsAAOnSurface, true);

  // Pure white accent requires black foreground text
  const whiteReport = getAccentContrastReport({
    ...DEFAULT_CUSTOM_THEME,
    accentHex: '#FFFFFF',
  });
  assert.equal(whiteReport.recommendedFg, '#000000');
  assert.equal(whiteReport.blackOnAccent, 21);

  // Malformed hex falls back cleanly to Signal Red without NaN
  const fallbackReport = getAccentContrastReport({
    ...DEFAULT_CUSTOM_THEME,
    accentHex: 'not-a-color',
  });
  assert.equal(fallbackReport.onDarkBg, signalReport.onDarkBg);
  assert.equal(Number.isNaN(fallbackReport.onDarkBg), false);
});

test('generateCustomThemeCss emits valid Tailwind v4 @theme block and semantic --nt-* variables', () => {
  const custom: CustomThemeConfig = {
    mode: 'light',
    accentHex: '#2563eb',
    radiusPx: 24,
    density: 'airy',
    showDotField: false,
  };
  const css = generateCustomThemeCss(custom);
  assert.ok(css.includes('package: nthgui'));
  assert.ok(css.includes('@import "tailwindcss";'));
  assert.ok(css.includes('@theme {'));
  assert.ok(css.includes('--color-nothing-accent: #2563EB;'));
  assert.ok(css.includes('--radius-nothing-card: 24px;'));
  assert.ok(css.includes('--radius-nothing-control: 12px;'));
  assert.ok(css.includes('--spacing-nothing-panel: 24px;'));
  assert.ok(css.includes('[data-theme="light"]'));
  assert.ok(css.includes('--nt-dot-field-opacity: 0;'));
  assert.equal(css.includes('@nothing-ui/'), false);

  const defaultCss = generateCustomThemeCss(DEFAULT_CUSTOM_THEME);
  assert.ok(defaultCss.includes('--nt-dot-field-opacity: 0.28;'));
});

test('generateCustomTokensJson produces parseable JSON with nthgui metadata and active palette', () => {
  for (const preset of ACCENT_PRESETS) {
    assert.equal(isValidHexColor(preset.hex), true, `Preset ${preset.id} hex should be valid`);
  }
  assert.equal(RADIUS_PROFILES.length, 4);
  assert.equal(DENSITY_PROFILES.length, 3);

  const raw = generateCustomTokensJson({
    mode: 'high-contrast',
    accentHex: '#e07a16',
    radiusPx: 0,
    density: 'compact',
    showDotField: true,
  });
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  assert.equal(parsed.package, 'nthgui');
  assert.equal(parsed.mode, 'high-contrast');
  assert.equal(parsed.accent, '#E07A16');
  assert.equal(parsed.radiusPx, 0);
  assert.equal(parsed.density, 'compact');
  assert.equal(parsed.showDotField, true);
  assert.ok(parsed.palette && typeof parsed.palette === 'object');
});
