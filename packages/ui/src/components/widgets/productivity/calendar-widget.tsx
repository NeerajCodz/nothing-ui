import * as React from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { cn } from '../../../lib/cn';
import {
  type CalendarSelectionMode,
  type CalendarWeekStart,
  type MagneticOffset,
  buildMonthGrid,
  computeGridProximity,
  computeMagneticOffset,
  countDaysInclusive,
  dateToIso,
  formatAccessibleDateLabel,
  formatCompactDateLabel,
  formatMonthDotoLabel,
  getIsoWeekNumber,
  getWeekdayHeaders,
  isIsoDateInRange,
  normalizeDateInput,
  parseIsoDate,
  shiftCalendarMonth,
  shiftIsoDay,
} from '../../../lib/widgets/calendar-widget-logic';

export interface CalendarWidgetProps {
  /** Controlled selected date (Date or YYYY-MM-DD). */
  value?: Date | string;
  /** Initial selected date for uncontrolled usage. */
  defaultValue?: Date | string;
  /** Selection mode: single day or inclusive date range. */
  defaultMode?: CalendarSelectionMode;
  /** First day of week: 1 = Monday (Nothing OS default), 0 = Sunday. */
  defaultWeekStartsOn?: CalendarWeekStart;
  /** Optional list of YYYY-MM-DD ISO dates displaying Signal Red event dots. */
  markedDates?: readonly string[];
  /** Maximum magnetic hover pull in pixels (set 0 to disable). */
  magneticStrength?: number;
  /** Optional deterministic "today" override for previews and tests. */
  today?: Date;
  /** Shows header controls for Single/Range mode and Mon/Sun week start. */
  showControls?: boolean;
  /** Fires whenever a single date is selected. */
  onSelectDate?: (isoDate: string) => void;
  /** Fires whenever range selection updates. */
  onSelectRange?: (range: { start: string; end: string | null }) => void;
  className?: string;
}

const ZERO_OFFSET: MagneticOffset = { x: 0, y: 0, intensity: 0 };

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  return reduced;
}

export function CalendarWidget({
  value,
  defaultValue,
  defaultMode = 'single',
  defaultWeekStartsOn = 1,
  markedDates,
  magneticStrength = 5,
  today,
  showControls = true,
  onSelectDate,
  onSelectRange,
  className,
}: CalendarWidgetProps) {
  const todayIso = React.useMemo(() => dateToIso(today ?? new Date()), [today]);
  const initialSelectedIso = React.useMemo(
    () => normalizeDateInput(value) ?? normalizeDateInput(defaultValue) ?? todayIso,
    [value, defaultValue, todayIso],
  );

  const initialParts = parseIsoDate(initialSelectedIso) ?? parseIsoDate(todayIso)!;

  const [viewYear, setViewYear] = React.useState(initialParts.year);
  const [viewMonth, setViewMonth] = React.useState(initialParts.month);
  const [internalSelected, setInternalSelected] = React.useState<string>(initialSelectedIso);
  const [rangeEnd, setRangeEnd] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<CalendarSelectionMode>(defaultMode);
  const [weekStartsOn, setWeekStartsOn] = React.useState<CalendarWeekStart>(defaultWeekStartsOn);

  // Magnetic pointer state for active hovered cell
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [magneticOffset, setMagneticOffset] = React.useState<MagneticOffset>(ZERO_OFFSET);
  const reducedMotion = usePrefersReducedMotion();

  const cellButtonRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});

  const selectedIso = normalizeDateInput(value) ?? internalSelected;

  React.useEffect(() => {
    const controlled = normalizeDateInput(value);
    if (controlled) {
      const parsed = parseIsoDate(controlled);
      if (parsed) {
        setViewYear(parsed.year);
        setViewMonth(parsed.month);
      }
    }
  }, [value]);

  // Default event markers relative to visible month if caller doesn't supply any
  const markedSet = React.useMemo(() => {
    if (markedDates) return new Set(markedDates);
    const pad = (n: number) => String(n).padStart(2, '0');
    const prefix = `${viewYear}-${pad(viewMonth + 1)}`;
    return new Set([`${prefix}-05`, `${prefix}-14`, `${prefix}-21`, todayIso]);
  }, [markedDates, viewYear, viewMonth, todayIso]);

  const cells = React.useMemo(
    () => buildMonthGrid(viewYear, viewMonth, weekStartsOn),
    [viewYear, viewMonth, weekStartsOn],
  );

  const weekdayHeaders = React.useMemo(
    () => getWeekdayHeaders(weekStartsOn),
    [weekStartsOn],
  );

  const monthHeading = formatMonthDotoLabel(viewYear, viewMonth);

  const selectedParts = parseIsoDate(selectedIso);
  const selectedIsoWeek = selectedParts
    ? getIsoWeekNumber(selectedParts.year, selectedParts.month, selectedParts.day)
    : getIsoWeekNumber(viewYear, viewMonth, 1);

  const handleSelectIso = React.useCallback(
    (iso: string) => {
      const parsed = parseIsoDate(iso);
      if (parsed && (parsed.year !== viewYear || parsed.month !== viewMonth)) {
        setViewYear(parsed.year);
        setViewMonth(parsed.month);
      }

      if (mode === 'single') {
        if (value === undefined) setInternalSelected(iso);
        setRangeEnd(null);
        onSelectDate?.(iso);
        return;
      }

      // Range selection state machine
      if (!selectedIso || rangeEnd !== null) {
        if (value === undefined) setInternalSelected(iso);
        setRangeEnd(null);
        onSelectRange?.({ start: iso, end: null });
        onSelectDate?.(iso);
      } else {
        const [start, end] = iso < selectedIso ? [iso, selectedIso] : [selectedIso, iso];
        if (value === undefined) setInternalSelected(start);
        setRangeEnd(end);
        onSelectRange?.({ start, end });
        onSelectDate?.(end);
      }
    },
    [mode, value, selectedIso, rangeEnd, viewYear, viewMonth, onSelectDate, onSelectRange],
  );

  const handleStepMonth = React.useCallback((delta: number) => {
    setHoveredIndex(null);
    setMagneticOffset(ZERO_OFFSET);
    setViewYear((prevYear) => {
      const shifted = shiftCalendarMonth(prevYear, viewMonth, delta);
      setViewMonth(shifted.month);
      return shifted.year;
    });
  }, [viewMonth]);

  const handleJumpToday = React.useCallback(() => {
    const parsed = parseIsoDate(todayIso);
    if (parsed) {
      setViewYear(parsed.year);
      setViewMonth(parsed.month);
    }
    if (value === undefined) setInternalSelected(todayIso);
    setRangeEnd(null);
    onSelectDate?.(todayIso);
  }, [todayIso, value, onSelectDate]);

  const handleCellKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, iso: string) => {
      let deltaDays = 0;
      if (e.key === 'ArrowRight') deltaDays = 1;
      else if (e.key === 'ArrowLeft') deltaDays = -1;
      else if (e.key === 'ArrowDown') deltaDays = 7;
      else if (e.key === 'ArrowUp') deltaDays = -7;
      else if (e.key === 'PageDown') {
        e.preventDefault();
        handleStepMonth(1);
        return;
      } else if (e.key === 'PageUp') {
        e.preventDefault();
        handleStepMonth(-1);
        return;
      } else {
        return;
      }

      e.preventDefault();
      const nextIso = shiftIsoDay(iso, deltaDays);
      const parsed = parseIsoDate(nextIso);
      if (parsed && (parsed.year !== viewYear || parsed.month !== viewMonth)) {
        setViewYear(parsed.year);
        setViewMonth(parsed.month);
      }
      window.requestAnimationFrame(() => {
        cellButtonRefs.current[nextIso]?.focus();
      });
    },
    [viewYear, viewMonth, handleStepMonth],
  );

  const handlePointerMove = React.useCallback(
    (idx: number, event: React.PointerEvent<HTMLButtonElement>) => {
      setHoveredIndex(idx);
      if (reducedMotion || magneticStrength <= 0) {
        setMagneticOffset(ZERO_OFFSET);
        return;
      }
      const rect = event.currentTarget.getBoundingClientRect();
      setMagneticOffset(
        computeMagneticOffset(event.clientX, event.clientY, rect, magneticStrength),
      );
    },
    [reducedMotion, magneticStrength],
  );

  const handleGridPointerLeave = React.useCallback(() => {
    setHoveredIndex(null);
    setMagneticOffset(ZERO_OFFSET);
  }, []);

  const rangeSpanDays =
    mode === 'range' && rangeEnd ? countDaysInclusive(selectedIso, rangeEnd) : 1;

  return (
    <section
      data-testid="calendar-widget"
      aria-label={`Calendar Widget — ${monthHeading}`}
      className={cn(
        'rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5 text-[var(--nt-display)] select-none',
        className,
      )}
    >
      {/* Top Bar: Doto Month/Year + Month Navigation */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[var(--nt-line)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--nt-muted)] tabular-nums">
            <span>WK {String(selectedIsoWeek).padStart(2, '0')}</span>
            <span aria-hidden="true">·</span>
            <span>{mode === 'range' ? 'Range Select' : 'Single Date'}</span>
            <span aria-hidden="true">·</span>
            <span>Magnetic Grid</span>
          </div>
          <h3
            data-testid="calendar-month-heading"
            className="font-display text-2xl sm:text-[26px] leading-none tracking-[0.04em] text-[var(--nt-display)] tabular-nums"
          >
            {monthHeading}
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleJumpToday}
            className="h-8 px-2.5 rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] font-mono text-[11px] text-[var(--nt-secondary)] hover:border-[var(--nt-line-2)] hover:text-[var(--nt-display)] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nt-focus-ring)]"
          >
            Today
          </button>
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => handleStepMonth(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] text-[var(--nt-secondary)] hover:border-[var(--nt-line-2)] hover:text-[var(--nt-display)] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nt-focus-ring)]"
          >
            <CaretLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => handleStepMonth(1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] text-[var(--nt-secondary)] hover:border-[var(--nt-line-2)] hover:text-[var(--nt-display)] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nt-focus-ring)]"
          >
            <CaretRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Mode & Week-Start Segmented Controls */}
      {showControls && (
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2">
          <div
            role="group"
            aria-label="Date selection mode"
            className="inline-flex items-center gap-0.5 rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] p-0.5 font-mono text-[11px]"
          >
            {(
              [
                { id: 'single', label: 'Single' },
                { id: 'range', label: 'Range' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                aria-pressed={mode === opt.id}
                onClick={() => {
                  setMode(opt.id);
                  if (opt.id === 'single') setRangeEnd(null);
                }}
                className={cn(
                  'rounded-md px-2.5 py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer',
                  mode === opt.id
                    ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                    : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div
            role="group"
            aria-label="Week start day"
            className="inline-flex items-center gap-0.5 rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] p-0.5 font-mono text-[11px]"
          >
            {(
              [
                { id: 1 as CalendarWeekStart, label: 'Mon' },
                { id: 0 as CalendarWeekStart, label: 'Sun' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.label}
                type="button"
                aria-pressed={weekStartsOn === opt.id}
                onClick={() => setWeekStartsOn(opt.id)}
                className={cn(
                  'rounded-md px-2 py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer',
                  weekStartsOn === opt.id
                    ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                    : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Weekday Column Header Row */}
      <div
        role="row"
        className="mt-4 grid grid-cols-7 border-x border-t border-[var(--nt-line)] bg-[var(--nt-bg)]"
      >
        {weekdayHeaders.map((dayLabel) => (
          <div
            key={dayLabel}
            role="columnheader"
            className="py-2 text-center font-mono text-[10px] tracking-[0.14em] text-[var(--nt-muted)] border-r last:border-r-0 border-[var(--nt-line)]"
          >
            {dayLabel}
          </div>
        ))}
      </div>

      {/* Minimalist 6x7 Monochrome Grid with Magnetic Hover States */}
      <div
        role="grid"
        aria-label={monthHeading}
        data-testid="calendar-date-grid"
        onPointerLeave={handleGridPointerLeave}
        className="grid grid-cols-7 border-t border-l border-[var(--nt-line)] bg-[var(--nt-bg)]"
      >
        {cells.map((cell, idx) => {
          const isToday = cell.iso === todayIso;
          const isStart = cell.iso === selectedIso;
          const isEnd = mode === 'range' && rangeEnd !== null && cell.iso === rangeEnd;
          const isSelected = isStart || isEnd;
          const isInRange =
            mode === 'range' &&
            rangeEnd !== null &&
            isIsoDateInRange(cell.iso, selectedIso, rangeEnd) &&
            !isSelected;
          const isMarked = markedSet.has(cell.iso);

          const isHovered = hoveredIndex === idx;
          const proximity = computeGridProximity(hoveredIndex, idx, 7);

          const translateX = isHovered ? magneticOffset.x : 0;
          const translateY = isHovered ? magneticOffset.y : 0;

          return (
            <button
              key={cell.iso}
              ref={(el) => {
                cellButtonRefs.current[cell.iso] = el;
              }}
              type="button"
              data-date={cell.iso}
              data-magnetic-active={isHovered ? 'true' : 'false'}
              data-magnetic-proximity={proximity > 0 ? String(proximity) : undefined}
              aria-label={formatAccessibleDateLabel(cell.iso)}
              aria-pressed={isSelected}
              aria-current={isToday ? 'date' : undefined}
              onClick={() => handleSelectIso(cell.iso)}
              onKeyDown={(e) => handleCellKeyDown(e, cell.iso)}
              onPointerEnter={(e) => handlePointerMove(idx, e)}
              onPointerMove={(e) => handlePointerMove(idx, e)}
              className={cn(
                'group relative flex min-h-[44px] items-center justify-center border-r border-b border-[var(--nt-line)] p-1 transition-colors duration-150 cursor-pointer focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--nt-focus-ring)]',
                isSelected
                  ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : isInRange
                    ? 'bg-[var(--nt-raised)] text-[var(--nt-display)]'
                    : isHovered
                      ? 'bg-[var(--nt-raised)]/85 text-[var(--nt-display)]'
                      : proximity > 0.25
                        ? 'bg-[var(--nt-surface)]/75 text-[var(--nt-primary)]'
                        : 'bg-transparent text-[var(--nt-primary)]',
                !cell.inCurrentMonth && !isSelected && 'opacity-35',
              )}
            >
              {/* Magnetic corner crosshair reticle visible on active hover */}
              <span
                aria-hidden="true"
                className={cn(
                  'pointer-events-none absolute inset-1 border border-dashed transition-opacity duration-150',
                  isHovered && !isSelected
                    ? 'opacity-70 border-[var(--nt-display)]/45'
                    : 'opacity-0 border-transparent',
                )}
              />

              {/* Magnetically attracted numeral & indicator stack (compositor transform only) */}
              <span
                data-testid={`calendar-day-inner-${cell.iso}`}
                className="relative z-[1] flex flex-col items-center justify-center gap-0.5 will-change-transform transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  transform: `translate3d(${translateX}px, ${translateY}px, 0)`,
                }}
              >
                <span
                  className={cn(
                    'font-mono text-xs leading-none tabular-nums',
                    isSelected
                      ? 'font-semibold'
                      : isToday
                        ? 'font-semibold text-[var(--nt-display)]'
                        : 'font-normal',
                  )}
                >
                  {String(cell.day).padStart(2, '0')}
                </span>

                {/* Precision indicator dot: Signal Red for Today or Marked Event */}
                <span className="flex h-1.5 items-center justify-center gap-0.5" aria-hidden="true">
                  {isToday && (
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        isSelected ? 'bg-[var(--nt-accent)]' : 'bg-[var(--nt-accent)]',
                      )}
                    />
                  )}
                  {!isToday && isMarked && cell.inCurrentMonth && (
                    <span
                      className={cn(
                        'h-1 w-1 rounded-full',
                        isSelected ? 'bg-[var(--nt-inverse-fg)]/70' : 'bg-[var(--nt-muted)]',
                      )}
                    />
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Monochrome Selection Summary Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[var(--nt-line)] font-mono text-xs tabular-nums">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[var(--nt-muted)]">Selected</span>
          <span
            data-testid="calendar-selected-readout"
            className="text-[var(--nt-display)] font-medium"
          >
            {mode === 'range' && rangeEnd
              ? `${formatCompactDateLabel(selectedIso)} → ${formatCompactDateLabel(rangeEnd)}`
              : formatCompactDateLabel(selectedIso)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[var(--nt-muted)]">
          {mode === 'range' && rangeEnd ? (
            <span className="text-[var(--nt-accent)] font-medium">
              {rangeSpanDays} {rangeSpanDays === 1 ? 'day' : 'days'}
            </span>
          ) : (
            <span>{selectedIso === todayIso ? 'Today' : selectedIso}</span>
          )}
        </div>
      </div>
    </section>
  );
}
