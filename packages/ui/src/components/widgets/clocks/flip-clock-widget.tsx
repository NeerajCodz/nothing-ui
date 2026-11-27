import * as React from 'react';
import { cn } from '../../../lib/cn';
import { type ClockFormat, getZonedTimeParts, pad2 } from '../../../lib/widgets/clock-engine';
import { useLiveClock } from './use-live-clock';

export interface FlipClockWidgetProps {
  defaultFormat?: ClockFormat;
  defaultShowSeconds?: boolean;
  timeZone?: string;
  fixedDate?: Date;
  showControls?: boolean;
  className?: string;
}

function FlipTile({
  value,
  label,
  accent = false,
  compact = false,
}: {
  value: string;
  label: string;
  accent?: boolean;
  compact?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-bg)] flex items-center justify-center font-mono tabular-nums font-bold tracking-tight select-none',
          compact ? 'w-16 h-20 text-3xl' : 'w-22 h-26 sm:w-24 sm:h-28 text-4xl sm:text-5xl',
          accent ? 'text-[var(--nt-accent)]' : 'text-[var(--nt-display)]',
        )}
      >
        {/* Top flap luminance shade */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-[var(--nt-display)]/[0.03]"
        />
        <span className="relative z-10">{value}</span>
        {/* Mechanical split-flap hinge seam */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-[var(--nt-line-2)] z-20"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1 top-1/2 -translate-y-1/2 w-1 h-2.5 rounded-sm bg-[var(--nt-line-2)] z-20"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 w-1 h-2.5 rounded-sm bg-[var(--nt-line-2)] z-20"
        />
      </div>
      <span className="text-[11px] font-mono text-[var(--nt-muted)]">{label}</span>
    </div>
  );
}

export function FlipClockWidget({
  defaultFormat = '24h',
  defaultShowSeconds = true,
  timeZone,
  fixedDate,
  showControls = true,
  className,
}: FlipClockWidgetProps) {
  const [format, setFormat] = React.useState<ClockFormat>(defaultFormat);
  const [showSeconds, setShowSeconds] = React.useState(defaultShowSeconds);
  const now = useLiveClock(1000, fixedDate);
  const parts = getZonedTimeParts(now, timeZone);

  const hh = format === '24h' ? pad2(parts.hours24) : pad2(parts.hours12);
  const mm = pad2(parts.minutes);
  const ss = pad2(parts.seconds);

  return (
    <section
      aria-label="Split-Flap Mechanical Clock"
      className={cn(
        'rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5 text-[var(--nt-display)]',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[var(--nt-line)]">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Split-Flap Mechanical Clock</h3>
          <p className="text-xs text-[var(--nt-muted)] mt-0.5">
            {parts.dayName} · {parts.dateLabel} · {format.toUpperCase()}
          </p>
        </div>

        {showControls && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFormat((f) => (f === '24h' ? '12h' : '24h'))}
              className="px-2.5 py-1 text-xs font-mono rounded-lg border border-[var(--nt-line)] text-[var(--nt-muted)] hover:text-[var(--nt-display)] whitespace-nowrap shrink-0"
            >
              {format.toUpperCase()}
            </button>
            <button
              type="button"
              onClick={() => setShowSeconds((s) => !s)}
              aria-pressed={showSeconds}
              className={cn(
                'px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors whitespace-nowrap shrink-0',
                showSeconds
                  ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'border-[var(--nt-line)] text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
              )}
            >
              Seconds
            </button>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <FlipTile value={hh} label="Hours" />
        <span aria-hidden="true" className="text-2xl font-mono text-[var(--nt-muted)] -mt-5">
          :
        </span>
        <FlipTile value={mm} label="Minutes" />
        {showSeconds && (
          <>
            <span aria-hidden="true" className="text-2xl font-mono text-[var(--nt-muted)] -mt-5">
              :
            </span>
            <FlipTile value={ss} label="Seconds" accent compact />
          </>
        )}
        {format === '12h' && (
          <div className="self-start mt-2 px-2 py-1 rounded-md border border-[var(--nt-line)] bg-[var(--nt-bg)] font-mono text-xs text-[var(--nt-accent)]">
            {parts.period}
          </div>
        )}
      </div>
    </section>
  );
}
