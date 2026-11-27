import * as React from 'react';
import { cn } from '../../../lib/cn';
import {
  ANALOG_DIAL_PRESETS,
  type AnalogDialVariant,
  type ClockFormat,
  WORLD_CLOCK_CITIES,
  computeAnalogAngles,
  getZonedTimeParts,
  pad2,
} from '../../../lib/widgets/clock-engine';
import { useLiveClock } from './use-live-clock';

export interface AnalogClockWidgetProps {
  defaultDial?: AnalogDialVariant;
  defaultSweep?: boolean;
  defaultFormat?: ClockFormat;
  defaultTimeZone?: string;
  showControls?: boolean;
  showDigitalReadout?: boolean;
  size?: number;
  fixedDate?: Date;
  className?: string;
}

export function AnalogClockWidget({
  defaultDial = 'minimal-dots',
  defaultSweep = true,
  defaultFormat = '24h',
  defaultTimeZone,
  showControls = true,
  showDigitalReadout = true,
  size = 220,
  fixedDate,
  className,
}: AnalogClockWidgetProps) {
  const [dial, setDial] = React.useState<AnalogDialVariant>(defaultDial);
  const [sweep, setSweep] = React.useState(defaultSweep);
  const [format, setFormat] = React.useState<ClockFormat>(defaultFormat);
  const [timeZone, setTimeZone] = React.useState<string>(defaultTimeZone ?? '');

  React.useEffect(() => {
    setDial(defaultDial);
  }, [defaultDial]);

  React.useEffect(() => {
    setSweep(defaultSweep);
  }, [defaultSweep]);

  React.useEffect(() => {
    setFormat(defaultFormat);
  }, [defaultFormat]);

  React.useEffect(() => {
    if (defaultTimeZone !== undefined) setTimeZone(defaultTimeZone);
  }, [defaultTimeZone]);

  const now = useLiveClock(sweep ? 100 : 1000, fixedDate);
  const parts = getZonedTimeParts(now, timeZone || undefined);
  const angles = computeAnalogAngles(
    parts.hours24,
    parts.minutes,
    parts.seconds,
    parts.milliseconds,
    sweep,
  );

  const displayHour = format === '24h' ? pad2(parts.hours24) : pad2(parts.hours12);
  const digitalTime = `${displayHour}:${pad2(parts.minutes)}:${pad2(parts.seconds)}`;
  const activePreset = ANALOG_DIAL_PRESETS.find((p) => p.id === dial) ?? ANALOG_DIAL_PRESETS[0];

  const cx = 110;
  const cy = 110;
  const radius = 94;

  return (
    <section
      aria-label={`Analog Clock (${activePreset.label})`}
      className={cn(
        'rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5 text-[var(--nt-display)]',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[var(--nt-line)]">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-[var(--nt-display)]">
            Analog Hardware Clock
          </h3>
          <p className="text-xs text-[var(--nt-muted)] mt-0.5">
            {activePreset.label} · {sweep ? 'Sweep' : 'Quartz 1Hz'} · {parts.dayName} {parts.dateLabel}
          </p>
        </div>

        {showControls && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSweep((prev) => !prev)}
              aria-pressed={sweep}
              className={cn(
                'px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors whitespace-nowrap shrink-0',
                sweep
                  ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'border-[var(--nt-line)] text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
              )}
            >
              {sweep ? 'Sweep' : 'Quartz'}
            </button>
            <button
              type="button"
              onClick={() => setFormat((prev) => (prev === '24h' ? '12h' : '24h'))}
              className="px-2.5 py-1 text-xs font-mono rounded-lg border border-[var(--nt-line)] text-[var(--nt-muted)] hover:text-[var(--nt-display)] transition-colors whitespace-nowrap shrink-0"
            >
              {format.toUpperCase()}
            </button>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col items-center gap-4">
        <svg
          width={size}
          height={size}
          viewBox="0 0 220 220"
          role="img"
          aria-label={`Analog dial reading ${digitalTime}`}
          className="select-none shrink-0"
        >
          {/* Outer machined bezel */}
          <circle
            cx={cx}
            cy={cy}
            r={104}
            fill="var(--nt-bg)"
            stroke="var(--nt-line-2)"
            strokeWidth={1.5}
          />
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="var(--nt-surface)"
            stroke="var(--nt-line)"
            strokeWidth={1}
          />

          {/* Skeleton Ring concentric geometry */}
          {dial === 'skeleton-ring' && (
            <g opacity={0.45}>
              <circle
                cx={cx}
                cy={cy}
                r={68}
                fill="none"
                stroke="var(--nt-line-2)"
                strokeDasharray="3 4"
                strokeWidth={1}
              />
              <circle
                cx={cx}
                cy={cy}
                r={42}
                fill="none"
                stroke="var(--nt-line-2)"
                strokeWidth={1}
              />
              <line x1={cx} y1={24} x2={cx} y2={196} stroke="var(--nt-line)" strokeWidth={1} />
              <line x1={24} y1={cy} x2={196} y2={cy} stroke="var(--nt-line)" strokeWidth={1} />
            </g>
          )}

          {/* Chronograph dual recessed subdials (left: 24h cycle, bottom: 60s) */}
          {dial === 'chronograph' && (
            <g>
              {/* Left 24h subdial */}
              <circle
                cx={72}
                cy={110}
                r={21}
                fill="var(--nt-bg)"
                stroke="var(--nt-line-2)"
                strokeWidth={1}
              />
              <text
                x={72}
                y={102}
                textAnchor="middle"
                fill="var(--nt-muted)"
                fontSize="6.5"
                fontFamily="var(--font-mono)"
              >
                24H
              </text>
              <line
                x1={72}
                y1={110}
                x2={72}
                y2={94}
                stroke="var(--nt-display)"
                strokeWidth={1.5}
                strokeLinecap="round"
                transform={`rotate(${(parts.hours24 / 24) * 360} 72 110)`}
              />
              <circle cx={72} cy={110} r={2} fill="var(--nt-display)" />

              {/* Bottom 60s subdial */}
              <circle
                cx={110}
                cy={148}
                r={21}
                fill="var(--nt-bg)"
                stroke="var(--nt-line-2)"
                strokeWidth={1}
              />
              <text
                x={110}
                y={140}
                textAnchor="middle"
                fill="var(--nt-muted)"
                fontSize="6.5"
                fontFamily="var(--font-mono)"
              >
                60S
              </text>
              <line
                x1={110}
                y1={148}
                x2={110}
                y2={132}
                stroke="var(--nt-accent)"
                strokeWidth={1.5}
                strokeLinecap="round"
                transform={`rotate(${angles.secondDeg} 110 148)`}
              />
              <circle cx={110} cy={148} r={2} fill="var(--nt-accent)" />
            </g>
          )}

          {/* 60-minute railway ticks */}
          {(dial === 'railway-ticks' || dial === 'chronograph' || dial === 'skeleton-ring') &&
            Array.from({ length: 60 }).map((_, idx) => {
              const deg = idx * 6;
              const isHour = idx % 5 === 0;
              const isCardinal = idx % 15 === 0;
              const len = isCardinal ? 11 : isHour ? 7 : 3.5;
              const y1 = 18;
              const y2 = y1 + len;
              return (
                <line
                  key={idx}
                  x1={cx}
                  y1={y1}
                  x2={cx}
                  y2={y2}
                  stroke={
                    idx === 0
                      ? 'var(--nt-accent)'
                      : isHour
                        ? 'var(--nt-display)'
                        : 'var(--nt-muted)'
                  }
                  strokeWidth={isCardinal ? 2 : isHour ? 1.4 : 0.8}
                  strokeLinecap="round"
                  opacity={isHour ? 0.95 : 0.5}
                  transform={`rotate(${deg} ${cx} ${cy})`}
                />
              );
            })}

          {/* Minimal Dots hour markers */}
          {dial === 'minimal-dots' &&
            Array.from({ length: 12 }).map((_, idx) => {
              const rad = ((idx * 30 - 90) * Math.PI) / 180;
              const mx = cx + Math.cos(rad) * 80;
              const my = cy + Math.sin(rad) * 80;
              const isCardinal = idx % 3 === 0;
              return (
                <circle
                  key={idx}
                  cx={mx}
                  cy={my}
                  r={idx === 0 ? 4.2 : isCardinal ? 3.2 : 2}
                  fill={idx === 0 ? 'var(--nt-accent)' : isCardinal ? 'var(--nt-display)' : 'var(--nt-muted)'}
                />
              );
            })}

          {/* Bauhaus numerals */}
          {dial === 'bauhaus-roman' && (
            <g>
              {Array.from({ length: 12 }).map((_, idx) => {
                if (idx % 3 === 0) return null;
                const deg = idx * 30;
                return (
                  <line
                    key={idx}
                    x1={cx}
                    y1={22}
                    x2={cx}
                    y2={30}
                    stroke="var(--nt-muted)"
                    strokeWidth={1.4}
                    strokeLinecap="round"
                    transform={`rotate(${deg} ${cx} ${cy})`}
                  />
                );
              })}
              {[
                { label: '12', x: 110, y: 36, accent: true },
                { label: '03', x: 184, y: 114, accent: false },
                { label: '06', x: 110, y: 192, accent: false },
                { label: '09', x: 36, y: 114, accent: false },
              ].map((num) => (
                <text
                  key={num.label}
                  x={num.x}
                  y={num.y}
                  textAnchor="middle"
                  fill={num.accent ? 'var(--nt-accent)' : 'var(--nt-display)'}
                  fontSize="13"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                >
                  {num.label}
                </text>
              ))}
            </g>
          )}

          {/* Date complication aperture at 3 o'clock (except Bauhaus) */}
          {dial !== 'bauhaus-roman' && (
            <g>
              <rect
                x={142}
                y={101}
                width={26}
                height={18}
                rx={4}
                fill="var(--nt-bg)"
                stroke="var(--nt-line-2)"
                strokeWidth={1}
              />
              <text
                x={155}
                y={113}
                textAnchor="middle"
                fill="var(--nt-display)"
                fontSize="9"
                fontFamily="var(--font-mono)"
              >
                {parts.dateLabel.slice(-2)}
              </text>
            </g>
          )}

          {/* Hour Hand */}
          <line
            x1={cx}
            y1={cy + 10}
            x2={cx}
            y2={58}
            stroke="var(--nt-display)"
            strokeWidth={dial === 'minimal-dots' ? 4.5 : 4}
            strokeLinecap="round"
            transform={`rotate(${angles.hourDeg} ${cx} ${cy})`}
          />

          {/* Minute Hand */}
          <line
            x1={cx}
            y1={cy + 14}
            x2={cx}
            y2={36}
            stroke="var(--nt-display)"
            strokeWidth={2.6}
            strokeLinecap="round"
            transform={`rotate(${angles.minuteDeg} ${cx} ${cy})`}
          />

          {/* Signal Red Seconds Sweep Hand */}
          <g transform={`rotate(${angles.secondDeg} ${cx} ${cy})`}>
            <line
              x1={cx}
              y1={cy + 20}
              x2={cx}
              y2={27}
              stroke="var(--nt-accent)"
              strokeWidth={1.6}
              strokeLinecap="round"
            />
            <circle cx={cx} cy={cy + 17} r={2.2} fill="var(--nt-accent)" />
          </g>

          {/* Center Pinion */}
          <circle cx={cx} cy={cy} r={5} fill="var(--nt-display)" />
          <circle cx={cx} cy={cy} r={2} fill="var(--nt-accent)" />
        </svg>

        {showDigitalReadout && (
          <div className="flex items-baseline gap-2 font-mono tabular-nums">
            <time dateTime={now.toISOString()} className="text-xl font-semibold tracking-tight text-[var(--nt-display)]">
              {digitalTime}
            </time>
            {format === '12h' && (
              <span className="text-xs text-[var(--nt-accent)] font-medium">{parts.period}</span>
            )}
          </div>
        )}
      </div>

      {showControls && (
        <div className="mt-5 pt-4 border-t border-[var(--nt-line)] space-y-3">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Analog dial face">
            {ANALOG_DIAL_PRESETS.map((preset) => {
              const active = dial === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setDial(preset.id)}
                  aria-pressed={active}
                  className={cn(
                    'px-2.5 py-1.5 text-xs rounded-lg border transition-colors whitespace-nowrap shrink-0',
                    active
                      ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)] font-medium'
                      : 'border-[var(--nt-line)] text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-2 text-xs">
            <label htmlFor="analog-tz-select" className="text-[var(--nt-muted)]">
              Time Zone
            </label>
            <select
              id="analog-tz-select"
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
              className="rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] px-2.5 py-1 font-mono text-xs text-[var(--nt-display)]"
            >
              <option value="">Local System</option>
              {WORLD_CLOCK_CITIES.map((c) => (
                <option key={c.id} value={c.timeZone}>
                  {c.city} ({c.offsetLabel})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </section>
  );
}
