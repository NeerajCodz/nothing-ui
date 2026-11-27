export type AnalogTickStyle = 'dots' | 'dashes' | 'batons' | 'hybrid';
export type AnalogSecondMotion = 'magnetic-stutter' | 'mechanical-beat' | 'sweep';
export type AnalogTickDensity = 12 | 24 | 60 | 120;

export interface AnalogRingTickConfig {
  tickCount?: AnalogTickDensity;
  tickStyle?: AnalogTickStyle;
  majorInterval?: number;
  outerRadius?: number;
  tickLength?: number;
  majorTickLength?: number;
  dotRadius?: number;
  majorDotRadius?: number;
  accentTwelve?: boolean;
  showCardinalNumerals?: boolean;
}

export interface AnalogRingTickGeometry {
  index: number;
  angleDeg: number;
  isTwelve: boolean;
  isCardinal: boolean;
  isMajor: boolean;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cx: number;
  cy: number;
  dotRadius: number;
  strokeWidth: number;
  shape: 'dot' | 'line';
}

export interface StutterClockAngles {
  hourDeg: number;
  minuteDeg: number;
  secondDeg: number;
  activeSecondIndex: number;
  /** 0..1 impulse energy right as the second hand snaps onto a tick detent */
  magneticPulse: number;
}

export const ANALOG_TICK_STYLE_OPTIONS: ReadonlyArray<{
  id: AnalogTickStyle;
  label: string;
}> = [
  { id: 'hybrid', label: 'Hybrid' },
  { id: 'dots', label: 'Dots' },
  { id: 'dashes', label: 'Dashes' },
  { id: 'batons', label: 'Batons' },
];

export const ANALOG_TICK_DENSITY_OPTIONS: readonly AnalogTickDensity[] = [12, 24, 60, 120];

export const ANALOG_MOTION_OPTIONS: ReadonlyArray<{
  id: AnalogSecondMotion;
  label: string;
}> = [
  { id: 'magnetic-stutter', label: 'Magnetic Stutter' },
  { id: 'mechanical-beat', label: 'Beat 4Hz' },
  { id: 'sweep', label: 'Sweep' },
];

export function resolveMajorTickInterval(tickCount: AnalogTickDensity, explicit?: number): number {
  if (explicit && explicit >= 1) return Math.floor(explicit);
  switch (tickCount) {
    case 12:
      return 3;
    case 24:
      return 2;
    case 120:
      return 10;
    default:
      return 5;
  }
}

/**
 * Generates deterministic SVG geometry for every ring tick around the clock perimeter.
 * Coordinates are computed in a 240x240 SVG viewBox centered at (120, 120).
 */
export function generateAnalogRingTicks(
  config: AnalogRingTickConfig = {},
  center = 120,
): AnalogRingTickGeometry[] {
  const tickCount: AnalogTickDensity = config.tickCount ?? 60;
  const tickStyle: AnalogTickStyle = config.tickStyle ?? 'hybrid';
  const majorInterval = resolveMajorTickInterval(tickCount, config.majorInterval);
  const cardinalInterval = Math.max(1, Math.round(tickCount / 4));

  const outerRadius = config.outerRadius ?? 102;
  const baseTickLen = config.tickLength ?? (tickStyle === 'batons' ? 7 : 5);
  const majorTickLen = config.majorTickLength ?? (tickStyle === 'batons' ? 14 : 11);
  const minorDotR = config.dotRadius ?? (tickCount >= 60 ? 1.25 : 2.1);
  const majorDotR = config.majorDotRadius ?? 3.1;

  const ticks: AnalogRingTickGeometry[] = [];

  for (let i = 0; i < tickCount; i++) {
    const angleDeg = (i / tickCount) * 360;
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const isTwelve = i === 0;
    const isCardinal = i % cardinalInterval === 0;
    const isMajor = isTwelve || isCardinal || i % majorInterval === 0;

    const length = isCardinal ? majorTickLen + 2 : isMajor ? majorTickLen : baseTickLen;
    const innerRadius = outerRadius - length;
    const dotOrbitRadius = outerRadius - (isMajor ? 4 : 3.5);

    const shape: 'dot' | 'line' =
      tickStyle === 'dots'
        ? 'dot'
        : tickStyle === 'hybrid'
          ? isCardinal
            ? 'line'
            : 'dot'
          : 'line';

    const dotRadius = isTwelve
      ? majorDotR + 0.9
      : isMajor
        ? majorDotR
        : minorDotR;

    const strokeWidth = isTwelve
      ? 2.6
      : isCardinal
        ? 2.2
        : isMajor
          ? tickStyle === 'batons'
            ? 2.2
            : 1.5
          : tickStyle === 'batons'
            ? 1.25
            : 0.95;

    ticks.push({
      index: i,
      angleDeg: Number(angleDeg.toFixed(3)),
      isTwelve,
      isCardinal,
      isMajor,
      x1: Number((center + cos * outerRadius).toFixed(2)),
      y1: Number((center + sin * outerRadius).toFixed(2)),
      x2: Number((center + cos * innerRadius).toFixed(2)),
      y2: Number((center + sin * innerRadius).toFixed(2)),
      cx: Number((center + cos * dotOrbitRadius).toFixed(2)),
      cy: Number((center + sin * dotOrbitRadius).toFixed(2)),
      dotRadius: Number(dotRadius.toFixed(2)),
      strokeWidth: Number(strokeWidth.toFixed(2)),
      shape,
    });
  }

  return ticks;
}

/**
 * Evaluates a damped magnetic detent stutter curve for a single 1-second interval.
 *
 * - `fraction` in [0, 1) represents progress within the current second (milliseconds / 1000).
 * - At t = 0..0.06s: brief magnetic inertia hold + sharp snap-jump forward from the previous second.
 * - At t = 0.06..0.28s: critically under-damped spring overshoot (+1.15° * intensity) and micro-rebound
 *   settling onto the exact target tick detent.
 * - At t = 0.28..0.96s: magnetically locked on the tick detent with zero drift.
 * - At t = 0.96..1.00s: subtle magnetic pre-tension micro-twitch (~0.18°) anticipating the next tick.
 */
export function computeMagneticStutterSecondDeg(
  seconds: number,
  milliseconds: number,
  stutterIntensity = 1,
): { secondDeg: number; magneticPulse: number } {
  const safeSec = ((Math.floor(seconds) % 60) + 60) % 60;
  const t = Math.max(0, Math.min(0.9999, milliseconds / 1000));
  const intensity = Math.max(0.25, Math.min(2, stutterIntensity));

  const targetDeg = safeSec * 6;
  const stepDeg = 6;

  // Phase 1: Rapid magnetic snap from previous tick (t in [0, 0.09))
  if (t < 0.09) {
    const p = t / 0.09;
    // Fast cubic ease-in-out snap covering -6deg -> 0deg plus initial magnetic kick
    const snap = 1 - Math.pow(1 - p, 3);
    const offsetDeg = -stepDeg * (1 - snap) + 0.95 * intensity * Math.sin(p * Math.PI * 0.5);
    return {
      secondDeg: Number((targetDeg + offsetDeg).toFixed(3)),
      magneticPulse: Number(snap.toFixed(3)),
    };
  }

  // Phase 2: Damped magnetic spring rebound settling into the detent (t in [0.09, 0.34))
  if (t < 0.34) {
    const dt = t - 0.09; // 0..0.25
    const decay = Math.exp(-15 * dt);
    const oscillation = Math.cos(dt * 38) * 0.95 * intensity * decay;
    const pulse = Math.max(0, Math.exp(-10 * dt));
    return {
      secondDeg: Number((targetDeg + oscillation).toFixed(3)),
      magneticPulse: Number(pulse.toFixed(3)),
    };
  }

  // Phase 3: Locked magnetically onto detent (t in [0.34, 0.94))
  if (t < 0.94) {
    return {
      secondDeg: Number(targetDeg.toFixed(3)),
      magneticPulse: 0,
    };
  }

  // Phase 4: Subtle magnetic pull tension right before snapping to next second (t in [0.94, 1.0))
  const pre = (t - 0.94) / 0.06;
  const microPull = 0.22 * intensity * pre * pre;
  return {
    secondDeg: Number((targetDeg + microPull).toFixed(3)),
    magneticPulse: Number((0.18 * pre).toFixed(3)),
  };
}

/**
 * Computes hour, minute, and second angles for the Nothing AnalogClock across
 * Magnetic Stutter, Mechanical 4Hz Beat, and Smooth Sweep motions.
 */
export function computeStutterHandAngles(options: {
  hours24: number;
  minutes: number;
  seconds: number;
  milliseconds?: number;
  motion?: AnalogSecondMotion;
  stutterIntensity?: number;
  beatsPerSecond?: number;
}): StutterClockAngles {
  const {
    hours24,
    minutes,
    seconds,
    milliseconds = 0,
    motion = 'magnetic-stutter',
    stutterIntensity = 1,
    beatsPerSecond = 4,
  } = options;

  const safeSec = ((Math.floor(seconds) % 60) + 60) % 60;
  const ms = Math.max(0, Math.min(999, milliseconds));

  let secondDeg = safeSec * 6;
  let magneticPulse = 0;

  if (motion === 'magnetic-stutter') {
    const stutter = computeMagneticStutterSecondDeg(safeSec, ms, stutterIntensity);
    secondDeg = stutter.secondDeg;
    magneticPulse = stutter.magneticPulse;
  } else if (motion === 'mechanical-beat') {
    const beats = Math.max(2, Math.min(8, Math.round(beatsPerSecond)));
    const beatIndex = Math.floor((ms / 1000) * beats);
    const beatFrac = ((ms / 1000) * beats) - beatIndex;
    const microOvershoot = beatFrac < 0.2 ? Math.sin((beatFrac / 0.2) * Math.PI) * 0.35 : 0;
    secondDeg = Number(((safeSec + beatIndex / beats) * 6 + microOvershoot).toFixed(3));
    magneticPulse = Number(Math.max(0, 1 - beatFrac * 4).toFixed(3));
  } else {
    secondDeg = Number(((safeSec + ms / 1000) * 6).toFixed(3));
    magneticPulse = 0;
  }

  const continuousSec = safeSec + ms / 1000;
  const minuteDeg = Number((((minutes + continuousSec / 60) / 60) * 360).toFixed(2));
  const hourDeg = Number(((((hours24 % 12) + minutes / 60 + continuousSec / 3600) / 12) * 360).toFixed(2));

  return {
    hourDeg,
    minuteDeg,
    secondDeg,
    activeSecondIndex: safeSec,
    magneticPulse,
  };
}
