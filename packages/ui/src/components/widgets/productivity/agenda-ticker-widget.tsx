import * as React from 'react';
import { cn } from '../../../lib/cn';

interface AgendaEvent {
  id: string;
  title: string;
  timeRange: string;
  startsInMin: number;
  room: string;
  joinUrl: string;
  host: string;
}

const INITIAL_EVENTS: readonly AgendaEvent[] = [
  {
    id: 'ev1',
    title: 'Hardware Systems Architecture Review',
    timeRange: '10:30 – 11:15',
    startsInMin: 12,
    room: 'Studio B · Floor 4',
    joinUrl: 'https://meet.nothing.design/hw-arch-04',
    host: 'Carl & Industrial Design',
  },
  {
    id: 'ev2',
    title: 'Glyph SDK v3 Firmware Sync',
    timeRange: '13:00 – 13:45',
    startsInMin: 162,
    room: 'Lab 2 · Acoustic Wing',
    joinUrl: 'https://meet.nothing.design/glyph-sdk',
    host: 'Firmware Core',
  },
  {
    id: 'ev3',
    title: 'Weekly Typography & Motion Critique',
    timeRange: '15:30 – 16:00',
    startsInMin: 312,
    room: 'Open Atrium',
    joinUrl: 'https://meet.nothing.design/type-crit',
    host: 'Brand Systems',
  },
];

export interface AgendaTickerWidgetProps {
  className?: string;
}

export function AgendaTickerWidget({ className }: AgendaTickerWidgetProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [snoozeMin, setSnoozeMin] = React.useState(0);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const event = INITIAL_EVENTS[activeIndex] ?? INITIAL_EVENTS[0];
  const countdownMin = event.startsInMin + snoozeMin;
  const urgent = countdownMin <= 15;

  const copyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(event.joinUrl).catch(() => {});
    }
    setCopiedId(event.id);
    window.setTimeout(() => setCopiedId(null), 1500);
  };

  const selectEvent = (idx: number) => {
    setActiveIndex(idx);
    setSnoozeMin(0);
  };

  return (
    <section
      aria-label="Next-Up Agenda Ticker"
      className={cn(
        'rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5 text-[var(--nt-display)]',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[var(--nt-line)]">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Next-Up Agenda Ticker</h3>
          <p className="text-xs text-[var(--nt-muted)] mt-0.5 font-mono tabular-nums">
            Event 0{activeIndex + 1} of 0{INITIAL_EVENTS.length} · {event.timeRange}
          </p>
        </div>

        <span
          className={cn(
            'font-mono tabular-nums text-xs font-semibold',
            urgent ? 'text-[var(--nt-accent)]' : 'text-[var(--nt-display)]',
          )}
        >
          In {countdownMin} min
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-4 space-y-3">
        <div>
          <div className="text-base font-semibold tracking-tight text-[var(--nt-display)]">
            {event.title}
          </div>
          <div className="text-xs text-[var(--nt-muted)] mt-1">
            {event.room} · {event.host}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] px-3 py-2">
          <span className="font-mono text-xs text-[var(--nt-muted)] truncate">
            {event.joinUrl}
          </span>
          <button
            type="button"
            onClick={copyLink}
            className="px-2.5 py-1 text-[11px] font-mono rounded-md bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)] whitespace-nowrap shrink-0"
          >
            {copiedId === event.id ? 'Copied' : 'Copy Link'}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={() => setSnoozeMin((s) => s + 5)}
            className="px-3 py-1.5 text-xs font-mono rounded-lg border border-[var(--nt-line-2)] text-[var(--nt-display)] whitespace-nowrap shrink-0"
          >
            Snooze +5m
          </button>

          <div className="flex items-center gap-1.5">
            {INITIAL_EVENTS.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectEvent(idx)}
                aria-label={`View upcoming event ${idx + 1}: ${item.title}`}
                aria-pressed={idx === activeIndex}
                className={cn(
                  'px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors whitespace-nowrap shrink-0',
                  idx === activeIndex
                    ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                    : 'border-[var(--nt-line)] text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
                )}
              >
                0{idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
