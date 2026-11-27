import * as React from 'react';
import {
  ArrowRight,
  Bell,
  Check,
  Copy,
  Gear,
  MagnifyingGlass,
  SlidersHorizontal,
  WifiHigh,
} from '@phosphor-icons/react';
import {
  GLYPH_PRESETS,
  countAddressable,
  getPreset,
  type GlyphPresetId,
  type GlyphResolution,
} from '@nothing-ui/core';
import { DotIcon } from '@nothing-ui/dot-icons/react';
import {
  CATALOG,
  PLANNED_WIDGETS,
  countCompleteInventory,
  getChartsCatalog,
  getComponentCatalog,
  getPublicImportPath,
  getWidgetCatalog,
} from '@nothing-ui/registry';
import {
  Button,
  GlyphMatrix,
  LEDIndicator,
  NothingDotLoader,
  NothingRotaryKnob,
  NothingSlider,
  NothingSwitch,
  SignalMeter,
  cn,
  useTheme,
} from '@nothing-ui/ui';

export function OverviewShowcase({
  onSelectComponent,
  onNavigate,
  onOpenRoadmap,
  onOpenCliSetup,
}: {
  onSelectComponent: (slug: string) => void;
  onNavigate: (section: 'components' | 'charts' | 'widgets' | 'docs' | 'icons' | 'studio' | 'showcase') => void;
  onOpenRoadmap?: () => void;
  onOpenCliSetup?: () => void;
}) {
  const { theme, setTheme } = useTheme();
  const [resolution, setResolution] = React.useState<GlyphResolution>(25);
  const [preset, setPreset] = React.useState<GlyphPresetId>('power');
  const [cells, setCells] = React.useState(() => getPreset('power', 25));
  const [installMode, setInstallMode] = React.useState<'cli' | 'package'>('cli');
  const [copied, setCopied] = React.useState(false);

  const installCommand =
    installMode === 'cli' ? 'npx nthgui init' : 'npm install nthgui';

  const handleResolution = (next: GlyphResolution) => {
    setResolution(next);
    setCells(getPreset(preset, next));
  };

  const handlePreset = (id: GlyphPresetId) => {
    setPreset(id);
    setCells(getPreset(id, resolution));
  };

  const handleCopyInstall = async () => {
    try {
      await navigator.clipboard.writeText(installCommand);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const inventory = React.useMemo(() => countCompleteInventory(), []);
  const componentCount = React.useMemo(() => getComponentCatalog().length, []);
  const chartCount = React.useMemo(() => getChartsCatalog().length, []);
  const widgetCount = React.useMemo(() => getWidgetCatalog().length, []);

  return (
    <div className="space-y-10">
      {/* Metadata & Theme Switch Row (Zero pills, unboxed metadata) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--nt-line)] pb-4">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-xs text-[var(--nt-muted)]">
          <span className="text-[var(--nt-display)]">
            {componentCount} Components ({chartCount} Charts)
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {widgetCount} Live Widgets
            {PLANNED_WIDGETS.length > 0 ? ` (+${PLANNED_WIDGETS.length} Planned)` : ''}
          </span>
          <span aria-hidden="true">·</span>
          <span>Standalone Glyph</span>
          <span aria-hidden="true">·</span>
          <span>
            {inventory.shipped} Shipped · {CATALOG.length}/{CATALOG.length} Web + Native
          </span>
        </div>

        <div
          role="group"
          aria-label="Theme mode"
          className="inline-flex items-center rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-1 font-mono text-xs"
        >
          {(
            [
              { id: 'dark', label: 'Dark' },
              { id: 'light', label: 'Light' },
              { id: 'high-contrast', label: 'High Contrast' },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={theme === m.id}
              onClick={() => setTheme(m.id)}
              className={cn(
                'rounded-lg px-3 py-1 transition-colors whitespace-nowrap cursor-pointer',
                theme === m.id
                  ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]'
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Split: Editorial Manifesto + Live Interactive 25x25 / 13x13 Glyph Matrix */}
      <section id="ov-intro" className="scroll-mt-20 grid grid-cols-1 gap-6 xl:grid-cols-12 items-stretch">
        <div className="xl:col-span-7 flex flex-col justify-between rounded-2xl nt-card-surface p-7 sm:p-9 space-y-6">
          <div className="space-y-4">
            <h1 className="font-display text-4xl sm:text-5xl leading-[1.04] tracking-[0.02em] text-[var(--nt-display)] text-balance">
              Nothing UI Design System
            </h1>
            <p className="max-w-xl text-sm sm:text-base leading-relaxed text-[var(--nt-secondary)]">
              Modular React and React Native component ecosystem published through a single npm package
              (<code className="font-mono text-xs text-[var(--nt-display)]">nthgui</code>) — zero extra
              scoped installs, live Props Playground, 10 Showcase experiences, 35 9×9 Dot Icons, and 13×13 / 25×25 Glyph Matrices.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2 rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex shrink-0 rounded-lg bg-[var(--nt-raised)] p-0.5 font-mono text-[11px]">
                  <button
                    type="button"
                    aria-pressed={installMode === 'cli'}
                    onClick={() => setInstallMode('cli')}
                    className={cn(
                      'whitespace-nowrap shrink-0 rounded-md px-2.5 py-0.5 cursor-pointer',
                      installMode === 'cli'
                        ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                        : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
                    )}
                  >
                    CLI (Default)
                  </button>
                  <button
                    type="button"
                    aria-pressed={installMode === 'package'}
                    onClick={() => setInstallMode('package')}
                    className={cn(
                      'whitespace-nowrap shrink-0 rounded-md px-2.5 py-0.5 cursor-pointer',
                      installMode === 'package'
                        ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                        : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
                    )}
                  >
                    Package
                  </button>
                </div>
                <span className="font-mono text-[10px] text-[var(--nt-muted)]">
                  Single npm package · 0 extra installs
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] px-3.5 py-2">
                <code className="truncate font-mono text-xs text-[var(--nt-display)]">
                  {installCommand}
                </code>
                <Button variant="primary" size="sm" onClick={handleCopyInstall}>
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button variant="primary" size="md" onClick={() => onNavigate('components')}>
                Components ({componentCount}) <ArrowRight className="h-3.5 w-3.5" weight="bold" />
              </Button>
              <Button variant="signal" size="md" onClick={() => onNavigate('widgets')}>
                Widgets ({widgetCount}
                {PLANNED_WIDGETS.length > 0 ? ` + ${PLANNED_WIDGETS.length}` : ''})
              </Button>
              <Button variant="outline" size="md" onClick={() => onNavigate('studio')}>
                Glyph System
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => (onOpenCliSetup ? onOpenCliSetup() : onNavigate('docs'))}
              >
                CLI &amp; Setup
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={() => (onOpenRoadmap ? onOpenRoadmap() : onNavigate('docs'))}
              >
                136-Component Map
              </Button>
            </div>
          </div>
        </div>

        {/* Hero Interactive 25x25 <-> 13x13 Glyph Matrix */}
        <div id="ov-glyph" className="scroll-mt-20 xl:col-span-5 flex flex-col justify-between rounded-2xl nt-card-surface p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-[var(--nt-display)]">
              GlyphMatrix · {resolution}×{resolution}
            </span>
            <div className="inline-flex rounded-lg border border-[var(--nt-line)] p-0.5">
              {([25, 13] as const).map((res) => (
                <button
                  key={res}
                  type="button"
                  aria-pressed={resolution === res}
                  onClick={() => handleResolution(res)}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-[11px] cursor-pointer',
                    resolution === res
                      ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                      : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]'
                  )}
                >
                  {res}×{res}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <GlyphMatrix
              resolution={resolution}
              cells={cells}
              onCellsChange={setCells}
              interactive
              paintState={preset === 'live' ? 'signal' : 'on'}
              size={200}
              label="Homepage interactive Glyph Matrix"
            />
            <div className="grid w-full max-w-[320px] grid-cols-4 gap-1.5">
              {GLYPH_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePreset(p.id)}
                  className={cn(
                    'rounded-md border px-2 py-1 text-center font-mono text-[11px] transition-colors cursor-pointer',
                    preset === p.id
                      ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                      : 'border-[var(--nt-line)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)]'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[var(--nt-line)] pt-3 font-mono text-[11px] text-[var(--nt-muted)]">
            <span>{countAddressable(resolution)} addressable LEDs · Click or drag to paint</span>
            <button
              type="button"
              onClick={() => onNavigate('studio')}
              className="text-[var(--nt-display)] hover:underline cursor-pointer"
            >
              Studio →
            </button>
          </div>
        </div>
      </section>

      {/* Live Library Proof Row: Controls + Phosphor vs Dot Icons + Hardware Encoders */}
      <section id="ov-proof" className="scroll-mt-20 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Card 1: Real Interactive Controls */}
        <div className="rounded-2xl nt-card-surface p-6 space-y-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--nt-display)]">
              01. Headless Controls
            </h2>
            <button
              type="button"
              onClick={() => onSelectComponent('slider')}
              className="font-mono text-xs text-[var(--nt-muted)] hover:text-[var(--nt-display)] cursor-pointer"
            >
              Inspect →
            </button>
          </div>

          <div className="space-y-4">
            <NothingSwitch label="Glyph Matrix Sync" defaultChecked />
            <NothingSwitch label="Signal Red Interrupt" tone="signal" defaultChecked />
            <NothingSlider label="Matrix Output" defaultValue={64} unit="%" />
          </div>

          <p className="font-mono text-[11px] text-[var(--nt-muted)]">
            Powered by @ui-sdk/react with keyboard & ARIA primitives.
          </p>
        </div>

        {/* Card 2: Phosphor Ordinary vs @nothing-ui/dot-icons */}
        <div className="rounded-2xl nt-card-surface p-6 space-y-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--nt-display)]">
              02. Dual Icon Architecture
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('icons')}
              className="font-mono text-xs text-[var(--nt-muted)] hover:text-[var(--nt-display)] cursor-pointer"
            >
              1,691 Dot Icons →
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
                Ordinary UI Chrome · @phosphor-icons/react
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] px-4 py-3 text-[var(--nt-display)]">
                <WifiHigh className="h-5 w-5" />
                <Bell className="h-5 w-5" />
                <MagnifyingGlass className="h-5 w-5" />
                <Gear className="h-5 w-5" />
                <SlidersHorizontal className="h-5 w-5" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
                Signature Dotted Identity · nthgui/icons
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] px-4 py-3 text-[var(--nt-display)]">
                <DotIcon name="wifi" size={20} decorative />
                <DotIcon name="bell" size={20} decorative />
                <DotIcon name="search" size={20} decorative />
                <DotIcon name="gear" size={20} decorative />
                <DotIcon name="bolt" size={20} color="#D71921" decorative />
              </div>
            </div>
          </div>

          <p className="font-mono text-[11px] text-[var(--nt-muted)]">
            Tree-shakeable subpath export included inside nthgui.
          </p>
        </div>

        {/* Card 3: Nothing Exclusive Hardware Controls */}
        <div className="rounded-2xl nt-card-surface p-6 space-y-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--nt-display)]">
              03. Hardware Exclusive
            </h2>
            <button
              type="button"
              onClick={() => onSelectComponent('hardware-kit')}
              className="font-mono text-xs text-[var(--nt-muted)] hover:text-[var(--nt-display)] cursor-pointer"
            >
              Inspect →
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] px-3.5 py-2.5">
              <LEDIndicator tone="signal" cadence="pulse" label="LIVE" />
              <SignalMeter strength={4} label="5G" />
            </div>
            <div className="flex items-center justify-around py-1">
              <NothingRotaryKnob label="GAIN" defaultValue={55} />
              <NothingDotLoader label="SYNC" />
            </div>
          </div>

          <p className="font-mono text-[11px] text-[var(--nt-muted)]">
            All 22 Nothing UI Exclusive components shipped across Families 14–16.
          </p>
        </div>
      </section>

      {/* What Ships Today: Package & Component Status Index */}
      <section id="ov-catalog" className="scroll-mt-20 space-y-4 border-t border-[var(--nt-line)] pt-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-[var(--nt-display)]">
              Shipped Component Catalog
            </h2>
            <p className="mt-1 text-xs text-[var(--nt-secondary)]">
              Every module below has a live demo, source-backed code tab, API table, and keyboard contract.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => onNavigate('components')}>
            Open Full Explorer
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CATALOG.slice(0, 12).map((entry) => (
            <button
              key={entry.slug}
              type="button"
              onClick={() => onSelectComponent(entry.slug)}
              className="group flex flex-col justify-between rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-4 text-left transition-colors hover:border-[var(--nt-display)] cursor-pointer"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[10px] text-[var(--nt-muted)]">
                  <span>{entry.moduleNumber} · {entry.category}</span>
                  <span className="text-[var(--nt-success)]">{entry.web}</span>
                </div>
                <div className="font-mono text-sm font-medium text-[var(--nt-display)] group-hover:underline">
                  {entry.title}
                </div>
                <p className="line-clamp-2 text-xs leading-relaxed text-[var(--nt-secondary)]">
                  {entry.description}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-[var(--nt-muted)]">
                <span>{getPublicImportPath(entry)}</span>
                <span>{entry.native === 'stable' ? 'Native' : `Native: ${entry.native}`}</span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
