import * as React from 'react';
import {
  ArrowRight,
  CalendarBlank,
  CheckCircle,
  Clock,
  Cpu,
  GridFour,
  SquaresFour,
  Terminal,
  VideoCamera,
  Wrench,
} from '@phosphor-icons/react';
import {
  CLOCK_WIDGET_SLUGS,
  PLANNED_WIDGETS,
  SHIPPED_ROADMAP_WIDGET_COUNT,
  WIDGET_GROUPS,
  getChartsCatalog,
  getComponentCatalog,
  getWidgetCatalog,
  type PlannedWidgetEntry,
  type WidgetGroup,
} from '@nothing-ui/registry';
import {
  AnalogClock,
  AnalogClockWidget,
  Button,
  CalendarWidget,
  FlipClockWidget,
  RadialClockWidget,
  WordClockWidget,
  cn,
} from '@nothing-ui/ui';

type LiveWidgetGroupFilter = 'All' | 'Clocks' | WidgetGroup;
type RoadmapGroupFilter = 'All' | WidgetGroup;
type PriorityFilter = 'All' | PlannedWidgetEntry['priority'];

const LIVE_GROUPS: readonly LiveWidgetGroupFilter[] = ['All', 'Clocks', ...WIDGET_GROUPS];

const ROADMAP_GROUPS: readonly RoadmapGroupFilter[] = ['All', ...WIDGET_GROUPS];
const PRIORITIES: readonly PriorityFilter[] = ['All', 'P1', 'P2', 'P3'];

function getGroupIcon(group?: WidgetGroup) {
  switch (group) {
    case 'Calendar & Time':
      return CalendarBlank;
    case 'Audio & Video':
      return VideoCamera;
    case 'Hardware OS':
      return Cpu;
    default:
      return Wrench;
  }
}

export function WidgetsHub({
  onSelectWidget,
  onOpenComponents,
  onOpenCharts,
  onOpenGlyph,
}: {
  onSelectWidget: (slug: string) => void;
  onOpenComponents: () => void;
  onOpenCharts: () => void;
  onOpenGlyph: () => void;
}) {
  const [liveGroup, setLiveGroup] = React.useState<LiveWidgetGroupFilter>('All');
  const [roadmapGroup, setRoadmapGroup] = React.useState<RoadmapGroupFilter>('All');
  const [priorityFilter, setPriorityFilter] = React.useState<PriorityFilter>('All');

  const liveWidgets = React.useMemo(() => getWidgetCatalog(), []);
  const componentCount = React.useMemo(() => getComponentCatalog().length, []);
  const chartCount = React.useMemo(() => getChartsCatalog().length, []);
  const clockCount = React.useMemo(
    () => liveWidgets.filter((w) => CLOCK_WIDGET_SLUGS.has(w.slug)).length,
    [liveWidgets],
  );

  const filteredLiveWidgets = React.useMemo(() => {
    if (liveGroup === 'All') return liveWidgets;
    if (liveGroup === 'Clocks') {
      return liveWidgets.filter((entry) => CLOCK_WIDGET_SLUGS.has(entry.slug));
    }
    return liveWidgets.filter((entry) => entry.widgetGroup === liveGroup);
  }, [liveWidgets, liveGroup]);

  const filteredPlannedWidgets = React.useMemo(() => {
    return PLANNED_WIDGETS.filter((entry) => {
      if (roadmapGroup !== 'All' && entry.group !== roadmapGroup) return false;
      if (priorityFilter !== 'All' && entry.priority !== priorityFilter) return false;
      return true;
    });
  }, [roadmapGroup, priorityFilter]);

  return (
    <div className="space-y-10" data-testid="widgets-hub">
      {/* Header */}
      <header
        id="widgets-header"
        className="scroll-mt-20 space-y-3 border-b border-[var(--nt-line)] pb-6"
      >
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-[var(--nt-muted)]">
          <span className="text-[var(--nt-display)]">Widgets</span>
          <span aria-hidden="true">·</span>
          <span>{liveWidgets.length} Shipped Live</span>
          <span aria-hidden="true">·</span>
          <span>{clockCount} Clock Varieties</span>
          <span aria-hidden="true">·</span>
          <span>
            {PLANNED_WIDGETS.length === 0
              ? '100% Roadmap Shipped'
              : `${PLANNED_WIDGETS.length} Planned Roadmap`}
          </span>
          <span aria-hidden="true">·</span>
          <span>Web + React Native (nthgui)</span>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="font-display text-3xl sm:text-4xl tracking-[0.02em] text-[var(--nt-display)]">
              Nothing UI Widgets
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-[var(--nt-secondary)]">
              Self-contained, stateful mini-applications — Analog, Split-Flap, Binary, Word Matrix,
              and Orbital Clocks, Pedometer &amp; Power Hubs, Podcast &amp; Voice Memo Decks,
              Pomodoro Sprints, 90-Day Habit Matrix, and Unit/FX Converters — strictly separated from
              atomic Components and the standalone Glyph System.
            </p>
          </div>

          <Button variant="primary" size="sm" onClick={() => onSelectWidget('clock-collection')}>
            <Clock className="h-3.5 w-3.5" />
            Open Clock Studio ({clockCount})
          </Button>
        </div>
      </header>

      {/* 3-Track Architecture Distinction */}
      <section
        id="widgets-pillars"
        className="scroll-mt-20 grid grid-cols-1 gap-4 md:grid-cols-3"
        aria-label="Nothing UI 3-track taxonomy"
      >
        {/* Pillar 1: Components */}
        <div className="flex flex-col justify-between rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 font-mono text-[10px] text-[var(--nt-muted)] whitespace-nowrap">
              <span className="uppercase tracking-[0.1em]">Track 01 · Primitives</span>
              <span className="tabular-nums text-[var(--nt-display)]">{componentCount} live</span>
            </div>
            <h2 className="font-display text-xl text-[var(--nt-display)]">Components</h2>
            <p className="text-xs leading-relaxed text-[var(--nt-secondary)]">
              Reusable atomic UI building blocks across Inputs &amp; Actions, Navigation &amp;
              Layout, Overlays &amp; Feedback, dedicated{' '}
              <span className="text-[var(--nt-display)]">Charts ({chartCount})</span>, and Data
              &amp; Hardware.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-[var(--nt-line)] pt-3">
            <Button variant="outline" size="sm" onClick={onOpenComponents}>
              Browse Components
            </Button>
            <Button variant="ghost" size="sm" onClick={onOpenCharts}>
              Charts ({chartCount}) →
            </Button>
          </div>
        </div>

        {/* Pillar 2: Widgets (Active) */}
        <div className="flex flex-col justify-between rounded-2xl border border-[var(--nt-display)] bg-[var(--nt-surface)] p-5 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 font-mono text-[10px] text-[var(--nt-muted)] whitespace-nowrap">
              <span className="uppercase tracking-[0.1em] text-[var(--nt-accent)]">
                Track 02 · Mini-Apps
              </span>
              <span className="tabular-nums text-[var(--nt-display)]">
                {PLANNED_WIDGETS.length === 0
                  ? `${liveWidgets.length} live · 100%`
                  : `${liveWidgets.length} live · +${PLANNED_WIDGETS.length}`}
              </span>
            </div>
            <h2 className="font-display text-xl text-[var(--nt-display)]">Widgets</h2>
            <p className="text-xs leading-relaxed text-[var(--nt-secondary)]">
              Complete, drop-in functional modules that compose multiple primitives with domain
              state — {clockCount} Clock varieties, Hardware OS telemetry, Audio/Video decks, and
              Productivity tools.
            </p>
          </div>
          <div className="flex items-center justify-between border-t border-[var(--nt-line)] pt-3 font-mono text-[11px] text-[var(--nt-display)]">
            <span className="flex items-center gap-1.5">
              <SquaresFour className="h-3.5 w-3.5 text-[var(--nt-accent)]" />
              Active Workspace
            </span>
            <span className="tabular-nums text-[var(--nt-muted)]">4 groups</span>
          </div>
        </div>

        {/* Pillar 3: Glyph System */}
        <div className="flex flex-col justify-between rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 font-mono text-[10px] text-[var(--nt-muted)] whitespace-nowrap">
              <span className="uppercase tracking-[0.1em]">Track 03 · LED Matrix</span>
              <span className="tabular-nums text-[var(--nt-display)]">13×13 · 25×25</span>
            </div>
            <h2 className="font-display text-xl text-[var(--nt-display)]">Glyph System</h2>
            <p className="text-xs leading-relaxed text-[var(--nt-secondary)]">
              Standalone addressable LED matrix architecture — neither a standard Component nor a
              Widget. Ships with Glyph Studio, frame timeline animator, and SVG/JSON hardware
              export.
            </p>
          </div>
          <div className="flex items-center justify-between border-t border-[var(--nt-line)] pt-3">
            <Button variant="outline" size="sm" onClick={onOpenGlyph}>
              <GridFour className="h-3.5 w-3.5" />
              Open Glyph Studio
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Clock Varieties Live Preview Strip */}
      <section
        id="widgets-clocks-preview"
        className="scroll-mt-20 space-y-4"
        aria-label="Clock varieties live preview"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl text-[var(--nt-display)]">
              Clock Varieties Suite ({clockCount})
            </h2>
            <p className="mt-1 text-xs text-[var(--nt-secondary)]">
              Analog dials (Minimal Dots, Railway, Chronograph, Skeleton, Bauhaus), Split-Flap,
              Binary BCD, Typographic Word Matrix, Orbital/Solar Radial, World Deck, and Stopwatch.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onSelectWidget('nothing-analog-clock')}>
              Doto AnalogClock
            </Button>
            <Button variant="outline" size="sm" onClick={() => onSelectWidget('calendar-widget')}>
              CalendarWidget
            </Button>
            <Button variant="outline" size="sm" onClick={() => onSelectWidget('clock-collection')}>
              Compare All in Studio →
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <AnalogClock size={220} />
          <CalendarWidget />
          <AnalogClockWidget defaultDial="chronograph" size={184} />
          <FlipClockWidget />
          <WordClockWidget />
          <RadialClockWidget defaultMode="orbital" />
        </div>
      </section>

      {/* Shipped Live Widgets */}
      <section id="widgets-live" className="scroll-mt-20 space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-[var(--nt-display)]">
              Shipped Live Widgets ({liveWidgets.length})
            </h2>
            <p className="mt-1 text-xs text-[var(--nt-secondary)]">
              Every widget ships with interactive Web preview, React Native parity, CLI install, and
              API props table.
            </p>
          </div>

          <div
            role="group"
            aria-label="Filter live widgets by group"
            className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-1 font-mono text-[11px]"
          >
            {LIVE_GROUPS.map((group) => {
              const count =
                group === 'All'
                  ? liveWidgets.length
                  : group === 'Clocks'
                    ? clockCount
                    : liveWidgets.filter((w) => w.widgetGroup === group).length;
              const active = liveGroup === group;
              return (
                <button
                  key={group}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setLiveGroup(group)}
                  className={cn(
                    'rounded-lg px-2.5 py-1 transition-colors whitespace-nowrap cursor-pointer',
                    active
                      ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                      : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
                  )}
                >
                  {group} ({count})
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
          data-testid="live-widgets-grid"
        >
          {filteredLiveWidgets.map((widget) => {
            const GroupIcon = getGroupIcon(widget.widgetGroup);
            return (
              <button
                key={widget.slug}
                type="button"
                data-testid={`widget-card-${widget.slug}`}
                onClick={() => onSelectWidget(widget.slug)}
                className="group flex flex-col justify-between rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5 text-left transition-colors hover:border-[var(--nt-display)] cursor-pointer space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 font-mono text-[10px] text-[var(--nt-muted)]">
                    <span className="flex items-center gap-1.5">
                      <GroupIcon className="h-3.5 w-3.5 text-[var(--nt-accent)]" />
                      <span>{widget.widgetGroup}</span>
                    </span>
                    <span className="tabular-nums text-[var(--nt-success)]">
                      {widget.moduleNumber} · {widget.web}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-mono text-sm font-medium text-[var(--nt-display)] group-hover:underline">
                      {widget.title}
                    </h3>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[var(--nt-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--nt-display)]" />
                  </div>

                  <p className="text-xs leading-relaxed text-[var(--nt-secondary)]">
                    {widget.description}
                  </p>
                </div>

                <div className="space-y-2 border-t border-[var(--nt-line)] pt-3 font-mono text-[10px] text-[var(--nt-muted)]">
                  <div className="flex items-center gap-1.5 truncate text-[var(--nt-display)]">
                    <Terminal className="h-3 w-3 shrink-0 text-[var(--nt-accent)]" />
                    <span className="truncate">npx nthgui add {widget.slug}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{widget.web === 'stable' ? 'Web' : `Web: ${widget.web}`}</span>
                    <span>{widget.native === 'stable' ? 'Native' : `Native: ${widget.native}`}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Planned Widgets Roadmap / 100% Shipped Milestone */}
      <section
        id="widgets-roadmap"
        className="scroll-mt-20 space-y-5 border-t border-[var(--nt-line)] pt-8"
      >
        {PLANNED_WIDGETS.length === 0 ? (
          <div
            data-testid="roadmap-complete-banner"
            className="rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-6 space-y-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 font-mono text-xs text-[var(--nt-success)]">
                  <CheckCircle className="h-4 w-4" weight="fill" />
                  <span>Roadmap Complete · 0 Remaining</span>
                </div>
                <h2 className="font-display text-2xl text-[var(--nt-display)]">
                  All {SHIPPED_ROADMAP_WIDGET_COUNT} Planned Widgets Shipped Live
                </h2>
                <p className="max-w-2xl text-xs leading-relaxed text-[var(--nt-secondary)]">
                  Every planned Hardware OS, Calendar &amp; Time, Audio &amp; Video, and
                  Productivity widget — plus 6 dedicated Clock Varieties — is now live with full
                  React Native parity and offline CLI scaffolding.
                </p>
              </div>
              <div className="font-mono text-xs tabular-nums text-[var(--nt-muted)]">
                {liveWidgets.length} / {liveWidgets.length} Live
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-[var(--nt-line)] pt-4">
              {(
                [
                  { slug: 'pedometer-ring', label: 'Pedometer Ring' },
                  { slug: 'battery-health-hub', label: 'Power Hub' },
                  { slug: 'stopwatch-timer', label: 'Stopwatch & Timer' },
                  { slug: 'world-clock-deck', label: 'World Clock' },
                  { slug: 'pomodoro-focus-card', label: 'Pomodoro Deck' },
                  { slug: 'habit-matrix-tracker', label: '90-Day Habit Matrix' },
                  { slug: 'unit-fx-converter', label: 'Unit & FX Converter' },
                ] as const
              ).map((item) => (
                <Button
                  key={item.slug}
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectWidget(item.slug)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-1">
                <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--nt-accent)]">
                  Next-Wave Widget Architecture
                </div>
                <h2 className="font-display text-2xl text-[var(--nt-display)]">
                  Planned Widgets Roadmap ({PLANNED_WIDGETS.length})
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div
                  role="group"
                  aria-label="Filter planned widgets by priority"
                  className="inline-flex items-center gap-1 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-1 font-mono text-[11px]"
                >
                  {PRIORITIES.map((priority) => {
                    const active = priorityFilter === priority;
                    return (
                      <button
                        key={priority}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setPriorityFilter(priority)}
                        className={cn(
                          'rounded-lg px-2 py-1 transition-colors cursor-pointer',
                          active
                            ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                            : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
                        )}
                      >
                        {priority}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div
              role="group"
              aria-label="Filter planned widgets by group"
              className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-1 font-mono text-[11px]"
            >
              {ROADMAP_GROUPS.map((group) => {
                const count =
                  group === 'All'
                    ? PLANNED_WIDGETS.length
                    : PLANNED_WIDGETS.filter((w) => w.group === group).length;
                const active = roadmapGroup === group;
                return (
                  <button
                    key={group}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setRoadmapGroup(group)}
                    className={cn(
                      'rounded-lg px-2.5 py-1 transition-colors whitespace-nowrap cursor-pointer',
                      active
                        ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                        : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
                    )}
                  >
                    {group} ({count})
                  </button>
                );
              })}
            </div>

            {filteredPlannedWidgets.length === 0 ? (
              <p className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-6 font-mono text-xs text-[var(--nt-muted)]">
                No planned widgets match the selected group and priority filter.
              </p>
            ) : (
              <div
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
                data-testid="planned-widgets-grid"
              >
                {filteredPlannedWidgets.map((widget) => {
                  const GroupIcon = getGroupIcon(widget.group);
                  return (
                    <div
                      key={widget.slug}
                      data-testid={`planned-widget-${widget.slug}`}
                      className="flex flex-col justify-between rounded-2xl border border-dashed border-[var(--nt-line-2)] bg-[var(--nt-surface)]/70 p-5 space-y-4"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2 font-mono text-[10px] text-[var(--nt-muted)]">
                          <span className="flex items-center gap-1.5">
                            <GroupIcon className="h-3.5 w-3.5" />
                            <span>{widget.group}</span>
                          </span>
                          <span className="tabular-nums font-medium text-[var(--nt-display)]">
                            {widget.priority} · Planned
                          </span>
                        </div>
                        <h3 className="font-mono text-sm font-medium text-[var(--nt-display)]">
                          {widget.title}
                        </h3>
                        <p className="text-xs leading-relaxed text-[var(--nt-secondary)]">
                          {widget.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
