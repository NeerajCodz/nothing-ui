import * as React from 'react';
import {
  Calendar,
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
} from '@ui-sdk/react/calendar';
import {
  Timeline,
  TimelineConnector,
  TimelineDescription,
  TimelineItem,
  TimelineMarker,
  TimelineTime,
  TimelineTitle,
} from '@ui-sdk/react/timeline';
import {
  FileInput,
  FileInputDropzone,
  FileInputItem,
  FileInputItemRemove,
  FileInputList,
  FileInputTrigger,
  formatFileSize,
} from '@ui-sdk/react/file-input';
import { ArrowUpDown, ChevronLeft, ChevronRight, Pause, Play, RefreshCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DotIcon } from './DotIcon';
import {
  NothingLoader,
  useAsyncAction,
  useResolvedLoading,
  type LoaderVariant,
} from '@nothing-ui/ui';

export function NothingCard({
  title,
  subtitle,
  children,
  loading,
  className,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
}) {
  const resolved = useResolvedLoading({ loading });
  const isBusy = resolved.isLoading;

  if (isBusy) {
    return (
      <div
        aria-busy="true"
        aria-label="Loading card"
        className={cn('nt-card-surface rounded-xl p-5 space-y-3', className)}
      >
        <div className="nt-skeleton h-5 w-2/5 rounded" />
        <div className="nt-skeleton h-3 w-3/5 rounded" />
        <div className="pt-2 space-y-2">
          <div className="nt-skeleton h-3.5 w-full rounded" />
          <div className="nt-skeleton h-3.5 w-5/6 rounded" />
          <div className="nt-skeleton h-3.5 w-2/3 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('nt-card-surface rounded-xl p-5', className)}>
      {title && (
        <h3 className="font-display text-lg tracking-wide text-[var(--nt-display)]">{title}</h3>
      )}
      {subtitle && <p className="mt-1 font-mono text-[11px] text-[var(--nt-muted)]">{subtitle}</p>}
      <div className={title || subtitle ? 'mt-4' : ''}>{children}</div>
    </div>
  );
}

export function NothingCalendar({
  defaultValue = '2026-11-19',
  loading,
  loaderVariant,
}: {
  defaultValue?: string;
  loading?: boolean;
  loaderVariant?: LoaderVariant;
}) {
  const [selected, setSelected] = React.useState(defaultValue);
  const asyncAction = useAsyncAction(450);
  const resolved = useResolvedLoading({
    loading: loading || asyncAction.loading,
    loaderVariant,
  });
  const isBusy = resolved.isLoading;

  return (
    <div className="space-y-3 w-fit" aria-busy={isBusy || undefined}>
      <Calendar
        value={selected}
        onValueChange={(val) => {
          if (val) {
            setSelected(String(val));
            asyncAction.trigger();
          }
        }}
        className={cn(
          'w-fit rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)] p-4 transition-opacity',
          isBusy && 'opacity-75'
        )}
      >
        <div className="mb-3 flex items-center justify-between gap-4">
          <CalendarPrevious
            aria-label="Previous month"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--nt-line)] text-[var(--nt-primary)] hover:border-[var(--nt-display)] cursor-pointer"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </CalendarPrevious>
          <CalendarHeading className="font-display text-base tracking-wide text-[var(--nt-display)]" />
          <CalendarNext
            aria-label="Next month"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--nt-line)] text-[var(--nt-primary)] hover:border-[var(--nt-display)] cursor-pointer"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </CalendarNext>
        </div>
        <CalendarGrid className="border-collapse font-mono text-xs tabular-nums">
          <CalendarWeekdays className="text-[10px] uppercase text-[var(--nt-muted)]">
            {(index) => <CalendarWeekday index={index} className="h-8 w-9 text-center font-normal" />}
          </CalendarWeekdays>
          <CalendarWeeks>
            {(cell) => (
              <CalendarDay
                value={cell.date}
                className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--nt-primary)] transition-colors hover:bg-[var(--nt-raised)] data-outside:opacity-30 data-today:border data-today:border-[#D71921] data-selected:bg-[var(--nt-inverse-bg)] data-selected:text-[var(--nt-inverse-fg)] cursor-pointer"
              />
            )}
          </CalendarWeeks>
        </CalendarGrid>
      </Calendar>
      <div className="flex items-center gap-2 font-mono text-[11px] tabular-nums text-[var(--nt-muted)]">
        {isBusy ? (
          <NothingLoader variant={resolved.variant} size="xs" label="Checking schedule..." tone="display" />
        ) : (
          <span>
            Selected date: <span className="text-[var(--nt-display)]">{selected}</span>
          </span>
        )}
      </div>
    </div>
  );
}

const DEFAULT_TIMELINE_EVENTS = [
  {
    title: 'Registry published',
    time: '21:34',
    dateTime: '2026-11-19T21:34',
    description: '60 Nothing UI primitives bundled with Web + React Native parity.',
  },
  {
    title: 'Glyph curves calibrated',
    time: '21:32',
    dateTime: '2026-11-19T21:32',
    description: '25×25 circular LED mask validated across 8 geometric presets.',
  },
  {
    title: 'Token contrast verified',
    time: '21:30',
    dateTime: '2026-11-19T21:30',
    description: 'OLED dark and paper light surfaces passed AA contrast checks.',
  },
];

export function NothingTimeline({ loading, loaderVariant }: { loading?: boolean; loaderVariant?: LoaderVariant } = {}) {
  const [events, setEvents] = React.useState(DEFAULT_TIMELINE_EVENTS);
  const asyncAction = useAsyncAction(700);
  const resolved = useResolvedLoading({ loading, loaderVariant });
  const isInitialLoading = resolved.isLoading;

  if (isInitialLoading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading timeline">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-3.5">
            <span className="nt-skeleton mt-1 h-2.5 w-2.5 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2 pb-2">
              <div className="nt-skeleton h-3.5 w-2/5 rounded" />
              <div className="nt-skeleton h-3 w-4/5 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Timeline aria-label="Build timeline" className="space-y-4">
        {events.map((ev, idx) => (
          <TimelineItem key={`${ev.title}-${idx}`} className="flex gap-3.5">
            <div className="flex flex-col items-center">
              <TimelineMarker
                className={cn(
                  'mt-1 h-2.5 w-2.5 rounded-full',
                  idx === 0 ? 'bg-[#D71921]' : 'bg-[var(--nt-display)]'
                )}
              />
              {idx < events.length - 1 && (
                <TimelineConnector className="mt-1.5 w-px flex-1 bg-[var(--nt-line-2)]" />
              )}
            </div>
            <div className="pb-2">
              <div className="flex items-center gap-3">
                <TimelineTitle className="font-mono text-xs font-medium text-[var(--nt-display)]">
                  {ev.title}
                </TimelineTitle>
                <TimelineTime
                  dateTime={ev.dateTime}
                  className="font-mono text-[11px] tabular-nums text-[var(--nt-muted)]"
                >
                  {ev.time}
                </TimelineTime>
              </div>
              <TimelineDescription className="mt-1 text-xs leading-relaxed text-[var(--nt-secondary)]">
                {ev.description}
              </TimelineDescription>
            </div>
          </TimelineItem>
        ))}
      </Timeline>
      {events.length < 5 && (
        <button
          type="button"
          disabled={asyncAction.loading}
          aria-busy={asyncAction.loading || undefined}
          onClick={() =>
            asyncAction.trigger(() =>
              setEvents((prev) => [
                ...prev,
                {
                  title: `Snapshot #${prev.length + 1} archived`,
                  time: '21:24',
                  dateTime: '2026-11-19T21:24',
                  description: 'Immutable release bundle checksum recorded in manifest.',
                },
              ])
            )
          }
          className="inline-flex items-center gap-2 rounded-md border border-[var(--nt-line-2)] px-3 py-1.5 font-mono text-[11px] text-[var(--nt-primary)] hover:border-[var(--nt-display)] disabled:opacity-70 cursor-pointer"
        >
          {asyncAction.loading && <NothingLoader variant={resolved.variant} size="xs" decorative />}
          <span>{asyncAction.loading ? 'Loading older events...' : 'Load older events'}</span>
        </button>
      )}
    </div>
  );
}

const STREAM_EVENTS = [
  'tokens · synced dark/light map',
  'glyph · 25×25 frame rendered',
  'ui-sdk · popup focus trap ready',
  'cli · registry manifest built',
  'cache · 35 dot-icons indexed',
  'build #482 · zero warnings',
];

export function ActivityStream() {
  const [paused, setPaused] = React.useState(false);
  const [items, setItems] = React.useState(() => [
    { id: 1, ts: '20:57:34', text: 'db · migration applied' },
    { id: 2, ts: '20:57:32', text: 'webhook · delivered' },
    { id: 3, ts: '20:57:30', text: 'cache · purged' },
    { id: 4, ts: '20:57:28', text: 'deploy · review required' },
  ]);

  React.useEffect(() => {
    if (paused) return;
    let counter = 5;
    const timer = window.setInterval(() => {
      const now = new Date();
      const ts = now.toTimeString().slice(0, 8);
      const text = STREAM_EVENTS[counter % STREAM_EVENTS.length];
      setItems((prev) => [{ id: counter++, ts, text }, ...prev.slice(0, 5)]);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <div className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--nt-secondary)]">
          Activity Stream · {paused ? 'Paused' : 'Live'}
        </span>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          className="inline-flex items-center gap-1.5 rounded border border-[var(--nt-line-2)] px-2 py-1 font-mono text-[10px] text-[var(--nt-primary)] hover:border-[var(--nt-display)] cursor-pointer"
        >
          {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          <span>{paused ? 'Resume' : 'Pause'}</span>
        </button>
      </div>
      <div className="space-y-2 font-mono text-xs tabular-nums">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 border-b border-[var(--nt-line)] pb-1.5 last:border-0 last:pb-0"
          >
            <span className="text-[var(--nt-muted)]">{item.ts}</span>
            <span className="truncate text-[var(--nt-primary)]">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MetricCard({
  label,
  value,
  delta,
  positive = true,
  loading,
}: {
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
  loading?: boolean;
}) {
  const resolved = useResolvedLoading({ loading });
  const isBusy = resolved.isLoading;

  return (
    <div
      aria-busy={isBusy || undefined}
      className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-4"
    >
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--nt-muted)]">
        {label}
      </div>
      {isBusy ? (
        <div className="mt-2 space-y-2.5">
          <div className="nt-skeleton h-8 w-24 rounded" />
          <div className="nt-skeleton h-3 w-32 rounded" />
        </div>
      ) : (
        <>
          <div className="mt-2 font-display text-3xl tabular-nums text-[var(--nt-display)]">
            {value}
          </div>
          {delta && (
            <div
              className={cn(
                'mt-1.5 font-mono text-[11px] tabular-nums',
                positive ? 'text-[var(--nt-secondary)]' : 'text-[#D71921]'
              )}
            >
              {delta}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function LiveCounter({
  label = 'Events This Week',
  target = 1482,
  loading,
  loaderVariant,
}: {
  label?: string;
  target?: number;
  loading?: boolean;
  loaderVariant?: LoaderVariant;
}) {
  const [count, setCount] = React.useState(target - 24);
  const asyncAction = useAsyncAction(600);
  const resolved = useResolvedLoading({
    loading: loading || asyncAction.loading,
    loaderVariant,
  });
  const isBusy = resolved.isLoading;

  const increment = () => {
    asyncAction.trigger(() => setCount((c) => c + 12));
  };

  return (
    <div
      aria-busy={isBusy || undefined}
      className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-4 flex flex-col justify-between"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--nt-muted)]">
          {label}
        </span>
        <button
          type="button"
          disabled={isBusy}
          onClick={increment}
          className="inline-flex items-center gap-1 rounded border border-[var(--nt-line-2)] px-2 py-0.5 font-mono text-[10px] text-[var(--nt-primary)] hover:border-[var(--nt-display)] disabled:opacity-65 cursor-pointer"
        >
          {isBusy && <NothingLoader variant={resolved.variant} size="xs" decorative />}
          <span>{isBusy ? 'Sync' : '+12'}</span>
        </button>
      </div>
      {resolved.isLoading && !asyncAction.loading ? (
        <div className="mt-2 space-y-2.5">
          <div className="nt-skeleton h-9 w-28 rounded" />
          <div className="nt-skeleton h-3 w-32 rounded" />
        </div>
      ) : (
        <>
          <div className="mt-2 font-display text-4xl tabular-nums text-[var(--nt-display)]">
            {count.toLocaleString()}
          </div>
          <div className="mt-1.5 font-mono text-[11px] tabular-nums text-[var(--nt-secondary)]">
            ↑ 12% vs prior cycle
          </div>
        </>
      )}
    </div>
  );
}

interface PackageRow {
  module: string;
  primitive: string;
  sizeKb: number;
  status: 'Stable' | 'Experimental';
}

const TABLE_ROWS: PackageRow[] = [
  { module: 'Button', primitive: '@ui-sdk/react/button', sizeKb: 1.4, status: 'Stable' },
  { module: 'Dialog', primitive: '@ui-sdk/react/dialog', sizeKb: 4.8, status: 'Stable' },
  { module: 'Command', primitive: '@ui-sdk/react/command', sizeKb: 6.2, status: 'Stable' },
  { module: 'Calendar', primitive: '@ui-sdk/react/calendar', sizeKb: 5.5, status: 'Stable' },
  { module: 'GlyphMatrix', primitive: 'Pure SVG / CSS Grid', sizeKb: 2.1, status: 'Stable' },
  { module: 'OTPInput', primitive: '@ui-sdk/react/otp-input', sizeKb: 3.1, status: 'Experimental' },
];

export function NothingDataTable({
  loading,
  loaderVariant,
}: {
  loading?: boolean;
  loaderVariant?: LoaderVariant;
} = {}) {
  const [sortAsc, setSortAsc] = React.useState(true);
  const [query, setQuery] = React.useState('');
  const refreshAction = useAsyncAction(900);
  const resolved = useResolvedLoading({
    loading: loading || refreshAction.loading,
    loaderVariant,
  });
  const isBusy = resolved.isLoading;

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = TABLE_ROWS.filter(
      (r) =>
        !q ||
        r.module.toLowerCase().includes(q) ||
        r.primitive.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
    );
    return [...list].sort((a, b) => (sortAsc ? a.sizeKb - b.sizeKb : b.sizeKb - a.sizeKb));
  }, [query, sortAsc]);

  return (
    <div className="space-y-3" aria-busy={isBusy || undefined}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter modules..."
          aria-label="Filter table modules"
          className="h-9 w-full max-w-xs rounded-md border border-[var(--nt-line-2)] bg-transparent px-3 font-mono text-xs text-[var(--nt-primary)] placeholder:text-[var(--nt-muted)] focus:border-[var(--nt-display)] focus:outline-none"
        />
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] tabular-nums text-[var(--nt-muted)]">
            {isBusy ? 'Refreshing rows...' : `${filtered.length} of ${TABLE_ROWS.length} modules`}
          </span>
          <button
            type="button"
            disabled={isBusy}
            aria-busy={isBusy || undefined}
            onClick={() => refreshAction.trigger()}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-surface)] px-2.5 font-mono text-[11px] text-[var(--nt-display)] hover:border-[var(--nt-display)] disabled:opacity-70 cursor-pointer whitespace-nowrap"
          >
            {isBusy ? (
              <NothingLoader variant={resolved.variant} size="xs" decorative />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            <span>{isBusy ? 'Syncing' : 'Refresh'}</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)]">
        <table className="w-full border-collapse text-left font-mono text-xs">
          <thead className="border-b border-[var(--nt-line)] bg-[var(--nt-raised)]/50 text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Module</th>
              <th className="px-4 py-3 font-medium">Primitive</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">
                <button
                  type="button"
                  onClick={() => setSortAsc((s) => !s)}
                  className="inline-flex items-center gap-1 hover:text-[var(--nt-display)] cursor-pointer"
                >
                  <span>Size (kB)</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--nt-line)] tabular-nums">
            {isBusy ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} data-testid="table-skeleton-row">
                  <td className="px-4 py-3">
                    <div className="nt-skeleton h-3.5 w-24 rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="nt-skeleton h-3.5 w-40 rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="nt-skeleton h-3.5 w-16 rounded" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="nt-skeleton ml-auto h-3.5 w-10 rounded" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[var(--nt-muted)]">
                  No matching modules found.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.module} className="transition-colors hover:bg-[var(--nt-raised)]/40">
                  <td className="px-4 py-3 font-medium text-[var(--nt-display)]">{row.module}</td>
                  <td className="px-4 py-3 text-[var(--nt-secondary)]">{row.primitive}</td>
                  <td className="px-4 py-3 text-[var(--nt-secondary)]">{row.status}</td>
                  <td className="px-4 py-3 text-right text-[var(--nt-primary)]">
                    {row.sizeKb.toFixed(1)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function NothingDropzone({
  loading,
  loaderVariant,
}: {
  loading?: boolean;
  loaderVariant?: LoaderVariant;
} = {}) {
  const [uploadedName, setUploadedName] = React.useState<string | null>(null);
  const uploadAction = useAsyncAction(1100);
  const resolved = useResolvedLoading({
    loading: loading || uploadAction.loading,
    loaderVariant,
  });
  const isBusy = resolved.isLoading;

  return (
    <FileInput multiple className="space-y-3">
      <FileInputDropzone
        aria-busy={isBusy || undefined}
        className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--nt-line-2)] bg-[var(--nt-raised)]/30 p-7 text-center transition-colors data-dragging:border-[#D71921] data-dragging:bg-[#D71921]/8"
      >
        {isBusy ? (
          <NothingLoader variant={resolved.variant} size="md" tone="display" decorative />
        ) : (
          <DotIcon name="download" size={28} className="text-[var(--nt-secondary)]" />
        )}
        <div>
          <p className="font-mono text-xs text-[var(--nt-primary)]">
            {isBusy ? 'Uploading firmware-tokens.json...' : 'Drop files here or browse local assets'}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
            Supports JSON tokens · SVG · Firmware packs
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <FileInputTrigger className="rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-surface)] px-3.5 py-1.5 font-mono text-xs text-[var(--nt-primary)] hover:border-[var(--nt-display)] cursor-pointer">
            Browse Files
          </FileInputTrigger>
          <button
            type="button"
            disabled={isBusy}
            onClick={() =>
              uploadAction.trigger(() => setUploadedName('nothing-os-tokens.json · 42.6 kB'))
            }
            className="inline-flex items-center gap-1.5 rounded-md bg-[var(--nt-inverse-bg)] px-3.5 py-1.5 font-mono text-xs text-[var(--nt-inverse-fg)] hover:opacity-85 disabled:opacity-70 cursor-pointer"
          >
            {isBusy && <NothingLoader variant={resolved.variant} size="xs" decorative />}
            <span>{isBusy ? 'Uploading...' : 'Simulate Upload'}</span>
          </button>
        </div>
      </FileInputDropzone>
      {uploadedName && !isBusy && (
        <div className="flex items-center justify-between rounded-md border border-[var(--nt-line)] bg-[var(--nt-surface)] px-3 py-2 font-mono text-xs">
          <span className="truncate text-[var(--nt-display)]">{uploadedName}</span>
          <span className="text-[11px] text-[var(--nt-success)]">Uploaded</span>
        </div>
      )}
      <FileInputList aria-label="Queued files" className="space-y-1.5">
        <FileInputItem className="flex items-center justify-between rounded-md border border-[var(--nt-line)] bg-[var(--nt-surface)] px-3 py-2 font-mono text-xs">
          {({ file }) => (
            <>
              <span className="truncate text-[var(--nt-primary)]">{file.name}</span>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[var(--nt-muted)] tabular-nums">
                  {formatFileSize(file.size)}
                </span>
                <FileInputItemRemove
                  aria-label={`Remove ${file.name}`}
                  className="text-[var(--nt-muted)] hover:text-[#D71921] cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </FileInputItemRemove>
              </div>
            </>
          )}
        </FileInputItem>
      </FileInputList>
    </FileInput>
  );
}
