import * as React from 'react';
import { cn } from '../lib/cn';
import type { LoaderVariant, LoadingPosition } from '../lib/loading-logic';
import { useLoadingConfig } from '../hooks/loading-provider';
import { resolveLoaderVariant } from '../lib/loading-logic';

export interface NothingLoadingProps {
  /** Activates loading state, sets aria-busy, and blocks duplicate actions. */
  loading?: boolean;
  /** Optional replacement text displayed while loading (e.g. "Saving..."). */
  loadingText?: string;
  /** Visual indicator style; inherits LoadingConfigProvider ("normal" by default). */
  loaderVariant?: LoaderVariant;
  /** Indicator placement relative to label/content ("start" by default). */
  loadingPosition?: LoadingPosition;
  /** Escape hatch to supply any custom spinner or loading element. */
  loadingIndicator?: React.ReactNode;
}

export interface NothingLoaderProps {
  /** Indicator style ("normal" monochrome spinner by default; inherits provider). */
  variant?: LoaderVariant;
  /** Size preset matching inline controls or standalone surfaces. */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Optional accessible & visible status label (e.g. "Loading..."). */
  label?: string;
  /** Color tone ("current" inherits parent button/text color). */
  tone?: 'current' | 'display' | 'muted' | 'signal';
  /** Custom replacement indicator element. */
  indicator?: React.ReactNode;
  /** Mark decorative when rendered inside an aria-busy button or control. */
  decorative?: boolean;
  className?: string;
}

const SPINNER_SIZES = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
};

const DOTS_CELL_SIZES = {
  xs: 'h-[2.5px] w-[2.5px]',
  sm: 'h-[3px] w-[3px]',
  md: 'h-1.5 w-1.5',
  lg: 'h-2 w-2',
};

const DOTS_GAP_SIZES = {
  xs: 'gap-[1.5px]',
  sm: 'gap-[2px]',
  md: 'gap-1',
  lg: 'gap-1.5',
};

const BAR_HEIGHT_SIZES = {
  xs: 'h-3',
  sm: 'h-3.5',
  md: 'h-5',
  lg: 'h-6',
};

const TONE_CLASSES = {
  current: 'text-current',
  display: 'text-[var(--nt-display)]',
  muted: 'text-[var(--nt-muted)]',
  signal: 'text-[var(--nt-accent)]',
};

/**
 * NothingLoader — Configurable, accessible loading primitive.
 * Defaults to a clean, normal rotating monochrome ring ("normal").
 * Developers can opt into "dots" (3x3 matrix), "bars", "pulse", or pass a custom indicator.
 */
export function NothingLoader({
  variant,
  size = 'sm',
  label,
  tone = 'current',
  indicator,
  decorative = false,
  className,
}: NothingLoaderProps) {
  const ctx = useLoadingConfig();
  const resolvedVariant = resolveLoaderVariant(variant, ctx.variant);

  const renderGraphic = () => {
    if (indicator) return indicator;

    if (resolvedVariant === 'dots') {
      return (
        <span
          aria-hidden="true"
          className={cn('inline-grid grid-cols-3 shrink-0', DOTS_GAP_SIZES[size])}
        >
          {Array.from({ length: 9 }).map((_, idx) => (
            <span
              key={idx}
              className={cn('nt-dot-loader-cell rounded-full bg-current', DOTS_CELL_SIZES[size])}
              style={{ animationDelay: `${idx * 75}ms` }}
            />
          ))}
        </span>
      );
    }

    if (resolvedVariant === 'bars') {
      return (
        <span
          aria-hidden="true"
          className={cn('inline-flex items-center gap-[2px] shrink-0', BAR_HEIGHT_SIZES[size])}
        >
          {[0, 1, 2].map((idx) => (
            <span
              key={idx}
              className="nt-bar-loader-col h-full w-[2.5px] rounded-full bg-current"
              style={{ animationDelay: `${idx * 140}ms` }}
            />
          ))}
        </span>
      );
    }

    if (resolvedVariant === 'pulse') {
      return (
        <span
          aria-hidden="true"
          className={cn('relative inline-flex items-center justify-center shrink-0', SPINNER_SIZES[size])}
        >
          <span className="absolute inset-0 rounded-full border border-current opacity-35 motion-safe:animate-ping" />
          <span className="h-[45%] w-[45%] rounded-full bg-current" />
        </span>
      );
    }

    // Default: "normal" clean rotating monochrome ring spinner
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        className={cn('shrink-0 motion-safe:animate-spin', SPINNER_SIZES[size])}
      >
        <circle
          cx="12"
          cy="12"
          r="9.5"
          stroke="currentColor"
          strokeOpacity="0.22"
          strokeWidth="2.5"
        />
        <path
          d="M21.5 12a9.5 9.5 0 0 0-9.5-9.5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    );
  };

  return (
    <span
      role={decorative ? undefined : 'status'}
      aria-hidden={decorative ? true : undefined}
      aria-label={!decorative && !label ? 'Loading' : undefined}
      data-loader-variant={resolvedVariant}
      className={cn('inline-flex items-center gap-2', TONE_CLASSES[tone], className)}
    >
      {renderGraphic()}
      {label && (
        <span className="font-mono text-[11px] tracking-[0.06em] tabular-nums">{label}</span>
      )}
    </span>
  );
}

export const Loader = NothingLoader;
