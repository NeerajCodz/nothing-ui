import * as React from 'react';
import { cn } from '../../../lib/cn';
import {
  type DistanceUnit,
  computeStepMetrics,
} from '../../../lib/widgets/hardware-widget-logic';

export interface PedometerRingWidgetProps {
  defaultSteps?: number;
  defaultGoal?: number;
  defaultUnit?: DistanceUnit;
  streakDays?: number;
  className?: string;
}

const CADENCE_SLOTS = [
  { label: '08h', val: 42 },
  { label: '10h', val: 74 },
  { label: '12h', val: 88 },
  { label: '14h', val: 56 },
  { label: '16h', val: 92 },
  { label: '18h', val: 68 },
  { label: '20h', val: 38 },
];

export function PedometerRingWidget({
  defaultSteps = 7840,
  defaultGoal = 10000,
  defaultUnit = 'km',
  streakDays = 14,
  className,
}: PedometerRingWidgetProps) {
  const [steps, setSteps] = React.useState(defaultSteps);
  const [goal, setGoal] = React.useState(defaultGoal);
  const [unit, setUnit] = React.useState<DistanceUnit>(defaultUnit);

  const metrics = computeStepMetrics(steps, goal, unit);
  const totalDots = 24;
  const activeDots = Math.round((metrics.progressPct / 100) * totalDots);

  return (
    <section
      aria-label="Pedometer and Step Matrix"
      className={cn(
        'rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5 text-[var(--nt-display)]',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[var(--nt-line)]">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Pedometer & Step Matrix</h3>
          <p className="text-xs text-[var(--nt-muted)] mt-0.5 font-mono tabular-nums">
            {streakDays}-day streak · Goal {metrics.goal.toLocaleString()} steps
          </p>
        </div>

        <div className="flex items-center gap-1" role="group" aria-label="Distance unit">
          {(['km', 'mi'] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              aria-pressed={unit === u}
              className={cn(
                'px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors whitespace-nowrap shrink-0',
                unit === u
                  ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'border-[var(--nt-line)] text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
              )}
            >
              {u.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
        {/* 24-dot step matrix ring */}
        <div className="flex flex-col items-center">
          <svg
            width={184}
            height={184}
            viewBox="0 0 184 184"
            role="img"
            aria-label={`${metrics.steps} of ${metrics.goal} steps (${metrics.progressPct}%)`}
          >
            {Array.from({ length: totalDots }).map((_, i) => {
              const rad = ((i / totalDots) * 360 - 90) * (Math.PI / 180);
              const cx = 92 + Math.cos(rad) * 74;
              const cy = 92 + Math.sin(rad) * 74;
              const lit = i < activeDots;
              const isLead = lit && i === activeDots - 1;
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={isLead ? 5 : lit ? 4 : 2.5}
                  fill={
                    isLead || (metrics.goalMet && lit)
                      ? 'var(--nt-accent)'
                      : lit
                        ? 'var(--nt-display)'
                        : 'var(--nt-line-2)'
                  }
                  opacity={lit ? 1 : 0.45}
                />
              );
            })}
            <text
              x={92}
              y={88}
              textAnchor="middle"
              fill="var(--nt-display)"
              fontSize="24"
              fontWeight="700"
              fontFamily="var(--font-mono)"
            >
              {metrics.steps.toLocaleString()}
            </text>
            <text
              x={92}
              y={107}
              textAnchor="middle"
              fill={metrics.goalMet ? 'var(--nt-accent)' : 'var(--nt-muted)'}
              fontSize="11"
              fontFamily="var(--font-mono)"
            >
              {metrics.goalMet ? 'GOAL REACHED' : `${metrics.progressPct}% OF GOAL`}
            </text>
          </svg>
        </div>

        {/* Telemetry metrics & cadence histogram */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center font-mono tabular-nums">
            <div className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-2.5">
              <div className="text-[10px] text-[var(--nt-muted)]">DIST</div>
              <div className="text-xs font-semibold mt-1">{metrics.distanceLabel}</div>
            </div>
            <div className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-2.5">
              <div className="text-[10px] text-[var(--nt-muted)]">KCAL</div>
              <div className="text-xs font-semibold mt-1">{metrics.calories}</div>
            </div>
            <div className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-2.5">
              <div className="text-[10px] text-[var(--nt-muted)]">ACTIVE</div>
              <div className="text-xs font-semibold mt-1">{metrics.activeMinutes}m</div>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-mono text-[var(--nt-muted)] mb-2">
              Hourly Cadence
            </div>
            <div className="flex items-end gap-2 h-16">
              {CADENCE_SLOTS.map((slot) => (
                <div key={slot.label} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full h-11 flex items-end">
                    <div
                      className="w-full rounded-sm bg-[var(--nt-display)]/80"
                      style={{ height: `${slot.val}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-[var(--nt-muted)]">
                    {slot.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setSteps((s) => s + 500)}
              className="px-3 py-1.5 text-xs font-mono rounded-lg bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)] whitespace-nowrap shrink-0"
            >
              +500 Steps
            </button>
            <button
              type="button"
              onClick={() => setGoal((g) => (g === 10000 ? 12000 : g === 12000 ? 8000 : 10000))}
              className="px-3 py-1.5 text-xs font-mono rounded-lg border border-[var(--nt-line)] text-[var(--nt-muted)] hover:text-[var(--nt-display)] whitespace-nowrap shrink-0"
            >
              Goal: {goal.toLocaleString()}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
