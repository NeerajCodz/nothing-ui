import * as React from 'react';
import { cn } from '../../../lib/cn';
import {
  type ScreenTimeCategory,
  computeScreenTimeSummary,
  formatDurationMinutes,
} from '../../../lib/widgets/hardware-widget-logic';

const INITIAL_CATEGORIES: ScreenTimeCategory[] = [
  { id: 'build', label: 'Build & Code', minutes: 108, budgetMinutes: 150 },
  { id: 'comms', label: 'Messages & Mail', minutes: 42, budgetMinutes: 60 },
  { id: 'media', label: 'Audio & Video', minutes: 36, budgetMinutes: 45 },
  { id: 'social', label: 'Social Feeds', minutes: 24, budgetMinutes: 30 },
];

export interface ScreenTimePulseWidgetProps {
  dailyLimitMinutes?: number;
  className?: string;
}

export function ScreenTimePulseWidget({
  dailyLimitMinutes = 240,
  className,
}: ScreenTimePulseWidgetProps) {
  const [categories, setCategories] = React.useState<ScreenTimeCategory[]>(INITIAL_CATEGORIES);
  const [flipToGlyphActive, setFlipToGlyphActive] = React.useState(true);
  const [quietMinutes, setQuietMinutes] = React.useState(95);

  const summary = computeScreenTimeSummary(
    categories,
    dailyLimitMinutes,
    flipToGlyphActive ? quietMinutes : 0,
  );

  const addCategoryTime = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, minutes: c.minutes + 15 } : c)),
    );
  };

  return (
    <section
      aria-label="Screen Time and Focus Pulse"
      className={cn(
        'rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5 text-[var(--nt-display)]',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[var(--nt-line)]">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Screen Time & Focus Pulse</h3>
          <p className="text-xs text-[var(--nt-muted)] mt-0.5 font-mono tabular-nums">
            {summary.formattedTotal} / {formatDurationMinutes(dailyLimitMinutes)} daily limit
          </p>
        </div>

        <button
          type="button"
          onClick={() => setFlipToGlyphActive((v) => !v)}
          aria-pressed={flipToGlyphActive}
          className={cn(
            'px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors whitespace-nowrap shrink-0',
            flipToGlyphActive
              ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
              : 'border-[var(--nt-line)] text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
          )}
        >
          Flip-to-Glyph: {flipToGlyphActive ? 'On' : 'Off'}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2.5 font-mono tabular-nums">
        <div className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-3">
          <div className="text-[10px] text-[var(--nt-muted)]">USAGE</div>
          <div
            className={cn(
              'text-lg font-bold mt-0.5',
              summary.overBudget ? 'text-[var(--nt-accent)]' : 'text-[var(--nt-display)]',
            )}
          >
            {summary.formattedTotal}
          </div>
        </div>
        <div className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-3">
          <div className="text-[10px] text-[var(--nt-muted)]">QUIET HRS</div>
          <div className="text-lg font-bold mt-0.5">
            {formatDurationMinutes(flipToGlyphActive ? quietMinutes : 0)}
          </div>
        </div>
        <div className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-3">
          <div className="text-[10px] text-[var(--nt-muted)]">FOCUS</div>
          <div className="text-lg font-bold mt-0.5">{summary.focusScore}/100</div>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {categories.map((cat) => {
          const pct = Math.min(100, Math.round((cat.minutes / cat.budgetMinutes) * 100));
          const exceeded = cat.minutes > cat.budgetMinutes;
          return (
            <div key={cat.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[var(--nt-display)]">{cat.label}</span>
                <div className="flex items-center gap-2 font-mono tabular-nums">
                  <span className={exceeded ? 'text-[var(--nt-accent)]' : 'text-[var(--nt-muted)]'}>
                    {formatDurationMinutes(cat.minutes)} / {formatDurationMinutes(cat.budgetMinutes)}
                  </span>
                  <button
                    type="button"
                    onClick={() => addCategoryTime(cat.id)}
                    aria-label={`Add 15 minutes to ${cat.label}`}
                    className="px-1.5 py-0.5 text-[10px] rounded border border-[var(--nt-line)] text-[var(--nt-muted)] hover:text-[var(--nt-display)]"
                  >
                    +15m
                  </button>
                </div>
              </div>
              <div className="h-2 rounded-full bg-[var(--nt-line)] overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all duration-200',
                    exceeded ? 'bg-[var(--nt-accent)]' : 'bg-[var(--nt-display)]',
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {flipToGlyphActive && (
        <div className="mt-4 pt-3 border-t border-[var(--nt-line)] flex items-center justify-between gap-3 text-xs">
          <label htmlFor="quiet-hours-slider" className="text-[var(--nt-muted)] whitespace-nowrap">
            Quiet Session
          </label>
          <input
            id="quiet-hours-slider"
            type="range"
            min={0}
            max={240}
            step={15}
            value={quietMinutes}
            onChange={(e) => setQuietMinutes(Number(e.target.value))}
            className="flex-1 accent-[var(--nt-accent)] cursor-pointer"
          />
          <span className="font-mono tabular-nums w-14 text-right">
            {formatDurationMinutes(quietMinutes)}
          </span>
        </div>
      )}
    </section>
  );
}
