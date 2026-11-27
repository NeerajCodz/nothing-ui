import * as React from 'react';
import { cn } from '../../../lib/cn';
import { formatStopwatchMs } from '../../../lib/widgets/clock-engine';
import { formatCountdownSeconds } from '../../../lib/widgets/utility-widget-logic';

export type StopwatchMode = 'stopwatch' | 'timer';

interface LapRecord {
  index: number;
  totalMs: number;
  splitMs: number;
}

const TIMER_PRESETS = [
  { label: '1m', seconds: 60 },
  { label: '5m', seconds: 300 },
  { label: '10m', seconds: 600 },
  { label: '25m', seconds: 1500 },
] as const;

export interface StopwatchTimerWidgetProps {
  defaultMode?: StopwatchMode;
  className?: string;
}

export function StopwatchTimerWidget({
  defaultMode = 'stopwatch',
  className,
}: StopwatchTimerWidgetProps) {
  const [mode, setMode] = React.useState<StopwatchMode>(defaultMode);

  // Stopwatch state
  const [elapsedMs, setElapsedMs] = React.useState(0);
  const [swRunning, setSwRunning] = React.useState(false);
  const [laps, setLaps] = React.useState<LapRecord[]>([]);
  const swStartRef = React.useRef<number>(0);

  // Countdown Timer state
  const [timerDurationSec, setTimerDurationSec] = React.useState(300);
  const [timerRemainingSec, setTimerRemainingSec] = React.useState(300);
  const [timerRunning, setTimerRunning] = React.useState(false);

  React.useEffect(() => {
    if (!swRunning) return;
    swStartRef.current = performance.now() - elapsedMs;
    const id = window.setInterval(() => {
      setElapsedMs(Math.max(0, performance.now() - swStartRef.current));
    }, 37);
    return () => window.clearInterval(id);
  }, [swRunning]);

  React.useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setTimerRemainingSec((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  const sw = formatStopwatchMs(elapsedMs);
  const timerPct =
    timerDurationSec > 0
      ? Math.round(((timerDurationSec - timerRemainingSec) / timerDurationSec) * 100)
      : 100;

  const recordLap = () => {
    const prevTotal = laps[0]?.totalMs ?? 0;
    const nextTotal = Math.max(elapsedMs, prevTotal);
    setLaps((prev) => [
      { index: prev.length + 1, totalMs: nextTotal, splitMs: nextTotal - prevTotal },
      ...prev,
    ]);
  };

  const resetStopwatch = () => {
    setSwRunning(false);
    setElapsedMs(0);
    setLaps([]);
  };

  const selectPreset = (sec: number) => {
    setTimerRunning(false);
    setTimerDurationSec(sec);
    setTimerRemainingSec(sec);
  };

  return (
    <section
      aria-label="Stopwatch and Interval Timer"
      className={cn(
        'rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5 text-[var(--nt-display)]',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[var(--nt-line)]">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Stopwatch & Interval Timer</h3>
          <p className="text-xs text-[var(--nt-muted)] mt-0.5">
            {mode === 'stopwatch' ? 'Millisecond precision · Lap splits' : 'Countdown presets · Interval alert'}
          </p>
        </div>

        <div className="flex items-center gap-1" role="group" aria-label="Timer mode">
          {(
            [
              { id: 'stopwatch', label: 'Stopwatch' },
              { id: 'timer', label: 'Timer' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMode(tab.id)}
              aria-pressed={mode === tab.id}
              className={cn(
                'px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors whitespace-nowrap shrink-0',
                mode === tab.id
                  ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'border-[var(--nt-line)] text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {mode === 'stopwatch' ? (
        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] px-4 py-6 text-center font-mono tabular-nums">
            <div className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--nt-display)]">
              {sw.minutes}:{sw.seconds}
              <span className="text-2xl sm:text-3xl text-[var(--nt-accent)]">.{sw.centiseconds}</span>
            </div>
            <div className="mt-2 text-xs text-[var(--nt-muted)]">
              {swRunning ? 'Running' : elapsedMs > 0 ? 'Paused' : 'Ready'} · {laps.length} laps
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setSwRunning((r) => !r)}
              className={cn(
                'px-4 py-2 text-xs font-mono rounded-lg transition-colors whitespace-nowrap shrink-0',
                swRunning
                  ? 'bg-[var(--nt-accent)] text-white'
                  : 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]',
              )}
            >
              {swRunning ? 'Pause' : elapsedMs > 0 ? 'Resume' : 'Start'}
            </button>
            <button
              type="button"
              onClick={recordLap}
              disabled={!swRunning && elapsedMs === 0}
              className="px-4 py-2 text-xs font-mono rounded-lg border border-[var(--nt-line-2)] text-[var(--nt-display)] disabled:opacity-40 whitespace-nowrap shrink-0"
            >
              Lap
            </button>
            <button
              type="button"
              onClick={resetStopwatch}
              className="px-4 py-2 text-xs font-mono rounded-lg border border-[var(--nt-line)] text-[var(--nt-muted)] hover:text-[var(--nt-display)] whitespace-nowrap shrink-0"
            >
              Reset
            </button>
          </div>

          {laps.length > 0 && (
            <div className="border-t border-[var(--nt-line)] pt-3 max-h-40 overflow-y-auto divide-y divide-[var(--nt-line)]">
              {laps.map((lap) => (
                <div
                  key={lap.index}
                  className="py-1.5 flex items-center justify-between text-xs font-mono tabular-nums"
                >
                  <span className="text-[var(--nt-muted)]">
                    Lap {String(lap.index).padStart(2, '0')}
                  </span>
                  <span className="text-[var(--nt-muted)]">
                    +{formatStopwatchMs(lap.splitMs).formatted}
                  </span>
                  <span className="font-semibold text-[var(--nt-display)]">
                    {formatStopwatchMs(lap.totalMs).formatted}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] px-4 py-6 text-center">
            <div
              className={cn(
                'font-mono tabular-nums text-4xl sm:text-5xl font-bold tracking-tight',
                timerRemainingSec === 0 ? 'text-[var(--nt-accent)]' : 'text-[var(--nt-display)]',
              )}
            >
              {formatCountdownSeconds(timerRemainingSec)}
            </div>
            <div className="mt-3 h-1.5 w-full rounded-full bg-[var(--nt-line)] overflow-hidden">
              <div
                className="h-full bg-[var(--nt-accent)] transition-all duration-300"
                style={{ width: `${timerPct}%` }}
              />
            </div>
            <div className="mt-2 text-xs font-mono text-[var(--nt-muted)]">
              {timerRemainingSec === 0
                ? 'Interval complete'
                : timerRunning
                  ? 'Counting down'
                  : 'Standby'}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5" role="group" aria-label="Timer presets">
            {TIMER_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => selectPreset(preset.seconds)}
                aria-pressed={timerDurationSec === preset.seconds}
                className={cn(
                  'px-3 py-1.5 text-xs font-mono rounded-lg border transition-colors whitespace-nowrap shrink-0',
                  timerDurationSec === preset.seconds
                    ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                    : 'border-[var(--nt-line)] text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (timerRemainingSec === 0) setTimerRemainingSec(timerDurationSec);
                setTimerRunning((r) => !r);
              }}
              className={cn(
                'px-4 py-2 text-xs font-mono rounded-lg transition-colors whitespace-nowrap shrink-0',
                timerRunning
                  ? 'bg-[var(--nt-accent)] text-white'
                  : 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]',
              )}
            >
              {timerRunning ? 'Pause' : 'Start Timer'}
            </button>
            <button
              type="button"
              onClick={() => {
                setTimerRunning(false);
                setTimerRemainingSec(timerDurationSec);
              }}
              className="px-4 py-2 text-xs font-mono rounded-lg border border-[var(--nt-line)] text-[var(--nt-muted)] hover:text-[var(--nt-display)] whitespace-nowrap shrink-0"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
