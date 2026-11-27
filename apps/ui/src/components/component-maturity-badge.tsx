import * as React from 'react';
import { cn } from '@nothing-ui/ui';
import type { ComponentMaturityMeta } from '../lib/component-maturity';

export interface ComponentMaturityBadgeProps {
  maturity: ComponentMaturityMeta;
  className?: string;
}

/**
 * Hardware-inspired Nothing UI maturity indicator displaying a live semantic LED dot,
 * maturity tier label (Alpha, Beta, Stable, Deprecated), and concise lifecycle cue.
 */
export function ComponentMaturityBadge({
  maturity,
  className,
}: ComponentMaturityBadgeProps) {
  return (
    <span
      data-testid="component-maturity-badge"
      data-maturity={maturity.level}
      data-color-token={maturity.colorToken}
      title={`${maturity.label} — ${maturity.shortNote}`}
      className={cn(
        'inline-flex items-center gap-2 rounded-md border px-2.5 py-1 font-mono text-[11px] leading-none tracking-[0.06em]',
        maturity.badgeClass,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn('h-2 w-2 shrink-0 rounded-full', maturity.dotClass)}
      />
      <span className="font-semibold uppercase">{maturity.label}</span>
      <span aria-hidden="true" className="opacity-35">·</span>
      <span className="text-[10px] font-normal text-[var(--nt-secondary)]">
        {maturity.shortNote}
      </span>
    </span>
  );
}
