import * as React from 'react';
import { DotIcon } from '@nothing-ui/dot-icons/react';
import type { DotIconName } from '@nothing-ui/dot-icons';
import { cn } from '../lib/cn';
import { NothingLoader } from './loader';
import { useAsyncAction, useResolvedLoading } from '../hooks/loading-provider';
import type { LoaderVariant } from '../lib/loading-logic';

/**
 * 16.3 LEDIndicator — Illuminated hardware status diode with steady, pulse, or syncing state.
 */
export interface LEDIndicatorProps {
  tone?: 'mono' | 'signal' | 'success' | 'warning' | 'off';
  cadence?: 'steady' | 'pulse';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  loading?: boolean;
  loaderVariant?: LoaderVariant;
  className?: string;
}

const LED_TONE_CLASSES = {
  mono: 'bg-[var(--nt-display)] shadow-[0_0_8px_rgba(255,255,255,0.45)]',
  signal: 'bg-[var(--nt-accent)] shadow-[0_0_10px_rgba(215,25,33,0.65)]',
  success: 'bg-[var(--nt-success)] shadow-[0_0_8px_rgba(34,197,94,0.5)]',
  warning: 'bg-[var(--nt-warning)] shadow-[0_0_8px_rgba(245,158,11,0.5)]',
  off: 'bg-[var(--nt-line-2)] opacity-45',
};

const LED_SIZE_CLASSES = {
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3.5 w-3.5',
};

export function LEDIndicator({
  tone = 'signal',
  cadence = 'steady',
  size = 'md',
  label,
  loading,
  loaderVariant,
  className,
}: LEDIndicatorProps) {
  const resolved = useResolvedLoading({ loading, loaderVariant });
  const isBusy = resolved.isLoading;

  return (
    <span
      aria-busy={isBusy || undefined}
      className={cn('inline-flex items-center gap-2 font-mono text-xs text-[var(--nt-primary)]', className)}
    >
      {isBusy ? (
        <NothingLoader variant={resolved.variant} size="xs" tone="display" decorative />
      ) : (
        <span
          aria-hidden="true"
          className={cn(
            'inline-block rounded-full',
            LED_SIZE_CLASSES[size],
            LED_TONE_CLASSES[tone],
            cadence === 'pulse' && tone !== 'off' && 'motion-safe:animate-pulse',
          )}
        />
      )}
      {label && <span>{isBusy ? 'SYNCING' : label}</span>}
    </span>
  );
}

/**
 * 16.4 SignalMeter — Multi-bar hardware RF / wireless reception indicator with scanning state.
 */
export interface SignalMeterProps {
  strength: number; // 0..bars
  bars?: number;
  label?: string;
  readout?: string;
  signalCritical?: boolean;
  loading?: boolean;
  loaderVariant?: LoaderVariant;
  className?: string;
}

export function SignalMeter({
  strength,
  bars = 5,
  label = 'RF LINK',
  readout,
  signalCritical = false,
  loading,
  loaderVariant,
  className,
}: SignalMeterProps) {
  const resolved = useResolvedLoading({ loading, loaderVariant });
  const isBusy = resolved.isLoading;
  const clamped = Math.max(0, Math.min(bars, Math.round(strength)));
  const isLow = clamped <= 1 || signalCritical;

  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={bars}
      aria-valuenow={clamped}
      aria-busy={isBusy || undefined}
      className={cn(
        'inline-flex items-center gap-3 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] px-3.5 py-2.5',
        className,
      )}
    >
      {isBusy ? (
        <NothingLoader variant={resolved.variant} size="sm" tone="display" decorative />
      ) : (
        <div className="flex h-6 items-end gap-1" aria-hidden="true">
          {Array.from({ length: bars }).map((_, idx) => {
            const active = idx < clamped;
            const heightPct = 28 + Math.round(((idx + 1) / bars) * 72);
            return (
              <span
                key={idx}
                style={{ height: `${heightPct}%` }}
                className={cn(
                  'w-1.5 rounded-full transition-colors',
                  active
                    ? isLow
                      ? 'bg-[var(--nt-accent)]'
                      : 'bg-[var(--nt-display)]'
                    : 'bg-[var(--nt-line-2)] opacity-45',
                )}
              />
            );
          })}
        </div>
      )}
      <div className="flex flex-col font-mono leading-tight">
        <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
          {label}
        </span>
        <span className="text-xs tabular-nums text-[var(--nt-display)]">
          {isBusy ? 'SCANNING...' : (readout ?? `${clamped}/${bars} BARS`)}
        </span>
      </div>
    </div>
  );
}

/**
 * 16.5 QuickSettingTile — Nothing OS hardware-style toggle tile with async handshake loading.
 */
export interface QuickSettingTileProps {
  icon: DotIconName;
  label: string;
  detail?: string;
  pressed: boolean;
  onPressedChange: (next: boolean) => void;
  accent?: 'mono' | 'signal';
  loading?: boolean;
  asyncToggle?: boolean;
  loaderVariant?: LoaderVariant;
  className?: string;
}

export function QuickSettingTile({
  icon,
  label,
  detail,
  pressed,
  onPressedChange,
  accent = 'mono',
  loading,
  asyncToggle = true,
  loaderVariant,
  className,
}: QuickSettingTileProps) {
  const asyncAction = useAsyncAction(600);
  const resolved = useResolvedLoading({
    loading: loading || asyncAction.loading,
    loaderVariant,
  });
  const isBusy = resolved.isLoading;

  const handleClick = () => {
    if (isBusy) return;
    if (asyncToggle) {
      asyncAction.trigger(() => onPressedChange(!pressed));
    } else {
      onPressedChange(!pressed);
    }
  };

  return (
    <button
      type="button"
      disabled={isBusy}
      aria-pressed={pressed}
      aria-busy={isBusy || undefined}
      onClick={handleClick}
      className={cn(
        'group flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all cursor-pointer select-none disabled:cursor-wait',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nt-focus-ring)]',
        pressed
          ? accent === 'signal'
            ? 'border-transparent bg-[var(--nt-accent)] text-[var(--nt-accent-fg,white)]'
            : 'border-transparent bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
          : 'border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-display)] hover:border-[var(--nt-line-2)]',
        className,
      )}
    >
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border',
          pressed
            ? 'border-current/25 bg-current/10'
            : 'border-[var(--nt-line)] bg-[var(--nt-raised)]',
        )}
      >
        {isBusy ? (
          <NothingLoader variant={resolved.variant} size="sm" decorative />
        ) : (
          <DotIcon name={icon} size={18} />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-mono text-xs font-medium">{label}</span>
        <span
          className={cn(
            'block truncate font-mono text-[10px]',
            pressed ? 'opacity-75' : 'text-[var(--nt-muted)]',
          )}
        >
          {isBusy ? 'Connecting...' : (detail ?? (pressed ? 'Active' : 'Standby'))}
        </span>
      </span>
    </button>
  );
}
