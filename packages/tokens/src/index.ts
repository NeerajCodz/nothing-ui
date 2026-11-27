export * from './foundations/colors';
export * from './foundations/scale';
export * from './themes/themes';

import { DENSITY_TOKENS, MOTION_TOKENS, RADIUS_TOKENS, SPACING_SCALE, TYPOGRAPHY_TOKENS } from './foundations/scale';
import { DARK_THEME, HIGH_CONTRAST_THEME, LIGHT_THEME, THEMES, type ThemeMode } from './themes/themes';
import type { SemanticColorTokens } from './foundations/colors';

function renderCssVars(theme: SemanticColorTokens): string {
  return [
    `  --nt-bg: ${theme.background};`,
    `  --nt-surface: ${theme.surface};`,
    `  --nt-surface-glass: ${theme.surfaceGlass};`,
    `  --nt-raised: ${theme.surfaceRaised};`,
    `  --nt-overlay: ${theme.surfaceOverlay};`,
    `  --nt-line: ${theme.border};`,
    `  --nt-line-2: ${theme.borderStrong};`,
    `  --nt-display: ${theme.foreground};`,
    `  --nt-primary: ${theme.foregroundPrimary};`,
    `  --nt-secondary: ${theme.foregroundSecondary};`,
    `  --nt-muted: ${theme.foregroundMuted};`,
    `  --nt-accent: ${theme.signal};`,
    `  --nt-accent-hover: ${theme.signalHover};`,
    `  --nt-accent-soft: ${theme.signalSoft};`,
    `  --nt-accent-fg: ${theme.signalForeground};`,
    `  --nt-success: ${theme.success};`,
    `  --nt-warning: ${theme.warning};`,
    `  --nt-danger: ${theme.danger};`,
    `  --nt-focus-ring: ${theme.focusRing};`,
    `  --nt-inverse-bg: ${theme.interactive};`,
    `  --nt-inverse-fg: ${theme.interactiveForeground};`,
  ].join('\n');
}

export function generateWebCss(): string {
  return [
    '/* Deterministic generated output from @nothing-ui/tokens */',
    ':root, [data-theme="light"] {',
    renderCssVars(LIGHT_THEME),
    `  --nt-radius-sm: ${RADIUS_TOKENS.control}px;`,
    `  --nt-radius-md: ${RADIUS_TOKENS.card}px;`,
    `  --nt-radius-lg: ${RADIUS_TOKENS.panel}px;`,
    '}',
    '',
    '.dark, [data-theme="dark"] {',
    renderCssVars(DARK_THEME),
    '}',
    '',
    '.high-contrast, [data-theme="high-contrast"] {',
    renderCssVars(HIGH_CONTRAST_THEME),
    '}',
  ].join('\n');
}

export function getNativeTheme(mode: ThemeMode) {
  return {
    mode,
    colors: THEMES[mode],
    spacing: SPACING_SCALE,
    radius: RADIUS_TOKENS,
    density: DENSITY_TOKENS,
    typography: TYPOGRAPHY_TOKENS.nativeFamilies,
    motion: MOTION_TOKENS,
  };
}

export function generateTokensJson(): string {
  return JSON.stringify(
    {
      version: '1.0.0',
      themes: THEMES,
      spacing: SPACING_SCALE,
      radius: RADIUS_TOKENS,
      density: DENSITY_TOKENS,
      typography: TYPOGRAPHY_TOKENS,
      motion: MOTION_TOKENS,
    },
    null,
    2
  );
}
