import * as React from 'react';
import { ArrowCounterClockwise, Eye, EyeSlash } from '@phosphor-icons/react';
import { cn } from '@nothing-ui/ui';
import type { BarSeriesKey } from './bar-series-logic';

export interface BarSeriesLegendItem {
  key: BarSeriesKey;
  label: string;
  color: string;
  total: number;
  unit: string;
  visible: boolean;
}

export interface BarSeriesLegendProps {
  items: readonly BarSeriesLegendItem[];
  onToggle: (key: BarSeriesKey) => void;
  onShowAll: () => void;
  className?: string;
}

/**
 * Interactive series legend for the ChartsHub responsive bar chart.
 * Allows users to toggle individual data series on/off with full keyboard & ARIA feedback.
 */
export function BarSeriesLegend({
  items,
  onToggle,
  onShowAll,
  className,
}: BarSeriesLegendProps) {
  const visibleCount = items.filter((item) => item.visible).length;
  const hasHidden = visibleCount < items.length;

  return (
    <div
      data-testid="bar-series-legend"
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] px-3.5 py-2.5',
        className,
      )}
    >
      <div
        role="group"
        aria-label="Toggle bar chart data series"
        className="flex flex-wrap items-center gap-2"
      >
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            data-testid={`bar-legend-toggle-${item.key}`}
            data-series-key={item.key}
            data-series-visible={String(item.visible)}
            aria-pressed={item.visible}
            aria-label={`Toggle ${item.label} series visibility`}
            onClick={() => onToggle(item.key)}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 font-mono text-xs transition-colors cursor-pointer',
              item.visible
                ? 'border-[var(--nt-line-2)] bg-[var(--nt-surface)] text-[var(--nt-display)] hover:border-[var(--nt-display)]'
                : 'border-dashed border-[var(--nt-line)] bg-transparent text-[var(--nt-muted)] hover:border-[var(--nt-line-2)] hover:text-[var(--nt-secondary)]',
            )}
          >
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 shrink-0 rounded-[2px] border transition-opacity"
              style={
                item.visible
                  ? { backgroundColor: item.color, borderColor: item.color }
                  : { backgroundColor: 'transparent', borderColor: item.color, opacity: 0.45 }
              }
            />
            <span className={cn('whitespace-nowrap', !item.visible && 'line-through opacity-65')}>
              {item.label}
            </span>
            <span
              className={cn(
                'text-[10px] tabular-nums',
                item.visible ? 'text-[var(--nt-muted)]' : 'opacity-50',
              )}
            >
              {item.total.toLocaleString()} {item.unit}
            </span>
            {item.visible ? (
              <Eye className="h-3.5 w-3.5 shrink-0 text-[var(--nt-secondary)]" aria-hidden="true" />
            ) : (
              <EyeSlash className="h-3.5 w-3.5 shrink-0 text-[var(--nt-muted)]" aria-hidden="true" />
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 font-mono text-[11px] text-[var(--nt-muted)]">
        <span className="tabular-nums">
          {visibleCount}/{items.length} visible
        </span>
        {hasHidden && (
          <button
            type="button"
            data-testid="bar-legend-show-all"
            onClick={onShowAll}
            className="inline-flex items-center gap-1 rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-surface)] px-2 py-1 text-[11px] text-[var(--nt-display)] transition-colors hover:border-[var(--nt-display)] cursor-pointer"
          >
            <ArrowCounterClockwise className="h-3 w-3" aria-hidden="true" />
            <span>Show all</span>
          </button>
        )}
      </div>
    </div>
  );
}
