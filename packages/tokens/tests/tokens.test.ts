import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DARK_THEME,
  DENSITY_TOKENS,
  HIGH_CONTRAST_THEME,
  LIGHT_THEME,
  MOTION_TOKENS,
  RADIUS_TOKENS,
  SPACING_SCALE,
  THEMES,
  TYPOGRAPHY_TOKENS,
  generateTokensJson,
  generateWebCss,
  getNativeTheme,
  type ThemeMode,
} from '../src/index';

const REQUIRED_COLOR_KEYS = [
  'background',
  'surface',
  'surfaceGlass',
  'surfaceRaised',
  'surfaceOverlay',
  'border',
  'borderStrong',
  'foreground',
  'foregroundPrimary',
  'foregroundSecondary',
  'foregroundMuted',
  'signal',
  'signalHover',
  'signalSoft',
  'signalForeground',
  'success',
  'warning',
  'danger',
  'focusRing',
  'interactive',
  'interactiveForeground',
] as const;

test('all three themes (light, dark, high-contrast) define every semantic color token', () => {
  const modes: ThemeMode[] = ['light', 'dark', 'high-contrast'];
  for (const mode of modes) {
    const theme = THEMES[mode];
    assert.ok(theme, `Missing theme for ${mode}`);
    for (const key of REQUIRED_COLOR_KEYS) {
      assert.equal(typeof theme[key], 'string', `Theme ${mode}.${key} must be a string`);
      assert.ok(theme[key].length > 0, `Theme ${mode}.${key} must be non-empty`);
    }
  }

  assert.equal(LIGHT_THEME, THEMES.light);
  assert.equal(DARK_THEME, THEMES.dark);
  assert.equal(HIGH_CONTRAST_THEME, THEMES['high-contrast']);
  assert.equal(DARK_THEME.background.toLowerCase(), '#000000', 'Dark mode uses pure OLED black');
  assert.equal(DARK_THEME.signal.toLowerCase(), '#d71921', 'Signal Red is #D71921');
});

test('generateWebCss produces deterministic CSS with all themes and semantic --nt-* variables', () => {
  const css1 = generateWebCss();
  const css2 = generateWebCss();
  assert.equal(css1, css2, 'generateWebCss must be deterministic');

  assert.ok(css1.includes(':root, [data-theme="light"]'));
  assert.ok(css1.includes('.dark, [data-theme="dark"]'));
  assert.ok(css1.includes('.high-contrast, [data-theme="high-contrast"]'));

  for (const varName of [
    '--nt-bg:',
    '--nt-surface:',
    '--nt-line:',
    '--nt-display:',
    '--nt-primary:',
    '--nt-secondary:',
    '--nt-muted:',
    '--nt-accent:',
    '--nt-inverse-bg:',
    '--nt-inverse-fg:',
    '--nt-radius-sm:',
    '--nt-radius-md:',
    '--nt-radius-lg:',
  ]) {
    assert.ok(css1.includes(varName), `Missing CSS variable ${varName}`);
  }
});

test('getNativeTheme returns complete React Native theme payload for every ThemeMode', () => {
  for (const mode of ['light', 'dark', 'high-contrast'] as const) {
    const nativeTheme = getNativeTheme(mode);
    assert.equal(nativeTheme.mode, mode);
    assert.deepEqual(nativeTheme.colors, THEMES[mode]);
    assert.deepEqual(nativeTheme.spacing, SPACING_SCALE);
    assert.deepEqual(nativeTheme.radius, RADIUS_TOKENS);
    assert.deepEqual(nativeTheme.density, DENSITY_TOKENS);
    assert.deepEqual(nativeTheme.typography, TYPOGRAPHY_TOKENS.nativeFamilies);
    assert.deepEqual(nativeTheme.motion, MOTION_TOKENS);
  }
});

test('generateTokensJson emits valid JSON containing themes, spacing, radius, density, typography, and motion', () => {
  const raw = generateTokensJson();
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  assert.ok(parsed.version);
  assert.ok(parsed.themes);
  assert.ok(parsed.spacing);
  assert.ok(parsed.radius);
  assert.ok(parsed.density);
  assert.ok(parsed.typography);
  assert.ok(parsed.motion);
});
