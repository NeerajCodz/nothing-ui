import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import { renderComponentDemo } from './ComponentDemos';
import { appToaster } from '@/components/nothing/Overlays';

const NEUTRAL_TOKENS = [
  { name: 'Black', token: '--nt-bg (dark)', hex: '#000000' },
  { name: 'Surface', token: '--nt-surface (dark)', hex: '#111111' },
  { name: 'Dark', token: '--nt-raised (dark)', hex: '#1B1B1B' },
  { name: 'Grey', token: '--nt-line-2 (dark)', hex: '#333333' },
  { name: 'Muted', token: '--nt-muted', hex: '#737373' },
  { name: 'Paper', token: '--nt-bg (light)', hex: '#F4F4F4' },
  { name: 'White', token: '--nt-display (dark)', hex: '#FFFFFF' },
];

const SPACING_SCALE = [4, 8, 12, 16, 24, 32, 40, 48, 56, 64, 72, 80, 96, 128];

export function FoundationsView() {
  const [copiedHex, setCopiedHex] = React.useState<string | null>(null);
  const [sampleText, setSampleText] = React.useState('ENGINEERED CLARITY · 0123456789');

  const handleCopyHex = (hex: string) => {
    navigator.clipboard?.writeText(hex).catch(() => {});
    setCopiedHex(hex);
    appToaster(`Copied ${hex}`, { description: 'Color value copied to clipboard.' });
    window.setTimeout(() => setCopiedHex(null), 1500);
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      <div className="space-y-2 border-b border-[var(--nt-line)] pb-6">
        <div className="font-mono text-xs text-[var(--nt-muted)]">
          Design Tokens · Architecture · Iconography
        </div>
        <h1 className="font-display text-3xl sm:text-4xl text-[var(--nt-display)]">
          Foundations
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--nt-secondary)]">
          Every surface, radius, typographic scale, sparse dot field, and LED grid in Nothing UI
          reads from one minimal set of semantic monochrome tokens.
        </p>
      </div>

      {/* 01 Color System */}
      <section aria-labelledby="f-color" className="nt-card-surface rounded-2xl p-6 space-y-6">
        <div className="flex items-baseline gap-2.5">
          <span className="font-display text-xs text-[var(--nt-secondary)]">01</span>
          <h2 id="f-color" className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--nt-display)]">
            Color System · Click any swatch to copy
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {NEUTRAL_TOKENS.map((sw) => (
            <button
              key={sw.hex}
              type="button"
              onClick={() => handleCopyHex(sw.hex)}
              className="group flex flex-col items-center rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-3.5 text-center transition-colors hover:border-[var(--nt-display)] cursor-pointer"
            >
              <span
                className="h-12 w-12 rounded-full border border-[var(--nt-line-2)]"
                style={{ backgroundColor: sw.hex }}
              />
              <span className="mt-3 font-mono text-xs text-[var(--nt-display)]">{sw.name}</span>
              <span className="mt-0.5 inline-flex items-center gap-1 font-mono text-[10px] text-[var(--nt-muted)]">
                {copiedHex === sw.hex ? <Check className="h-3 w-3" /> : <Copy className="h-2.5 w-2.5 opacity-60" />}
                {sw.hex}
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleCopyHex('#D71921')}
            className="group flex flex-col items-center rounded-xl border border-[#D71921]/40 bg-[#D71921]/10 p-3.5 text-center transition-colors hover:border-[#D71921] cursor-pointer"
          >
            <span className="h-12 w-12 rounded-full bg-[#D71921]" />
            <span className="mt-3 font-mono text-xs text-[var(--nt-display)]">Signal Red</span>
            <span className="mt-0.5 inline-flex items-center gap-1 font-mono text-[10px] text-[#D71921]">
              {copiedHex === '#D71921' ? <Check className="h-3 w-3" /> : <Copy className="h-2.5 w-2.5" />}
              #D71921
            </span>
          </button>
        </div>
      </section>

      {/* 02 Typography Specimen Lab */}
      <section aria-labelledby="f-type" className="nt-card-surface rounded-2xl p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-baseline gap-2.5">
            <span className="font-display text-xs text-[var(--nt-secondary)]">02</span>
            <h2 id="f-type" className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--nt-display)]">
              Typography Specimen
            </h2>
          </div>
          <input
            type="text"
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
            aria-label="Live typography preview text"
            className="h-9 w-full max-w-xs rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-surface)] px-3 font-mono text-xs text-[var(--nt-primary)] focus:border-[var(--nt-display)] focus:outline-none"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5 space-y-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--nt-muted)]">
              Primary Display · Doto
            </div>
            <div className="font-display text-3xl leading-tight text-[var(--nt-display)] break-words">
              {sampleText}
            </div>
          </div>
          <div className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5 space-y-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--nt-muted)]">
              UI &amp; Prose · Plus Jakarta Sans
            </div>
            <div className="text-2xl font-semibold tracking-tight text-[var(--nt-display)] break-words">
              {sampleText}
            </div>
          </div>
          <div className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5 space-y-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--nt-muted)]">
              Telemetry &amp; Code · JetBrains Mono
            </div>
            <div className="font-mono text-lg tabular-nums text-[var(--nt-display)] break-words">
              {sampleText}
            </div>
          </div>
        </div>
      </section>

      {/* 04 Spacing Scale & 20 Local-Inverse Dot Field Schematic */}
      <div className="grid gap-6 lg:grid-cols-12">
        <section aria-labelledby="f-space" className="nt-card-surface rounded-2xl p-6 lg:col-span-5 space-y-5">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2.5">
              <span className="font-display text-xs text-[var(--nt-secondary)]">04</span>
              <h2 id="f-space" className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--nt-display)]">
                Spacing System
              </h2>
            </div>
            <span className="font-mono text-[10px] text-[var(--nt-muted)]">4pt base</span>
          </div>

          <div className="flex items-end gap-1.5 h-24 pt-4">
            {SPACING_SCALE.map((val, idx) => (
              <div key={val} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-t-[2px] bg-[var(--nt-secondary)]"
                  style={{ height: `${10 + idx * 5}px` }}
                />
                <span className="font-mono text-[8px] tabular-nums text-[var(--nt-muted)]">
                  {val}
                </span>
              </div>
            ))}
          </div>

          <p className="text-xs leading-relaxed text-[var(--nt-secondary)]">
            Outer container padding always stays equal to or greater than inner sibling gaps
            (minimum 16px container inset, 12px module gutters).
          </p>
        </section>

        <section aria-labelledby="f-dotfield" className="nt-card-surface rounded-2xl p-6 lg:col-span-7 space-y-5">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2.5">
              <span className="font-display text-xs text-[var(--nt-secondary)]">20</span>
              <h2 id="f-dotfield" className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--nt-display)]">
                Background · Local-Inverse Dot Field
              </h2>
            </div>
            <span className="font-mono text-[10px] text-[var(--nt-muted)]">mix-blend-mode: difference</span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 items-center">
            <p className="text-xs leading-relaxed text-[var(--nt-secondary)]">
              One continuous dot field crosses both dark and light surfaces using{' '}
              <code className="font-mono text-[var(--nt-display)]">mix-blend-mode: difference</code>
              — automatically reading light over dark slabs and dark over light slabs. Frosted
              cards sit on top and cover the dots underneath.
            </p>
            <div
              role="img"
              aria-label="Schematic showing one dot field inverting across dark and light surfaces while a frosted card covers the dots"
              className="relative flex h-48 overflow-hidden rounded-xl border border-[var(--nt-line-2)] isolate"
            >
              <div className="flex flex-1 items-end bg-[#0B0B0B] p-3 font-mono text-[9px] uppercase text-[#888888]">
                Dark · Light dots
              </div>
              <div className="flex flex-1 items-end bg-[#ECECEC] p-3 font-mono text-[9px] uppercase text-[#666666]">
                Light · Dark dots
              </div>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-10"
                style={{
                  backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1.5px, transparent 1.9px)',
                  backgroundSize: '18px 18px',
                  mixBlendMode: 'difference',
                }}
              />
              <div className="absolute right-4 top-6 z-20 flex h-24 w-[48%] items-end rounded-lg border border-[var(--nt-line-2)] bg-[var(--nt-surface)] p-3 font-mono text-[9px] uppercase text-[var(--nt-display)] shadow-lg">
                Card · Covers dots
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 40 Glyph Matrix Studio */}
      <section aria-labelledby="f-glyph" className="nt-card-surface rounded-2xl p-6 space-y-5">
        <div className="flex items-baseline gap-2.5">
          <span className="font-display text-xs text-[var(--nt-secondary)]">40</span>
          <h2 id="f-glyph" className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--nt-display)]">
            Glyph Matrix · Interactive 25×25 Studio
          </h2>
        </div>
        {renderComponentDemo('glyph-matrix')}
      </section>

      {/* 21 Full 35-icon 9x9 Dot Icon Library */}
      <section aria-labelledby="f-icons" className="nt-card-surface rounded-2xl p-6 space-y-5">
        <div className="flex items-baseline gap-2.5">
          <span className="font-display text-xs text-[var(--nt-secondary)]">21</span>
          <h2 id="f-icons" className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--nt-display)]">
            Icon Library · 35 Round-Dot Pixels
          </h2>
        </div>
        {renderComponentDemo('dot-icons')}
      </section>
    </div>
  );
}
