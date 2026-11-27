import * as React from 'react';
import { Check, Copy, Package, Terminal } from '@phosphor-icons/react';
import {
  createDryRunPlan,
  type SupportedFramework,
  type SupportedPackageManager,
} from '@nothing-ui/cli';
import { CATALOG } from '@nothing-ui/registry';
import { Button, appToaster, cn } from '@nothing-ui/ui';
import {
  buildComponentAddCliCommand,
  copyTextToClipboard,
  formatCopiedToastPayload,
} from '../../lib/cli-copy';

const FRAMEWORKS: ReadonlyArray<{ id: SupportedFramework; label: string; cssEntry: string }> = [
  { id: 'vite', label: 'Vite + React', cssEntry: 'src/index.css' },
  { id: 'next', label: 'Next.js App Router', cssEntry: 'app/globals.css' },
  { id: 'tanstack', label: 'TanStack Start', cssEntry: 'src/styles/app.css' },
  { id: 'expo', label: 'Expo / React Native', cssEntry: 'theme/nothing-native.ts' },
];

const PACKAGE_MANAGERS: SupportedPackageManager[] = ['npm', 'bun', 'pnpm', 'yarn'];

const SIMULATOR_CANDIDATES = [
  { slug: 'button', label: 'Button' },
  { slug: 'glyph-matrix', label: 'Glyph Matrix' },
  { slug: 'dot-icon', label: 'Dot Icon' },
  { slug: 'dot-matrix-clock', label: 'Dot Matrix Clock' },
  { slug: 'earbuds-battery', label: 'Earbuds & Battery' },
  { slug: 'combobox', label: 'Combobox' },
  { slug: 'date-time-picker', label: 'Date & Time Picker' },
  { slug: 'sparkline-strip', label: 'Sparkline Strip' },
  { slug: 'sortable-board', label: 'Sortable Board' },
  { slug: 'block-os-lockscreen', label: 'Block: OS Lockscreen' },
] as const;

const SUBPATH_EXPORTS = [
  { subpath: 'nthgui', purpose: 'Core monochrome UI components, layouts, forms, overlays, charts, and theme provider.' },
  { subpath: 'nthgui/glyph', purpose: '13×13 & 25×25 circular GlyphMatrix, presets, GlyphProgress, and GlyphAnimator.' },
  { subpath: 'nthgui/icons', purpose: '1,691 dot-matrix SVG icons (247 Nothing originals + 100% Lucide directory & aliases) with configurable grid, dot scale, shape, and color.' },
  { subpath: 'nthgui/tokens', purpose: 'Canonical Dark, Light, and WCAG AAA High-Contrast CSS variables & JSON tokens.' },
  { subpath: 'nthgui/native', purpose: 'All 111 live React Native modules, OLED tokens, and SVG Glyph/DotIcon renderers.' },
  { subpath: 'nthgui/styles.css', purpose: 'Pre-built CSS custom properties, frosted dot-field surface, and loader keyframes.' },
] as const;

export function CliSetupGuide() {
  const [framework, setFramework] = React.useState<SupportedFramework>('vite');
  const [pm, setPm] = React.useState<SupportedPackageManager>('npm');
  const [quickSlug, setQuickSlug] = React.useState<string>('button');
  const [quickNative, setQuickNative] = React.useState<boolean>(false);
  const [selectedSlugs, setSelectedSlugs] = React.useState<string[]>([
    'button',
    'glyph-matrix',
    'dot-matrix-clock',
  ]);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const copyTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const quickAddCommand = React.useMemo(
    () =>
      buildComponentAddCliCommand({
        slug: quickSlug,
        packageManager: pm,
        native: quickNative,
      }),
    [quickSlug, pm, quickNative],
  );

  const plan = React.useMemo(
    () => createDryRunPlan(selectedSlugs, pm, framework),
    [selectedSlugs, pm, framework],
  );

  const toggleSlug = (slug: string) => {
    setSelectedSlugs((prev) =>
      prev.includes(slug)
        ? prev.length > 1
          ? prev.filter((s) => s !== slug)
          : prev
        : [...prev, slug],
    );
  };

  const handleCopy = async (key: string, text: string, toastDescription?: string) => {
    await copyTextToClipboard(text);
    setCopiedKey(key);
    const toast = formatCopiedToastPayload(toastDescription ?? text);
    appToaster(toast.title, { description: toast.description });
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = window.setTimeout(() => setCopiedKey(null), 1800);
  };

  const activeFw = FRAMEWORKS.find((f) => f.id === framework)!;

  return (
    <div className="space-y-6">
      {/* Single-Package Guarantee Banner */}
      <section
        id="cli-single-package"
        className="scroll-mt-20 space-y-4 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-[var(--nt-accent)]" />
            <h2 className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--nt-display)]">
              Nothing UI · Single npm Package: nthgui
            </h2>
          </div>
          <div className="inline-flex rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] p-0.5 font-mono text-[11px]">
            {PACKAGE_MANAGERS.map((manager) => (
              <button
                key={manager}
                type="button"
                aria-pressed={pm === manager}
                onClick={() => setPm(manager)}
                className={cn(
                  'rounded-md px-2.5 py-1 cursor-pointer whitespace-nowrap shrink-0',
                  pm === manager
                    ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                    : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
                )}
              >
                {manager}
              </button>
            ))}
          </div>
        </div>

        <p className="max-w-3xl text-xs leading-relaxed text-[var(--nt-secondary)]">
          <strong>Nothing UI</strong> publishes to npm under the single package name{' '}
          <code className="font-mono text-[var(--nt-display)]">nthgui</code>.
          You never need to install separate scoped packages or icon/primitive extras.
          Use the offline-bundled copy-in CLI (<code className="font-mono text-[var(--nt-display)]">npx nthgui add</code>) or direct single-package imports (<code className="font-mono text-[var(--nt-display)]">npm install nthgui</code>).
        </p>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-2 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-4">
            <div className="flex items-center justify-between font-mono text-[11px] text-[var(--nt-muted)]">
              <span>Option A · CLI Copy-In (Default)</span>
              <span className="text-[var(--nt-accent)]">Recommended</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <code className="truncate font-mono text-xs text-[var(--nt-display)]">
                {plan.initCommand}
              </code>
              <Button variant="outline" size="sm" onClick={() => handleCopy('init', plan.initCommand)}>
                {copiedKey === 'init' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedKey === 'init' ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-4">
            <div className="flex items-center justify-between font-mono text-[11px] text-[var(--nt-muted)]">
              <span>Option B · Direct Single Package</span>
              <span>Zero extra installs</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <code className="truncate font-mono text-xs text-[var(--nt-display)]">
                {plan.packageInstallCommand}
              </code>
              <Button variant="outline" size="sm" onClick={() => handleCopy('pkg', plan.packageInstallCommand)}>
                {copiedKey === 'pkg' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedKey === 'pkg' ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Dedicated Quick Add · Copy CLI Command */}
      <section
        id="cli-quick-copy"
        data-testid="cli-quick-copy-card"
        className="scroll-mt-20 space-y-4 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-[var(--nt-accent)]" />
              <h2 className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--nt-display)]">
                Copy CLI Command · Add Any Component
              </h2>
            </div>
            <p className="text-xs text-[var(--nt-secondary)]">
              Pick any of the {CATALOG.length} catalog modules and copy the ready-to-run{' '}
              <code className="font-mono text-[var(--nt-display)]">nthgui add</code> command straight to your clipboard.
            </p>
          </div>

          <div
            role="group"
            aria-label="CLI target platform"
            className="inline-flex rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] p-0.5 font-mono text-[11px]"
          >
            <button
              type="button"
              aria-pressed={!quickNative}
              onClick={() => setQuickNative(false)}
              className={cn(
                'rounded-md px-2.5 py-1 cursor-pointer whitespace-nowrap shrink-0',
                !quickNative
                  ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
              )}
            >
              Web
            </button>
            <button
              type="button"
              aria-pressed={quickNative}
              onClick={() => setQuickNative(true)}
              className={cn(
                'rounded-md px-2.5 py-1 cursor-pointer whitespace-nowrap shrink-0',
                quickNative
                  ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
              )}
            >
              Native (--native)
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="sr-only" htmlFor="cli-quick-component-select">
            Select component for CLI command
          </label>
          <select
            id="cli-quick-component-select"
            aria-label="Select component for CLI command"
            value={quickSlug}
            onChange={(e) => setQuickSlug(e.target.value)}
            className="h-10 w-full sm:w-64 shrink-0 rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-bg)] px-3 font-mono text-xs text-[var(--nt-display)] focus:border-[var(--nt-display)] focus:outline-none cursor-pointer"
          >
            {CATALOG.map((entry) => (
              <option key={entry.slug} value={entry.slug}>
                {entry.title} ({entry.slug})
              </option>
            ))}
          </select>

          <div className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] px-3.5 py-2">
            <div className="flex min-w-0 items-center gap-2 font-mono text-xs">
              <span aria-hidden="true" className="select-none text-[var(--nt-accent)]">$</span>
              <code
                data-testid="cli-quick-add-command"
                className="truncate text-[var(--nt-display)]"
              >
                {quickAddCommand}
              </code>
            </div>
            <Button
              variant="primary"
              size="sm"
              className="shrink-0 whitespace-nowrap"
              onClick={() => handleCopy('quick-add', quickAddCommand)}
            >
              {copiedKey === 'quick-add' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedKey === 'quick-add' ? 'Copied!' : 'Copy CLI Command'}
            </Button>
          </div>
        </div>
      </section>

      {/* Interactive CLI Dry-Run Simulator */}
      <section
        id="cli-simulator"
        data-testid="cli-dry-run-simulator"
        className="scroll-mt-20 space-y-4 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-[var(--nt-accent)]" />
            <h2 className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--nt-display)]">
              Interactive CLI Dry-Run Planner
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] p-0.5 font-mono text-[11px]">
            {FRAMEWORKS.map((fw) => (
              <button
                key={fw.id}
                type="button"
                aria-pressed={framework === fw.id}
                onClick={() => setFramework(fw.id)}
                className={cn(
                  'rounded-md px-2.5 py-1 whitespace-nowrap cursor-pointer',
                  framework === fw.id
                    ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                    : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
                )}
              >
                {fw.label}
              </button>
            ))}
          </div>
        </div>

        {/* Component multi-select */}
        <div className="space-y-2">
          <div className="font-mono text-[11px] text-[var(--nt-muted)]">
            Select components or blocks to scaffold ({selectedSlugs.length} selected · target CSS: {activeFw.cssEntry}):
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SIMULATOR_CANDIDATES.map((item) => {
              const checked = selectedSlugs.includes(item.slug);
              return (
                <button
                  key={item.slug}
                  type="button"
                  aria-pressed={checked}
                  onClick={() => toggleSlug(item.slug)}
                  className={cn(
                    'rounded-lg border px-2.5 py-1.5 font-mono text-xs transition-colors cursor-pointer whitespace-nowrap',
                    checked
                      ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                      : 'border-[var(--nt-line)] bg-[var(--nt-bg)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
                  )}
                >
                  {checked ? '✓ ' : '+ '}
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Simulated Output */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-2.5 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-4">
            <div className="flex items-center justify-between font-mono text-[11px] text-[var(--nt-muted)]">
              <span>Simulated Terminal Output</span>
              <Button variant="primary" size="sm" onClick={() => handleCopy('addcmd', plan.addCommand)}>
                {copiedKey === 'addcmd' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedKey === 'addcmd' ? 'Copied!' : 'Copy CLI Command'}
              </Button>
            </div>
            <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-[var(--nt-primary)]">
              <code>
{`$ ${plan.addCommand}

✔ Resolved offline registry package: nthgui
✔ Extra packages required: 0
✔ Writing ${plan.targetFiles.length} file(s):
${plan.targetFiles.map((f) => `  + ${f}`).join('\n')}
✔ Done. Import directly from "@/components/nthgui" or "nthgui".`}
              </code>
            </pre>
          </div>

          <div className="lg:col-span-5 space-y-2 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-4">
            <div className="flex items-center justify-between font-mono text-[11px] text-[var(--nt-muted)]">
              <span>Generated components.json</span>
              <Button variant="outline" size="sm" onClick={() => handleCopy('compjson', plan.componentsJson, 'components.json configuration')}>
                {copiedKey === 'compjson' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedKey === 'compjson' ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <pre className="max-h-56 overflow-auto font-mono text-[11px] leading-relaxed text-[var(--nt-secondary)]">
              <code>{plan.componentsJson}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Subpath Export Table */}
      <section id="cli-subpaths" className="scroll-mt-20 space-y-3">
        <h2 className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--nt-display)]">
          Single-Package Subpath Exports
        </h2>
        <div className="overflow-x-auto rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)]">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[var(--nt-line)] bg-[var(--nt-raised)]/60 text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
                <th className="px-4 py-2.5">Import Path</th>
                <th className="px-4 py-2.5">Included Exports</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--nt-line)]">
              {SUBPATH_EXPORTS.map((row) => (
                <tr key={row.subpath}>
                  <td className="px-4 py-3 font-medium text-[var(--nt-accent)] whitespace-nowrap">
                    {row.subpath}
                  </td>
                  <td className="px-4 py-3 font-sans text-[var(--nt-secondary)]">
                    {row.purpose}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
