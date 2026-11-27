import * as React from 'react';
import {
  Check,
  Copy,
  DeviceMobile,
  GitBranch,
  MagnifyingGlass,
  Palette,
  ClockCounterClockwise,
  Terminal,
} from '@phosphor-icons/react';
import {
  CATALOG,
  COMPLETE_INVENTORY_GROUPS,
  countCompleteInventory,
} from '@nothing-ui/registry';
import {
  NATIVE_COMPATIBILITY_MATRIX,
  filterNativeSpecs,
  getAllNativeSpecs,
  getNativeSpecBySlug,
  type NativeCategory,
} from '@nothing-ui/ui-native';
import {
  Button,
  Stepper,
  appToaster,
  cn,
} from '@nothing-ui/ui';
import { copyTextToClipboard, formatCopiedToastPayload } from '../lib/cli-copy';
import { renderComponentDemo } from '@/components/docs/ComponentDemos';
import ButtonDemo from '../demos/button/01-variants';
import GlyphMatrixDemo from '../demos/glyph-matrix/01-resolutions';
import DotIconDemo from '../demos/dot-icon/01-gallery';
import DottedUiKitDemo from '../demos/dotted-ui/01-kit';
import HardwareUiKitDemo from '../demos/hardware-ui/01-kit';
import { StandardFamilyDemo } from '../demos/standard-families/01-families';
import { V02ExpandedDemo, V02_EXPANDED_SLUGS } from '../demos/expanded/v02-components';
import { V03CompleteDemo, V03_COMPLETE_SLUGS } from '../demos/complete';
import { CliSetupGuide } from './docs/cli-setup-guide';
import { ThemeCustomizer } from './docs/theme-customizer';

type HubTab = 'cli' | 'native' | 'tokens' | 'roadmap' | 'changelog';
type InventoryFilter = 'all' | 'standard' | 'exclusive' | 'shipped' | 'planned';

const NATIVE_CATEGORIES: Array<NativeCategory | 'All'> = [
  'All',
  'Inputs & Actions',
  'Navigation & Layout',
  'Overlays & Feedback',
  'Charts',
  'Data & Hardware',
  'Widgets',
  'Glyph System',
];

const STANDARD_FAMILY_SLUGS = new Set([
  'brand-logo',
  'chat',
  'charts',
  'media-kit',
  'motion-kit',
  'productivity-kit',
]);

function renderNativeApproximation(slug: string): React.ReactNode {
  if (slug === 'button') return <ButtonDemo />;
  if (slug === 'glyph-matrix') return <GlyphMatrixDemo />;
  if (slug === 'dot-icon') return <DotIconDemo />;
  if (slug === 'dot-text') return <DottedUiKitDemo />;
  if (slug === 'hardware-kit') return <HardwareUiKitDemo />;
  if (slug === 'stepper') return <Stepper />;
  if (V02_EXPANDED_SLUGS.has(slug)) return <V02ExpandedDemo slug={slug} />;
  if (V03_COMPLETE_SLUGS.has(slug)) return <V03CompleteDemo slug={slug} />;
  if (STANDARD_FAMILY_SLUGS.has(slug)) return <StandardFamilyDemo slug={slug} />;
  return <>{renderComponentDemo(slug)}</>;
}

export function NativeDocsHub({
  initialTab = 'cli',
  onTabChange,
  onSelectComponent,
}: {
  initialTab?: HubTab;
  onTabChange?: (tab: HubTab) => void;
  onSelectComponent: (slug: string) => void;
}) {
  const [tab, setTab] = React.useState<HubTab>(initialTab);
  const [selectedNativeSlug, setSelectedNativeSlug] = React.useState<string>('glyph-matrix');
  const [nativeQuery, setNativeQuery] = React.useState('');
  const [nativeCategory, setNativeCategory] = React.useState<NativeCategory | 'All'>('All');
  const [inventoryFilter, setInventoryFilter] = React.useState<InventoryFilter>('all');
  const [copied, setCopied] = React.useState<string | null>(null);

  React.useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const handleSelectTab = (next: HubTab) => {
    setTab(next);
    onTabChange?.(next);
  };

  const allNativeSpecs = React.useMemo(() => getAllNativeSpecs(), []);
  const filteredNativeSpecs = React.useMemo(
    () => filterNativeSpecs(nativeQuery, nativeCategory),
    [nativeQuery, nativeCategory]
  );

  const nativeSpec =
    getNativeSpecBySlug(selectedNativeSlug) ?? allNativeSpecs[0];

  const inventoryStats = React.useMemo(() => countCompleteInventory(), []);
  const filteredGroups = React.useMemo(() => {
    return COMPLETE_INVENTORY_GROUPS.map((group) => {
      if (inventoryFilter === 'standard' && group.track !== 'standard') return null;
      if (inventoryFilter === 'exclusive' && group.track !== 'exclusive') return null;
      const items = group.items.filter((item) => {
        if (inventoryFilter === 'shipped') return item.status !== 'planned';
        if (inventoryFilter === 'planned') return item.status === 'planned';
        return true;
      });
      if (items.length === 0) return null;
      return { ...group, items };
    }).filter((g): g is NonNullable<typeof g> => g !== null);
  }, [inventoryFilter]);

  const copyTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const handleCopy = async (key: string, text: string, toastDescription?: string) => {
    await copyTextToClipboard(text);
    setCopied(key);
    const toast = formatCopiedToastPayload(toastDescription ?? text);
    appToaster(toast.title, { description: toast.description });
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = window.setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div id="docs-header" className="scroll-mt-20 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--nt-line)] pb-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 font-mono text-xs text-[var(--nt-muted)]">
            <span className="text-[var(--nt-display)]">Single Package: nthgui</span>
            <span aria-hidden="true">·</span>
            <span>{allNativeSpecs.length}/{allNativeSpecs.length} Web + Native</span>
            <span aria-hidden="true">·</span>
            <span>136/136 Shipped</span>
            <span aria-hidden="true">·</span>
            <span>v0.4.0</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl tracking-[0.02em] text-[var(--nt-display)]">
            CLI, Native &amp; Architecture
          </h1>
          <p className="text-sm text-[var(--nt-secondary)] leading-relaxed">
            Single-package <code className="font-mono text-xs text-[var(--nt-display)]">nthgui</code> CLI onboarding, live
            Tailwind v4 Theme Customizer, full <strong>{allNativeSpecs.length}-module React Native parity</strong> (<code className="font-mono text-xs text-[var(--nt-display)]">nthgui/native</code>),
            and the complete 136-component · 16-family system — 100% live for Web &amp; Native.
          </p>
        </div>

        {/* Sub-tab Bar */}
        <div
          role="tablist"
          aria-label="Documentation sections"
          className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-1"
        >
          {(
            [
              { id: 'cli', label: 'CLI & Setup', icon: Terminal },
              { id: 'tokens', label: 'Theme', icon: Palette },
              { id: 'native', label: `React Native (${allNativeSpecs.length})`, icon: DeviceMobile },
              { id: 'roadmap', label: '136 Map', icon: GitBranch },
              { id: 'changelog', label: 'Changelog', icon: ClockCounterClockwise },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => handleSelectTab(id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono text-[11px] whitespace-nowrap transition-colors cursor-pointer',
                tab === id
                  ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 0: CLI & SINGLE-PACKAGE SETUP */}
      {tab === 'cli' && <CliSetupGuide />}

      {/* TAB 1: REACT NATIVE (ALL 60 LIVE COMPONENTS) */}
      {tab === 'native' && nativeSpec && (
        <div className="space-y-6">
          {/* Compatibility Matrix */}
          <div id="native-compat" className="scroll-mt-20 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">Native Coverage</div>
              <div className="mt-1 font-mono text-sm tabular-nums text-[var(--nt-accent)]">
                {NATIVE_COMPATIBILITY_MATRIX.coverage}
              </div>
            </div>
            <div className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">React Native &amp; Expo</div>
              <div className="mt-1 font-mono text-sm text-[var(--nt-display)]">
                RN {NATIVE_COMPATIBILITY_MATRIX.reactNative} · Expo {NATIVE_COMPATIBILITY_MATRIX.expoSdk}
              </div>
            </div>
            <div className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">Vector Engine</div>
              <div className="mt-1 font-mono text-sm text-[var(--nt-display)]">
                react-native-svg {NATIVE_COMPATIBILITY_MATRIX.reactNativeSvg}
              </div>
            </div>
            <div className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">Native Subpath</div>
              <div className="mt-1 font-mono text-sm text-[var(--nt-display)]">nthgui/native</div>
            </div>
          </div>

          <p className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] px-4 py-3 text-xs leading-relaxed text-[var(--nt-secondary)]">
            {NATIVE_COMPATIBILITY_MATRIX.statusNote}
          </p>

          {/* All 60 Live React Native Components Inspector */}
          <div id="native-preview" className="scroll-mt-20 grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
            {/* Searchable Left Picker */}
            <div className="lg:col-span-4 space-y-3 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-4">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
                <span>All Native Modules</span>
                <span className="tabular-nums text-[var(--nt-display)]">
                  {filteredNativeSpecs.length} / {allNativeSpecs.length}
                </span>
              </div>

              <div className="relative">
                <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--nt-muted)]" />
                <input
                  type="search"
                  aria-label="Filter React Native components"
                  value={nativeQuery}
                  onChange={(e) => setNativeQuery(e.target.value)}
                  placeholder={`Search ${allNativeSpecs.length} RN modules...`}
                  className="h-9 w-full rounded-lg border border-[var(--nt-line-2)] bg-[var(--nt-bg)] pl-8 pr-3 font-mono text-xs text-[var(--nt-display)] placeholder:text-[var(--nt-muted)] focus:border-[var(--nt-display)] focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                {NATIVE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    aria-pressed={nativeCategory === cat}
                    onClick={() => setNativeCategory(cat)}
                    className={cn(
                      'rounded-md px-2 py-1 transition-colors cursor-pointer',
                      nativeCategory === cat
                        ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                        : 'bg-[var(--nt-raised)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)]'
                    )}
                  >
                    {cat === 'All' ? 'All' : cat.split(' ')[0]}
                  </button>
                ))}
              </div>

              <div className="max-h-[460px] space-y-1 overflow-y-auto pr-1">
                {filteredNativeSpecs.map((item) => {
                  const active = item.slug === nativeSpec.slug;
                  return (
                    <button
                      key={item.slug}
                      type="button"
                      onClick={() => setSelectedNativeSlug(item.slug)}
                      className={cn(
                        'flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left font-mono text-xs transition-colors cursor-pointer',
                        active
                          ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                          : 'text-[var(--nt-secondary)] hover:bg-[var(--nt-raised)] hover:text-[var(--nt-display)]'
                      )}
                    >
                      <span className="truncate font-medium">{item.nativeName}</span>
                      <span className="shrink-0 text-[10px] opacity-70">{item.slug}</span>
                    </button>
                  );
                })}
                {filteredNativeSpecs.length === 0 && (
                  <div className="py-6 text-center font-mono text-xs text-[var(--nt-muted)]">
                    No matching native components.
                  </div>
                )}
              </div>
            </div>

            {/* Right Interactive Preview + CLI + RN Code */}
            <div className="lg:col-span-8 space-y-5 min-w-0">
              {/* CLI Copy-In Bar */}
              <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] px-4 py-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Terminal className="h-4 w-4 shrink-0 text-[var(--nt-accent)]" />
                  <code
                    data-testid="native-hub-cli-cmd"
                    className="truncate font-mono text-xs text-[var(--nt-display)]"
                  >
                    {nativeSpec.cliCommand}
                  </code>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectComponent(nativeSpec.slug)}
                  >
                    Docs →
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleCopy('native-cli', nativeSpec.cliCommand)}
                  >
                    {copied === 'native-cli' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied === 'native-cli' ? 'Copied!' : 'Copy CLI Command'}
                  </Button>
                </div>
              </div>

              {/* Clearly Labeled Web Approximation */}
              <div className="rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--nt-line)] pb-3 font-mono text-xs">
                  <span className="text-[var(--nt-display)]">
                    {nativeSpec.nativeName} ↔ {nativeSpec.webCounterpart}
                  </span>
                  <span className="text-[var(--nt-accent)]">
                    Interactive Web Approximation · Expo / RN Parity
                  </span>
                </div>

                <div className="flex min-h-[180px] items-center justify-center overflow-x-auto py-2">
                  {renderNativeApproximation(nativeSpec.slug)}
                </div>

                <div className="space-y-1.5 border-t border-[var(--nt-line)] pt-3">
                  <p className="text-xs leading-relaxed text-[var(--nt-secondary)]">{nativeSpec.platformNotes}</p>
                  <div className="font-mono text-[11px] text-[var(--nt-muted)]">
                    RN Primitives:{' '}
                    <span className="text-[var(--nt-display)]">{nativeSpec.primitivesUsed.join(' · ')}</span>
                  </div>
                </div>
              </div>

              {/* React Native Source Code */}
              <div className="overflow-hidden rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)]">
                <div className="flex items-center justify-between border-b border-[var(--nt-line)] px-4 py-2.5 font-mono text-xs">
                  <span className="text-[var(--nt-muted)]">
                    {nativeSpec.importPath} · components/nothing-native/{nativeSpec.slug}.tsx
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy('native-code', nativeSpec.code, `${nativeSpec.nativeName} React Native source`)}
                  >
                    {copied === 'native-code' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied === 'native-code' ? 'Copied!' : 'Copy RN Code'}
                  </Button>
                </div>
                <pre
                  data-testid="native-hub-code"
                  className="max-h-96 overflow-auto p-5 font-mono text-xs leading-relaxed text-[var(--nt-primary)]"
                >
                  <code>{nativeSpec.code}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Complete 60-Component React Native Parity Matrix */}
          <div id="native-matrix" className="scroll-mt-20 space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--nt-display)]">
                Complete React Native Parity Matrix ({CATALOG.length} / {CATALOG.length} Live Modules)
              </h2>
              <span className="font-mono text-[11px] text-[var(--nt-muted)]">
                Single package: nthgui/native · 0 extra installs
              </span>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)]">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-[var(--nt-line)] bg-[var(--nt-raised)]/60 text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
                    <th scope="col" className="px-4 py-2.5">#</th>
                    <th scope="col" className="px-4 py-2.5">React Native Export</th>
                    <th scope="col" className="px-4 py-2.5">Web Counterpart</th>
                    <th scope="col" className="px-4 py-2.5">Category</th>
                    <th scope="col" className="px-4 py-2.5">CLI Add</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--nt-line)]">
                  {allNativeSpecs.map((spec, idx) => (
                    <tr key={spec.slug} className="hover:bg-[var(--nt-raised)]/40">
                      <td className="px-4 py-2.5 tabular-nums text-[var(--nt-muted)]">
                        {String(idx + 1).padStart(2, '0')}
                      </td>
                      <td className="px-4 py-2.5 text-[var(--nt-display)] font-medium">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedNativeSlug(spec.slug);
                            document.getElementById('native-preview')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="hover:underline cursor-pointer"
                        >
                          {spec.nativeName}
                        </button>
                      </td>
                      <td className="px-4 py-2.5">
                        <button
                          type="button"
                          onClick={() => onSelectComponent(spec.slug)}
                          className="text-[var(--nt-secondary)] hover:text-[var(--nt-display)] hover:underline cursor-pointer"
                        >
                          {spec.webCounterpart} →
                        </button>
                      </td>
                      <td className="px-4 py-2.5 text-[var(--nt-muted)]">{spec.category}</td>
                      <td className="px-4 py-2.5 text-[var(--nt-secondary)]">
                        <button
                          type="button"
                          onClick={() => handleCopy(`matrix-${spec.slug}`, spec.cliCommand)}
                          aria-label={`Copy CLI command ${spec.cliCommand}`}
                          className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-left hover:bg-[var(--nt-raised)] hover:text-[var(--nt-display)] cursor-pointer transition-colors"
                        >
                          <span>{spec.cliCommand}</span>
                          {copied === `matrix-${spec.slug}` ? (
                            <Check className="h-3 w-3 shrink-0 text-[var(--nt-success)]" />
                          ) : (
                            <Copy className="h-3 w-3 shrink-0 text-[var(--nt-muted)]" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE THEME & TOKEN CUSTOMIZER */}
      {tab === 'tokens' && <ThemeCustomizer />}

      {/* TAB 3: COMPLETE 136-COMPONENT · 16-FAMILY INVENTORY */}
      {tab === 'roadmap' && (
        <div className="space-y-6">
          <div id="roadmap-summary" className="scroll-mt-20 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-4 font-mono">
              <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
                TONY-Inspired Standard (1–13)
              </div>
              <div className="mt-1 font-display text-3xl tabular-nums text-[var(--nt-display)]">
                {inventoryStats.standard}
              </div>
              <p className="mt-1 font-sans text-xs text-[var(--nt-secondary)]">
                All 13 standard families complete — 100% Web + Native.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-4 font-mono">
              <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
                Nothing UI Exclusive (14–16)
              </div>
              <div className="mt-1 font-display text-3xl tabular-nums text-[var(--nt-accent)]">
                {inventoryStats.exclusive}
              </div>
              <p className="mt-1 font-sans text-xs text-[var(--nt-secondary)]">
                Glyph Matrix (10) · Dotted UI (6) · Hardware (6) — all 22 live.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-4 font-mono">
              <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
                Complete Shipped Inventory
              </div>
              <div className="mt-1 font-display text-3xl tabular-nums text-[var(--nt-display)]">
                {inventoryStats.total}
              </div>
              <p className="mt-1 font-sans text-xs text-[var(--nt-secondary)]">
                {inventoryStats.families} families · {inventoryStats.shipped} shipped · {inventoryStats.planned} planned.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-4 font-mono">
              <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
                Icons &amp; Native Parity
              </div>
              <div className="mt-1 font-display text-2xl leading-9 whitespace-nowrap tabular-nums text-[var(--nt-display)]">
                35 · {allNativeSpecs.length}/{allNativeSpecs.length}
              </div>
              <p className="mt-1 font-sans text-xs text-[var(--nt-secondary)]">
                All {allNativeSpecs.length} live modules ship in React Native · all 136/136 shipped.
              </p>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div id="roadmap-filters" className="scroll-mt-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] px-4 py-3">
            <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
              {(
                [
                  { id: 'all', label: `All (${inventoryStats.total})` },
                  { id: 'standard', label: `Standard (${inventoryStats.standard})` },
                  { id: 'exclusive', label: `Nothing Exclusive (${inventoryStats.exclusive})` },
                  { id: 'shipped', label: `Shipped (${inventoryStats.shipped})` },
                  { id: 'planned', label: `Planned (${inventoryStats.planned})` },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={inventoryFilter === f.id}
                  onClick={() => setInventoryFilter(f.id)}
                  className={cn(
                    'rounded-lg px-2.5 py-1 transition-colors cursor-pointer',
                    inventoryFilter === f.id
                      ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                      : 'text-[var(--nt-secondary)] hover:bg-[var(--nt-raised)] hover:text-[var(--nt-display)]'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <span className="font-mono text-[11px] text-[var(--nt-muted)]">
              Every shipped component includes Web + React Native (nthgui/native)
            </span>
          </div>

          <div id="roadmap-families" className="scroll-mt-20 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGroups.map((group) => (
              <div
                key={group.familyNumber}
                className="rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-4 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-[var(--nt-line)] pb-2 font-mono text-xs">
                  <span className="text-[var(--nt-display)] font-medium">
                    {String(group.familyNumber).padStart(2, '0')}. {group.category}
                  </span>
                  <span
                    className={cn(
                      'text-[10px]',
                      group.track === 'exclusive' ? 'text-[var(--nt-accent)]' : 'text-[var(--nt-muted)]'
                    )}
                  >
                    {group.track === 'exclusive' ? 'EXCLUSIVE' : group.priority} · {group.items.length}
                  </span>
                </div>
                <ul className="space-y-1.5 font-mono text-xs">
                  {group.items.map((item) => (
                    <li key={item.slug} className="flex items-center justify-between gap-2">
                      {item.shippedSlug ? (
                        <button
                          type="button"
                          onClick={() => onSelectComponent(item.shippedSlug!)}
                          className="text-left text-[var(--nt-display)] hover:underline cursor-pointer truncate"
                        >
                          {item.name}
                        </button>
                      ) : (
                        <span className="text-[var(--nt-muted)] truncate">{item.name}</span>
                      )}
                      <span
                        className={cn(
                          'shrink-0 text-[10px]',
                          item.status === 'stable'
                            ? 'text-[var(--nt-success)]'
                            : item.status === 'beta'
                              ? 'text-[var(--nt-warning)]'
                              : 'text-[var(--nt-muted)]'
                        )}
                      >
                        {item.shippedSlug ? `${item.status} · RN` : `planned · ${item.nativeTarget}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CHANGELOG */}
      {tab === 'changelog' && (
        <div className="space-y-4 max-w-3xl">
          <article id="changelog-v04" className="scroll-mt-20 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-6 space-y-3">
            <div className="flex items-center justify-between font-mono text-xs text-[var(--nt-muted)]">
              <span className="text-[var(--nt-display)]">v0.4.0 · 100% Complete — All 136 Components Live (88 / 88 Web + Native)</span>
              <span>2026-11-20</span>
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-[var(--nt-secondary)]">
              <li>Completed all remaining 28 component modules across Forms (<code>Form</code>, <code>Native Select</code>, <code>Questionnaire</code>), Overlays &amp; Navigation (<code>Layer Dialog</code>, <code>Menubar</code>, <code>Navigation Menu</code>, <code>Layer Card</code>, <code>Marker</code>), Layout &amp; Chat (<code>Carousel</code>, <code>Resizable Panels</code>, <code>Scroll Area</code>, <code>Aspect Ratio</code>, <code>Grid</code>, <code>Direction</code>, <code>Message Scroller</code>), Advanced Charts (<code>Pie Chart</code>, <code>Timeseries</code>, <code>Sankey</code>, <code>Map Chart</code>, <code>Flow</code>, <code>Custom Chart</code>), Media (<code>Audio Recorder</code>, <code>Video Recorder</code>, <code>Camera Capture</code>, <code>Media Studio</code>, <code>Media Viewer</code>), and Productivity (<code>Editor</code>, <code>Calendar Canvas</code>).</li>
              <li>Reached <strong>136 / 136 stable components (0 planned)</strong> across all 16 families and <strong>88 / 88 live interactive modules</strong> with full React Native parity under <code>nthgui/native</code>.</li>
              <li>Bundled all <strong>98 offline CLI copy-in templates</strong> (88 Web + Native modules + 10 Showcase blocks) directly inside the single <code>nthgui</code> package with dedicated one-click Copy CLI Command toast feedback.</li>
            </ul>
          </article>

          <article id="changelog-v03" className="scroll-mt-20 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-6 space-y-3">
            <div className="flex items-center justify-between font-mono text-xs text-[var(--nt-muted)]">
              <span className="text-[var(--nt-display)]">v0.3.0 · Full React Native Component Parity (60 / 60 Live)</span>
              <span>2026-11-20</span>
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-[var(--nt-secondary)]">
              <li>Expanded <code>nthgui/native</code> from 12 first-wave primitives to <strong>all 60 live catalog components</strong> across Inputs &amp; Actions, Navigation &amp; Layout, Overlays &amp; Feedback, and Data &amp; Hardware.</li>
              <li>Added a dedicated <strong>React Native</strong> code tab directly inside every component page with iOS/Android primitives, ergonomics notes, and <code>npx nthgui add &lt;slug&gt; --native</code> CLI commands.</li>
              <li>Upgraded <strong>Docs → React Native (60)</strong> into a searchable, filterable 60-component explorer with live interactive approximations and a full 60-row parity matrix.</li>
              <li>Mapped all 136 planned inventory items to explicit PascalCase React Native targets under <code>nthgui/native</code> with zero extra npm package installs.</li>
            </ul>
          </article>

          <article id="changelog-v02" className="scroll-mt-20 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-6 space-y-3">
            <div className="flex items-center justify-between font-mono text-xs text-[var(--nt-muted)]">
              <span className="text-[var(--nt-display)]">v0.2.0 · Single-Package nthgui, Blocks &amp; Props Playground</span>
              <span>2026-11-20</span>
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-[var(--nt-secondary)]">
              <li>Consolidated public npm distribution strictly to <code>nthgui</code> with default <code>npx nthgui add &lt;component&gt;</code> copy-in workflow plus <code>npm install nthgui</code> subpath imports (zero extra manual installs).</li>
              <li>Launched <strong>Pre-Built Nothing OS Blocks</strong> featuring 5 full interactive templates (OS Lockscreen Deck, Ear (3) Audio Console, Fleet Telemetry Ops, Passkey &amp; OTP Auth, Workspace &amp; Kanban) with Desktop/Tablet/Mobile viewport switching.</li>
              <li>Added <strong>Interactive Props Playground</strong> with real-time live-synced JSX output using single-package <code>nthgui</code> imports.</li>
              <li>Upgraded Tokens into a live <strong>Theme &amp; Token Customizer</strong> with Signal Accent tuning, live WCAG contrast verification, radius/density controls, and downloadable Tailwind v4 <code>nthgui.css</code>.</li>
              <li>Promoted 16 newly interactive modules from the 136-component inventory across Hardware Widgets, Advanced Forms, Data &amp; Charts, and Overlays &amp; Productivity (60 live catalog modules total).</li>
            </ul>
          </article>

          <article id="changelog-v01" className="scroll-mt-20 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-6 space-y-3">
            <div className="flex items-center justify-between font-mono text-xs text-[var(--nt-muted)]">
              <span className="text-[var(--nt-display)]">v0.1.0-alpha.1 · Monorepo &amp; Design System Rebuild</span>
              <span>2026-11-20</span>
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-[var(--nt-secondary)]">
              <li>Established persistent 3-column documentation shell with left collapsible sidebar and right On-Page Table of Contents scroll-spy.</li>
              <li>Generalized circular Glyph Matrix geometry to both <strong>25×25 (481 LEDs)</strong> and <strong>13×13 (121 LEDs)</strong> with offline <strong>Glyph Matrix Studio</strong> and JSON/SVG export.</li>
              <li>Built 35 original 9×9 Dot Icons with <code>map-pin</code> alias, React/Native renderers, and interactive 9×9 Pixel-Grid Magnifier.</li>
            </ul>
          </article>
        </div>
      )}
    </div>
  );
}

