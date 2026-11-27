export type CalendarWeekStart = 0 | 1; // 0 = Sunday, 1 = Monday
export type CalendarSelectionMode = 'single' | 'range';

export interface CalendarDayCell {
  iso: string;
  year: number;
  month: number; // 0-indexed (0 = January)
  day: number;
  dayOfWeek: number; // 0 = Sun .. 6 = Sat
  inCurrentMonth: boolean;
  isWeekend: boolean;
  isoWeek: number;
}

export interface MagneticOffset {
  x: number;
  y: number;
  intensity: number; // 0..1 proximity pull
}

const MONTH_SHORT = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
] as const;

const MONTH_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const WEEKDAY_LONG = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

const WEEKDAY_TWO = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'] as const;

export function padCalendar2(value: number): string {
  return String(Math.max(0, Math.floor(value))).padStart(2, '0');
}

export function formatIsoDate(year: number, month: number, day: number): string {
  return `${year}-${padCalendar2(month + 1)}-${padCalendar2(day)}`;
}

export function dateToIso(date: Date): string {
  return formatIsoDate(date.getFullYear(), date.getMonth(), date.getDate());
}

export function parseIsoDate(iso: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  if (month < 0 || month > 11 || day < 1 || day > 31) return null;
  const probe = new Date(year, month, day);
  if (
    probe.getFullYear() !== year ||
    probe.getMonth() !== month ||
    probe.getDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

export function normalizeDateInput(input?: Date | string | null): string | null {
  if (!input) return null;
  if (typeof input === 'string') {
    return parseIsoDate(input) ? input.trim() : null;
  }
  if (input instanceof Date && !Number.isNaN(input.getTime())) {
    return dateToIso(input);
  }
  return null;
}

export function getIsoWeekNumber(year: number, month: number, day: number): number {
  const target = new Date(Date.UTC(year, month, day));
  const dayNum = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil((((target.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function getWeekdayHeaders(weekStartsOn: CalendarWeekStart = 1): readonly string[] {
  if (weekStartsOn === 0) return WEEKDAY_TWO;
  return [...WEEKDAY_TWO.slice(1), WEEKDAY_TWO[0]];
}

export function shiftCalendarMonth(
  year: number,
  month: number,
  deltaMonths: number,
): { year: number; month: number } {
  const d = new Date(year, month + deltaMonths, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

export function shiftIsoDay(iso: string, deltaDays: number): string {
  const parsed = parseIsoDate(iso);
  if (!parsed) return iso;
  const d = new Date(parsed.year, parsed.month, parsed.day + deltaDays);
  return dateToIso(d);
}

/**
 * Builds a deterministic 42-cell (6 rows x 7 columns) calendar matrix for the target month.
 */
export function buildMonthGrid(
  year: number,
  month: number,
  weekStartsOn: CalendarWeekStart = 1,
): CalendarDayCell[] {
  const firstOfMonth = new Date(year, month, 1);
  const firstDow = firstOfMonth.getDay(); // 0..6
  const leadingOffset = (firstDow - weekStartsOn + 7) % 7;

  const cells: CalendarDayCell[] = [];
  for (let i = 0; i < 42; i++) {
    const cellDate = new Date(year, month, 1 - leadingOffset + i);
    const cy = cellDate.getFullYear();
    const cm = cellDate.getMonth();
    const cd = cellDate.getDate();
    const dow = cellDate.getDay();

    cells.push({
      iso: formatIsoDate(cy, cm, cd),
      year: cy,
      month: cm,
      day: cd,
      dayOfWeek: dow,
      inCurrentMonth: cy === year && cm === month,
      isWeekend: dow === 0 || dow === 6,
      isoWeek: getIsoWeekNumber(cy, cm, cd),
    });
  }

  return cells;
}

export function compareIsoDates(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

export function isIsoDateInRange(iso: string, start: string | null, end: string | null): boolean {
  if (!start || !end) return false;
  const [lo, hi] = start <= end ? [start, end] : [end, start];
  return iso >= lo && iso <= hi;
}

export function countDaysInclusive(start: string | null, end: string | null): number {
  if (!start) return 0;
  if (!end) return 1;
  const pA = parseIsoDate(start);
  const pB = parseIsoDate(end);
  if (!pA || !pB) return 1;
  const tA = Date.UTC(pA.year, pA.month, pA.day);
  const tB = Date.UTC(pB.year, pB.month, pB.day);
  return Math.round(Math.abs(tB - tA) / 86400000) + 1;
}

export function formatMonthDotoLabel(year: number, month: number): string {
  const safeMonth = ((month % 12) + 12) % 12;
  return `${MONTH_SHORT[safeMonth]} ${year}`;
}

export function formatAccessibleDateLabel(iso: string): string {
  const parsed = parseIsoDate(iso);
  if (!parsed) return iso;
  const d = new Date(parsed.year, parsed.month, parsed.day);
  return `${WEEKDAY_LONG[d.getDay()]}, ${MONTH_LONG[parsed.month]} ${parsed.day}, ${parsed.year}`;
}

export function formatCompactDateLabel(iso: string): string {
  const parsed = parseIsoDate(iso);
  if (!parsed) return iso;
  return `${MONTH_SHORT[parsed.month]} ${padCalendar2(parsed.day)}, ${parsed.year}`;
}

/**
 * Computes a smooth, bounded magnetic attraction offset (px) for a hovered calendar cell
 * based on pointer coordinates relative to the cell bounding box.
 */
export function computeMagneticOffset(
  pointerX: number,
  pointerY: number,
  rect: { left: number; top: number; width: number; height: number },
  maxPullPx = 5,
): MagneticOffset {
  if (rect.width <= 0 || rect.height <= 0 || maxPullPx <= 0) {
    return { x: 0, y: 0, intensity: 0 };
  }
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const nx = Math.max(-1, Math.min(1, (pointerX - cx) / (rect.width / 2)));
  const ny = Math.max(-1, Math.min(1, (pointerY - cy) / (rect.height / 2)));

  // Soft cubic ease-out curve so center feels stable while edges pull crisply toward pointer
  const dist = Math.min(1, Math.hypot(nx, ny));
  const ease = dist === 0 ? 0 : 1 - Math.pow(1 - dist, 1.8);
  const x = Number((nx * maxPullPx * (0.45 + 0.55 * ease)).toFixed(2));
  const y = Number((ny * maxPullPx * (0.45 + 0.55 * ease)).toFixed(2));

  return {
    x,
    y,
    intensity: Number(dist.toFixed(3)),
  };
}

/**
 * Computes neighbor awareness (0..1) inside the 7-column calendar grid so cells
 * immediately adjacent to the magnetically hovered cell subtly respond.
 */
export function computeGridProximity(
  hoveredIndex: number | null,
  cellIndex: number,
  cols = 7,
): number {
  if (hoveredIndex === null || hoveredIndex < 0 || cellIndex < 0) return 0;
  if (hoveredIndex === cellIndex) return 1;
  const hr = Math.floor(hoveredIndex / cols);
  const hc = hoveredIndex % cols;
  const cr = Math.floor(cellIndex / cols);
  const cc = cellIndex % cols;
  const dist = Math.hypot(cr - hr, cc - hc);
  if (dist > 1.5) return 0;
  return Number(Math.max(0, 1 - dist / 1.75).toFixed(3));
}
