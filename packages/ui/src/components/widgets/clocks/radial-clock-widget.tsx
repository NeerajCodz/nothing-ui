import * as React from 'react';
import { cn } from '../../../lib/cn';
import {
  computeRadialClockProgress,
  getZonedTimeParts,
  pad2,
} from '../../../lib/widgets/clock-engine';
import { useLiveClock } from './use-live-clock';

export type RadialClockMode = 'orbital' | 'concentric' | 'solar-horizon';

export interface RadialClockWidgetProps {
  defaultMode?: RadialClockMode;
  timeZone?: string;
  fixedDate?: Date;
  showControls?: boolean;
  className?: string;
}

function ringStroke(radius: number, pct: number) {
  const c = 2 * Math.PI * radius;
  const offset = c * (1 - Math.max(0, Math.min(100, pct)) / 100);
  return { circumference: c, dashOffset: offset };
}

export function RadialClockWidget({
  defaultMode = 'orbital',
  timeZone,
  fixedDate,
  showControls = true,
  className,
}: RadialClockWidgetProps) {
  const [mode, setMode] = React.useState<RadialClockMode>(defaultMode);
  const now = useLiveClock(1000, fixedDate);
  const parts = getZonedTimeParts(now, timeZone);
  const progress = computeRadialClockProgress(parts.hours24, parts.minutes, parts.seconds);

  const secRing = ringStroke(84, progress.secondPct);
  const minRing = ringStroke(66, progress.minutePct);
  const hrRing = ringStroke(48, progress.hourPct);

  const orbitDot = (radius: number, pct: number) => {
    const rad = ((pct / 100) * 360 - 90) * (Math.PI / 180);
    return { x: 105 + Math.cos(rad) * radius, y: 105 + Math.sin(rad) * radius };
  };

  const secPos = orbitDot(84, progress.secondPct);
  const minPos = orbitDot(66, progress.minutePct);
  const hrPos = orbitDot(48, progress.hourPct);

  // Solar arc angle from 180 deg (left horizon) to 0 deg (right horizon)
  const solarAngle = Math.PI - (progress.solarPct / 100) * Math.PI;
  const sunX = 105 + Math.cos(solarAngle) * 76;
  const sunY = 128 - Math.sin(solarAngle) * 76;

  return (
    <section
      aria-label="Orbital and Radial Arc Clock"
      className={cn(
        'rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5 text-[var(--nt-display)]',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[var(--nt-line)]">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Orbital & Solar Radial Clock</h3>
          <p className="text-xs text-[var(--nt-muted)] mt-0.5 font-mono tabular-nums">
            Day {progress.dayPct}% · {parts.isDaytime ? 'Daylight' : 'Night Cycle'}
          </p>
        </div>

        {showControls && (
          <div className="flex items-center gap-1" role="group" aria-label="Radial clock style">
            {(
              [
                { id: 'orbital', label: 'Orbital' },
                { id: 'concentric', label: 'Arcs' },
                { id: 'solar-horizon', label: 'Solar' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setMode(opt.id)}
                aria-pressed={mode === opt.id}
                className={cn(
                  'px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors whitespace-nowrap shrink-0',
                  mode === opt.id
                    ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                    : 'border-[var(--nt-line)] text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col items-center gap-3">
        {mode === 'solar-horizon' ? (
          <svg
            width={210}
            height={160}
            viewBox="0 0 210 160"
            role="img"
            aria-label={`Solar horizon clock ${pad2(parts.hours24)}:${pad2(parts.minutes)}`}
          >
            <line
              x1={18}
              y1={128}
              x2={192}
              y2={128}
              stroke="var(--nt-line-2)"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
            <path
              d="M 29 128 A 76 76 0 0 1 181 128"
              fill="none"
              stroke="var(--nt-line-2)"
              strokeWidth={2}
            />
            <circle
              cx={sunX}
              cy={sunY}
              r={7}
              fill={parts.isDaytime ? 'var(--nt-accent)' : 'var(--nt-muted)'}
            />
            <text
              x={105}
              y={104}
              textAnchor="middle"
              fill="var(--nt-display)"
              fontSize="24"
              fontWeight="700"
              fontFamily="var(--font-mono)"
            >
              {pad2(parts.hours24)}:{pad2(parts.minutes)}
            </text>
            <text
              x={29}
              y={144}
              textAnchor="middle"
              fill="var(--nt-muted)"
              fontSize="9"
              fontFamily="var(--font-mono)"
            >
              06:00
            </text>
            <text
              x={105}
              y={144}
              textAnchor="middle"
              fill="var(--nt-muted)"
              fontSize="9"
              fontFamily="var(--font-mono)"
            >
              NOON
            </text>
            <text
              x={181}
              y={144}
              textAnchor="middle"
              fill="var(--nt-muted)"
              fontSize="9"
              fontFamily="var(--font-mono)"
            >
              18:00
            </text>
          </svg>
        ) : (
          <svg
            width={210}
            height={210}
            viewBox="0 0 210 210"
            role="img"
            aria-label={`Radial clock ${pad2(parts.hours24)}:${pad2(parts.minutes)}:${pad2(parts.seconds)}`}
          >
            {/* Track circles */}
            {[84, 66, 48].map((r) => (
              <circle
                key={r}
                cx={105}
                cy={105}
                r={r}
                fill="none"
                stroke="var(--nt-line)"
                strokeWidth={mode === 'concentric' ? 7 : 1.5}
              />
            ))}

            {/* Progress arcs */}
            <circle
              cx={105}
              cy={105}
              r={84}
              fill="none"
              stroke="var(--nt-accent)"
              strokeWidth={mode === 'concentric' ? 7 : 2.2}
              strokeDasharray={secRing.circumference}
              strokeDashoffset={secRing.dashOffset}
              strokeLinecap="round"
              transform="rotate(-90 105 105)"
            />
            <circle
              cx={105}
              cy={105}
              r={66}
              fill="none"
              stroke="var(--nt-display)"
              strokeWidth={mode === 'concentric' ? 7 : 2.2}
              strokeDasharray={minRing.circumference}
              strokeDashoffset={minRing.dashOffset}
              strokeLinecap="round"
              transform="rotate(-90 105 105)"
            />
            <circle
              cx={105}
              cy={105}
              r={48}
              fill="none"
              stroke="var(--nt-muted)"
              strokeWidth={mode === 'concentric' ? 7 : 2.2}
              strokeDasharray={hrRing.circumference}
              strokeDashoffset={hrRing.dashOffset}
              strokeLinecap="round"
              transform="rotate(-90 105 105)"
            />

            {mode === 'orbital' && (
              <>
                <circle cx={secPos.x} cy={secPos.y} r={4.5} fill="var(--nt-accent)" />
                <circle cx={minPos.x} cy={minPos.y} r={4} fill="var(--nt-display)" />
                <circle cx={hrPos.x} cy={hrPos.y} r={3.5} fill="var(--nt-muted)" />
              </>
            )}

            <text
              x={105}
              y={104}
              textAnchor="middle"
              fill="var(--nt-display)"
              fontSize="18"
              fontWeight="700"
              fontFamily="var(--font-mono)"
            >
              {pad2(parts.hours24)}:{pad2(parts.minutes)}
            </text>
            <text
              x={105}
              y={121}
              textAnchor="middle"
              fill="var(--nt-accent)"
              fontSize="11"
              fontFamily="var(--font-mono)"
            >
              :{pad2(parts.seconds)}
            </text>
          </svg>
        )}

        <div className="flex items-center gap-4 text-xs font-mono tabular-nums text-[var(--nt-muted)]">
          <span>HR {progress.hourPct}%</span>
          <span aria-hidden="true">·</span>
          <span>MIN {progress.minutePct}%</span>
          <span aria-hidden="true">·</span>
          <span className="text-[var(--nt-accent)]">SEC {progress.secondPct}%</span>
        </div>
      </div>
    </section>
  );
}
