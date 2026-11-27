import * as React from 'react';
import { cn } from '../../../lib/cn';
import {
  ANALOG_MOTION_OPTIONS,
  ANALOG_TICK_DENSITY_OPTIONS,
  ANALOG_TICK_STYLE_OPTIONS,
  type AnalogSecondMotion,
  type AnalogTickDensity,
  type AnalogTickStyle,
  computeStutterHandAngles,
  generateAnalogRingTicks,
} from '../../../lib/widgets/analog-clock-physics';
import { getZonedTimeParts, pad2 } from '../../../lib/widgets/clock-engine';

export interface AnalogClockProps {
  /** Diameter of the SVG clock dial in pixels. */
  size?: number;
  /** Number of customizable ticks around the perimeter ring. */
  tickCount?: AnalogTickDensity;
  /** Visual geometry of perimeter ring ticks. */
  tickStyle?: AnalogTickStyle;
  /** Interval between major emphasized ring ticks. */
  majorInterval?: number;
  /** Length of standard linear ring ticks in SVG units. */
  tickLength?: number;
  /** Length of major/cardinal ring ticks in SVG units. */
  majorTickLength?: number;
  /** Radius of minor dot ticks in SVG units. */
  dotRadius?: number;
  /** Radius of major dot ticks in SVG units. */
  majorDotRadius?: number;
  /** Highlights 12 o'clock index in Signal Red. */
  accentTwelve?: boolean;
  /** Renders Doto cardinal numerals (12, 03, 06, 09) inside the dial. */
  showCardinalNumerals?: boolean;
  /** Renders embedded Doto digital HH:MM:SS aperture inside the dial. */
  showDigitalAperture?: boolean;
  /** Second-hand motion physics ('magnetic-stutter' by default). */
  motion?: AnalogSecondMotion;
  /** Strength of the magnetic detent overshoot & rebound (0.25..2.0). */
  stutterIntensity?: number;
  /** Optional IANA timezone string (e.g. "Europe/London"). */
  timeZone?: string;
  /** Shows interactive ring-tick and motion customizer controls below the dial. */
  showControls?: boolean;
  /** Optional deterministic timestamp for testing or static previews. */
  fixedDate?: Date;
  /** Optional display heading label. */
  label?: string;
  className?: string;
}

function useStutterClockFrame(
  motion: AnalogSecondMotion,
  fixedDate?: Date,
): Date {
  const [now, setNow] = React.useState<Date>(() => fixedDate ?? new Date());

  React.useEffect(() => {
    if (fixedDate) {
      setNow(fixedDate);
      return;
    }

    const prefersReduced =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setNow(new Date());
      const id = window.setInterval(() => setNow(new Date()), 1000);
      return () => window.clearInterval(id);
    }

    // Use requestAnimationFrame for magnetic stutter & smooth sweep physics
    let rafId = 0;
    let lastPaint = 0;
    const minFrameMs = motion === 'sweep' ? 24 : 16;

    const loop = (ts: number) => {
      if (ts - lastPaint >= minFrameMs) {
        lastPaint = ts;
        setNow(new Date());
      }
      rafId = window.requestAnimationFrame(loop);
    };

    rafId = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(rafId);
  }, [motion, fixedDate]);

  return fixedDate ?? now;
}

const DOTO_FONT_STACK = "'Doto', var(--font-display), monospace";

export function AnalogClock({
  size = 240,
  tickCount = 60,
  tickStyle = 'hybrid',
  majorInterval,
  tickLength,
  majorTickLength,
  dotRadius,
  majorDotRadius,
  accentTwelve = true,
  showCardinalNumerals = true,
  showDigitalAperture = true,
  motion = 'magnetic-stutter',
  stutterIntensity = 1.05,
  timeZone,
  showControls = true,
  fixedDate,
  label = 'Nothing Analog Clock',
  className,
}: AnalogClockProps) {
  const [activeTickCount, setActiveTickCount] = React.useState<AnalogTickDensity>(tickCount);
  const [activeTickStyle, setActiveTickStyle] = React.useState<AnalogTickStyle>(tickStyle);
  const [activeMotion, setActiveMotion] = React.useState<AnalogSecondMotion>(motion);
  const [activeIntensity, setActiveIntensity] = React.useState<number>(stutterIntensity);
  const [numeralsVisible, setNumeralsVisible] = React.useState<boolean>(showCardinalNumerals);

  React.useEffect(() => setActiveTickCount(tickCount), [tickCount]);
  React.useEffect(() => setActiveTickStyle(tickStyle), [tickStyle]);
  React.useEffect(() => setActiveMotion(motion), [motion]);
  React.useEffect(() => setActiveIntensity(stutterIntensity), [stutterIntensity]);
  React.useEffect(() => setNumeralsVisible(showCardinalNumerals), [showCardinalNumerals]);

  const now = useStutterClockFrame(activeMotion, fixedDate);
  const parts = getZonedTimeParts(now, timeZone || undefined);

  const angles = computeStutterHandAngles({
    hours24: parts.hours24,
    minutes: parts.minutes,
    seconds: parts.seconds,
    milliseconds: parts.milliseconds,
    motion: activeMotion,
    stutterIntensity: activeIntensity,
  });

  const ringTicks = React.useMemo(
    () =>
      generateAnalogRingTicks(
        {
          tickCount: activeTickCount,
          tickStyle: activeTickStyle,
          majorInterval,
          tickLength,
          majorTickLength,
          dotRadius,
          majorDotRadius,
          accentTwelve,
          showCardinalNumerals: numeralsVisible,
        },
        120,
      ),
    [
      activeTickCount,
      activeTickStyle,
      majorInterval,
      tickLength,
      majorTickLength,
      dotRadius,
      majorDotRadius,
      accentTwelve,
      numeralsVisible,
    ],
  );

  // Map current 0..59 second onto the nearest tick index for magnetic detent illumination
  const activeRingTickIndex =
    Math.round((angles.activeSecondIndex / 60) * activeTickCount) % activeTickCount;

  const digitalReadout = `${pad2(parts.hours24)}:${pad2(parts.minutes)}:${pad2(parts.seconds)}`;
  const cx = 120;
  const cy = 120;

  return (
    <section
      data-testid="nothing-analog-clock"
      aria-label={`${label} — ${digitalReadout}`}
      className={cn(
        'rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5 text-[var(--nt-display)] select-none',
        className,
      )}
    >
      {/* Header: Doto Title + Clean Unboxed Metadata */}
      <div className="flex flex-wrap items-end justify-between gap-2 pb-4 border-b border-[var(--nt-line)]">
        <div className="space-y-0.5">
          <h3 className="font-display text-lg tracking-[0.04em] text-[var(--nt-display)] leading-tight">
            {label}
          </h3>
          <p className="font-mono text-[11px] text-[var(--nt-muted)] tabular-nums">
            <span>{activeTickCount} ticks</span>
            <span aria-hidden="true"> · </span>
            <span className="capitalize">{activeTickStyle}</span>
            <span aria-hidden="true"> · </span>
            <span>
              {activeMotion === 'magnetic-stutter'
                ? 'Magnetic Stutter'
                : activeMotion === 'mechanical-beat'
                  ? 'Beat 4Hz'
                  : 'Sweep'}
            </span>
          </p>
        </div>

        <time
          dateTime={now.toISOString()}
          data-testid="analog-clock-doto-readout"
          className="font-display text-xl tracking-[0.06em] text-[var(--nt-display)] tabular-nums"
        >
          {digitalReadout}
        </time>
      </div>

      {/* Main SVG Analog Clock Dial */}
      <div className="mt-5 flex flex-col items-center">
        <svg
          width={size}
          height={size}
          viewBox="0 0 240 240"
          role="img"
          data-testid="analog-clock-svg"
          data-motion={activeMotion}
          data-tick-style={activeTickStyle}
          data-tick-count={activeTickCount}
          aria-label={`Nothing analog clock showing ${digitalReadout}`}
          className="shrink-0 overflow-visible"
        >
          {/* Outer machined bezel ring */}
          <circle
            cx={cx}
            cy={cy}
            r={115}
            fill="var(--nt-bg)"
            stroke="var(--nt-line-2)"
            strokeWidth={1.5}
          />

          {/* Recessed dial face */}
          <circle
            cx={cx}
            cy={cy}
            r={107}
            fill="var(--nt-surface)"
            stroke="var(--nt-line)"
            strokeWidth={1}
          />

          {/* Subtle dotted calibration ring inside the ticks */}
          <circle
            cx={cx}
            cy={cy}
            r={82}
            fill="none"
            stroke="var(--nt-line)"
            strokeWidth={0.85}
            strokeDasharray="1.5 5.5"
            opacity={0.75}
          />

          {/* Minimal geometric crosshairs */}
          <line
            x1={cx}
            y1={44}
            x2={cx}
            y2={196}
            stroke="var(--nt-line)"
            strokeWidth={0.65}
            opacity={0.45}
          />
          <line
            x1={44}
            y1={cy}
            x2={196}
            y2={cy}
            stroke="var(--nt-line)"
            strokeWidth={0.65}
            opacity={0.45}
          />

          {/* Customizable Perimeter Ring Ticks */}
          <g data-testid="analog-clock-ring-ticks">
            {ringTicks.map((tick) => {
              const isStruckTick =
                activeMotion !== 'sweep' && tick.index === activeRingTickIndex;
              const pulseScale = isStruckTick ? 1 + angles.magneticPulse * 0.45 : 1;

              const fillOrStroke =
                isStruckTick
                  ? 'var(--nt-accent)'
                  : tick.isTwelve && accentTwelve
                    ? 'var(--nt-accent)'
                    : tick.isMajor
                      ? 'var(--nt-display)'
                      : 'var(--nt-muted)';

              const opacity = isStruckTick
                ? 1
                : tick.isMajor
                  ? 0.95
                  : activeTickCount === 120
                    ? 0.35
                    : 0.55;

              if (tick.shape === 'dot') {
                return (
                  <circle
                    key={tick.index}
                    data-tick-index={tick.index}
                    cx={tick.cx}
                    cy={tick.cy}
                    r={Number((tick.dotRadius * pulseScale).toFixed(2))}
                    fill={fillOrStroke}
                    opacity={opacity}
                  />
                );
              }

              return (
                <line
                  key={tick.index}
                  data-tick-index={tick.index}
                  x1={tick.x1}
                  y1={tick.y1}
                  x2={tick.x2}
                  y2={tick.y2}
                  stroke={fillOrStroke}
                  strokeWidth={Number((tick.strokeWidth * (isStruckTick ? 1.25 : 1)).toFixed(2))}
                  strokeLinecap="round"
                  opacity={opacity}
                />
              );
            })}
          </g>

          {/* Doto Font Cardinal Numerals (12 · 03 · 06 · 09) */}
          {numeralsVisible && (
            <g data-testid="analog-clock-doto-numerals">
              {(
                [
                  { text: '12', x: 120, y: 49, accent: accentTwelve },
                  { text: '03', x: 193, y: 125, accent: false },
                  { text: '06', x: 120, y: 201, accent: false },
                  { text: '09', x: 47, y: 125, accent: false },
                ] as const
              ).map((item) => (
                <text
                  key={item.text}
                  x={item.x}
                  y={item.y}
                  textAnchor="middle"
                  fill={item.accent ? 'var(--nt-accent)' : 'var(--nt-display)'}
                  fontSize="14"
                  fontWeight="700"
                  letterSpacing="0.06em"
                  style={{ fontFamily: DOTO_FONT_STACK }}
                >
                  {item.text}
                </text>
              ))}
            </g>
          )}

          {/* Top Doto Date Stamp */}
          <text
            x={cx}
            y={76}
            textAnchor="middle"
            fill="var(--nt-secondary)"
            fontSize="9"
            fontWeight="600"
            letterSpacing="0.14em"
            style={{ fontFamily: DOTO_FONT_STACK }}
          >
            {parts.dayName} · {parts.dateLabel}
          </text>

          {/* Lower Recessed Doto Digital Aperture */}
          {showDigitalAperture && (
            <g>
              <rect
                x={82}
                y={149}
                width={76}
                height={22}
                rx={5}
                fill="var(--nt-bg)"
                stroke="var(--nt-line-2)"
                strokeWidth={1}
              />
              <text
                x={cx}
                y={163.5}
                textAnchor="middle"
                fill="var(--nt-display)"
                fontSize="11"
                fontWeight="700"
                letterSpacing="0.08em"
                style={{ fontFamily: DOTO_FONT_STACK }}
              >
                {digitalReadout}
              </text>
            </g>
          )}

          {/* Hour Hand (Architectural Tapered Polygon + Pinion) */}
          <g
            data-testid="analog-clock-hour-hand"
            transform={`rotate(${angles.hourDeg} ${cx} ${cy})`}
          >
            <line
              x1={cx}
              y1={cy + 14}
              x2={cx}
              y2={66}
              stroke="var(--nt-display)"
              strokeWidth={5.2}
              strokeLinecap="round"
            />
            <line
              x1={cx}
              y1={cy - 10}
              x2={cx}
              y2={74}
              stroke="var(--nt-bg)"
              strokeWidth={1.3}
              strokeLinecap="round"
            />
          </g>

          {/* Minute Hand */}
          <g
            data-testid="analog-clock-minute-hand"
            transform={`rotate(${angles.minuteDeg} ${cx} ${cy})`}
          >
            <line
              x1={cx}
              y1={cy + 18}
              x2={cx}
              y2={42}
              stroke="var(--nt-display)"
              strokeWidth={3.2}
              strokeLinecap="round"
            />
          </g>

          {/* Magnetic Stuttering Second Hand (Signal Red Needle + Counterpoise Ring) */}
          <g
            data-testid="analog-clock-second-hand"
            data-second-deg={angles.secondDeg}
            transform={`rotate(${angles.secondDeg} ${cx} ${cy})`}
          >
            {/* Tail counterweight */}
            <line
              x1={cx}
              y1={cy + 24}
              x2={cx}
              y2={cy}
              stroke="var(--nt-accent)"
              strokeWidth={2}
              strokeLinecap="round"
            />
            <circle
              cx={cx}
              cy={cy + 20}
              r={3.2}
              fill="var(--nt-bg)"
              stroke="var(--nt-accent)"
              strokeWidth={1.6}
            />
            {/* Main precision needle */}
            <line
              x1={cx}
              y1={cy}
              x2={cx}
              y2={28}
              stroke="var(--nt-accent)"
              strokeWidth={1.6}
              strokeLinecap="round"
            />
            {/* Magnetic tip dot */}
            <circle
              cx={cx}
              cy={30}
              r={2.1 + angles.magneticPulse * 0.7}
              fill="var(--nt-accent)"
            />
          </g>

          {/* Center Machined Pinion Cap */}
          <circle cx={cx} cy={cy} r={6} fill="var(--nt-display)" />
          <circle cx={cx} cy={cy} r={2.4} fill="var(--nt-accent)" />
        </svg>
      </div>

      {/* Interactive Ring Ticks & Magnetic Stutter Customizer */}
      {showControls && (
        <div className="mt-5 pt-4 border-t border-[var(--nt-line)] space-y-3 font-mono text-xs">
          {/* Row 1: Motion Physics */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] text-[var(--nt-muted)]">Second Hand</span>
            <div
              role="group"
              aria-label="Second hand motion"
              className="inline-flex flex-wrap items-center gap-0.5 rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] p-0.5"
            >
              {ANALOG_MOTION_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={activeMotion === opt.id}
                  onClick={() => setActiveMotion(opt.id)}
                  className={cn(
                    'rounded-md px-2 py-1 text-[11px] transition-colors whitespace-nowrap shrink-0 cursor-pointer',
                    activeMotion === opt.id
                      ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                      : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Customizable Ring Tick Style */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] text-[var(--nt-muted)]">Ring Ticks</span>
            <div
              role="group"
              aria-label="Ring tick style"
              className="inline-flex flex-wrap items-center gap-0.5 rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] p-0.5"
            >
              {ANALOG_TICK_STYLE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={activeTickStyle === opt.id}
                  onClick={() => setActiveTickStyle(opt.id)}
                  className={cn(
                    'rounded-md px-2 py-1 text-[11px] transition-colors whitespace-nowrap shrink-0 cursor-pointer',
                    activeTickStyle === opt.id
                      ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                      : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Ring Tick Count + Doto Numerals Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[var(--nt-muted)]">Density</span>
              <div
                role="group"
                aria-label="Ring tick count"
                className="inline-flex items-center gap-0.5 rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] p-0.5"
              >
                {ANALOG_TICK_DENSITY_OPTIONS.map((count) => (
                  <button
                    key={count}
                    type="button"
                    aria-pressed={activeTickCount === count}
                    onClick={() => setActiveTickCount(count)}
                    className={cn(
                      'rounded-md px-2 py-1 text-[11px] tabular-nums transition-colors whitespace-nowrap shrink-0 cursor-pointer',
                      activeTickCount === count
                        ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                        : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
                    )}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              aria-pressed={numeralsVisible}
              onClick={() => setNumeralsVisible((v) => !v)}
              className={cn(
                'rounded-lg border px-2.5 py-1 text-[11px] transition-colors whitespace-nowrap shrink-0 cursor-pointer',
                numeralsVisible
                  ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'border-[var(--nt-line)] bg-[var(--nt-bg)] text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
              )}
            >
              Doto Numerals: {numeralsVisible ? 'On' : 'Off'}
            </button>
          </div>

          {/* Row 4: Magnetic Stutter Snap Slider (when in magnetic-stutter mode) */}
          {activeMotion === 'magnetic-stutter' && (
            <label className="flex items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-[var(--nt-muted)] whitespace-nowrap">
                Magnetic Snap
              </span>
              <input
                type="range"
                min={0.5}
                max={1.6}
                step={0.05}
                value={activeIntensity}
                aria-label="Magnetic stutter intensity"
                onChange={(e) => setActiveIntensity(Number(e.target.value))}
                className="h-1 flex-1 cursor-pointer accent-[var(--nt-accent)]"
              />
              <span className="w-10 text-right text-[11px] tabular-nums text-[var(--nt-display)]">
                {activeIntensity.toFixed(2)}×
              </span>
            </label>
          )}
        </div>
      )}
    </section>
  );
}
