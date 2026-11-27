import * as React from 'react';
import {
  Check,
  Code,
  Copy,
  Desktop,
  DeviceMobile,
  DeviceTablet,
  MagnifyingGlass,
  Terminal,
  X,
} from '@phosphor-icons/react';
import { formatCliAdd, type PackageManager } from '@nothing-ui/registry';
import { Button, cn } from '@nothing-ui/ui';
import {
  SHOWCASE_CATALOG,
  SHOWCASE_CATEGORIES,
  countShowcasesByKind,
  filterShowcaseItems,
  type ShowcaseCategory,
  type ShowcaseMeta,
} from '../../lib/showcase';
import {
  AudioConsoleBlock,
  LockscreenDeckBlock,
  PasskeyAuthBlock,
  TelemetryOpsBlock,
  WorkspaceKanbanBlock,
} from '../blocks/blocks-gallery';
import {
  DeveloperApiConsoleShowcase,
  GlyphFocusComposerShowcase,
  HardwareStoreConfiguratorShowcase,
  LiveWidgetWallShowcase,
  ProCameraDeckShowcase,
} from './new-showcases';

type ViewportMode = 'desktop' | 'tablet' | 'mobile';
const PACKAGE_MANAGERS: PackageManager[] = ['bun', 'pnpm', 'npm', 'yarn'];

function renderShowcaseCanvas(id: string): React.ReactNode {
  switch (id) {
    case 'showcase-os-lockscreen':
      return <LockscreenDeckBlock />;
    case 'showcase-widget-wall':
      return <LiveWidgetWallShowcase />;
    case 'showcase-camera-deck':
      return <ProCameraDeckShowcase />;
    case 'showcase-audio-console':
      return <AudioConsoleBlock />;
    case 'showcase-glyph-focus':
      return <GlyphFocusComposerShowcase />;
    case 'showcase-telemetry-ops':
      return <TelemetryOpsBlock />;
    case 'showcase-developer-api':
      return <DeveloperApiConsoleShowcase />;
    case 'showcase-hardware-store':
      return <HardwareStoreConfiguratorShowcase />;
    case 'showcase-passkey-auth':
      return <PasskeyAuthBlock />;
    case 'showcase-workspace-kanban':
      return <WorkspaceKanbanBlock />;
    default:
      return null;
  }
}

function kindLabel(kind: ShowcaseMeta['kind']): string {
  if (kind === 'block') return 'OS Block';
  if (kind === 'widgets') return '5 Hardware Widgets';
  return 'Interactive Showcase';
}

export function ShowcaseGallery({
  onSelectComponent,
}: {
  onSelectComponent: (slug: string) => void;
}) {
  const [category, setCategory] = React.useState<ShowcaseCategory>('All');
  const [query, setQuery] = React.useState('');
  const [pm, setPm] = React.useState<PackageManager>('npm');
  const [tabById, setTabById] = React.useState<Record<string, 'preview' | 'code'>>({});
  const [viewportById, setViewportById] = React.useState<Record<string, ViewportMode>>({});
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const counts = React.useMemo(() => countShowcasesByKind(), []);
  const visibleItems = React.useMemo(
    () => filterShowcaseItems(query, category),
    [query, category],
  );

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1600);
    } catch {
      setCopiedKey(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header
        id="showcase-header"
        className="scroll-mt-20 space-y-3 border-b border-[var(--nt-line)] pb-6"
      >
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-[var(--nt-muted)]">
          <span className="text-[var(--nt-display)]">Nothing UI Showcase</span>
          <span aria-hidden="true">·</span>
          <span>
            {counts.total} Live Experiences ({counts.blocks} OS Blocks · 5 Hardware Widgets · {counts.templates} New Templates)
          </span>
          <span aria-hidden="true">·</span>
          <span>Single Package: nthgui</span>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <h1 className="font-display text-3xl sm:text-4xl tracking-[0.02em] text-[var(--nt-display)] text-balance">
              Blocks, Widgets &amp; Full-Page Showcases
            </h1>
            <p className="text-sm leading-relaxed text-[var(--nt-secondary)]">
              Real interactive layouts, Nothing OS hardware decks, developer consoles, and commerce
              flows built exclusively with{' '}
              <code className="font-mono text-xs text-[var(--nt-display)]">nthgui</code>. Switch
              viewports, trigger live loading states, inspect TSX source, or scaffold via CLI.
            </p>
          </div>

          <div className="inline-flex rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] p-0.5 font-mono text-[11px]">
            {PACKAGE_MANAGERS.map((manager) => (
              <button
                key={manager}
                type="button"
                aria-pressed={pm === manager}
                onClick={() => setPm(manager)}
                className={cn(
                  'rounded-md px-2.5 py-1 transition-colors cursor-pointer whitespace-nowrap',
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
      </header>

      {/* Search + Category Filter */}
      <div id="showcase-filter" className="scroll-mt-20 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <MagnifyingGlass
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--nt-muted)]"
              aria-hidden="true"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${SHOWCASE_CATALOG.length} showcases, blocks, or primitives...`}
              aria-label="Filter showcases"
              className="h-9 w-full rounded-lg border border-[var(--nt-line-2)] bg-[var(--nt-surface)] pl-8 pr-8 font-mono text-xs text-[var(--nt-display)] placeholder:text-[var(--nt-muted)] focus:border-[var(--nt-display)] focus:outline-none"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear showcase search"
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--nt-muted)] hover:text-[var(--nt-display)] cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <span className="font-mono text-xs tabular-nums text-[var(--nt-muted)]">
            Showing {visibleItems.length} of {SHOWCASE_CATALOG.length}
          </span>
        </div>

        <div
          role="group"
          aria-label="Showcase category filter"
          className="flex flex-wrap items-center gap-1.5"
        >
          {SHOWCASE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              aria-pressed={category === cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'rounded-lg border px-3 py-1.5 font-mono text-xs whitespace-nowrap transition-colors cursor-pointer',
                category === cat
                  ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Empty Search State */}
      {visibleItems.length === 0 ? (
        <div className="rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-10 text-center space-y-3">
          <p className="font-mono text-xs text-[var(--nt-muted)]">
            No showcases match &ldquo;{query}&rdquo; in {category}.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setQuery('');
              setCategory('All');
            }}
          >
            Reset Showcase Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-10">
          {visibleItems.map((item) => {
            const activeTab = tabById[item.id] ?? 'preview';
            const viewport = viewportById[item.id] ?? 'desktop';
            const cliCmd = formatCliAdd(pm, item.cliTarget);

            return (
              <section
                key={item.id}
                id={item.id}
                data-testid={`showcase-card-${item.id}`}
                className="scroll-mt-20 space-y-4 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--nt-line)] pb-4">
                  <div className="space-y-1 max-w-2xl">
                    <div className="font-mono text-[11px] text-[var(--nt-muted)]">
                      {item.category} · {kindLabel(item.kind)} · {item.includedSlugs.length}{' '}
                      primitives
                    </div>
                    <h2 className="font-display text-2xl text-[var(--nt-display)]">
                      {item.title}
                    </h2>
                    <p className="text-xs leading-relaxed text-[var(--nt-secondary)]">
                      {item.description}
                    </p>
                  </div>

                  {/* Preview/Code + Viewport Width */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] p-0.5 font-mono text-xs">
                      <button
                        type="button"
                        aria-pressed={activeTab === 'preview'}
                        onClick={() => setTabById((p) => ({ ...p, [item.id]: 'preview' }))}
                        className={cn(
                          'rounded-md px-2.5 py-1 cursor-pointer whitespace-nowrap',
                          activeTab === 'preview'
                            ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                            : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
                        )}
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        aria-pressed={activeTab === 'code'}
                        onClick={() => setTabById((p) => ({ ...p, [item.id]: 'code' }))}
                        className={cn(
                          'inline-flex items-center gap-1 rounded-md px-2.5 py-1 cursor-pointer whitespace-nowrap',
                          activeTab === 'code'
                            ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                            : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
                        )}
                      >
                        <Code className="h-3.5 w-3.5" />
                        Code
                      </button>
                    </div>

                    {activeTab === 'preview' && (
                      <div className="hidden sm:inline-flex rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] p-0.5">
                        {(
                          [
                            { id: 'desktop', icon: Desktop, label: 'Desktop width' },
                            { id: 'tablet', icon: DeviceTablet, label: 'Tablet width' },
                            { id: 'mobile', icon: DeviceMobile, label: 'Mobile width' },
                          ] as const
                        ).map(({ id, icon: Icon, label }) => (
                          <button
                            key={id}
                            type="button"
                            aria-label={label}
                            aria-pressed={viewport === id}
                            onClick={() => setViewportById((p) => ({ ...p, [item.id]: id }))}
                            className={cn(
                              'inline-flex h-7 w-7 items-center justify-center rounded-md cursor-pointer',
                              viewport === id
                                ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                                : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Single-Package CLI Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] px-3.5 py-2.5">
                  <div className="flex items-center gap-2 min-w-0 font-mono text-xs">
                    <Terminal className="h-3.5 w-3.5 shrink-0 text-[var(--nt-accent)]" />
                    <code className="truncate text-[var(--nt-display)]">{cliCmd}</code>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(`cli-${item.id}`, cliCmd)}
                  >
                    {copiedKey === `cli-${item.id}` ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copiedKey === `cli-${item.id}` ? 'Copied' : 'Copy CLI'}
                  </Button>
                </div>

                {/* Live Stage or Code */}
                {activeTab === 'preview' ? (
                  <div className="overflow-x-auto rounded-xl border border-[var(--nt-line)] bg-[var(--nt-raised)]/30 p-4">
                    <div
                      className={cn(
                        'mx-auto transition-all duration-200',
                        viewport === 'desktop'
                          ? 'w-full'
                          : viewport === 'tablet'
                            ? 'max-w-[768px]'
                            : 'max-w-[390px]',
                      )}
                    >
                      {renderShowcaseCanvas(item.id)}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-end">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleCopy(`code-${item.id}`, item.code)}
                      >
                        {copiedKey === `code-${item.id}` ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        {copiedKey === `code-${item.id}` ? 'Copied TSX' : 'Copy TSX'}
                      </Button>
                    </div>
                    <pre className="overflow-x-auto rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-4 font-mono text-xs leading-relaxed text-[var(--nt-primary)]">
                      <code>{item.code}</code>
                    </pre>
                  </div>
                )}

                {/* Linked Primitives */}
                <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
                  <span className="text-[var(--nt-muted)]">Primitives used:</span>
                  {item.includedSlugs.map((slug) => (
                    <button
                      key={slug}
                      type="button"
                      onClick={() => onSelectComponent(slug)}
                      className="rounded-md border border-[var(--nt-line)] bg-[var(--nt-bg)] px-2 py-0.5 text-[var(--nt-secondary)] hover:border-[var(--nt-display)] hover:text-[var(--nt-display)] cursor-pointer"
                    >
                      {slug} →
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
