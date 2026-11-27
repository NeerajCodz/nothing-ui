export type ClockFormat = '12h' | '24h';

export type AnalogDialVariant =
  | 'minimal-dots'
  | 'railway-ticks'
  | 'chronograph'
  | 'skeleton-ring'
  | 'bauhaus-roman';

export interface AnalogDialMeta {
  id: AnalogDialVariant;
  label: string;
  description: string;
}

export const ANALOG_DIAL_PRESETS: readonly AnalogDialMeta[] = [
  {
    id: 'minimal-dots',
    label: 'Minimal Dots',
    description: '12 recessed dot-matrix hour markers with Signal Red 12 o’clock index.',
  },
  {
    id: 'railway-ticks',
    label: 'Railway Ticks',
    description: '60-minute precision chapter ring with bold cardinal batons.',
  },
  {
    id: 'chronograph',
    label: 'Chronograph',
    description: 'Dual recessed subdials tracking live seconds and 24-hour cycle.',
  },
  {
    id: 'skeleton-ring',
    label: 'Skeleton Ring',
    description: 'Exposed concentric gear geometry with radial crosshairs.',
  },
  {
    id: 'bauhaus-roman',
    label: 'Bauhaus Numerals',
    description: 'Architectural 12 · 3 · 6 · 9 dial numerals with tapered hands.',
  },
];

export interface ZonedTimeParts {
  hours24: number;
  hours12: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  period: 'AM' | 'PM';
  dayName: string;
  dateLabel: string;
  isDaytime: boolean;
}

export function getZonedTimeParts(date: Date, timeZone?: string): ZonedTimeParts {
  const safeZone = timeZone || undefined;
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: safeZone,
      hour12: false,
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).formatToParts(date);

    const lookup = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
    const rawHour = Number(lookup('hour'));
    const hours24 = Number.isFinite(rawHour) ? rawHour % 24 : date.getHours();
    const minutes = Number(lookup('minute')) || 0;
    const seconds = Number(lookup('second')) || 0;
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    const period: 'AM' | 'PM' = hours24 >= 12 ? 'PM' : 'AM';
    const dayName = lookup('weekday') || 'MON';
    const month = lookup('month') || 'JAN';
    const day = lookup('day') || '01';

    return {
      hours24,
      hours12,
      minutes,
      seconds,
      milliseconds: date.getMilliseconds(),
      period,
      dayName: dayName.toUpperCase(),
      dateLabel: `${month.toUpperCase()} ${day}`,
      isDaytime: hours24 >= 6 && hours24 < 19,
    };
  } catch {
    const hours24 = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    return {
      hours24,
      hours12: hours24 % 12 === 0 ? 12 : hours24 % 12,
      minutes,
      seconds,
      milliseconds: date.getMilliseconds(),
      period: hours24 >= 12 ? 'PM' : 'AM',
      dayName: 'UTC',
      dateLabel: `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`,
      isDaytime: hours24 >= 6 && hours24 < 19,
    };
  }
}

export function pad2(n: number): string {
  return String(Math.max(0, Math.floor(n))).padStart(2, '0');
}

export interface AnalogHandAngles {
  hourDeg: number;
  minuteDeg: number;
  secondDeg: number;
}

export function computeAnalogAngles(
  hours24: number,
  minutes: number,
  seconds: number,
  milliseconds = 0,
  sweep = true,
): AnalogHandAngles {
  const smoothSec = sweep ? seconds + milliseconds / 1000 : seconds;
  const secondDeg = (smoothSec / 60) * 360;
  const minuteDeg = ((minutes + smoothSec / 60) / 60) * 360;
  const hourDeg = (((hours24 % 12) + minutes / 60 + smoothSec / 3600) / 12) * 360;
  return {
    hourDeg: Number(hourDeg.toFixed(2)),
    minuteDeg: Number(minuteDeg.toFixed(2)),
    secondDeg: Number(secondDeg.toFixed(2)),
  };
}

export type BinaryClockMode = 'bcd' | 'binary';

export interface BinaryClockColumn {
  id: string;
  label: string;
  group: 'H' | 'M' | 'S';
  value: number;
  bits: { weight: number; active: boolean }[];
}

export function encodeBinaryClock(
  hours24: number,
  minutes: number,
  seconds: number,
  mode: BinaryClockMode = 'bcd',
): BinaryClockColumn[] {
  if (mode === 'binary') {
    const weights = [32, 16, 8, 4, 2, 1];
    const toBits = (val: number) => weights.map((w) => ({ weight: w, active: Boolean(val & w) }));
    return [
      { id: 'h', label: 'HRS', group: 'H', value: hours24, bits: toBits(hours24) },
      { id: 'm', label: 'MIN', group: 'M', value: minutes, bits: toBits(minutes) },
      { id: 's', label: 'SEC', group: 'S', value: seconds, bits: toBits(seconds) },
    ];
  }

  const weights = [8, 4, 2, 1];
  const digits = [
    { id: 'h1', label: 'H₁', group: 'H' as const, value: Math.floor(hours24 / 10) },
    { id: 'h2', label: 'H₂', group: 'H' as const, value: hours24 % 10 },
    { id: 'm1', label: 'M₁', group: 'M' as const, value: Math.floor(minutes / 10) },
    { id: 'm2', label: 'M₂', group: 'M' as const, value: minutes % 10 },
    { id: 's1', label: 'S₁', group: 'S' as const, value: Math.floor(seconds / 10) },
    { id: 's2', label: 'S₂', group: 'S' as const, value: seconds % 10 },
  ];

  return digits.map((d) => ({
    ...d,
    bits: weights.map((w) => ({ weight: w, active: Boolean(d.value & w) })),
  }));
}

/**
 * Classic 11x10 English typographic word clock letter matrix.
 */
export const WORD_CLOCK_ROWS: readonly string[] = [
  'ITLISASAMPM',
  'ACQUARTERDC',
  'TWENTYFIVEX',
  'HALFSTENFTO',
  'PASTERUNINE',
  'ONESIXTHREE',
  'FOURFIVETWO',
  'EIGHTELEVEN',
  'SEVENTWELVE',
  'TENSEOCLOCK',
];

type WordSpan = readonly [row: number, startCol: number, length: number];

const WORD_SPANS: Record<string, WordSpan> = {
  IT: [0, 0, 2],
  IS: [0, 3, 2],
  A: [1, 0, 1],
  QUARTER: [1, 2, 7],
  TWENTY: [2, 0, 6],
  FIVE_MIN: [2, 6, 4],
  HALF: [3, 0, 4],
  TEN_MIN: [3, 5, 3],
  TO: [3, 9, 2],
  PAST: [4, 0, 4],
  H9: [4, 7, 4],
  H1: [5, 0, 3],
  H6: [5, 3, 3],
  H3: [5, 6, 5],
  H4: [6, 0, 4],
  H5: [6, 4, 4],
  H2: [6, 8, 3],
  H8: [7, 0, 5],
  H11: [7, 5, 6],
  H7: [8, 0, 5],
  H12: [8, 5, 6],
  H10: [9, 0, 3],
  OCLOCK: [9, 5, 6],
};

export interface WordClockState {
  activeCells: Set<string>;
  minuteDots: number; // 0..4 precision minute LEDs
  phrase: string;
}

export function resolveWordClockState(hours24: number, minutes: number): WordClockState {
  const bucket = Math.floor(minutes / 5) * 5;
  const minuteDots = minutes % 5;
  const nextHourOffset = bucket >= 35 ? 1 : 0;
  const displayHour = ((hours24 + nextHourOffset) % 12) || 12;

  const keys: string[] = ['IT', 'IS'];
  const words: string[] = ['IT', 'IS'];

  if (bucket === 5) {
    keys.push('FIVE_MIN', 'PAST');
    words.push('FIVE', 'PAST');
  } else if (bucket === 10) {
    keys.push('TEN_MIN', 'PAST');
    words.push('TEN', 'PAST');
  } else if (bucket === 15) {
    keys.push('A', 'QUARTER', 'PAST');
    words.push('A', 'QUARTER', 'PAST');
  } else if (bucket === 20) {
    keys.push('TWENTY', 'PAST');
    words.push('TWENTY', 'PAST');
  } else if (bucket === 25) {
    keys.push('TWENTY', 'FIVE_MIN', 'PAST');
    words.push('TWENTY', 'FIVE', 'PAST');
  } else if (bucket === 30) {
    keys.push('HALF', 'PAST');
    words.push('HALF', 'PAST');
  } else if (bucket === 35) {
    keys.push('TWENTY', 'FIVE_MIN', 'TO');
    words.push('TWENTY', 'FIVE', 'TO');
  } else if (bucket === 40) {
    keys.push('TWENTY', 'TO');
    words.push('TWENTY', 'TO');
  } else if (bucket === 45) {
    keys.push('A', 'QUARTER', 'TO');
    words.push('A', 'QUARTER', 'TO');
  } else if (bucket === 50) {
    keys.push('TEN_MIN', 'TO');
    words.push('TEN', 'TO');
  } else if (bucket === 55) {
    keys.push('FIVE_MIN', 'TO');
    words.push('FIVE', 'TO');
  }

  const hourNames: Record<number, string> = {
    1: 'ONE',
    2: 'TWO',
    3: 'THREE',
    4: 'FOUR',
    5: 'FIVE',
    6: 'SIX',
    7: 'SEVEN',
    8: 'EIGHT',
    9: 'NINE',
    10: 'TEN',
    11: 'ELEVEN',
    12: 'TWELVE',
  };

  keys.push(`H${displayHour}`);
  words.push(hourNames[displayHour]);

  if (bucket === 0) {
    keys.push('OCLOCK');
    words.push("O'CLOCK");
  }

  const activeCells = new Set<string>();
  for (const key of keys) {
    const span = WORD_SPANS[key];
    if (!span) continue;
    const [row, startCol, len] = span;
    for (let c = startCol; c < startCol + len; c++) {
      activeCells.add(`${row}:${c}`);
    }
  }

  return {
    activeCells,
    minuteDots,
    phrase: words.join(' '),
  };
}

export interface RadialClockProgress {
  secondPct: number;
  minutePct: number;
  hourPct: number;
  dayPct: number;
  solarPct: number; // 0..100 across 06:00 -> 18:00 daylight arc
}

export function computeRadialClockProgress(
  hours24: number,
  minutes: number,
  seconds: number,
): RadialClockProgress {
  const totalDaySeconds = hours24 * 3600 + minutes * 60 + seconds;
  const daylightSeconds = totalDaySeconds - 6 * 3600;
  const solarPct = Math.max(0, Math.min(100, (daylightSeconds / (12 * 3600)) * 100));

  return {
    secondPct: Number(((seconds / 60) * 100).toFixed(1)),
    minutePct: Number((((minutes + seconds / 60) / 60) * 100).toFixed(1)),
    hourPct: Number(((((hours24 % 12) + minutes / 60) / 12) * 100).toFixed(1)),
    dayPct: Number(((totalDaySeconds / 86400) * 100).toFixed(1)),
    solarPct: Number(solarPct.toFixed(1)),
  };
}

export interface StopwatchFormatted {
  minutes: string;
  seconds: string;
  centiseconds: string;
  formatted: string;
}

export function formatStopwatchMs(ms: number): StopwatchFormatted {
  const safe = Math.max(0, Math.floor(ms));
  const totalSec = Math.floor(safe / 1000);
  const minutes = pad2(Math.floor(totalSec / 60));
  const seconds = pad2(totalSec % 60);
  const centiseconds = pad2(Math.floor((safe % 1000) / 10));
  return {
    minutes,
    seconds,
    centiseconds,
    formatted: `${minutes}:${seconds}.${centiseconds}`,
  };
}

export interface WorldClockCity {
  id: string;
  city: string;
  code: string;
  timeZone: string;
  offsetLabel: string;
}

export const WORLD_CLOCK_CITIES: readonly WorldClockCity[] = [
  { id: 'lon', city: 'London', code: 'LDN', timeZone: 'Europe/London', offsetLabel: 'UTC+0' },
  { id: 'nyc', city: 'New York', code: 'NYC', timeZone: 'America/New_York', offsetLabel: 'UTC-5' },
  { id: 'sfo', city: 'San Francisco', code: 'SFO', timeZone: 'America/Los_Angeles', offsetLabel: 'UTC-8' },
  { id: 'ber', city: 'Berlin', code: 'BER', timeZone: 'Europe/Berlin', offsetLabel: 'UTC+1' },
  { id: 'blr', city: 'Bengaluru', code: 'BLR', timeZone: 'Asia/Kolkata', offsetLabel: 'UTC+5:30' },
  { id: 'tyo', city: 'Tokyo', code: 'TYO', timeZone: 'Asia/Tokyo', offsetLabel: 'UTC+9' },
];

export function applyHourOffset(date: Date, offsetHours: number): Date {
  return new Date(date.getTime() + offsetHours * 3600 * 1000);
}
