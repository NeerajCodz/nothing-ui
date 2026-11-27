import * as React from 'react';
import { Button } from '@ui-sdk/react/button';
import { cn } from '@/lib/utils';
import {
  NothingLoader,
  useResolvedLoading,
  type LoaderVariant,
  type LoadingPosition,
} from '@nothing-ui/ui';

export interface NothingButtonProps extends Omit<React.ComponentProps<typeof Button>, 'children'> {
  variant?: 'primary' | 'outline' | 'ghost' | 'signal';
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'square';
  loading?: boolean;
  loadingText?: string;
  loaderVariant?: LoaderVariant;
  loadingPosition?: LoadingPosition;
  loadingIndicator?: React.ReactNode;
  children?: React.ReactNode;
}

export function NothingButton({
  variant = 'primary',
  size = 'md',
  loading,
  loadingText,
  loaderVariant,
  loadingPosition = 'start',
  loadingIndicator,
  disabled,
  className,
  children,
  ...props
}: NothingButtonProps) {
  const resolved = useResolvedLoading({ loading, loaderVariant });
  const isBusy = resolved.isLoading;
  const isIconOnly = size === 'icon' || size === 'square';

  const loaderEl = (
    <NothingLoader
      variant={resolved.variant}
      size={size === 'sm' ? 'xs' : 'sm'}
      indicator={loadingIndicator}
      decorative
    />
  );

  return (
    <Button
      disabled={disabled || isBusy}
      aria-busy={isBusy || undefined}
      data-loading={isBusy ? 'true' : undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-mono text-xs tracking-wide transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D71921] disabled:pointer-events-none active:scale-[0.98]',
        disabled && !isBusy && 'disabled:opacity-35',
        isBusy && 'opacity-80 cursor-wait',
        variant === 'primary' &&
          'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)] hover:opacity-85',
        variant === 'outline' &&
          'border border-[var(--nt-line-2)] bg-transparent text-[var(--nt-primary)] hover:border-[var(--nt-display)]',
        variant === 'ghost' &&
          'bg-transparent text-[var(--nt-primary)] hover:bg-[var(--nt-raised)]',
        variant === 'signal' && 'bg-[#D71921] text-white hover:bg-[#b8141b]',
        size === 'sm' && 'h-8 px-3 rounded-md text-[11px]',
        size === 'md' && 'h-9 px-4 rounded-md',
        size === 'lg' && 'h-11 px-6 rounded-lg text-sm',
        size === 'icon' && 'h-9 w-9 rounded-full p-0',
        size === 'square' && 'h-9 w-9 rounded-md p-0',
        className
      )}
      {...props}
    >
      {isBusy ? (
        isIconOnly || loadingPosition === 'replace' ? (
          <span className="relative inline-flex items-center justify-center">
            <span className="invisible inline-flex items-center gap-2" aria-hidden="true">
              {children}
            </span>
            <span className="absolute inset-0 inline-flex items-center justify-center">
              {loaderEl}
            </span>
          </span>
        ) : loadingPosition === 'end' ? (
          <>
            <span>{loadingText ?? children}</span>
            {loaderEl}
          </>
        ) : (
          <>
            {loaderEl}
            <span>{loadingText ?? children}</span>
          </>
        )
      ) : (
        children
      )}
    </Button>
  );
}
