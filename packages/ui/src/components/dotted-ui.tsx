import * as React from 'react';
import { cn } from '../lib/cn';
import { NothingLoader } from './loader';
import { useAsyncAction, useResolvedLoading } from '../hooks/loading-provider';
import type { LoaderVariant } from '../lib/loading-logic';

/**
 * 15.2 DotText — Dot-matrix Doto display typography with calibrated tracking and optional Signal accent.
 */
export interface DotTextProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'div';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  tone?: 'display' | 'secondary' | 'signal';
  uppercase?: boolean;
}

const DOT_TEXT_SIZES = {
  sm: 'text-sm tracking-[0.06em]',
  md: 'text-xl tracking-[0.05em]',
  lg: 'text-3xl tracking-[0.04em]',
  xl: 'text-4xl sm:text-5xl tracking-[0.03em] leading-[1.06]',
  '2xl': 'text-5xl sm:text-6xl tracking-[0.02em] leading-[1.02]',
};

const DOT_TEXT_TONES = {
  display: 'text-[var(--nt-display)]',
  secondary: 'text-[var(--nt-secondary)]',
  signal: 'text-[var(--nt-accent)]',
};

export function DotText({
  as: Tag = 'span',
  size = 'md',
  tone = 'display',
  uppercase = false,
  className,
  children,
  ...props
}: DotTextProps) {
  return (
    <Tag
      className={cn(
        'font-display tabular-nums',
        DOT_TEXT_SIZES[size],
        DOT_TEXT_TONES[tone],
        uppercase && 'uppercase',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

/**
 * 15.4 DotCounter — Numeric dot-matrix readout with tabular digits, optional unit, and loading skeleton.
 */
export interface DotCounterProps {
  value: number | string;
  label?: string;
  unit?: string;
  delta?: string;
  signal?: boolean;
  loading?: boolean;
  className?: string;
}

export function DotCounter({
  value,
  label,
  unit,
  delta,
  signal = false,
  loading,
  className,
}: DotCounterProps) {
  const resolved = useResolvedLoading({ loading });
  const isBusy = resolved.isLoading;

  return (
    <div
      aria-busy={isBusy || undefined}
      className={cn(
        'inline-flex flex-col gap-1 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] px-4 py-3',
        className,
      )}
    >
      {label && (
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--nt-muted)]">
          {label}
        </span>
      )}
      {isBusy ? (
        <div className="nt-skeleton mt-1 h-7 w-24 rounded" />
      ) : (
        <div className="flex items-baseline gap-1.5">
          <span
            className={cn(
              'font-display text-3xl leading-none tabular-nums',
              signal ? 'text-[var(--nt-accent)]' : 'text-[var(--nt-display)]',
            )}
          >
            {value}
          </span>
          {unit && <span className="font-mono text-xs text-[var(--nt-secondary)]">{unit}</span>}
          {delta && (
            <span className="ml-1 font-mono text-[11px] tabular-nums text-[var(--nt-muted)]">
              {delta}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * 15.5 DotProgress — Discrete circular dot-matrix progress bar with indeterminate loading mode.
 */
export interface DotProgressProps {
  value: number;
  max?: number;
  dots?: number;
  label?: string;
  signal?: boolean;
  loading?: boolean;
  className?: string;
}

export function DotProgress({
  value,
  max = 100,
  dots = 20,
  label,
  signal = false,
  loading,
  className,
}: DotProgressProps) {
  const resolved = useResolvedLoading({ loading });
  const isBusy = resolved.isLoading;
  const clamped = Math.max(0, Math.min(max, value));
  const ratio = max > 0 ? clamped / max : 0;
  const litDots = Math.round(ratio * dots);
  const pct = Math.round(ratio * 100);

  return (
    <div className={cn('space-y-2', className)} aria-busy={isBusy || undefined}>
      {label && (
        <div className="flex items-center justify-between font-mono text-xs">
          <span className="text-[var(--nt-secondary)]">{label}</span>
          <span className="tabular-nums text-[var(--nt-display)]">
            {isBusy ? 'Loading...' : `${pct}%`}
          </span>
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label || 'Dot progress'}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={isBusy ? undefined : clamped}
        className="flex items-center gap-1.5"
      >
        {Array.from({ length: dots }).map((_, i) => {
          const lit = !isBusy && i < litDots;
          return (
            <span
              key={i}
              aria-hidden="true"
              style={isBusy ? { animationDelay: `${i * 55}ms` } : undefined}
              className={cn(
                'h-2.5 w-2.5 rounded-full transition-colors duration-150',
                isBusy
                  ? cn('nt-dot-loader-cell', signal ? 'bg-[var(--nt-accent)]' : 'bg-[var(--nt-display)]')
                  : lit
                    ? signal
                      ? 'bg-[var(--nt-accent)] shadow-[0_0_8px_rgba(215,25,33,0.45)]'
                      : 'bg-[var(--nt-display)]'
                    : 'bg-[var(--nt-line-2)] opacity-45',
              )}
            />
          );
        })}
      </div>
    </div>
  );
}

/**
 * 15.6 DotMatrixClock — Standalone dot-matrix digital clock with live NTP sync action.
 */
export interface DotMatrixClockProps {
  initial24Hour?: boolean;
  timezoneLabel?: string;
  loading?: boolean;
  loaderVariant?: LoaderVariant;
  className?: string;
}

export function DotMatrixClock({
  initial24Hour = true,
  timezoneLabel = 'LOCAL',
  loading,
  loaderVariant,
  className,
}: DotMatrixClockProps) {
  const [is24h, setIs24h] = React.useState(initial24Hour);
  const [now, setNow] = React.useState(() => new Date());
  const syncAction = useAsyncAction(700);
  const resolved = useResolvedLoading({
    loading: loading || syncAction.loading,
    loaderVariant,
  });
  const isBusy = resolved.isLoading;

  React.useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const rawHours = now.getHours();
  const displayHours = is24h ? rawHours : rawHours % 12 || 12;
  const hh = String(displayHours).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const meridiem = is24h ? '24H' : rawHours >= 12 ? 'PM' : 'AM';

  return (
    <div
      aria-busy={isBusy || undefined}
      className={cn(
        'inline-flex flex-col gap-3 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--nt-muted)]">
        <span className="flex items-center gap-2">
          {isBusy ? (
            <NothingLoader variant={resolved.variant} size="xs" decorative />
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--nt-accent)]" aria-hidden="true" />
          )}
          {isBusy ? 'SYNCING NTP...' : `${timezoneLabel} · ${meridiem}`}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => syncAction.trigger(() => setNow(new Date()))}
            className="rounded border border-[var(--nt-line-2)] px-2 py-0.5 text-[10px] text-[var(--nt-secondary)] hover:text-[var(--nt-display)] disabled:opacity-50 cursor-pointer"
          >
            Sync
          </button>
          <button
            type="button"
            onClick={() => setIs24h((prev) => !prev)}
            className="rounded border border-[var(--nt-line-2)] px-2 py-0.5 text-[10px] text-[var(--nt-secondary)] hover:text-[var(--nt-display)] cursor-pointer"
          >
            {is24h ? '12H' : '24H'}
          </button>
        </div>
      </div>
      <div className="flex items-baseline gap-1 font-display text-4xl leading-none tracking-[0.06em] tabular-nums text-[var(--nt-display)]">
        <span>{hh}</span>
        <span className={cn('text-[var(--nt-accent)]', now.getSeconds() % 2 === 0 ? 'opacity-100' : 'opacity-35')}>
          :
        </span>
        <span>{mm}</span>
        <span className="ml-1.5 font-mono text-sm text-[var(--nt-muted)]">{ss}</span>
      </div>
    </div>
  );
}
