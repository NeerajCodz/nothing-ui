import * as React from 'react';
import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from '@ui-sdk/react/progress';
import {
  Meter,
  MeterIndicator,
  MeterLabel,
  MeterTrack,
  MeterValue,
} from '@ui-sdk/react/meter';
import { Separator } from '@ui-sdk/react/separator';
import { Avatar, AvatarFallback } from '@ui-sdk/react/avatar';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DotIcon } from './DotIcon';
import { NothingButton } from './Button';
import {
  NothingLoader,
  useAsyncAction,
  useResolvedLoading,
  type LoaderVariant,
} from '@nothing-ui/ui';

export function NothingAlert({
  tone = 'neutral',
  title,
  description,
  loading,
  loaderVariant,
}: {
  tone?: 'neutral' | 'signal' | 'success';
  title: string;
  description: string;
  loading?: boolean;
  loaderVariant?: LoaderVariant;
}) {
  const resolved = useResolvedLoading({ loading, loaderVariant });
  const isBusy = resolved.isLoading;
  const Icon = tone === 'signal' ? AlertTriangle : tone === 'success' ? CheckCircle2 : Info;

  return (
    <div
      role="status"
      aria-busy={isBusy || undefined}
      className={cn(
        'flex items-start gap-3 rounded-xl border p-4',
        tone === 'signal'
          ? 'border-[#D71921]/40 bg-[#D71921]/10'
          : tone === 'success'
            ? 'border-emerald-500/35 bg-emerald-500/8'
            : 'border-[var(--nt-line-2)] bg-[var(--nt-raised)]/50'
      )}
    >
      {isBusy ? (
        <span className="mt-0.5 shrink-0 text-[var(--nt-display)]">
          <NothingLoader variant={resolved.variant} size="xs" decorative />
        </span>
      ) : (
        <Icon
          className={cn(
            'mt-0.5 h-4 w-4 shrink-0',
            tone === 'signal'
              ? 'text-[#D71921]'
              : tone === 'success'
                ? 'text-emerald-500'
                : 'text-[var(--nt-secondary)]'
          )}
        />
      )}
      <div className="min-w-0">
        <div className="font-mono text-xs font-medium uppercase tracking-[0.1em] text-[var(--nt-display)]">
          {isBusy ? `${title} · Syncing` : title}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-[var(--nt-secondary)]">{description}</p>
      </div>
    </div>
  );
}

export function NothingBanner({
  message,
  actionLabel,
  onAction,
  tone = 'default',
  loading,
  loaderVariant,
}: {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: 'default' | 'signal';
  loading?: boolean;
  loaderVariant?: LoaderVariant;
}) {
  const [dismissed, setDismissed] = React.useState(false);
  const asyncAction = useAsyncAction(750);
  const resolved = useResolvedLoading({
    loading: loading || asyncAction.loading,
    loaderVariant,
  });
  const isBusy = resolved.isLoading;

  if (dismissed) {
    return (
      <button
        type="button"
        onClick={() => setDismissed(false)}
        className="font-mono text-xs text-[var(--nt-muted)] underline underline-offset-4 hover:text-[var(--nt-primary)] cursor-pointer"
      >
        Restore dismissed banner
      </button>
    );
  }
  return (
    <div
      aria-busy={isBusy || undefined}
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-2.5',
        tone === 'signal'
          ? 'border-[#D71921]/40 bg-[#D71921]/10'
          : 'border-[var(--nt-line-2)] bg-[var(--nt-raised)]/60'
      )}
    >
      <span className="inline-flex items-center gap-2 font-mono text-xs text-[var(--nt-primary)]">
        {isBusy && <NothingLoader variant={resolved.variant} size="xs" decorative />}
        <span>{message}</span>
      </span>
      <div className="flex items-center gap-2">
        {actionLabel && (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => asyncAction.trigger(onAction)}
            className="inline-flex items-center gap-1.5 rounded-md bg-[var(--nt-inverse-bg)] px-2.5 py-1 font-mono text-[11px] text-[var(--nt-inverse-fg)] hover:opacity-85 disabled:opacity-70 cursor-pointer whitespace-nowrap"
          >
            {isBusy && <NothingLoader variant={resolved.variant} size="xs" decorative />}
            <span>{isBusy ? 'Working...' : actionLabel}</span>
          </button>
        )}
        <button
          type="button"
          aria-label="Dismiss banner"
          onClick={() => setDismissed(true)}
          className="flex h-6 w-6 items-center justify-center rounded text-[var(--nt-muted)] hover:text-[var(--nt-display)] cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function NothingProgress({
  label,
  value,
  tone = 'default',
  indeterminate,
  loading,
}: {
  label: string;
  value: number;
  tone?: 'default' | 'signal';
  indeterminate?: boolean;
  loading?: boolean;
}) {
  const resolved = useResolvedLoading({ loading: loading || indeterminate });
  const isIndeterminate = Boolean(indeterminate || resolved.isLoading);

  return (
    <Progress value={value} className="space-y-2" aria-busy={isIndeterminate || undefined}>
      <div className="flex items-center justify-between font-mono text-xs">
        <ProgressLabel className="text-[11px] uppercase tracking-[0.12em] text-[var(--nt-secondary)]">
          {label}
        </ProgressLabel>
        {isIndeterminate ? (
          <span className="tabular-nums text-[var(--nt-muted)]">Loading...</span>
        ) : (
          <ProgressValue className="tabular-nums text-[var(--nt-display)]" />
        )}
      </div>
      <ProgressTrack className="relative h-1.5 w-full overflow-hidden rounded-full bg-[var(--nt-line-2)]">
        {isIndeterminate ? (
          <div
            className={cn(
              'nt-indeterminate-bar h-full w-2/5 rounded-full',
              tone === 'signal' ? 'bg-[#D71921]' : 'bg-[var(--nt-display)]'
            )}
          />
        ) : (
          <ProgressIndicator
            className={cn(
              'h-full transition-all duration-300',
              tone === 'signal' ? 'bg-[#D71921]' : 'bg-[var(--nt-display)]'
            )}
          />
        )}
      </ProgressTrack>
    </Progress>
  );
}

export function NothingMeter({
  label,
  value,
  max = 100,
}: {
  label: string;
  value: number;
  max?: number;
}) {
  return (
    <Meter value={value} max={max} className="space-y-2">
      <div className="flex items-center justify-between font-mono text-xs">
        <MeterLabel className="text-[11px] uppercase tracking-[0.12em] text-[var(--nt-secondary)]">
          {label}
        </MeterLabel>
        <MeterValue className="tabular-nums text-[var(--nt-display)]" />
      </div>
      <MeterTrack className="h-2 w-full overflow-hidden rounded-sm bg-[var(--nt-line-2)]">
        <MeterIndicator className="h-full bg-[#D71921] transition-all duration-300" />
      </MeterTrack>
    </Meter>
  );
}

export function SegmentedBar({
  label,
  total = 16,
  filled = 12,
  tone = 'default',
  loading,
}: {
  label?: string;
  total?: number;
  filled?: number;
  tone?: 'default' | 'signal';
  loading?: boolean;
}) {
  const resolved = useResolvedLoading({ loading });
  const isBusy = resolved.isLoading;
  const pct = Math.round((filled / total) * 100);

  return (
    <div className="space-y-2" aria-busy={isBusy || undefined}>
      {label && (
        <div className="flex items-center justify-between font-mono text-xs">
          <span className="text-[11px] uppercase tracking-[0.12em] text-[var(--nt-secondary)]">
            {label}
          </span>
          <span className="tabular-nums text-[var(--nt-display)]">
            {isBusy ? 'Syncing...' : `${pct}%`}
          </span>
        </div>
      )}
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
        {Array.from({ length: total }).map((_, idx) => (
          <span
            key={idx}
            className={cn(
              'h-3.5 rounded-[2px] transition-colors',
              isBusy
                ? 'nt-skeleton'
                : idx < filled
                  ? tone === 'signal'
                    ? 'bg-[#D71921]'
                    : 'bg-[var(--nt-display)]'
                  : 'bg-[var(--nt-line-2)]'
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function NothingStepper({
  steps = ['Init', 'Tokens', 'Primitives', 'Ship'],
  initialStep = 1,
  loading,
  loaderVariant,
}: {
  steps?: string[];
  initialStep?: number;
  loading?: boolean;
  loaderVariant?: LoaderVariant;
}) {
  const [active, setActive] = React.useState(initialStep);
  const [validatingIdx, setValidatingIdx] = React.useState<number | null>(null);
  const asyncAction = useAsyncAction(600);
  const resolved = useResolvedLoading({
    loading: loading || asyncAction.loading,
    loaderVariant,
  });
  const isBusy = resolved.isLoading;

  const handleSelectStep = (idx: number) => {
    if (isBusy || idx === active) return;
    setValidatingIdx(idx);
    asyncAction.trigger(() => {
      setActive(idx);
      setValidatingIdx(null);
    });
  };

  return (
    <div className="space-y-4 w-full" aria-busy={isBusy || undefined}>
      <div className="flex items-center">
        {steps.map((step, idx) => {
          const completed = idx <= active;
          const isStepBusy =
            validatingIdx === idx || (validatingIdx === null && isBusy && idx === active);
          return (
            <React.Fragment key={step}>
              <button
                type="button"
                disabled={isBusy}
                aria-current={idx === active ? 'step' : undefined}
                onClick={() => handleSelectStep(idx)}
                className="flex flex-col items-center gap-1.5 cursor-pointer group disabled:cursor-wait"
              >
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full border font-mono text-xs tabular-nums transition-colors',
                    completed || isStepBusy
                      ? 'border-[var(--nt-inverse-bg)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                      : 'border-[var(--nt-line-2)] bg-transparent text-[var(--nt-muted)] group-hover:border-[var(--nt-primary)]'
                  )}
                >
                  {isStepBusy ? (
                    <NothingLoader variant={resolved.variant} size="xs" decorative />
                  ) : (
                    idx + 1
                  )}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--nt-secondary)]">
                  {step}
                </span>
              </button>
              {idx < steps.length - 1 && (
                <span
                  className={cn(
                    'mx-2 mb-5 h-px flex-1 transition-colors',
                    idx < active ? 'bg-[var(--nt-display)]' : 'bg-[var(--nt-line-2)]'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export function DotLoader({ label = 'LOADING' }: { label?: string }) {
  return (
    <div className="inline-flex flex-col items-center gap-3" role="status" aria-label={label}>
      <div className="grid grid-cols-3 gap-1.5">
        {Array.from({ length: 9 }).map((_, idx) => (
          <span
            key={idx}
            className="nt-dot-loader-cell h-2 w-2 rounded-full bg-[var(--nt-display)]"
            style={{ animationDelay: `${idx * 90}ms` }}
          />
        ))}
      </div>
      <span className="font-mono text-[10px] tracking-[0.18em] text-[var(--nt-muted)]">
        {label}
      </span>
    </div>
  );
}

export function NothingSkeleton() {
  return (
    <div className="flex items-start gap-3.5" aria-busy="true" aria-label="Loading content">
      <div className="nt-skeleton h-10 w-10 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2.5 pt-1">
        <div className="nt-skeleton h-3 w-full rounded" />
        <div className="nt-skeleton h-3 w-3/5 rounded" />
        <div className="nt-skeleton h-3 w-2/5 rounded" />
      </div>
    </div>
  );
}

export function NothingEmptyState({
  title = 'No modules staged',
  description = 'Select a component from the registry or run the CLI command to scaffold it.',
  actionLabel = 'Add Component',
  onAction,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const asyncAction = useAsyncAction(850);

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--nt-line-2)] px-6 py-10 text-center">
      <DotIcon name="folder" size={30} className="text-[var(--nt-muted)]" />
      <h4 className="mt-4 font-display text-xl text-[var(--nt-display)]">{title}</h4>
      <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-[var(--nt-secondary)]">
        {description}
      </p>
      {actionLabel && (
        <NothingButton
          variant="primary"
          size="sm"
          className="mt-5"
          loading={asyncAction.loading}
          loadingText="Initializing..."
          onClick={() => asyncAction.trigger(onAction)}
        >
          {actionLabel}
        </NothingButton>
      )}
    </div>
  );
}

export function NothingBreadcrumb({
  items,
  loading,
}: {
  items: string[];
  loading?: boolean;
}) {
  const resolved = useResolvedLoading({ loading });
  const isBusy = resolved.isLoading;

  return (
    <nav aria-label="Breadcrumb" aria-busy={isBusy || undefined} className="flex flex-wrap items-center gap-2 font-mono text-xs">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={item}>
            {isLast && isBusy ? (
              <span className="nt-skeleton inline-block h-3.5 w-24 rounded" aria-label="Resolving path" />
            ) : (
              <span
                className={
                  isLast ? 'text-[var(--nt-display)]' : 'text-[var(--nt-muted)] hover:text-[var(--nt-primary)]'
                }
              >
                {item}
              </span>
            )}
            {!isLast && (
              <span aria-hidden="true" className="text-[var(--nt-line-2)]">
                /
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export function NothingSeparator({ label }: { label?: string }) {
  if (!label) {
    return <Separator className="h-px w-full bg-[var(--nt-line)]" />;
  }
  return (
    <div className="flex items-center gap-3">
      <Separator className="h-px flex-1 bg-[var(--nt-line)]" />
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--nt-muted)]">
        {label}
      </span>
      <Separator className="h-px flex-1 bg-[var(--nt-line)]" />
    </div>
  );
}

export function NothingKbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded border border-[var(--nt-line-2)] bg-[var(--nt-raised)] px-1.5 font-mono text-[11px] text-[var(--nt-primary)]">
      {children}
    </kbd>
  );
}

export function NothingCodeBlock({ code, title }: { code: string; title?: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--nt-line)] bg-[#0b0b0b] text-[#e5e5e5]">
      <div className="flex items-center justify-between border-b border-[#222222] px-4 py-2">
        <span className="font-mono text-[11px] text-[#8a8a8a]">{title ?? 'tsx'}</span>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(code).catch(() => {});
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          }}
          className="font-mono text-[11px] text-[#b0b0b0] hover:text-white cursor-pointer"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function NothingAvatarGroup({
  initials = ['NK', 'AL', 'MR'],
  overflowCount = 5,
  loading,
}: {
  initials?: string[];
  overflowCount?: number;
  loading?: boolean;
}) {
  const resolved = useResolvedLoading({ loading });
  const isBusy = resolved.isLoading;

  if (isBusy) {
    return (
      <div className="flex items-center" aria-busy="true" aria-label="Loading collaborators">
        <div className="flex -space-x-2">
          {initials.map((item) => (
            <span
              key={item}
              className="nt-skeleton inline-flex h-9 w-9 rounded-full border-2 border-[var(--nt-surface)]"
            />
          ))}
        </div>
        <span className="nt-skeleton ml-3 inline-block h-3 w-28 rounded" />
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {initials.map((item) => (
          <Avatar
            key={item}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--nt-surface)] bg-[var(--nt-raised)] font-mono text-xs text-[var(--nt-display)] ring-1 ring-[var(--nt-line-2)]"
          >
            <AvatarFallback>{item}</AvatarFallback>
          </Avatar>
        ))}
        {overflowCount > 0 && (
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--nt-surface)] bg-[var(--nt-inverse-bg)] font-mono text-[11px] tabular-nums text-[var(--nt-inverse-fg)]">
            +{overflowCount}
          </span>
        )}
      </div>
      <span className="ml-3 font-mono text-xs text-[var(--nt-muted)] tabular-nums">
        {initials.length + overflowCount} collaborators
      </span>
    </div>
  );
}

export function InteractiveChipsDemo() {
  const [chips, setChips] = React.useState(['Glyph SDK', 'Monochrome', 'React 19', 'Doto']);
  const [active, setActive] = React.useState('Glyph SDK');
  const [pendingChip, setPendingChip] = React.useState<string | null>(null);
  const asyncAction = useAsyncAction(450);
  const resolved = useResolvedLoading({ loading: asyncAction.loading });

  const resetChips = () => {
    setChips(['Glyph SDK', 'Monochrome', 'React 19', 'Doto']);
    setActive('Glyph SDK');
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {chips.map((chip) => {
          const isSelected = active === chip;
          const isChipLoading = pendingChip === chip && asyncAction.loading;
          return (
            <div
              key={chip}
              className={cn(
                'inline-flex items-center rounded-full border font-mono text-xs transition-colors',
                isSelected
                  ? 'border-[var(--nt-inverse-bg)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'border-[var(--nt-line-2)] bg-transparent text-[var(--nt-primary)]'
              )}
            >
              <button
                type="button"
                onClick={() => {
                  setPendingChip(chip);
                  asyncAction.trigger(() => {
                    setActive(chip);
                    setPendingChip(null);
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 cursor-pointer"
              >
                {isChipLoading && <NothingLoader variant={resolved.variant} size="xs" decorative />}
                <span>{chip}</span>
              </button>
              <button
                type="button"
                aria-label={`Remove ${chip}`}
                onClick={() => setChips((prev) => prev.filter((c) => c !== chip))}
                className="pr-2.5 opacity-65 hover:opacity-100 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
        {chips.length < 4 && (
          <button
            type="button"
            onClick={resetChips}
            className="font-mono text-[11px] text-[var(--nt-muted)] underline underline-offset-4 hover:text-[var(--nt-display)] cursor-pointer"
          >
            Reset chips
          </button>
        )}
      </div>
    </div>
  );
}
