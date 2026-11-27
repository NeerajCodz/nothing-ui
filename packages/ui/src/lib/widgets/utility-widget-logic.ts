export type ConversionCategoryId = 'currency' | 'length' | 'temperature' | 'data' | 'time';

export interface ConversionUnit {
  id: string;
  label: string;
  symbol: string;
  toBase: number; // ignored for temperature
}

export interface ConversionCategory {
  id: ConversionCategoryId;
  label: string;
  units: readonly ConversionUnit[];
}

export const CONVERSION_CATEGORIES: readonly ConversionCategory[] = [
  {
    id: 'currency',
    label: 'FX Currency',
    units: [
      { id: 'USD', label: 'US Dollar', symbol: '$', toBase: 1 },
      { id: 'EUR', label: 'Euro', symbol: '€', toBase: 1.08 },
      { id: 'GBP', label: 'British Pound', symbol: '£', toBase: 1.27 },
      { id: 'JPY', label: 'Japanese Yen', symbol: '¥', toBase: 0.0066 },
      { id: 'INR', label: 'Indian Rupee', symbol: '₹', toBase: 0.0119 },
    ],
  },
  {
    id: 'length',
    label: 'Length',
    units: [
      { id: 'm', label: 'Meters', symbol: 'm', toBase: 1 },
      { id: 'km', label: 'Kilometers', symbol: 'km', toBase: 1000 },
      { id: 'mi', label: 'Miles', symbol: 'mi', toBase: 1609.344 },
      { id: 'ft', label: 'Feet', symbol: 'ft', toBase: 0.3048 },
      { id: 'in', label: 'Inches', symbol: 'in', toBase: 0.0254 },
    ],
  },
  {
    id: 'temperature',
    label: 'Temperature',
    units: [
      { id: 'C', label: 'Celsius', symbol: '°C', toBase: 1 },
      { id: 'F', label: 'Fahrenheit', symbol: '°F', toBase: 1 },
      { id: 'K', label: 'Kelvin', symbol: 'K', toBase: 1 },
    ],
  },
  {
    id: 'data',
    label: 'Data Rate',
    units: [
      { id: 'Mbps', label: 'Megabits / s', symbol: 'Mbps', toBase: 1 },
      { id: 'Gbps', label: 'Gigabits / s', symbol: 'Gbps', toBase: 1000 },
      { id: 'MBs', label: 'Megabytes / s', symbol: 'MB/s', toBase: 8 },
      { id: 'GBs', label: 'Gigabytes / s', symbol: 'GB/s', toBase: 8000 },
    ],
  },
  {
    id: 'time',
    label: 'Time',
    units: [
      { id: 'ms', label: 'Milliseconds', symbol: 'ms', toBase: 0.001 },
      { id: 's', label: 'Seconds', symbol: 's', toBase: 1 },
      { id: 'min', label: 'Minutes', symbol: 'min', toBase: 60 },
      { id: 'hr', label: 'Hours', symbol: 'hr', toBase: 3600 },
    ],
  },
];

export function convertUnitValue(
  categoryId: ConversionCategoryId,
  fromId: string,
  toId: string,
  amount: number,
): number {
  if (!Number.isFinite(amount)) return 0;
  if (fromId === toId) return amount;

  if (categoryId === 'temperature') {
    let celsius = amount;
    if (fromId === 'F') celsius = ((amount - 32) * 5) / 9;
    else if (fromId === 'K') celsius = amount - 273.15;

    if (toId === 'F') return Number(((celsius * 9) / 5 + 32).toFixed(2));
    if (toId === 'K') return Number((celsius + 273.15).toFixed(2));
    return Number(celsius.toFixed(2));
  }

  const category = CONVERSION_CATEGORIES.find((c) => c.id === categoryId);
  if (!category) return 0;
  const fromUnit = category.units.find((u) => u.id === fromId);
  const toUnit = category.units.find((u) => u.id === toId);
  if (!fromUnit || !toUnit) return 0;

  const inBase = amount * fromUnit.toBase;
  const result = inBase / toUnit.toBase;
  return Number(result.toFixed(4));
}

export interface HabitDayCell {
  index: number;
  label: string;
  completed: boolean;
  level: 0 | 1 | 2; // 0 = off, 1 = done, 2 = milestone streak day
}

export function generateDeterministicHabitMatrix(seed: number, totalDays = 90): boolean[] {
  const days: boolean[] = [];
  let s = seed >>> 0;
  for (let i = 0; i < totalDays; i++) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const recentBoost = i >= totalDays - 7 ? 0.88 : 0.64;
    days.push((s % 100) / 100 < recentBoost);
  }
  return days;
}

export interface HabitStats {
  completedDays: number;
  totalDays: number;
  completionRatePct: number;
  currentStreak: number;
  longestStreak: number;
  milestoneIndices: Set<number>;
}

export function computeHabitStats(completedFlags: readonly boolean[]): HabitStats {
  const totalDays = completedFlags.length;
  let completedDays = 0;
  let longestStreak = 0;
  let run = 0;
  const milestoneIndices = new Set<number>();

  for (let i = 0; i < totalDays; i++) {
    if (completedFlags[i]) {
      completedDays++;
      run++;
      if (run > longestStreak) longestStreak = run;
      if (run % 7 === 0) milestoneIndices.add(i);
    } else {
      run = 0;
    }
  }

  let currentStreak = 0;
  for (let i = totalDays - 1; i >= 0; i--) {
    if (completedFlags[i]) currentStreak++;
    else break;
  }

  return {
    completedDays,
    totalDays,
    completionRatePct: totalDays === 0 ? 0 : Math.round((completedDays / totalDays) * 100),
    currentStreak,
    longestStreak,
    milestoneIndices,
  };
}

export interface NoteChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export function serializeNotesToMarkdown(
  title: string,
  body: string,
  checklist: readonly NoteChecklistItem[],
): string {
  const lines: string[] = [`# ${title.trim() || 'Untitled Note'}`];
  if (body.trim()) {
    lines.push('', body.trim());
  }
  if (checklist.length > 0) {
    lines.push('');
    for (const item of checklist) {
      lines.push(`- [${item.done ? 'x' : ' '}] ${item.text}`);
    }
  }
  return lines.join('\n');
}

export function formatCountdownSeconds(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const PLAYBACK_SPEEDS = [1, 1.25, 1.5, 2] as const;

export function cyclePlaybackSpeed(current: number): number {
  const idx = PLAYBACK_SPEEDS.findIndex((s) => s === current);
  return PLAYBACK_SPEEDS[(idx + 1) % PLAYBACK_SPEEDS.length];
}
