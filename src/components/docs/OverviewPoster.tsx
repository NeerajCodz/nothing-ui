import * as React from 'react';
import { ArrowRight, Moon, Sun } from 'lucide-react';
import { NothingButton } from '@/components/nothing/Button';
import { CopyField } from '@/components/nothing/Input';
import {
  NothingOTPInput,
  NothingSegmentedControl,
  NothingSlider,
  NothingSwitch,
  RotaryKnob,
} from '@/components/nothing/Controls';
import { DotIcon } from '@/components/nothing/DotIcon';
import { GlyphMatrix } from '@/components/nothing/GlyphMatrix';
import { DotLoader, SegmentedBar } from '@/components/nothing/Feedback';
import { ActivityStream } from '@/components/nothing/DataDisplay';
import {
  DOT_ICON_NAMES,
} from '@/lib/dot-icons';
import { GLYPH_PRESETS, type GlyphPresetId } from '@/lib/glyph-matrix';
import { REGISTRY_COMPONENTS } from '@/lib/registry';
import { cn } from '@/lib/utils';
import type { AppSection } from './TopNav';

interface OverviewPosterProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onSelectComponent: (componentId: string) => void;
  onNavigate: (section: AppSection) => void;
}

const COLOR_SWATCHES = [
  { name: 'Black', hex: '#000000' },
  { name: 'Dark', hex: '#171717' },
  { name: 'Grey', hex: '#2A2A2A' },
  { name: 'Light', hex: '#5A5A5A' },
  { name: 'White', hex: '#FFFFFF' },
];

export function OverviewPoster({
  theme,
  onToggleTheme,
  onSelectComponent,
  onNavigate,
}: OverviewPosterProps) {
  const [heroGlyph, setHeroGlyph] = React.useState<GlyphPresetId>('power');

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Compact Workspace Toolbar: Theme Toggle + Registry Meta */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--nt-line)] pb-4">
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-[var(--nt-muted)]">
          <span className="text-[var(--nt-primary)]">{REGISTRY_COMPONENTS.length} Components</span>
          <span aria-hidden="true">·</span>
          <span>@ui-sdk/react primitives</span>
          <span aria-hidden="true">·</span>
          <span>35 Dot Icons</span>
          <span aria-hidden="true">·</span>
          <span>25×25 Glyph Matrix</span>
        </div>

        <div className="inline-flex items-center gap-1 rounded-full border border-[var(--nt-line-2)] bg-[var(--nt-surface)] p-1">
          <button
            type="button"
            aria-pressed={theme === 'dark'}
            onClick={() => theme !== 'dark' && onToggleTheme()}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] transition-colors cursor-pointer whitespace-nowrap',
              theme === 'dark'
                ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]'
            )}
          >
            <Moon className="h-3 w-3" />
            <span>Dark</span>
          </button>
          <button
            type="button"
            aria-pressed={theme === 'light'}
            onClick={() => theme !== 'light' && onToggleTheme()}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] transition-colors cursor-pointer whitespace-nowrap',
              theme === 'light'
                ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]'
            )}
          >
            <Sun className="h-3 w-3" />
            <span>Light</span>
          </button>
        </div>
      </div>

      {/* Poster Grid — Directly inspired by vibe-nothing-ui-design 12-column hairline modules */}
      <section aria-label="Nothing UI design system poster" className="grid grid-cols-1 gap-3.5 md:grid-cols-12">
        {/* Masthead Module */}
        <div className="nt-card-surface flex flex-col justify-between rounded-2xl p-6 md:col-span-5 lg:col-span-4">
          <div>
            <h1 className="font-display text-3xl sm:text-[40px] font-medium leading-[1.02] tracking-[0.04em] text-[var(--nt-display)] [text-wrap:balance]">
              Nothing UI Registry
            </h1>
            <p className="mt-5 max-w-[36ch] text-sm leading-relaxed text-[var(--nt-secondary)]">
              Open-source monochrome React component library and copy-paste registry built on
              headless <span className="font-mono text-xs text-[var(--nt-primary)]">ui-sdk</span>{' '}
              behaviors, dot-matrix display typography, and a single Signal Red accent.
            </p>
          </div>
          <div className="mt-6 space-y-4">
            <CopyField value="npx nthgui init" />
            <div className="flex flex-wrap items-center gap-2.5">
              <NothingButton variant="primary" onClick={() => onNavigate('components')}>
                <span>Browse Components</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </NothingButton>
              <NothingButton variant="outline" onClick={() => onNavigate('widgets')}>
                Nothing OS Widgets
              </NothingButton>
            </div>
          </div>
        </div>

        {/* 01 Color System Module */}
        <div className="nt-card-surface flex flex-col justify-between rounded-2xl p-6 md:col-span-7 lg:col-span-4">
          <div>
            <div className="mb-5 flex items-baseline justify-between">
              <div className="flex items-baseline gap-2.5">
                <span className="font-display text-xs text-[var(--nt-secondary)]">01</span>
                <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--nt-primary)]">
                  Color System
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('foundations')}
                className="font-mono text-[10px] text-[var(--nt-muted)] hover:text-[var(--nt-display)] cursor-pointer"
              >
                Tokens →
              </button>
            </div>
            <div className="flex flex-wrap gap-3.5">
              {COLOR_SWATCHES.map((sw) => (
                <div key={sw.hex} className="text-center">
                  <div
                    className="mx-auto mb-2 h-11 w-11 rounded-full border border-[var(--nt-line-2)]"
                    style={{ backgroundColor: sw.hex }}
                  />
                  <div className="font-mono text-[10px] text-[var(--nt-primary)]">{sw.name}</div>
                  <div className="font-mono text-[9px] text-[var(--nt-muted)]">{sw.hex}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 flex items-center gap-4 border-t border-[var(--nt-line)] pt-5">
            <div className="h-14 w-14 shrink-0 rounded-full bg-[#D71921]" />
            <div>
              <div className="font-mono text-xs text-[var(--nt-display)]">Signal Red</div>
              <div className="font-mono text-[11px] text-[var(--nt-muted)]">#D71921</div>
              <p className="mt-1 text-xs text-[var(--nt-secondary)]">
                Reserved for active alerts, recording cues, and primary interrupts.
              </p>
            </div>
          </div>
        </div>

        {/* 02 Typography & 03 Iconography Module */}
        <div className="nt-card-surface flex flex-col justify-between rounded-2xl p-6 md:col-span-12 lg:col-span-4">
          <div className="space-y-5">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2.5">
                <span className="font-display text-xs text-[var(--nt-secondary)]">02</span>
                <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--nt-primary)]">
                  Typography · 9×9 Icons
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onSelectComponent('dot-icons')}
                className="font-mono text-[10px] text-[var(--nt-muted)] hover:text-[var(--nt-display)] cursor-pointer"
              >
                35 Icons →
              </button>
            </div>
            <div className="flex items-end justify-between border-b border-[var(--nt-line)] pb-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
                  Display · Doto
                </div>
                <div className="font-display text-4xl text-[var(--nt-display)]">Aa 0123</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
                  UI · Plus Jakarta
                </div>
                <div className="text-2xl font-semibold tracking-tight text-[var(--nt-display)]">
                  Headline
                </div>
              </div>
            </div>
            <div className="grid grid-cols-8 gap-3 text-[var(--nt-primary)]">
              {DOT_ICON_NAMES.slice(0, 16).map((name) => (
                <button
                  key={name}
                  type="button"
                  title={name}
                  aria-label={`Inspect ${name} dot icon`}
                  onClick={() => onSelectComponent('dot-icons')}
                  className="flex items-center justify-center rounded-md p-1.5 transition-colors hover:bg-[var(--nt-raised)] hover:text-[#D71921] cursor-pointer"
                >
                  <DotIcon name={name} size={18} />
                </button>
              ))}
            </div>
          </div>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
            Monospace · JetBrains Mono · Tabular numerals enforced
          </p>
        </div>

        {/* 05 Interactive Controls Row */}
        <div className="nt-card-surface rounded-2xl p-6 md:col-span-6 lg:col-span-4 space-y-5">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2.5">
              <span className="font-display text-xs text-[var(--nt-secondary)]">05</span>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--nt-primary)]">
                Switches &amp; Sliders
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onSelectComponent('slider')}
              className="font-mono text-[10px] text-[var(--nt-muted)] hover:text-[var(--nt-display)] cursor-pointer"
            >
              Inspect →
            </button>
          </div>
          <div className="space-y-4">
            <NothingSwitch defaultChecked label="Glyph Interface" />
            <NothingSwitch defaultChecked tone="signal" label="Signal Alert Channel" />
            <NothingSlider label="Matrix Output" defaultValue={64} unit="%" />
          </div>
        </div>

        {/* 40 Canonical 25x25 Glyph Matrix Interactive Module */}
        <div className="nt-card-surface rounded-2xl p-6 md:col-span-6 lg:col-span-5 flex flex-col justify-between">
          <div className="flex items-baseline justify-between mb-4">
            <div className="flex items-baseline gap-2.5">
              <span className="font-display text-xs text-[var(--nt-secondary)]">40</span>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--nt-primary)]">
                Glyph Matrix · 25×25 Circular Mask
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onSelectComponent('glyph-matrix')}
              className="font-mono text-[10px] text-[var(--nt-muted)] hover:text-[var(--nt-display)] cursor-pointer"
            >
              Open Editor →
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <GlyphMatrix preset={heroGlyph} size={160} />
            <div className="flex-1 space-y-3">
              <p className="text-xs leading-relaxed text-[var(--nt-secondary)]">
                Matches Phone (3) circular LED geometry. 489 addressable dots with white primary
                LEDs and Signal Red active glyphs.
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {GLYPH_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setHeroGlyph(p.id)}
                    className={cn(
                      'rounded border px-2 py-1 font-mono text-[10px] transition-colors cursor-pointer',
                      heroGlyph === p.id
                        ? 'border-[var(--nt-inverse-bg)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                        : 'border-[var(--nt-line-2)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)]'
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 41 Rotary Knob + 42 Dot Loader */}
        <div className="nt-card-surface rounded-2xl p-6 md:col-span-12 lg:col-span-3 flex flex-col justify-between">
          <div className="flex items-baseline justify-between mb-4">
            <div className="flex items-baseline gap-2.5">
              <span className="font-display text-xs text-[var(--nt-secondary)]">41</span>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--nt-primary)]">
                Rotary · Loader
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onSelectComponent('rotary-knob')}
              className="font-mono text-[10px] text-[var(--nt-muted)] hover:text-[var(--nt-display)] cursor-pointer"
            >
              Inspect →
            </button>
          </div>
          <div className="flex items-center justify-around gap-4 py-2">
            <RotaryKnob label="GAIN" defaultValue={55} />
            <DotLoader label="SYNC" />
          </div>
        </div>

        {/* 43 Verification Code + 30 Segmented */}
        <div className="nt-card-surface rounded-2xl p-6 md:col-span-6 lg:col-span-5 space-y-5">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2.5">
              <span className="font-display text-xs text-[var(--nt-secondary)]">43</span>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--nt-primary)]">
                Verification Code · Segmented
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onSelectComponent('otp-input')}
              className="font-mono text-[10px] text-[var(--nt-muted)] hover:text-[var(--nt-display)] cursor-pointer"
            >
              @ui-sdk/react/otp-input →
            </button>
          </div>
          <NothingOTPInput length={6} defaultValue="2048" />
          <div className="pt-2">
            <NothingSegmentedControl
              defaultValue="week"
              options={[
                { value: 'day', label: 'Day' },
                { value: 'week', label: 'Week' },
                { value: 'month', label: 'Month' },
              ]}
            />
          </div>
        </div>

        {/* 19 Segmented Battery + 45 Activity Stream */}
        <div className="nt-card-surface rounded-2xl p-6 md:col-span-6 lg:col-span-7 space-y-5">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2.5">
              <span className="font-display text-xs text-[var(--nt-secondary)]">45</span>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--nt-primary)]">
                Telemetry · Activity Stream
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onSelectComponent('timeline')}
              className="font-mono text-[10px] text-[var(--nt-muted)] hover:text-[var(--nt-display)] cursor-pointer"
            >
              Inspect →
            </button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 items-center">
            <div className="space-y-4">
              <SegmentedBar label="Ear (a) Reserve" total={16} filled={13} />
              <SegmentedBar label="Glyph Thermal Headroom" total={16} filled={11} tone="signal" />
            </div>
            <ActivityStream />
          </div>
        </div>
      </section>

      {/* Complete Component Index Directory */}
      <section aria-labelledby="directory-heading" className="space-y-5 pt-4">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--nt-line)] pb-4">
          <div>
            <h2
              id="directory-heading"
              className="font-display text-2xl sm:text-3xl text-[var(--nt-display)]"
            >
              Full Component Registry
            </h2>
            <p className="mt-1 text-sm text-[var(--nt-secondary)]">
              Click any module to inspect live demos, copy source code, or grab its CLI command.
            </p>
          </div>
          <NothingButton variant="outline" size="sm" onClick={() => onNavigate('components')}>
            Open Docs Explorer
          </NothingButton>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {REGISTRY_COMPONENTS.map((comp) => (
            <button
              key={comp.id}
              type="button"
              onClick={() => onSelectComponent(comp.id)}
              className="nt-card-surface group flex flex-col justify-between rounded-xl p-4 text-left transition-colors hover:border-[var(--nt-display)] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D71921]"
            >
              <div>
                <div className="flex items-center justify-between font-mono text-[10px] text-[var(--nt-muted)]">
                  <span className="font-display text-xs text-[var(--nt-secondary)]">
                    {comp.number}
                  </span>
                  <span>{comp.category}</span>
                </div>
                <div className="mt-2 font-mono text-sm font-medium text-[var(--nt-display)] group-hover:text-[#D71921] transition-colors">
                  {comp.name}
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[var(--nt-secondary)]">
                  {comp.summary}
                </p>
              </div>
              <div className="mt-4 font-mono text-[10px] text-[var(--nt-muted)]">
                {comp.uiSdkPrimitive ?? 'Nothing Hardware Core'}
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
