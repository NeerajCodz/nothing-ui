export type DistanceUnit = 'km' | 'mi';

export interface StepMetrics {
  steps: number;
  goal: number;
  progressPct: number;
  goalMet: boolean;
  distanceLabel: string;
  distanceValue: number;
  calories: number;
  activeMinutes: number;
}

export function computeStepMetrics(
  steps: number,
  goal: number,
  unit: DistanceUnit = 'km',
): StepMetrics {
  const safeSteps = Math.max(0, Math.round(steps));
  const safeGoal = Math.max(500, Math.round(goal));
  const progressPct = Math.min(100, Math.round((safeSteps / safeGoal) * 100));
  const km = safeSteps * 0.00076;
  const distanceValue = unit === 'mi' ? Number((km * 0.621371).toFixed(2)) : Number(km.toFixed(2));
  const calories = Math.round(safeSteps * 0.042);
  const activeMinutes = Math.round(safeSteps / 110);

  return {
    steps: safeSteps,
    goal: safeGoal,
    progressPct,
    goalMet: safeSteps >= safeGoal,
    distanceValue,
    distanceLabel: `${distanceValue.toFixed(2)} ${unit}`,
    calories,
    activeMinutes,
  };
}

export interface PowerDeviceTelemetry {
  id: string;
  name: string;
  kind: 'phone' | 'earbuds' | 'watch' | 'laptop';
  level: number;
  charging: boolean;
  healthPct: number;
  watts?: number;
}

export interface PowerHubSummary {
  averagePct: number;
  chargingCount: number;
  lowDevices: PowerDeviceTelemetry[];
  totalWatts: number;
}

export function computePowerHubSummary(devices: readonly PowerDeviceTelemetry[]): PowerHubSummary {
  if (devices.length === 0) {
    return { averagePct: 0, chargingCount: 0, lowDevices: [], totalWatts: 0 };
  }
  const sum = devices.reduce((acc, d) => acc + Math.max(0, Math.min(100, d.level)), 0);
  const chargingCount = devices.filter((d) => d.charging).length;
  const lowDevices = devices.filter((d) => d.level <= 20 && !d.charging);
  const totalWatts = devices.reduce((acc, d) => acc + (d.charging ? d.watts ?? 0 : 0), 0);

  return {
    averagePct: Math.round(sum / devices.length),
    chargingCount,
    lowDevices,
    totalWatts: Number(totalWatts.toFixed(1)),
  };
}

export interface ScreenTimeCategory {
  id: string;
  label: string;
  minutes: number;
  budgetMinutes: number;
}

export interface ScreenTimeSummary {
  totalMinutes: number;
  formattedTotal: string;
  budgetPct: number;
  overBudget: boolean;
  focusScore: number;
}

export function formatDurationMinutes(minutes: number): string {
  const safe = Math.max(0, Math.round(minutes));
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
}

export function computeScreenTimeSummary(
  categories: readonly ScreenTimeCategory[],
  dailyLimitMinutes: number,
  flipToGlyphMinutes: number,
): ScreenTimeSummary {
  const totalMinutes = categories.reduce((acc, c) => acc + Math.max(0, c.minutes), 0);
  const safeLimit = Math.max(30, dailyLimitMinutes);
  const budgetPct = Math.min(100, Math.round((totalMinutes / safeLimit) * 100));
  const overBudget = totalMinutes > safeLimit;
  const quietBonus = Math.min(30, Math.round(flipToGlyphMinutes / 6));
  const usagePenalty = Math.min(70, Math.round((totalMinutes / safeLimit) * 55));
  const focusScore = Math.max(10, Math.min(100, 100 - usagePenalty + quietBonus));

  return {
    totalMinutes,
    formattedTotal: formatDurationMinutes(totalMinutes),
    budgetPct,
    overBudget,
    focusScore,
  };
}

export type LinkQualityGrade = 'Optimal' | 'Good' | 'Degraded';

export interface NetworkEvaluation {
  grade: LinkQualityGrade;
  signalBars: number; // 1..5
  bandwidthScore: number; // 0..100
}

export function evaluateLinkQuality(
  downMbps: number,
  upMbps: number,
  pingMs: number,
  jitterMs: number,
): NetworkEvaluation {
  let score = 100;
  if (downMbps < 50) score -= 35;
  else if (downMbps < 150) score -= 15;
  if (upMbps < 15) score -= 15;
  if (pingMs > 60) score -= 30;
  else if (pingMs > 28) score -= 12;
  if (jitterMs > 12) score -= 15;
  else if (jitterMs > 5) score -= 5;

  const clamped = Math.max(5, Math.min(100, score));
  const grade: LinkQualityGrade =
    clamped >= 80 ? 'Optimal' : clamped >= 50 ? 'Good' : 'Degraded';
  const signalBars =
    clamped >= 88 ? 5 : clamped >= 70 ? 4 : clamped >= 50 ? 3 : clamped >= 30 ? 2 : 1;

  return { grade, signalBars, bandwidthScore: clamped };
}
