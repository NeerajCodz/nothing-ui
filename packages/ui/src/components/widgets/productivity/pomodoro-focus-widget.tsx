import * as React from 'react';
import { cn } from '../../../lib/cn';
import { formatCountdownSeconds } from '../../../lib/widgets/utility-widget-logic';

type PomodoroPhase = 'focus' | 'short-break' | 'long-break';

const PHASE_CONFIG: Record<PomodoroPhase, { label: string; seconds: number }> = {
  focus: { label: 'Focus 25m', seconds: 25 * 60 },
  'short-break': { label: 'Break 5m', seconds: 5 * 60 },
  'long-break': { label: 'Rest 15m', seconds: 15 * 60 },
};

export interface PomodoroFocusWidgetProps {
  defaultPhase?: PomodoroPhase;
  className?: string;
}

export function PomodoroFocusWidget({
  defaultPhase = 'focus',
  className,
}: PomodoroFocusWidgetProps) {
  const [phase, setPhase] = React.useState<PomodoroPhase>(defaultPhase);
  const [remainingSec, setRemainingSec] = React.useState(PHASE_CONFIG[defaultPhase].seconds);
  const [running, setRunning] = React.useState(false);
  const [completedSessions, setCompletedSessions] = React.useState(2);
  const [dndEnabled, setDndEnabled] = React.useState(true);

  const totalSec = PHASE_CONFIG[phase].seconds;
  const elapsedPct = Math.round(((totalSec - remainingSec) / totalSec) * 100);

  React.useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemainingSec((prev) => {
        if (prev <= 1) {
          setRunning(false);
          if (phase === 'focus') {
            setCompletedSessions((c) => Math.min(4, c + 1));
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, phase]);

  const switchPhase = (next: PomodoroPhase) => {
    setRunning(false);
    setPhase(next);
    setRemainingSec(PHASE_CONFIG[next].seconds);
  };

  return (
    <section
      aria-label="Pomodoro Deep Work Deck"
      className={cn(
        'rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5 text-[var(--nt-display)]',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[var(--nt-line)]">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Pomodoro Deep Work Deck</h3>
          <p className="text-xs text-[var(--nt-muted)] mt-0.5 font-mono tabular-nums">
            Session {completedSessions}/4 · DND {dndEnabled ? 'Enabled' : 'Off'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setDndEnabled((v) => !v)}
          aria-pressed={dndEnabled}
          className={cn(
            'px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors whitespace-nowrap shrink-0',
            dndEnabled
              ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
              : 'border-[var(--nt-line)] text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
          )}
        >
          DND: {dndEnabled ? 'On' : 'Off'}
        </button>
      </div>

      {/* Phase switcher */}
      <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="Pomodoro phase">
        {(Object.keys(PHASE_CONFIG) as PomodoroPhase[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => switchPhase(key)}
            aria-pressed={phase === key}
            className={cn(
              'px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors whitespace-nowrap shrink-0',
              phase === key
                ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                : 'border-[var(--nt-line)] text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
            )}
          >
            {PHASE_CONFIG[key].label}
          </button>
        ))}
      </div>

      {/* Timer display + dot progress */}
      <div className="mt-4 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] px-4 py-6 text-center">
        <div
          className={cn(
            'font-mono tabular-nums text-5xl font-bold tracking-tight',
            remainingSec === 0 ? 'text-[var(--nt-accent)]' : 'text-[var(--nt-display)]',
          )}
        >
          {formatCountdownSeconds(remainingSec)}
        </div>

        {/* 20-dot linear progress bar */}
        <div className="mt-4 flex items-center justify-center gap-1.5" aria-hidden="true">
          {Array.from({ length: 20 }).map((_, idx) => {
            const lit = idx < Math.round((elapsedPct / 100) * 20);
            return (
              <span
                key={idx}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  lit ? 'bg-[var(--nt-accent)]' : 'bg-[var(--nt-line-2)] opacity-45',
                )}
              />
            );
          })}
        </div>

        {/* 4-sprint tally */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs font-mono text-[var(--nt-muted)]">
          <span>Sprints:</span>
          {[1, 2, 3, 4].map((slot) => (
            <span
              key={slot}
              className={cn(
                'w-2.5 h-2.5 rounded-full border',
                slot <= completedSessions
                  ? 'bg-[var(--nt-display)] border-[var(--nt-display)]'
                  : 'border-[var(--nt-line-2)]',
              )}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (remainingSec === 0) setRemainingSec(totalSec);
            setRunning((r) => !r);
          }}
          className={cn(
            'px-4 py-2 text-xs font-mono rounded-lg transition-colors whitespace-nowrap shrink-0',
            running
              ? 'bg-[var(--nt-accent)] text-white'
              : 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]',
          )}
        >
          {running ? 'Pause Sprint' : 'Start Sprint'}
        </button>
        <button
          type="button"
          onClick={() => {
            setRunning(false);
            setRemainingSec(totalSec);
          }}
          className="px-4 py-2 text-xs font-mono rounded-lg border border-[var(--nt-line)] text-[var(--nt-muted)] hover:text-[var(--nt-display)] whitespace-nowrap shrink-0"
        >
          Reset
        </button>
      </div>
    </section>
  );
}
