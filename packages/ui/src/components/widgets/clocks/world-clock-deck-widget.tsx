import * as React from 'react';
import { cn } from '../../../lib/cn';
import {
  WORLD_CLOCK_CITIES,
  type WorldClockCity,
  applyHourOffset,
  computeAnalogAngles,
  getZonedTimeParts,
  pad2,
} from '../../../lib/widgets/clock-engine';
import { useLiveClock } from './use-live-clock';

export interface WorldClockDeckWidgetProps {
  cities?: readonly WorldClockCity[];
  fixedDate?: Date;
  className?: string;
}

export function WorldClockDeckWidget({
  cities = WORLD_CLOCK_CITIES,
  fixedDate,
  className,
}: WorldClockDeckWidgetProps) {
  const [offsetHours, setOffsetHours] = React.useState(0);
  const [selectedIds, setSelectedIds] = React.useState<string[]>(() =>
    cities.slice(0, 4).map((c) => c.id),
  );

  const now = useLiveClock(1000, fixedDate);
  const referenceDate = offsetHours === 0 ? now : applyHourOffset(now, offsetHours);

  const toggleCity = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.length > 1 ? prev.filter((item) => item !== id) : prev;
      }
      return [...prev, id];
    });
  };

  const visibleCities = cities.filter((c) => selectedIds.includes(c.id));

  return (
    <section
      aria-label="Multi-Zone World Clock Deck"
      className={cn(
        'rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5 text-[var(--nt-display)]',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[var(--nt-line)]">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Multi-Zone World Clock</h3>
          <p className="text-xs text-[var(--nt-muted)] mt-0.5 font-mono tabular-nums">
            {visibleCities.length} zones active ·{' '}
            {offsetHours === 0
              ? 'Live UTC sync'
              : `Meeting scrub ${offsetHours > 0 ? `+${offsetHours}h` : `${offsetHours}h`}`}
          </p>
        </div>

        {offsetHours !== 0 && (
          <button
            type="button"
            onClick={() => setOffsetHours(0)}
            className="px-2.5 py-1 text-xs font-mono rounded-lg border border-[var(--nt-accent)] text-[var(--nt-accent)] whitespace-nowrap shrink-0"
          >
            Reset to Now
          </button>
        )}
      </div>

      {/* City toggle strip */}
      <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="Pinned world clock cities">
        {cities.map((c) => {
          const active = selectedIds.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => toggleCity(c.id)}
              aria-pressed={active}
              className={cn(
                'px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors whitespace-nowrap shrink-0',
                active
                  ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'border-[var(--nt-line)] text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
              )}
            >
              {c.code}
            </button>
          );
        })}
      </div>

      {/* World clock grid with miniature analog dial + tabular digital */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {visibleCities.map((city) => {
          const parts = getZonedTimeParts(referenceDate, city.timeZone);
          const angles = computeAnalogAngles(parts.hours24, parts.minutes, parts.seconds, 0, false);
          const workingHours = parts.hours24 >= 9 && parts.hours24 < 18;
          return (
            <div
              key={city.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] px-3.5 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <svg width={44} height={44} viewBox="0 0 44 44" aria-hidden="true" className="shrink-0">
                  <circle
                    cx={22}
                    cy={22}
                    r={20}
                    fill={parts.isDaytime ? 'var(--nt-surface)' : 'var(--nt-bg)'}
                    stroke="var(--nt-line-2)"
                    strokeWidth={1.2}
                  />
                  <line
                    x1={22}
                    y1={22}
                    x2={22}
                    y2={12}
                    stroke="var(--nt-display)"
                    strokeWidth={2}
                    strokeLinecap="round"
                    transform={`rotate(${angles.hourDeg} 22 22)`}
                  />
                  <line
                    x1={22}
                    y1={22}
                    x2={22}
                    y2={7}
                    stroke="var(--nt-display)"
                    strokeWidth={1.3}
                    strokeLinecap="round"
                    transform={`rotate(${angles.minuteDeg} 22 22)`}
                  />
                  <circle
                    cx={22}
                    cy={22}
                    r={2}
                    fill={parts.isDaytime ? 'var(--nt-accent)' : 'var(--nt-muted)'}
                  />
                </svg>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate text-[var(--nt-display)]">{city.city}</div>
                  <div className="text-[11px] font-mono text-[var(--nt-muted)]">
                    {city.offsetLabel} · {parts.isDaytime ? 'Day' : 'Night'}
                    {workingHours ? ' · Work' : ''}
                  </div>
                </div>
              </div>

              <div className="text-right font-mono tabular-nums shrink-0">
                <div className="text-lg font-bold leading-none text-[var(--nt-display)]">
                  {pad2(parts.hours24)}:{pad2(parts.minutes)}
                </div>
                <div className="text-[11px] text-[var(--nt-muted)] mt-1">{parts.dayName}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Meeting overlap hour scrubber */}
      <div className="mt-4 pt-4 border-t border-[var(--nt-line)]">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <label htmlFor="world-clock-scrub" className="text-[var(--nt-muted)]">
            Meeting Overlap Scrubber
          </label>
          <span className="font-mono tabular-nums text-[var(--nt-display)]">
            {offsetHours === 0 ? 'Current time' : `${offsetHours > 0 ? '+' : ''}${offsetHours} hours`}
          </span>
        </div>
        <input
          id="world-clock-scrub"
          type="range"
          min={-12}
          max={12}
          step={1}
          value={offsetHours}
          onChange={(e) => setOffsetHours(Number(e.target.value))}
          className="w-full accent-[var(--nt-accent)] cursor-pointer"
        />
      </div>
    </section>
  );
}
