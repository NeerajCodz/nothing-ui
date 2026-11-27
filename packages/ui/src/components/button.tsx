import * as React from 'react';
import { Button as UiButton } from '@ui-sdk/react/button';
import { cn } from '../lib/cn';
import { NothingLoader, type NothingLoadingProps } from './loader';
import { useResolvedLoading } from '../hooks/loading-provider';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'signal' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface NothingButtonProps
  extends Omit<React.ComponentPropsWithoutRef<typeof UiButton>, 'children'>,
    NothingLoadingProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: 'rounded' | 'pill' | 'square';
  /** Opt out of LoadingConfigProvider.previewLoading when used inside docs chrome. */
  ignorePreviewLoading?: boolean;
  children?: React.ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)] border border-transparent hover:opacity-90 active:scale-[0.98]',
  secondary:
    'bg-[var(--nt-raised)] text-[var(--nt-display)] border border-[var(--nt-line)] hover:border-[var(--nt-line-2)] hover:bg-[var(--nt-surface)] active:scale-[0.98]',
  outline:
    'bg-transparent text-[var(--nt-display)] border border-[var(--nt-line-2)] hover:bg-[var(--nt-raised)] hover:border-[var(--nt-display)] active:scale-[0.98]',
  ghost:
    'bg-transparent text-[var(--nt-secondary)] border border-transparent hover:bg-[var(--nt-raised)] hover:text-[var(--nt-display)]',
  signal:
    'bg-[var(--nt-accent)] text-[var(--nt-accent-fg,white)] border border-transparent hover:bg-[var(--nt-accent-hover)] active:scale-[0.98]',
  link:
    'bg-transparent text-[var(--nt-display)] underline underline-offset-4 hover:text-[var(--nt-accent)] px-0 h-auto',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-xs gap-2',
  lg: 'h-11 px-6 text-sm gap-2.5',
  icon: 'h-10 w-10 p-0',
};

const SHAPE_CLASSES: Record<'rounded' | 'pill' | 'square', string> = {
  rounded: 'rounded-lg',
  pill: 'rounded-full',
  square: 'rounded-none',
};

export const NothingButton = React.forwardRef<HTMLButtonElement, NothingButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      shape = 'rounded',
      loading,
      loadingText,
      loaderVariant,
      loadingPosition = 'start',
      loadingIndicator,
      ignorePreviewLoading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const resolved = useResolvedLoading({
      loading: ignorePreviewLoading ? Boolean(loading) : loading,
      loaderVariant,
    });
    const isBusy = ignorePreviewLoading ? Boolean(loading) : resolved.isLoading;
    const isIconOnly = size === 'icon';

    const loaderEl = (
      <NothingLoader
        variant={resolved.variant}
        size={size === 'sm' ? 'xs' : 'sm'}
        indicator={loadingIndicator}
        decorative
      />
    );

    const content = isBusy ? (
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
    );

    return (
      <UiButton
        ref={ref}
        disabled={disabled || isBusy}
        aria-busy={isBusy || undefined}
        data-loading={isBusy ? 'true' : undefined}
        className={cn(
          'inline-flex items-center justify-center font-mono font-medium tracking-[0.04em] whitespace-nowrap shrink-0 transition-all duration-150 cursor-pointer select-none',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nt-focus-ring)]',
          'disabled:pointer-events-none',
          disabled && !isBusy && 'disabled:opacity-45',
          isBusy && 'opacity-80 cursor-wait',
          VARIANT_CLASSES[variant],
          variant !== 'link' && SIZE_CLASSES[size],
          variant !== 'link' && SHAPE_CLASSES[shape],
          className
        )}
        {...props}
      >
        {content}
      </UiButton>
    );
  }
);

NothingButton.displayName = 'NothingButton';
export const Button = NothingButton;
