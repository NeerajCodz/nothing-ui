import * as React from 'react';
import {
  Check,
  Copy,
  FileCode,
  Keyboard,
  Terminal,
} from '@phosphor-icons/react';
import {
  CATALOG,
  buildInstallCommand,
  compileShadcnRegistryItem,
  getCatalogEntry,
  getComponentCatalog,
  getGlyphCatalog,
  getPublicImportPath,
  getWidgetCatalog,
  type InstallMode,
  type PackageManager,
} from '@nothing-ui/registry';
import { DOT_ICON_LIST } from '@nothing-ui/dot-icons';
import { getNativeSpecBySlug } from '@nothing-ui/ui-native';
import { Button, Stepper, cn, getComponentLoadingProfile } from '@nothing-ui/ui';
import { renderComponentDemo } from '@/components/docs/ComponentDemos';
import { DemoPreview } from './playground/demo-preview';
import { PropsPlayground } from './playground/props-playground';
import { ComponentMaturityBadge } from './component-maturity-badge';
import {
  resolveComponentMaturity,
  type ComponentMaturityLevel,
} from '../lib/component-maturity';
import { V02ExpandedDemo, V02_EXPANDED_SLUGS } from '../demos/expanded/v02-components';
import v02ExpandedRaw from '../demos/expanded/v02-components.tsx?raw';
import {
  V04CompleteDemo,
  V04_COMPLETE_SLUGS,
  V04_FORMS_OVERLAYS_LAYOUT_SLUGS,
} from '../demos/expanded/v04-complete';
import v04FormsOverlaysLayoutRaw from '../demos/expanded/v04-forms-overlays-layout.tsx?raw';
import v04ChartsMediaProductivityRaw from '../demos/expanded/v04-charts-media-productivity.tsx?raw';
import { V03CompleteDemo, V03_COMPLETE_SLUGS, getCompleteDemoSource } from '../demos/complete';

// Source-backed real TSX imports via Vite ?raw (single source of truth — never hand-copied strings)
import ButtonDemo, { meta as buttonMeta } from '../demos/button/01-variants';
import buttonDemoRaw from '../demos/button/01-variants.tsx?raw';
import GlyphMatrixDemo, { meta as glyphMeta } from '../demos/glyph-matrix/01-resolutions';
import glyphMatrixDemoRaw from '../demos/glyph-matrix/01-resolutions.tsx?raw';
import DotIconDemo, { meta as dotIconMeta } from '../demos/dot-icon/01-gallery';
import dotIconDemoRaw from '../demos/dot-icon/01-gallery.tsx?raw';
import DottedUiKitDemo, { meta as dottedMeta } from '../demos/dotted-ui/01-kit';
import dottedUiDemoRaw from '../demos/dotted-ui/01-kit.tsx?raw';
import HardwareUiKitDemo, { meta as hardwareMeta } from '../demos/hardware-ui/01-kit';
import hardwareUiDemoRaw from '../demos/hardware-ui/01-kit.tsx?raw';
import { StandardFamilyDemo } from '../demos/standard-families/01-families';
import standardFamiliesDemoRaw from '../demos/standard-families/01-families.tsx?raw';

import inputSourceRaw from '@/components/nothing/Input.tsx?raw';
import controlsSourceRaw from '@/components/nothing/Controls.tsx?raw';
import navigationSourceRaw from '@/components/nothing/Navigation.tsx?raw';
import overlaysSourceRaw from '@/components/nothing/Overlays.tsx?raw';
import feedbackSourceRaw from '@/components/nothing/Feedback.tsx?raw';
import dataDisplaySourceRaw from '@/components/nothing/DataDisplay.tsx?raw';

const STANDARD_FAMILY_SLUGS = new Set([
  'brand-logo',
  'chat',
  'charts',
  'media-kit',
  'motion-kit',
  'productivity-kit',
]);

function stripDemoMeta(raw: string): string {
  return raw.replace(/export const meta = \{[\s\S]*?\};\n\n?/m, '').trim();
}

function getSourceForSlug(slug: string, sourcePath: string): { code: string; label: string } {
  if (slug === 'button') return { code: stripDemoMeta(buttonDemoRaw), label: 'apps/ui/src/demos/button/01-variants.tsx' };
  if (slug === 'glyph-matrix') return { code: stripDemoMeta(glyphMatrixDemoRaw), label: 'apps/ui/src/demos/glyph-matrix/01-resolutions.tsx' };
  if (slug === 'dot-icon') return { code: stripDemoMeta(dotIconDemoRaw), label: 'apps/ui/src/demos/dot-icon/01-gallery.tsx' };
  if (slug === 'dot-text') return { code: stripDemoMeta(dottedUiDemoRaw), label: 'apps/ui/src/demos/dotted-ui/01-kit.tsx' };
  if (slug === 'hardware-kit' || slug === 'stepper') return { code: stripDemoMeta(hardwareUiDemoRaw), label: 'apps/ui/src/demos/hardware-ui/01-kit.tsx' };
  if (V02_EXPANDED_SLUGS.has(slug)) return { code: v02ExpandedRaw.trim(), label: 'apps/ui/src/demos/expanded/v02-components.tsx' };
  if (V03_COMPLETE_SLUGS.has(slug)) return getCompleteDemoSource(slug);
  if (STANDARD_FAMILY_SLUGS.has(slug)) return { code: standardFamiliesDemoRaw.trim(), label: 'apps/ui/src/demos/standard-families/01-families.tsx' };
  if (sourcePath.endsWith('Input.tsx')) return { code: inputSourceRaw, label: sourcePath };
  if (sourcePath.endsWith('Controls.tsx')) return { code: controlsSourceRaw, label: sourcePath };
  if (sourcePath.endsWith('Navigation.tsx')) return { code: navigationSourceRaw, label: sourcePath };
  if (sourcePath.endsWith('Overlays.tsx')) return { code: overlaysSourceRaw, label: sourcePath };
  if (sourcePath.endsWith('Feedback.tsx')) return { code: feedbackSourceRaw, label: sourcePath };
  return { code: dataDisplaySourceRaw, label: sourcePath };
}

const PACKAGE_MANAGERS: PackageManager[] = ['bun', 'pnpm', 'npm', 'yarn'];

export function ComponentsExplorer({
  activeSlug,
  onSelectSlug,
  onOpenGlyphStudio,
  onOpenIconExplorer,
  onOpenWidgets,
  maturityOverride,
}: {
  activeSlug: string;
  onSelectSlug: (slug: string) => void;
  onOpenGlyphStudio: () => void;
  onOpenIconExplorer: () => void;
  onOpenWidgets?: () => void;
  maturityOverride?: ComponentMaturityLevel;
}) {
  const [pm, setPm] = React.useState<PackageManager>('npm');
  const [installMode, setInstallMode] = React.useState<InstallMode>('cli');
  const [installPlatform, setInstallPlatform] = React.useState<'web' | 'native'>('web');
  const [showRegistryJson, setShowRegistryJson] = React.useState(false);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const activeEntry = getCatalogEntry(activeSlug) ?? CATALOG[0];
  const maturity = React.useMemo(
    () => resolveComponentMaturity(activeEntry, maturityOverride),
    [activeEntry, maturityOverride],
  );

  React.useEffect(() => {
    setInstallPlatform('web');
    setShowRegistryJson(false);
  }, [activeEntry.slug]);

  const installCmd = buildInstallCommand(activeEntry, pm, installPlatform, installMode);
  const publicImport = getPublicImportPath(activeEntry, installPlatform);
  const registryItemJson = React.useMemo(
    () => JSON.stringify(compileShadcnRegistryItem(activeEntry), null, 2),
    [activeEntry]
  );
  const sourceBundle = getSourceForSlug(activeEntry.slug, activeEntry.sourcePath);
  const nativeSpec = getNativeSpecBySlug(activeEntry.slug);
  const loadingProfile = getComponentLoadingProfile(activeEntry.slug);

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1600);
    } catch {
      setCopiedKey(null);
    }
  };

  const renderDemoBody = () => {
    if (activeEntry.slug === 'button') return <ButtonDemo />;
    if (activeEntry.slug === 'glyph-matrix') return <GlyphMatrixDemo />;
    if (activeEntry.slug === 'dot-icon') return <DotIconDemo />;
    if (activeEntry.slug === 'dot-text') return <DottedUiKitDemo />;
    if (activeEntry.slug === 'hardware-kit') return <HardwareUiKitDemo />;
    if (activeEntry.slug === 'stepper') return <Stepper />;
    if (V02_EXPANDED_SLUGS.has(activeEntry.slug)) {
      return <V02ExpandedDemo slug={activeEntry.slug} />;
    }
    if (V03_COMPLETE_SLUGS.has(activeEntry.slug)) {
      return <V03CompleteDemo slug={activeEntry.slug} />;
    }
    if (STANDARD_FAMILY_SLUGS.has(activeEntry.slug)) {
      return <StandardFamilyDemo slug={activeEntry.slug} />;
    }
    return <>{renderComponentDemo(activeEntry.slug)}</>;
  };

  const demoTitle =
    activeEntry.slug === 'button'
      ? buttonMeta.title
      : activeEntry.slug === 'glyph-matrix'
        ? glyphMeta.title
        : activeEntry.slug === 'dot-icon'
          ? dotIconMeta.title
          : activeEntry.slug === 'dot-text'
            ? dottedMeta.title
            : activeEntry.slug === 'hardware-kit'
              ? hardwareMeta.title
              : `${activeEntry.title} Interactive Preview`;

  const demoDesc =
    activeEntry.slug === 'button'
      ? buttonMeta.description
      : activeEntry.slug === 'glyph-matrix'
        ? glyphMeta.description
        : activeEntry.slug === 'dot-icon'
          ? dotIconMeta.description
          : activeEntry.slug === 'dot-text'
            ? dottedMeta.description
            : activeEntry.slug === 'hardware-kit'
              ? hardwareMeta.description
              : undefined;

  return (
    <article className="min-w-0 space-y-8">
      {/* Mobile Quick Module Switcher (Components / Widgets / Glyph System) */}
      <div className="lg:hidden">
        <label htmlFor="mobile-comp-select" className="sr-only">
          Select component, widget, or glyph module
        </label>
        <select
          id="mobile-comp-select"
          value={activeEntry.slug}
          onChange={(e) => onSelectSlug(e.target.value)}
          className="h-10 w-full rounded-lg border border-[var(--nt-line-2)] bg-[var(--nt-surface)] px-3 font-mono text-xs text-[var(--nt-display)]"
        >
          <optgroup label="Glyph System">
            {getGlyphCatalog().map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.moduleNumber} · {item.title}
              </option>
            ))}
          </optgroup>
          <optgroup label="Widgets">
            {getWidgetCatalog().map((item) => {
              const itemMaturity = resolveComponentMaturity(item);
              const tag = itemMaturity.level !== 'stable' ? ` · ${itemMaturity.label}` : '';
              return (
                <option key={item.slug} value={item.slug}>
                  {item.moduleNumber} · {item.title} ({item.widgetGroup}{tag})
                </option>
              );
            })}
          </optgroup>
          <optgroup label="Components">
            {getComponentCatalog().map((item) => {
              const itemMaturity = resolveComponentMaturity(item);
              const tag = itemMaturity.level !== 'stable' ? ` · ${itemMaturity.label}` : '';
              return (
                <option key={item.slug} value={item.slug}>
                  {item.moduleNumber} · {item.title} ({item.category}{tag})
                </option>
              );
            })}
          </optgroup>
        </select>
      </div>

      {/* 1. Breadcrumb, Title & Honest Status Metadata (Zero static pills) */}
      <header id="comp-overview" className="scroll-mt-20 space-y-3 border-b border-[var(--nt-line)] pb-6">
        <div
          data-testid="explorer-breadcrumb"
          className="flex flex-wrap items-center gap-2 font-mono text-xs text-[var(--nt-muted)]"
        >
          <span>
            {activeEntry.kind === 'widget'
              ? 'Widgets'
              : activeEntry.kind === 'glyph'
                ? 'Glyph System'
                : 'Components'}
          </span>
          <span aria-hidden="true">/</span>
          <span>
            {activeEntry.kind === 'widget'
              ? activeEntry.widgetGroup ?? 'Widgets'
              : activeEntry.kind === 'glyph'
                ? 'Standalone Matrix'
                : activeEntry.category}
          </span>
          <span aria-hidden="true">·</span>
          <span className="text-[var(--nt-display)]">
            {activeEntry.web === 'stable' ? 'Web' : `Web: ${activeEntry.web}`}
          </span>
          <span aria-hidden="true">·</span>
          <span className={activeEntry.native === 'stable' || activeEntry.native === 'beta' ? 'text-[var(--nt-display)]' : 'text-[var(--nt-muted)]'}>
            {activeEntry.native === 'stable' ? 'Native' : `Native: ${activeEntry.native}`}
          </span>
          {activeEntry.uiSdkPrimitive && (
            <>
              <span aria-hidden="true">·</span>
              <span>{activeEntry.uiSdkPrimitive}</span>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl sm:text-4xl tracking-[0.02em] text-[var(--nt-display)]">
              {activeEntry.title}
            </h1>
            <ComponentMaturityBadge maturity={maturity} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {activeEntry.kind === 'widget' && onOpenWidgets && (
              <Button variant="outline" size="sm" onClick={onOpenWidgets}>
                All Widgets &amp; Roadmap →
              </Button>
            )}
            {activeEntry.slug === 'glyph-matrix' && (
              <Button variant="signal" size="sm" onClick={onOpenGlyphStudio}>
                Open Full Glyph Studio →
              </Button>
            )}
            {activeEntry.slug === 'dot-icon' && (
              <Button variant="primary" size="sm" onClick={onOpenIconExplorer}>
                Open {DOT_ICON_LIST.length}-Icon Explorer →
              </Button>
            )}
          </div>
        </div>

        <p className="max-w-3xl text-sm leading-relaxed text-[var(--nt-secondary)]">
          {activeEntry.description}
        </p>

        {maturity.advisory && (
          <div
            data-testid="component-maturity-advisory"
            data-maturity={maturity.level}
            role="status"
            className={cn(
              'flex items-center gap-2.5 rounded-lg border px-3.5 py-2 font-mono text-xs',
              maturity.advisoryClass,
            )}
          >
            <span
              aria-hidden="true"
              className={cn('h-2 w-2 shrink-0 rounded-full', maturity.dotClass)}
            />
            <span>{maturity.advisory}</span>
          </div>
        )}
      </header>

      {/* 2. Source-Backed Live DemoPreview (Web + React Native) */}
      <section id="comp-preview" className="scroll-mt-20">
        <DemoPreview
          key={activeEntry.slug}
          title={demoTitle}
          description={demoDesc}
          sourceCode={sourceBundle.code}
          sourceLabel={sourceBundle.label}
          nativeCode={nativeSpec?.code}
          nativeLabel={nativeSpec ? `${nativeSpec.nativeName} · ${nativeSpec.importPath}` : undefined}
          nativeNotes={nativeSpec?.platformNotes}
          nativePrimitives={nativeSpec?.primitivesUsed}
          nativeCliCommand={nativeSpec?.cliCommand}
          loadingProfile={loadingProfile}
        >
          {renderDemoBody()}
        </DemoPreview>
      </section>

      {/* 2B. Interactive Props Playground with Live JSX Sync */}
      <PropsPlayground slug={activeEntry.slug} />

      {/* 3. Single-Package Installation (CLI default + npm i nothing-ui tab) */}
      <section id="comp-installation" className="scroll-mt-20 space-y-3 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--nt-display)]">
                  Installation
                </h2>
                <div className="inline-flex rounded-lg bg-[var(--nt-raised)] p-0.5 font-mono text-[11px]">
                  <button
                    type="button"
                    aria-pressed={installMode === 'cli'}
                    onClick={() => setInstallMode('cli')}
                    className={cn(
                      'rounded-md px-2.5 py-1 cursor-pointer whitespace-nowrap',
                      installMode === 'cli'
                        ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                        : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]'
                    )}
                  >
                    CLI (Copy-In)
                  </button>
                  <button
                    type="button"
                    aria-pressed={installMode === 'package'}
                    onClick={() => setInstallMode('package')}
                    className={cn(
                      'rounded-md px-2.5 py-1 cursor-pointer whitespace-nowrap',
                      installMode === 'package'
                        ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                        : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]'
                    )}
                  >
                    Package
                  </button>
                </div>
                <div className="inline-flex rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] p-0.5 font-mono text-[11px]">
                  <button
                    type="button"
                    aria-pressed={installPlatform === 'web'}
                    onClick={() => setInstallPlatform('web')}
                    className={cn(
                      'rounded-md px-2.5 py-1 cursor-pointer',
                      installPlatform === 'web'
                        ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                        : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]'
                    )}
                  >
                    Web
                  </button>
                  <button
                    type="button"
                    aria-pressed={installPlatform === 'native'}
                    onClick={() => setInstallPlatform('native')}
                    className={cn(
                      'rounded-md px-2.5 py-1 cursor-pointer',
                      installPlatform === 'native'
                        ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                        : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]'
                    )}
                  >
                    {activeEntry.native === 'stable' ? 'Native' : `Native (${activeEntry.native})`}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-lg border border-[var(--nt-line)] p-0.5">
                  {PACKAGE_MANAGERS.map((manager) => (
                    <button
                      key={manager}
                      type="button"
                      aria-pressed={pm === manager}
                      onClick={() => setPm(manager)}
                      className={cn(
                        'rounded-md px-2.5 py-1 font-mono text-[11px] transition-colors cursor-pointer',
                        pm === manager
                          ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                          : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]'
                      )}
                    >
                      {manager}
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRegistryJson((s) => !s)}
                >
                  <FileCode className="h-3.5 w-3.5" />
                  {showRegistryJson ? 'Hide Registry JSON' : 'Registry JSON'}
                </Button>
              </div>
            </div>

            {installCmd ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] px-4 py-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Terminal className="h-4 w-4 shrink-0 text-[var(--nt-accent)]" />
                  <code
                    data-testid="cli-command"
                    className="truncate font-mono text-xs text-[var(--nt-display)]"
                  >
                    {installCmd}
                  </code>
                </div>
                <Button variant="primary" size="sm" onClick={() => handleCopy('install', installCmd)}>
                  {copiedKey === 'install' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedKey === 'install' ? 'Copied' : 'Copy'}
                </Button>
              </div>
            ) : (
              <div className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] px-4 py-3 font-mono text-xs text-[var(--nt-muted)]">
                Native status is <strong className="text-[var(--nt-display)]">{activeEntry.native}</strong>. No native install command is advertised until React Native parity passes.
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-[var(--nt-muted)]">
              <span>
                Import:{' '}
                <code className="text-[var(--nt-display)]">
                  {installMode === 'cli'
                    ? installPlatform === 'native'
                      ? `@/components/nthgui-native/${activeEntry.slug}`
                      : `@/components/nthgui/${activeEntry.slug}`
                    : publicImport}
                </code>
              </span>
              <span>Published Package: nthgui · 0 extra installs</span>
            </div>

            {showRegistryJson && (
              <div className="space-y-2 border-t border-[var(--nt-line)] pt-3">
                <div className="flex items-center justify-between font-mono text-[11px] text-[var(--nt-muted)]">
                  <span>shadcn-compatible registry-item.json (/r/{activeEntry.slug}.json)</span>
                  <Button variant="outline" size="sm" onClick={() => handleCopy('regjson', registryItemJson)}>
                    {copiedKey === 'regjson' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedKey === 'regjson' ? 'Copied JSON' : 'Copy JSON'}
                  </Button>
                </div>
                <pre
                  data-testid="shadcn-registry-json"
                  className="max-h-60 overflow-auto rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-4 font-mono text-[11px] text-[var(--nt-primary)]"
                >
                  <code>{registryItemJson}</code>
                </pre>
              </div>
            )}
          </section>

          {/* 4. Features & API Props Table */}
          <section id="comp-api" className="scroll-mt-20 space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--nt-display)]">
                API Reference
              </h2>
              <p className="font-mono text-[11px] text-[var(--nt-muted)]">
                Loading: <span className="text-[var(--nt-display)]">{loadingProfile.archetypeLabel}</span> · Default <code className="text-[var(--nt-display)]">normal</code> · Web + Native
              </p>
            </div>
            <p className="text-xs leading-relaxed text-[var(--nt-secondary)]">
              {loadingProfile.triggerHint}. Configure globally via{' '}
              <code className="font-mono text-[var(--nt-display)]">LoadingConfigProvider</code> or per component with{' '}
              <code className="font-mono text-[var(--nt-display)]">loaderVariant=&quot;normal | dots | bars | pulse&quot;</code>.
            </p>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {activeEntry.features.map((feat) => (
                <li
                  key={feat}
                  className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-3.5 text-xs leading-relaxed text-[var(--nt-secondary)]"
                >
                  {feat}
                </li>
              ))}
            </ul>

            <div id="comp-props" className="scroll-mt-20 overflow-x-auto rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)]">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-[var(--nt-line)] bg-[var(--nt-raised)]/60 text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
                    <th scope="col" className="px-4 py-2.5">Prop</th>
                    <th scope="col" className="px-4 py-2.5">Type</th>
                    <th scope="col" className="px-4 py-2.5">Default</th>
                    <th scope="col" className="px-4 py-2.5">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--nt-line)]">
                  {activeEntry.props.map((prop) => (
                    <tr key={prop.name}>
                      <td className="px-4 py-3 font-medium text-[var(--nt-display)]">{prop.name}</td>
                      <td className="px-4 py-3 text-[var(--nt-accent)]">{prop.type}</td>
                      <td className="px-4 py-3 text-[var(--nt-muted)]">{prop.defaultValue ?? '—'}</td>
                      <td className="px-4 py-3 font-sans text-[var(--nt-secondary)]">{prop.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 5. Keyboard & Accessibility Rules */}
          <section id="comp-a11y" className="scroll-mt-20 space-y-3">
            <div className="flex items-center gap-2">
              <Keyboard className="h-4 w-4 text-[var(--nt-muted)]" />
              <h2 className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--nt-display)]">
                Keyboard & Accessibility
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-[var(--nt-secondary)]">
              {activeEntry.accessibilityNotes}
            </p>
            <div className="overflow-x-auto rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)]">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-[var(--nt-line)] bg-[var(--nt-raised)]/60 text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
                    <th scope="col" className="px-4 py-2.5 w-48">Key</th>
                    <th scope="col" className="px-4 py-2.5">Behavior</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--nt-line)]">
                  {activeEntry.keyboard.map((rule) => (
                    <tr key={rule.key}>
                      <td className="px-4 py-2.5 text-[var(--nt-display)]">{rule.key}</td>
                      <td className="px-4 py-2.5 font-sans text-[var(--nt-secondary)]">{rule.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 6. Related Components */}
          {activeEntry.related && activeEntry.related.length > 0 && (
            <section id="comp-related" className="scroll-mt-20 flex flex-wrap items-center gap-2 border-t border-[var(--nt-line)] pt-5 font-mono text-xs">
              <span className="text-[var(--nt-muted)]">Related:</span>
              {activeEntry.related.map((relSlug) => {
                const rel = getCatalogEntry(relSlug);
                if (!rel) return null;
                const relMaturity = resolveComponentMaturity(rel);
                return (
                  <button
                    key={rel.slug}
                    type="button"
                    data-maturity={relMaturity.level}
                    onClick={() => onSelectSlug(rel.slug)}
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] px-3 py-1.5 text-[var(--nt-display)] hover:border-[var(--nt-display)] cursor-pointer"
                  >
                    <span
                      aria-hidden="true"
                      className={cn('h-1.5 w-1.5 shrink-0 rounded-full', relMaturity.dotClass)}
                    />
                    <span>{rel.title}</span>
                    <span className={cn('text-[10px]', relMaturity.textClass)}>
                      {relMaturity.label}
                    </span>
                    <span aria-hidden="true" className="text-[var(--nt-muted)]">→</span>
                  </button>
                );
              })}
            </section>
          )}
    </article>
  );
}
