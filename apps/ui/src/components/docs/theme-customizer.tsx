import * as React from 'react';
import { ArrowCounterClockwise, Check, Copy, DownloadSimple, Palette } from '@phosphor-icons/react';
import { buildComponentsJson } from '@nothing-ui/cli';
import { THEMES, type ThemeMode } from '@nothing-ui/tokens';
import { Button, NothingSlider, NothingSwitch, cn, useTheme } from '@nothing-ui/ui';
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
} from '../../lib/theme-customizer';

export function ThemeCustomizer() {
  const { theme, setTheme } = useTheme();
  const [config, setConfig] = React.useState<CustomThemeConfig>({
    ...DEFAULT_CUSTOM_THEME,
    mode: theme,
  });
  const [hexDraft, setHexDraft] = React.useState(DEFAULT_CUSTOM_THEME.accentHex);
  const [applyToSite, setApplyToSite] = React.useState(false);
  const [outputTab, setOutputTab] = React.useState<'css' | 'components' | 'json'>('css');
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  React.useEffect(() => {
    setConfig((prev) => ({ ...prev, mode: theme }));
  }, [theme]);

  React.useEffect(() => {
    if (!applyToSite || typeof document === 'undefined') return;
    const root = document.documentElement;
    if (isValidHexColor(config.accentHex)) {
      root.style.setProperty('--nt-accent', config.accentHex);
    }
    return () => {
      root.style.removeProperty('--nt-accent');
    };
  }, [applyToSite, config.accentHex]);

  const contrast = React.useMemo(() => getAccentContrastReport(config), [config]);
  const outputCode = React.useMemo(() => {
    if (outputTab === 'css') return generateCustomThemeCss(config);
    if (outputTab === 'components') return buildComponentsJson('vite');
    return generateCustomTokensJson(config);
  }, [config, outputTab]);

  const handleMode = (mode: ThemeMode) => {
    setTheme(mode);
    setConfig((prev) => ({ ...prev, mode }));
  };

  const handleAccent = (hex: string) => {
    setHexDraft(hex);
    if (isValidHexColor(hex)) {
      setConfig((prev) => ({ ...prev, accentHex: hex.toUpperCase() }));
    }
  };

  const handleReset = () => {
    setTheme('dark');
    setConfig(DEFAULT_CUSTOM_THEME);
    setHexDraft(DEFAULT_CUSTOM_THEME.accentHex);
    setApplyToSite(false);
    if (typeof document !== 'undefined') {
      document.documentElement.style.removeProperty('--nt-accent');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputCode);
      setCopiedKey(outputTab);
      window.setTimeout(() => setCopiedKey(null), 1600);
    } catch {
      setCopiedKey(null);
    }
  };

  const handleDownloadCss = () => {
    const blob = new Blob([generateCustomThemeCss(config)], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nthgui.css';
    a.click();
    URL.revokeObjectURL(url);
  };

  const previewPalette = THEMES[config.mode];
  const previewPadding = DENSITY_PROFILES.find((d) => d.value === config.density)?.pad ?? '16px';

  return (
    <div className="space-y-6">
      {/* Mode & Controls */}
      <section id="tokens-mode" className="scroll-mt-20 grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="xl:col-span-6 space-y-5 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--nt-line)] pb-3">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-[var(--nt-accent)]" />
              <h2 className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--nt-display)]">
                Live Theme &amp; Token Customizer
              </h2>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <ArrowCounterClockwise className="h-3.5 w-3.5" />
              Reset
            </Button>
          </div>

          {/* Base Mode */}
          <div className="space-y-2">
            <div className="font-mono text-[11px] text-[var(--nt-secondary)]">Base Theme Mode</div>
            <div className="grid grid-cols-3 gap-1.5">
              {(['dark', 'light', 'high-contrast'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={config.mode === m}
                  onClick={() => handleMode(m)}
                  className={cn(
                    'rounded-lg border px-3 py-2 font-mono text-xs transition-colors cursor-pointer whitespace-nowrap',
                    config.mode === m
                      ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                      : 'border-[var(--nt-line)] bg-[var(--nt-bg)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
                  )}
                >
                  {m === 'high-contrast' ? 'High Contrast' : m === 'dark' ? 'OLED Dark' : 'Light Paper'}
                </button>
              ))}
            </div>
          </div>

          {/* Signal Accent */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-[var(--nt-secondary)]">Signal Accent Token (--nt-accent)</span>
              <span className="tabular-nums text-[var(--nt-display)]">{config.accentHex}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {ACCENT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  aria-pressed={config.accentHex.toUpperCase() === preset.hex}
                  onClick={() => handleAccent(preset.hex)}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 font-mono text-[11px] cursor-pointer',
                    config.accentHex.toUpperCase() === preset.hex
                      ? 'border-[var(--nt-display)] bg-[var(--nt-raised)] text-[var(--nt-display)]'
                      : 'border-[var(--nt-line)] bg-[var(--nt-bg)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="h-3 w-3 rounded-full border border-white/20"
                    style={{ backgroundColor: preset.hex }}
                  />
                  {preset.label}
                </button>
              ))}
              <input
                type="text"
                aria-label="Custom accent hex color"
                value={hexDraft}
                onChange={(e) => handleAccent(e.target.value)}
                placeholder="#D71921"
                className="h-8 w-24 rounded-lg border border-[var(--nt-line-2)] bg-[var(--nt-bg)] px-2 font-mono text-xs text-[var(--nt-display)] focus:border-[var(--nt-display)] focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] tabular-nums text-[var(--nt-muted)]">
              <span>Dark Contrast: {contrast.onDarkBg}:1</span>
              <span aria-hidden="true">·</span>
              <span>Light Contrast: {contrast.onLightBg}:1</span>
              <span aria-hidden="true">·</span>
              <span className={contrast.meetsAAOnSurface ? 'text-[var(--nt-success)]' : 'text-[var(--nt-accent)]'}>
                {contrast.meetsAAOnSurface ? 'WCAG AA UI Pass' : 'Low Surface Contrast'}
              </span>
            </div>
          </div>

          {/* Radius Scale */}
          <div className="space-y-2">
            <div className="font-mono text-[11px] text-[var(--nt-secondary)]">Corner Radius Scale</div>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {RADIUS_PROFILES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  aria-pressed={config.radiusPx === r.value}
                  onClick={() => setConfig((prev) => ({ ...prev, radiusPx: r.value }))}
                  className={cn(
                    'rounded-lg border px-2 py-1.5 font-mono text-[11px] whitespace-nowrap cursor-pointer',
                    config.radiusPx === r.value
                      ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                      : 'border-[var(--nt-line)] bg-[var(--nt-bg)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Density & Live Site Apply */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <div className="font-mono text-[11px] text-[var(--nt-secondary)]">Surface Density</div>
              <div className="grid grid-cols-3 gap-1">
                {DENSITY_PROFILES.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    aria-pressed={config.density === d.value}
                    onClick={() => setConfig((prev) => ({ ...prev, density: d.value }))}
                    className={cn(
                      'rounded-md border py-1 font-mono text-[11px] cursor-pointer',
                      config.density === d.value
                        ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                        : 'border-[var(--nt-line)] bg-[var(--nt-bg)] text-[var(--nt-secondary)]',
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-end gap-2">
              <NothingSwitch
                label="Apply Accent Live to Site"
                checked={applyToSite}
                onCheckedChange={setApplyToSite}
              />
            </div>
          </div>
        </div>

        {/* Live Customizer Preview Canvas */}
        <div
          id="tokens-swatches"
          data-testid="theme-customizer-preview"
          className="scroll-mt-20 xl:col-span-6 flex flex-col justify-between gap-4 border p-6"
          style={{
            backgroundColor: previewPalette.background,
            borderColor: previewPalette.borderStrong,
            borderRadius: `${config.radiusPx}px`,
            color: previewPalette.foreground,
            ['--nt-accent' as string]: config.accentHex,
          }}
        >
          <div className="flex items-center justify-between font-mono text-[11px]" style={{ color: previewPalette.foregroundMuted }}>
            <span>Live Token Preview · {config.mode}</span>
            <span className="tabular-nums">r={config.radiusPx}px · pad={previewPadding}</span>
          </div>

          <div
            className="space-y-4 border"
            style={{
              backgroundColor: previewPalette.surface,
              borderColor: previewPalette.border,
              borderRadius: `${Math.max(0, config.radiusPx - 4)}px`,
              padding: previewPadding,
            }}
          >
            <div className="space-y-1">
              <div className="font-mono text-[11px]" style={{ color: config.accentHex }}>
                nthgui · Single Package Theme
              </div>
              <div className="font-display text-2xl" style={{ color: previewPalette.foreground }}>
                Hardware Interface System
              </div>
              <p className="text-xs leading-relaxed" style={{ color: previewPalette.foregroundSecondary }}>
                Zero external theme dependencies. Export this Tailwind v4 stylesheet directly into your app.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="px-4 py-2 font-mono text-xs font-medium"
                style={{
                  backgroundColor: config.accentHex,
                  color: contrast.recommendedFg,
                  borderRadius: `${Math.max(0, Math.round(config.radiusPx * 0.5))}px`,
                }}
              >
                Primary Signal CTA
              </button>
              <button
                type="button"
                className="border px-4 py-2 font-mono text-xs"
                style={{
                  borderColor: previewPalette.borderStrong,
                  color: previewPalette.foreground,
                  borderRadius: `${Math.max(0, Math.round(config.radiusPx * 0.5))}px`,
                }}
              >
                Secondary Outline
              </button>
            </div>

            <NothingSlider label="Accent Gain" defaultValue={72} unit="%" />
          </div>

          <div className="grid grid-cols-4 gap-2 font-mono text-[10px]">
            {[
              { name: 'bg', hex: previewPalette.background },
              { name: 'surface', hex: previewPalette.surface },
              { name: 'line', hex: previewPalette.borderStrong },
              { name: 'accent', hex: config.accentHex },
            ].map((sw) => (
              <div
                key={sw.name}
                className="rounded-lg border p-2"
                style={{ borderColor: previewPalette.border, backgroundColor: previewPalette.surface }}
              >
                <div className="mb-1.5 h-5 w-full rounded" style={{ backgroundColor: sw.hex }} />
                <div style={{ color: previewPalette.foreground }}>{sw.name}</div>
                <div style={{ color: previewPalette.foregroundMuted }}>{sw.hex}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exportable CSS / components.json / tokens.json */}
      <section id="tokens-output" className="scroll-mt-20 space-y-3 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] p-0.5 font-mono text-xs">
            {(
              [
                { id: 'css', label: 'nthgui.css (Tailwind v4)' },
                { id: 'components', label: 'components.json' },
                { id: 'json', label: 'tokens.json' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={outputTab === t.id}
                onClick={() => setOutputTab(t.id)}
                className={cn(
                  'rounded-md px-3 py-1 cursor-pointer whitespace-nowrap',
                  outputTab === t.id
                    ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                    : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadCss}>
              <DownloadSimple className="h-3.5 w-3.5" />
              Download CSS
            </Button>
            <Button variant="primary" size="sm" onClick={handleCopy}>
              {copiedKey === outputTab ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedKey === outputTab ? 'Copied' : 'Copy Output'}
            </Button>
          </div>
        </div>

        <pre
          data-testid="theme-export-code"
          className="max-h-72 overflow-auto rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-4 font-mono text-xs leading-relaxed text-[var(--nt-primary)]"
        >
          <code>{outputCode}</code>
        </pre>
      </section>
    </div>
  );
}
