import * as React from 'react';
import { cn } from '../../../lib/cn';
import {
  type ClockFormat,
  WORLD_CLOCK_CITIES,
} from '../../../lib/widgets/clock-engine';
import { AnalogClockWidget } from './analog-clock-widget';
import { BinaryClockWidget } from './binary-clock-widget';
import { FlipClockWidget } from './flip-clock-widget';
import { RadialClockWidget } from './radial-clock-widget';
import { WordClockWidget } from './word-clock-widget';
import { useLiveClock } from './use-live-clock';

export type ClockStudioFilter = 'all' | 'analog' | 'digital' | 'radial';

export interface ClockStudioWidgetProps {
  fixedDate?: Date;
  className?: string;
}

export function ClockStudioWidget({ fixedDate, className }: ClockStudioWidgetProps) {
  const [filter, setFilter] = React.useState<ClockStudioFilter>('all');
  const [format, setFormat] = React.useState<ClockFormat>('24h');
  const [sweep, setSweep] = React.useState(true);
  const [timeZone, setTimeZone] = React.useState('');

  // Shared tick so every clock face in the studio advances in exact lockstep
  const syncedDate = useLiveClock(sweep ? 150 : 1000, fixedDate);
  const tz = timeZone || undefined;

  return (
    <section
      aria-label="Clock Face Gallery and Studio"
      className={cn(
        'rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5 text-[var(--nt-display)] space-y-5',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--nt-line)]">
        <div>
          <h3 className="text-base font-semibold tracking-tight">Clock Face Studio</h3>
          <p className="text-xs text-[var(--nt-muted)] mt-0.5">
            Compare 8 live hardware clock varieties synchronized to a single master oscillator
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1" role="group" aria-label="Filter clock varieties">
            {(
              [
                { id: 'all', label: 'All (8)' },
                { id: 'analog', label: 'Analog (4)' },
                { id: 'digital', label: 'Matrix & Flip (3)' },
                { id: 'radial', label: 'Radial (1)' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                aria-pressed={filter === tab.id}
                className={cn(
                  'px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors whitespace-nowrap shrink-0',
                  filter === tab.id
                    ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                    : 'border-[var(--nt-line)] text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setSweep((s) => !s)}
            aria-pressed={sweep}
            className="px-2.5 py-1 text-xs font-mono rounded-lg border border-[var(--nt-line)] text-[var(--nt-muted)] hover:text-[var(--nt-display)] whitespace-nowrap shrink-0"
          >
            {sweep ? 'Sweep' : 'Quartz'}
          </button>

          <button
            type="button"
            onClick={() => setFormat((f) => (f === '24h' ? '12h' : '24h'))}
            className="px-2.5 py-1 text-xs font-mono rounded-lg border border-[var(--nt-line)] text-[var(--nt-muted)] hover:text-[var(--nt-display)] whitespace-nowrap shrink-0"
          >
            {format.toUpperCase()}
          </button>

          <select
            aria-label="Master clock time zone"
            value={timeZone}
            onChange={(e) => setTimeZone(e.target.value)}
            className="rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] px-2.5 py-1 font-mono text-xs text-[var(--nt-display)]"
          >
            <option value="">Local Time</option>
            {WORLD_CLOCK_CITIES.map((c) => (
              <option key={c.id} value={c.timeZone}>
                {c.city}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {(filter === 'all' || filter === 'analog') && (
          <>
            <AnalogClockWidget
              defaultDial="minimal-dots"
              defaultSweep={sweep}
              defaultFormat={format}
              defaultTimeZone={timeZone}
              showControls={false}
              size={180}
              fixedDate={syncedDate}
            />
            <AnalogClockWidget
              defaultDial="chronograph"
              defaultSweep={sweep}
              defaultFormat={format}
              defaultTimeZone={timeZone}
              showControls={false}
              size={180}
              fixedDate={syncedDate}
            />
            <AnalogClockWidget
              defaultDial="railway-ticks"
              defaultSweep={sweep}
              defaultFormat={format}
              defaultTimeZone={timeZone}
              showControls={false}
              size={180}
              fixedDate={syncedDate}
            />
            <AnalogClockWidget
              defaultDial="bauhaus-roman"
              defaultSweep={sweep}
              defaultFormat={format}
              defaultTimeZone={timeZone}
              showControls={false}
              size={180}
              fixedDate={syncedDate}
            />
          </>
        )}

        {(filter === 'all' || filter === 'digital') && (
          <>
            <FlipClockWidget
              defaultFormat={format}
              timeZone={tz}
              showControls={false}
              fixedDate={syncedDate}
            />
            <BinaryClockWidget
              defaultMode="bcd"
              timeZone={tz}
              showControls={false}
              fixedDate={syncedDate}
            />
            <WordClockWidget
              timeZone={tz}
              showControls={false}
              fixedDate={syncedDate}
            />
          </>
        )}

        {(filter === 'all' || filter === 'radial') && (
          <RadialClockWidget
            defaultMode="orbital"
            timeZone={tz}
            showControls={true}
            fixedDate={syncedDate}
          />
        )}
      </div>
    </section>
  );
}
