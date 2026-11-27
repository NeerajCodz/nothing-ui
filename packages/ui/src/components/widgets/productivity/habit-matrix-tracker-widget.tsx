import * as React from 'react';
import { cn } from '../../../lib/cn';
import {
  computeHabitStats,
  generateDeterministicHabitMatrix,
} from '../../../lib/widgets/utility-widget-logic';

type HabitId = 'deep-work' | 'morning-run' | 'reading';

const HABIT_SEEDS: Record<HabitId, { label: string; seed: number }> = {
  'deep-work': { label: 'Deep Work', seed: 101 },
  'morning-run': { label: 'Morning Run', seed: 209 },
  reading: { label: 'Daily Reading', seed: 317 },
};

export interface HabitMatrixTrackerWidgetProps {
  className?: string;
}

export function HabitMatrixTrackerWidget({ className }: HabitMatrixTrackerWidgetProps) {
  const [activeHabit, setActiveHabit] = React.useState<HabitId>('deep-work');
  const [matrices, setMatrices] = React.useState<Record<HabitId, boolean[]>>(() => ({
    'deep-work': generateDeterministicHabitMatrix(HABIT_SEEDS['deep-work'].seed, 90),
    'morning-run': generateDeterministicHabitMatrix(HABIT_SEEDS['morning-run'].seed, 90),
    reading: generateDeterministicHabitMatrix(HABIT_SEEDS.reading.seed, 90),
  }));

  const currentMatrix = matrices[activeHabit];
  const stats = computeHabitStats(currentMatrix);

  const toggleDay = (idx: number) => {
    setMatrices((prev) => ({
      ...prev,
      [activeHabit]: prev[activeHabit].map((v, i) => (i === idx ? !v : v)),
    }));
  };

  return (
    <section
      aria-label="90-Day Habit Dot Matrix"
      className={cn(
        'rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5 text-[var(--nt-display)]',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[var(--nt-line)]">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">90-Day Habit Dot Matrix</h3>
          <p className="text-xs text-[var(--nt-muted)] mt-0.5 font-mono tabular-nums">
            {stats.completedDays}/{stats.totalDays} days ({stats.completionRatePct}%) · 7-day milestones in red
          </p>
        </div>

        <div className="flex items-center gap-1" role="group" aria-label="Tracked habit">
          {(Object.keys(HABIT_SEEDS) as HabitId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveHabit(id)}
              aria-pressed={activeHabit === id}
              className={cn(
                'px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors whitespace-nowrap shrink-0',
                activeHabit === id
                  ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'border-[var(--nt-line)] text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
              )}
            >
              {HABIT_SEEDS[id].label}
            </button>
          ))}
        </div>
      </div>

      {/* 15 x 6 = 90 day clickable dot matrix */}
      <div className="mt-4 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-4">
        <div
          className="grid grid-cols-15 gap-1.5 sm:gap-2"
          role="group"
          aria-label={`${HABIT_SEEDS[activeHabit].label} 90-day matrix`}
        >
          {currentMatrix.map((done, idx) => {
            const milestone = stats.milestoneIndices.has(idx);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => toggleDay(idx)}
                aria-pressed={done}
                aria-label={`Day ${idx + 1}: ${done ? 'Completed' : 'Missed'}`}
                title={`Day ${idx + 1} · ${milestone ? '7-day milestone' : done ? 'Done' : 'Open'}`}
                className={cn(
                  'aspect-square w-full rounded-full border transition-transform hover:scale-110',
                  milestone
                    ? 'bg-[var(--nt-accent)] border-[var(--nt-accent)]'
                    : done
                      ? 'bg-[var(--nt-display)] border-[var(--nt-display)]'
                      : 'bg-transparent border-[var(--nt-line-2)] opacity-45',
                )}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2.5 font-mono tabular-nums text-center">
        <div className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-2.5">
          <div className="text-[10px] text-[var(--nt-muted)]">CURRENT</div>
          <div className="text-base font-bold mt-0.5 text-[var(--nt-accent)]">
            {stats.currentStreak}d
          </div>
        </div>
        <div className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-2.5">
          <div className="text-[10px] text-[var(--nt-muted)]">LONGEST</div>
          <div className="text-base font-bold mt-0.5">{stats.longestStreak}d</div>
        </div>
        <div className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-2.5">
          <div className="text-[10px] text-[var(--nt-muted)]">RATE</div>
          <div className="text-base font-bold mt-0.5">{stats.completionRatePct}%</div>
        </div>
      </div>
    </section>
  );
}
