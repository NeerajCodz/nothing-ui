export const KNOB_MIN_ANGLE = -135;
export const KNOB_MAX_ANGLE = 135;

export function clampRotaryValue(value: number, min: number, max: number, step = 1): number {
  const clamped = Math.min(max, Math.max(min, value));
  if (step <= 0) return clamped;
  const snapped = Math.round((clamped - min) / step) * step + min;
  return Math.min(max, Math.max(min, Number(snapped.toFixed(6))));
}

export function valueToKnobAngle(value: number, min: number, max: number): number {
  if (max <= min) return KNOB_MIN_ANGLE;
  const ratio = (clampRotaryValue(value, min, max, 0) - min) / (max - min);
  return KNOB_MIN_ANGLE + ratio * (KNOB_MAX_ANGLE - KNOB_MIN_ANGLE);
}

export function applyDragDelta(
  startValue: number,
  deltaY: number,
  min: number,
  max: number,
  step = 1,
  sensitivity = 1.6
): number {
  const range = max - min;
  const deltaValue = (-deltaY / (100 * sensitivity)) * range;
  return clampRotaryValue(startValue + deltaValue, min, max, step);
}
