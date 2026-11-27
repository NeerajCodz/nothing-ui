import * as React from 'react';
import { cn } from '../../../lib/cn';
import {
  WORD_CLOCK_ROWS,
  getZonedTimeParts,
  pad2,
  resolveWordClockState,
} from '../../../lib/widgets/clock-engine';
import { useLiveClock } from './use-live-clock';

export interface WordClockWidgetProps {
  timeZone?: string;
  fixedDate?: Date;
  showControls?: boolean;
  className?: string;
}

export function WordClockWidget({
  timeZone,
  fixedDate,
  showControls = true,
  className,
}: WordClockWidgetProps) {
  const now = useLiveClock(1000, fixedDate);
  const liveParts = getZonedTimeParts(now, timeZone);

  const [manualOffsetMin, setManualOffsetMin] = React.useState<number | null>(null);
  const effectiveDate =
    manualOffsetMin === null
      ? now
      : new Date(now.getTime() + manualOffsetMin * 60 * 1000);
  const parts = getZonedTimeParts(effectiveDate, timeZone);
  const state = resolveWordClockState(parts.hours24, parts.minutes);

  return (
    <section
      aria-label="Typographic Word Matrix Clock"
      className={cn(
        'rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5 text-[var(--nt-display)]',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[var(--nt-line)]">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Typographic Word Clock</h3>
          <p className="text-xs text-[var(--nt-muted)] mt-0.5 font-mono tabular-nums">
            {pad2(parts.hours24)}:{pad2(parts.minutes)} · +{state.minuteDots}m precision LEDs
          </p>
        </div>

        {showControls && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setManualOffsetMin((prev) => (prev ?? 0) + 5)}
              className="px-2.5 py-1 text-xs font-mono rounded-lg border border-[var(--nt-line)] text-[var(--nt-muted)] hover:text-[var(--nt-display)] whitespace-nowrap shrink-0"
            >
              +5 min
            </button>
            {manualOffsetMin !== null && (
              <button
                type="button"
                onClick={() => setManualOffsetMin(null)}
                className="px-2.5 py-1 text-xs font-mono rounded-lg border border-[var(--nt-accent)] text-[var(--nt-accent)] whitespace-nowrap shrink-0"
              >
                Live ({pad2(liveParts.hours24)}:{pad2(liveParts.minutes)})
              </button>
            )}
          </div>
        )}
      </div>

      {/* 11x10 Word Matrix Plate with 4 Corner Minute LEDs */}
      <div className="mt-4 relative rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-bg)] px-5 py-6">
        {/* 4 corner precision minute diodes */}
        {[
          { idx: 1, pos: 'top-2.5 left-2.5' },
          { idx: 2, pos: 'top-2.5 right-2.5' },
          { idx: 3, pos: 'bottom-2.5 right-2.5' },
          { idx: 4, pos: 'bottom-2.5 left-2.5' },
        ].map((corner) => (
          <span
            key={corner.idx}
            aria-hidden="true"
            className={cn(
              'absolute w-2 h-2 rounded-full transition-colors',
              corner.pos,
              state.minuteDots >= corner.idx
                ? 'bg-[var(--nt-accent)]'
                : 'bg-[var(--nt-line-2)] opacity-35',
            )}
          />
        ))}

        <div
          className="grid grid-cols-11 gap-y-1.5 text-center font-mono text-xs sm:text-sm select-none"
          aria-hidden="true"
        >
          {WORD_CLOCK_ROWS.map((rowStr, rIdx) =>
            rowStr.split('').map((char, cIdx) => {
              const active = state.activeCells.has(`${rIdx}:${cIdx}`);
              return (
                <span
                  key={`${rIdx}-${cIdx}`}
                  className={cn(
                    'transition-opacity duration-200',
                    active
                      ? 'text-[var(--nt-display)] font-bold opacity-100'
                      : 'text-[var(--nt-muted)] opacity-25',
                  )}
                >
                  {char}
                </span>
              );
            }),
          )}
        </div>
      </div>

      <p className="mt-3 text-center font-mono text-xs tracking-wide text-[var(--nt-muted)]">
        {state.phrase}
        {state.minuteDots > 0 ? ` (+${state.minuteDots} min)` : ''}
      </p>
    </section>
  );
}
