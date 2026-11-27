import * as React from 'react';
import {
  ArrowRight,
  ChartBar,
  MagnifyingGlass,
  Terminal,
  X,
} from '@phosphor-icons/react';
import {
  CHART_REGISTRY,
  CHART_VISUALIZATION_KINDS,
  filterChartRegistry,
  type ChartEngine,
  type ChartVisualizationKind,
} from '@nothing-ui/registry';
import { cn, useTheme } from '@nothing-ui/ui';
import { RechartsBarPlaceholder } from './recharts-bar-placeholder';

type KindFilter = 'all' | ChartVisualizationKind;
type EngineFilter = 'all' | ChartEngine;

const KIND_LABELS: Record<KindFilter, string> = {
  all: 'All',
  cartesian: 'Cartesian',
  circular: 'Circular',
  radial: 'Radial',
  relational: 'Relational',
  spatial: 'Spatial',
  custom: 'Custom',
};

export function ChartsHub({
  onSelectChart,
}: {
  onSelectChart: (catalogSlug: string) => void;
}) {
  const { theme } = useTheme();
  const [query, setQuery] = React.useState('');
  const [kindFilter, setKindFilter] = React.useState<KindFilter>('all');
  const [engineFilter, setEngineFilter] = React.useState<EngineFilter>('all');

  const filteredCharts = React.useMemo(
    () => filterChartRegistry(query, { kind: kindFilter, engine: engineFilter }),
    [query, kindFilter, engineFilter],
  );

  return (
    <div className="space-y-10" data-testid="charts-hub">
      {/* Header */}
      <header
        id="charts-header"
        className="scroll-mt-20 space-y-3 border-b border-[var(--nt-line)] pb-6"
      >
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-[var(--nt-muted)]">
          <span className="text-[var(--nt-display)]">Charts</span>
          <span aria-hidden="true">·</span>
          <span>{CHART_REGISTRY.length} Registered Visualizations</span>
          <span aria-hidden="true">·</span>
          <span>Recharts + nthgui SVG</span>
          <span aria-hidden="true">·</span>
          <span>Active Theme: {theme}</span>
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-3xl sm:text-4xl tracking-[0.02em] text-[var(--nt-display)]">
            Nothing UI Charts
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-[var(--nt-secondary)]">
            Dedicated data visualization workspace and component registry — featuring a responsive
            Recharts bar chart demonstration synchronized with the global ThemeProvider alongside
            all registered interactive SVG visualizations.
          </p>
        </div>
      </header>

      {/* Responsive Recharts Bar Chart Placeholder Demo */}
      <section id="charts-bar-demo" className="scroll-mt-20 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-2xl text-[var(--nt-display)]">
            Responsive Bar Chart Demo (Recharts)
          </h2>
          <span className="font-mono text-xs text-[var(--nt-muted)]">
            Synced with Light / Dark / High Contrast root theme
          </span>
        </div>

        <RechartsBarPlaceholder />
      </section>

      {/* Data Visualization Component Registry */}
      <section
        id="charts-registry"
        className="scroll-mt-20 space-y-5 border-t border-[var(--nt-line)] pt-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--nt-accent)]">
              Data Visualization Registry
            </div>
            <h2 className="font-display text-2xl text-[var(--nt-display)]">
              Registered Chart Components ({CHART_REGISTRY.length})
            </h2>
            <p className="max-w-2xl text-xs leading-relaxed text-[var(--nt-secondary)]">
              Inspect any registered visualization module to open its interactive preview, live
              Props Playground, React Native spec, and CLI install command.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <MagnifyingGlass
                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--nt-muted)]"
                aria-hidden="true"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search chart registry..."
                aria-label="Search chart registry"
                className="h-8 w-52 rounded-lg border border-[var(--nt-line-2)] bg-[var(--nt-surface)] pl-8 pr-7 font-mono text-xs text-[var(--nt-display)] placeholder:text-[var(--nt-muted)] focus:border-[var(--nt-display)] focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear chart registry search"
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--nt-muted)] hover:text-[var(--nt-display)] cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <div
              role="group"
              aria-label="Filter chart registry by engine"
              className="inline-flex items-center gap-0.5 rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] p-0.5 font-mono text-[11px]"
            >
              {(
                [
                  { id: 'all', label: 'All Engines' },
                  { id: 'recharts', label: 'Recharts' },
                  { id: 'nthgui-svg', label: 'nthgui SVG' },
                ] as const
              ).map(({ id, label }) => {
                const active = engineFilter === id;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setEngineFilter(id)}
                    className={cn(
                      'rounded-md px-2 py-1 transition-colors cursor-pointer whitespace-nowrap',
                      active
                        ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                        : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div
          role="group"
          aria-label="Filter chart registry by visualization kind"
          className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-1 font-mono text-[11px]"
        >
          {(['all', ...CHART_VISUALIZATION_KINDS] as KindFilter[]).map((kind) => {
            const count =
              kind === 'all'
                ? CHART_REGISTRY.length
                : CHART_REGISTRY.filter((entry) => entry.kind === kind).length;
            const active = kindFilter === kind;
            return (
              <button
                key={kind}
                type="button"
                aria-pressed={active}
                onClick={() => setKindFilter(kind)}
                className={cn(
                  'rounded-lg px-2.5 py-1 transition-colors whitespace-nowrap cursor-pointer',
                  active
                    ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                    : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
                )}
              >
                {KIND_LABELS[kind]} ({count})
              </button>
            );
          })}
        </div>

        {filteredCharts.length === 0 ? (
          <p className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-6 font-mono text-xs text-[var(--nt-muted)]">
            No registered charts match the current search or filter.
          </p>
        ) : (
          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
            data-testid="chart-registry-grid"
          >
            {filteredCharts.map((entry) => (
              <button
                key={entry.id}
                type="button"
                data-testid={`chart-registry-card-${entry.id}`}
                onClick={() => onSelectChart(entry.catalogSlug)}
                className="group flex flex-col justify-between rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5 text-left transition-colors hover:border-[var(--nt-display)] cursor-pointer space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 font-mono text-[10px] text-[var(--nt-muted)]">
                    <span className="flex items-center gap-1.5 uppercase tracking-[0.08em]">
                      <ChartBar className="h-3.5 w-3.5 text-[var(--nt-accent)]" />
                      <span>{entry.kind}</span>
                    </span>
                    <span
                      className={cn(
                        'tabular-nums',
                        entry.engine === 'recharts'
                          ? 'text-[var(--nt-accent)]'
                          : 'text-[var(--nt-success)]',
                      )}
                    >
                      {entry.engine} · {entry.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-mono text-sm font-medium text-[var(--nt-display)] group-hover:underline">
                      {entry.name}
                    </h3>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[var(--nt-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--nt-display)]" />
                  </div>

                  <p className="text-xs leading-relaxed text-[var(--nt-secondary)]">
                    {entry.description}
                  </p>
                </div>

                <div className="space-y-2 border-t border-[var(--nt-line)] pt-3 font-mono text-[10px] text-[var(--nt-muted)]">
                  <div className="truncate text-[var(--nt-secondary)]">
                    {entry.supportedFeatures.slice(0, 3).join(' · ')}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 truncate text-[var(--nt-display)]">
                      <Terminal className="h-3 w-3 shrink-0 text-[var(--nt-accent)]" />
                      <span className="truncate">npx nthgui add {entry.catalogSlug}</span>
                    </span>
                    <span className="shrink-0 tabular-nums">{entry.defaultHeight}px</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
