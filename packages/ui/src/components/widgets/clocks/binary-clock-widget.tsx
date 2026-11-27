import * as React from 'react';
import { cn } from '../../../lib/cn';
import {
  type BinaryClockMode,
  encodeBinaryClock,
  getZonedTimeParts,
  pad2,
} from '../../../lib/widgets/clock-engine';
import { useLiveClock } from './use-live-clock';

export interface BinaryClockWidgetProps {
  defaultMode?: BinaryClockMode;
  timeZone?: string;
  fixedDate?: Date;
  showControls?: boolean;
  className?: string;
}

export function BinaryClockWidget({
  defaultMode = 'bcd',
  timeZone,
  fixedDate,
  showControls = true,
  className,
}: BinaryClockWidgetProps) {
  const [mode, setMode] = React.useState<BinaryClockMode>(defaultMode);
  const [showLegend, setShowLegend] = React.useState(true);
  const now = useLiveClock(1000, fixedDate);
  const parts = getZonedTimeParts(now, timeZone);

  const columns = encodeBinaryClock(parts.hours24, parts.minutes, parts.seconds, mode);
  const weights = mode === 'bcd' ? [8, 4, 2, 1] : [32, 16, 8, 4, 2, 1];
  const readable = `${pad2(parts.hours24)}:${pad2(parts.minutes)}:${pad2(parts.seconds)}`;

  return (
    <section
      aria-label="Binary and BCD Dot Matrix Clock"
      className={cn(
        'rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5 text-[var(--nt-display)]',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[var(--nt-line)]">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Binary Dot Matrix Clock</h3>
          <p className="text-xs text-[var(--nt-muted)] mt-0.5 font-mono tabular-nums">
            {mode === 'bcd' ? 'BCD 6×4 Matrix' : 'Pure Binary 3×6'} · {readable}
          </p>
        </div>

        {showControls && (
          <div className="flex items-center gap-1.5">
            {(['bcd', 'binary'] as const).map((nextMode) => (
              <button
                key={nextMode}
                type="button"
                onClick={() => setMode(nextMode)}
                aria-pressed={mode === nextMode}
                className={cn(
                  'px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors whitespace-nowrap shrink-0',
                  mode === nextMode
                    ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                    : 'border-[var(--nt-line)] text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
                )}
              >
                {nextMode === 'bcd' ? 'BCD' : 'Binary'}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowLegend((v) => !v)}
              aria-pressed={showLegend}
              className="px-2.5 py-1 text-xs font-mono rounded-lg border border-[var(--nt-line)] text-[var(--nt-muted)] hover:text-[var(--nt-display)] whitespace-nowrap shrink-0"
            >
              {showLegend ? 'Hide Bits' : 'Show Bits'}
            </button>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-center gap-4 overflow-x-auto">
        {showLegend && (
          <div className="flex flex-col gap-3 pr-2 border-r border-[var(--nt-line)]">
            {weights.map((w) => (
              <span
                key={w}
                className="h-5 flex items-center justify-end font-mono text-[11px] tabular-nums text-[var(--nt-muted)]"
              >
                {w}
              </span>
            ))}
            <span className="h-5 text-[10px] font-mono text-[var(--nt-muted)]">VAL</span>
          </div>
        )}

        <div className="flex items-start gap-3">
          {columns.map((col, colIdx) => {
            const groupBreak = mode === 'bcd' && (colIdx === 2 || colIdx === 4);
            return (
              <div
                key={col.id}
                className={cn('flex flex-col items-center gap-3', groupBreak && 'pl-3 border-l border-[var(--nt-line)]')}
              >
                {col.bits.map((bit) => (
                  <span
                    key={bit.weight}
                    title={`${col.label} bit ${bit.weight}: ${bit.active ? '1' : '0'}`}
                    className={cn(
                      'w-5 h-5 rounded-full border transition-colors',
                      bit.active
                        ? col.group === 'S'
                          ? 'bg-[var(--nt-accent)] border-[var(--nt-accent)]'
                          : 'bg-[var(--nt-display)] border-[var(--nt-display)]'
                        : 'bg-[var(--nt-bg)] border-[var(--nt-line-2)] opacity-45',
                    )}
                  />
                ))}
                <span className="h-5 font-mono text-xs tabular-nums text-[var(--nt-display)] font-semibold">
                  {mode === 'binary' ? pad2(col.value) : col.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
