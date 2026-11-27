import * as React from 'react';
import { Switch, SwitchThumb } from '@ui-sdk/react/switch';
import { Checkbox, CheckboxIndicator } from '@ui-sdk/react/checkbox';
import { Radio, RadioGroup, RadioIndicator } from '@ui-sdk/react/radio';
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from '@ui-sdk/react/slider';
import { Rating, RatingItem } from '@ui-sdk/react/rating';
import {
  NumberInput,
  NumberInputControl,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
} from '@ui-sdk/react/number-input';
import {
  OTPInput,
  OTPInputGroup,
  OTPInputSeparator,
  OTPInputSlot,
} from '@ui-sdk/react/otp-input';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@ui-sdk/react/segmented-control';
import { Toggle, ToggleGroup } from '@ui-sdk/react/toggle';
import { Bold, Check, Italic, Minus, Plus, Underline } from 'lucide-react';
import { cn } from '@/lib/utils';
import { applyDragDelta, clampRotaryValue, valueToKnobAngle } from '@/lib/rotary';
import {
  NothingLoader,
  useAsyncAction,
  useResolvedLoading,
  type LoaderVariant,
} from '@nothing-ui/ui';

export interface NothingSwitchProps extends Omit<React.ComponentProps<typeof Switch>, 'className'> {
  label?: string;
  description?: string;
  tone?: 'default' | 'signal';
  loading?: boolean;
  asyncToggle?: boolean;
  loaderVariant?: LoaderVariant;
  className?: string;
}

export function NothingSwitch({
  label,
  description,
  tone = 'default',
  loading,
  asyncToggle = false,
  loaderVariant,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  className,
  ...props
}: NothingSwitchProps) {
  const [internalChecked, setInternalChecked] = React.useState(Boolean(defaultChecked));
  const asyncAction = useAsyncAction(650);
  const resolved = useResolvedLoading({
    loading: loading || asyncAction.loading,
    loaderVariant,
  });
  const isBusy = resolved.isLoading;
  const isControlled = checked !== undefined;
  const currentChecked = isControlled ? checked : internalChecked;

  const handleCheckedChange: NonNullable<React.ComponentProps<typeof Switch>['onCheckedChange']> = (
    next,
    details,
  ) => {
    if (isBusy) return;
    if (asyncToggle) {
      asyncAction.trigger(() => {
        if (!isControlled) setInternalChecked(next);
        onCheckedChange?.(next, details);
      });
      return;
    }
    if (!isControlled) setInternalChecked(next);
    onCheckedChange?.(next, details);
  };

  return (
    <label
      aria-busy={isBusy || undefined}
      className={cn(
        'flex items-center justify-between gap-4 select-none',
        isBusy ? 'cursor-wait' : 'cursor-pointer',
        className
      )}
    >
      {(label || description) && (
        <span className="flex flex-col">
          {label && (
            <span className="inline-flex items-center gap-2 font-mono text-xs text-[var(--nt-primary)]">
              <span>{label}</span>
              {isBusy && (
                <NothingLoader variant={resolved.variant} size="xs" tone="muted" decorative />
              )}
            </span>
          )}
          {description && (
            <span className="text-xs text-[var(--nt-muted)]">
              {isBusy ? 'Saving setting...' : description}
            </span>
          )}
        </span>
      )}
      <Switch
        aria-label={label ?? 'Toggle switch'}
        aria-busy={isBusy || undefined}
        data-loading={isBusy ? 'true' : undefined}
        checked={currentChecked}
        onCheckedChange={handleCheckedChange}
        disabled={disabled || isBusy}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-[var(--nt-line-2)] bg-[var(--nt-raised)] p-0.5 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D71921] disabled:opacity-60',
          isBusy ? 'cursor-wait' : 'cursor-pointer',
          tone === 'signal'
            ? 'data-checked:border-[#D71921] data-checked:bg-[#D71921]'
            : 'data-checked:border-[var(--nt-inverse-bg)] data-checked:bg-[var(--nt-inverse-bg)]'
        )}
        {...props}
      >
        <SwitchThumb
          className={cn(
            'block h-4.5 w-4.5 rounded-full bg-[var(--nt-secondary)] transition-transform duration-150 data-checked:translate-x-5',
            tone === 'signal'
              ? 'data-checked:bg-white'
              : 'data-checked:bg-[var(--nt-inverse-fg)]'
          )}
        />
      </Switch>
    </label>
  );
}

export interface NothingCheckboxProps
  extends Omit<React.ComponentProps<typeof Checkbox>, 'className'> {
  label: string;
  loading?: boolean;
  loaderVariant?: LoaderVariant;
  className?: string;
}

export function NothingCheckbox({
  label,
  loading,
  loaderVariant,
  disabled,
  className,
  ...props
}: NothingCheckboxProps) {
  const resolved = useResolvedLoading({ loading, loaderVariant });
  const isBusy = resolved.isLoading;

  return (
    <label
      aria-busy={isBusy || undefined}
      className={cn(
        'inline-flex items-center gap-2.5 select-none',
        isBusy ? 'cursor-wait opacity-80' : 'cursor-pointer',
        className
      )}
    >
      <Checkbox
        aria-label={label}
        aria-busy={isBusy || undefined}
        data-loading={isBusy ? 'true' : undefined}
        disabled={disabled || isBusy}
        className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-[4px] border border-[var(--nt-line-2)] bg-transparent text-[var(--nt-inverse-fg)] transition-colors data-checked:border-[var(--nt-inverse-bg)] data-checked:bg-[var(--nt-inverse-bg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D71921] cursor-pointer disabled:pointer-events-none"
        {...props}
      >
        <CheckboxIndicator>
          <Check className="h-3 w-3 stroke-[3]" />
        </CheckboxIndicator>
      </Checkbox>
      <span className="font-mono text-xs text-[var(--nt-primary)]">{label}</span>
      {isBusy && <NothingLoader variant={resolved.variant} size="xs" tone="muted" decorative />}
    </label>
  );
}

export interface NothingRadioOption {
  value: string;
  label: string;
}

export function NothingRadioGroup({
  options,
  defaultValue,
  ariaLabel = 'Options',
  loading,
  loaderVariant,
}: {
  options: NothingRadioOption[];
  defaultValue?: string;
  ariaLabel?: string;
  loading?: boolean;
  loaderVariant?: LoaderVariant;
}) {
  const resolved = useResolvedLoading({ loading, loaderVariant });
  const isBusy = resolved.isLoading;

  return (
    <div className="space-y-2" aria-busy={isBusy || undefined}>
      <RadioGroup
        aria-label={ariaLabel}
        defaultValue={defaultValue ?? options[0]?.value}
        disabled={isBusy}
        className={cn('flex flex-col gap-2.5', isBusy && 'opacity-75')}
      >
        {options.map((opt) => (
          <label
            key={opt.value}
            className="inline-flex items-center gap-2.5 cursor-pointer select-none"
          >
            <Radio
              value={opt.value}
              className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border border-[var(--nt-line-2)] transition-colors data-checked:border-[var(--nt-display)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D71921] cursor-pointer"
            >
              <RadioIndicator className="h-2 w-2 rounded-full bg-[var(--nt-display)]" />
            </Radio>
            <span className="font-mono text-xs text-[var(--nt-primary)]">{opt.label}</span>
          </label>
        ))}
      </RadioGroup>
      {isBusy && (
        <NothingLoader variant={resolved.variant} size="xs" label="Updating profile..." tone="muted" />
      )}
    </div>
  );
}

export interface NothingSliderProps {
  label: string;
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  tone?: 'default' | 'signal';
  loading?: boolean;
  loaderVariant?: LoaderVariant;
  onValueChange?: (value: number) => void;
}

export function NothingSlider({
  label,
  value,
  defaultValue = 50,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  tone = 'default',
  loading,
  loaderVariant,
  onValueChange,
}: NothingSliderProps) {
  const resolved = useResolvedLoading({ loading, loaderVariant });
  const isBusy = resolved.isLoading;

  return (
    <Slider
      {...(value !== undefined ? { value } : { defaultValue })}
      min={min}
      max={max}
      step={step}
      disabled={isBusy}
      onValueChange={onValueChange}
      aria-busy={isBusy || undefined}
      className={cn('flex w-full flex-col gap-2', isBusy && 'opacity-75')}
    >
      <div className="flex items-center justify-between font-mono text-xs">
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-[var(--nt-secondary)]">
          <span>{label}</span>
          {isBusy && <NothingLoader variant={resolved.variant} size="xs" tone="muted" decorative />}
        </span>
        <span className="tabular-nums text-[var(--nt-display)]">
          <SliderValue />
          {unit}
        </span>
      </div>
      <SliderControl className="relative flex h-6 w-full touch-none items-center cursor-pointer">
        <SliderTrack className="relative h-1.5 w-full rounded-full bg-[var(--nt-line-2)]">
          <SliderIndicator
            className={cn(
              'h-full rounded-full',
              tone === 'signal' ? 'bg-[#D71921]' : 'bg-[var(--nt-display)]'
            )}
          />
          <SliderThumb
            aria-label={label}
            className={cn(
              'h-4 w-4 rounded-full border-2 bg-[var(--nt-bg)] shadow-sm transition-shadow hover:ring-4 hover:ring-[var(--nt-line-2)]/60 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#D71921]',
              tone === 'signal' ? 'border-[#D71921]' : 'border-[var(--nt-display)]'
            )}
          />
        </SliderTrack>
      </SliderControl>
    </Slider>
  );
}

export function NothingRating({
  defaultValue = 4,
  max = 5,
  loading,
  loaderVariant,
}: {
  defaultValue?: number;
  max?: number;
  loading?: boolean;
  loaderVariant?: LoaderVariant;
}) {
  const [score, setScore] = React.useState(defaultValue);
  const asyncAction = useAsyncAction(550);
  const resolved = useResolvedLoading({
    loading: loading || asyncAction.loading,
    loaderVariant,
  });
  const isBusy = resolved.isLoading;

  return (
    <div className="inline-flex items-center gap-3" aria-busy={isBusy || undefined}>
      <Rating
        aria-label="Dot rating"
        value={score}
        disabled={isBusy}
        onValueChange={(v) => {
          const next = v ?? 0;
          setScore(next);
          asyncAction.trigger();
        }}
        max={max}
        className={cn('inline-flex items-center gap-2', isBusy && 'opacity-70')}
      >
        <RatingItem className="h-5 w-5 rounded-full border border-[var(--nt-line-2)] bg-transparent transition-all duration-150 cursor-pointer data-filled:border-[#D71921] data-filled:bg-[#D71921] data-highlighted:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D71921]" />
      </Rating>
      {isBusy ? (
        <NothingLoader variant={resolved.variant} size="xs" label="Saving..." tone="muted" />
      ) : (
        <span className="font-mono text-xs tabular-nums text-[var(--nt-secondary)]">
          {score}/{max}
        </span>
      )}
    </div>
  );
}

export function NothingNumberInput({
  label,
  defaultValue = 3,
  min = 0,
  max = 99,
  loading,
  loaderVariant,
}: {
  label?: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  loading?: boolean;
  loaderVariant?: LoaderVariant;
}) {
  const resolved = useResolvedLoading({ loading, loaderVariant });
  const isBusy = resolved.isLoading;

  return (
    <NumberInput
      defaultValue={defaultValue}
      min={min}
      max={max}
      disabled={isBusy}
      aria-busy={isBusy || undefined}
      className="inline-flex flex-col gap-1.5"
    >
      {label && (
        <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--nt-secondary)]">
          <span>{label}</span>
          {isBusy && <NothingLoader variant={resolved.variant} size="xs" tone="muted" decorative />}
        </span>
      )}
      <NumberInputGroup
        className={cn(
          'inline-flex items-center overflow-hidden rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-surface)]',
          isBusy && 'opacity-70'
        )}
      >
        <NumberInputDecrement
          aria-label="Decrease value"
          className="flex h-9 w-9 items-center justify-center text-[var(--nt-primary)] transition-colors hover:bg-[var(--nt-raised)] disabled:opacity-35 cursor-pointer"
        >
          <Minus className="h-3.5 w-3.5" />
        </NumberInputDecrement>
        <NumberInputControl
          aria-label={label ?? 'Numeric value'}
          className="w-12 bg-transparent text-center font-mono text-xs tabular-nums text-[var(--nt-display)] focus:outline-none"
        />
        <NumberInputIncrement
          aria-label="Increase value"
          className="flex h-9 w-9 items-center justify-center text-[var(--nt-primary)] transition-colors hover:bg-[var(--nt-raised)] disabled:opacity-35 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
        </NumberInputIncrement>
      </NumberInputGroup>
    </NumberInput>
  );
}

export function NothingOTPInput({
  length = 6,
  defaultValue = '2048',
  loading,
  loaderVariant,
}: {
  length?: number;
  defaultValue?: string;
  loading?: boolean;
  loaderVariant?: LoaderVariant;
}) {
  const [code, setCode] = React.useState(defaultValue);
  const [verified, setVerified] = React.useState(false);
  const asyncAction = useAsyncAction(900);
  const resolved = useResolvedLoading({
    loading: loading || asyncAction.loading,
    loaderVariant,
  });
  const isBusy = resolved.isLoading;
  const firstHalf = Math.min(3, length);
  const secondHalf = Math.max(0, length - 3);

  const handleChange = (next: string) => {
    setCode(next);
    setVerified(false);
    if (next.length === length) {
      asyncAction.trigger(() => setVerified(true));
    }
  };

  return (
    <div className="space-y-3" aria-busy={isBusy || undefined}>
      <OTPInput
        maxLength={length}
        value={code}
        disabled={isBusy}
        onValueChange={handleChange}
        aria-label="Verification code"
        className={cn('flex items-center gap-2', isBusy && 'opacity-70')}
      >
        <OTPInputGroup className="flex items-center gap-2">
          {Array.from({ length: firstHalf }).map((_, i) => (
            <OTPInputSlot
              key={i}
              index={i}
              className="flex h-12 w-10 items-center justify-center rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-surface)] font-display text-2xl text-[var(--nt-display)] transition-colors data-active:border-[var(--nt-display)] data-active:ring-1 data-active:ring-[var(--nt-display)]"
            />
          ))}
        </OTPInputGroup>
        {secondHalf > 0 && (
          <>
            <OTPInputSeparator className="font-mono text-sm text-[var(--nt-muted)]">·</OTPInputSeparator>
            <OTPInputGroup className="flex items-center gap-2">
              {Array.from({ length: secondHalf }).map((_, i) => (
                <OTPInputSlot
                  key={i + firstHalf}
                  index={i + firstHalf}
                  className="flex h-12 w-10 items-center justify-center rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-surface)] font-display text-2xl text-[var(--nt-display)] transition-colors data-active:border-[var(--nt-display)] data-active:ring-1 data-active:ring-[var(--nt-display)]"
                />
              ))}
            </OTPInputGroup>
          </>
        )}
      </OTPInput>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {isBusy ? (
          <NothingLoader
            variant={resolved.variant}
            size="xs"
            label="Verifying 6-digit code..."
            tone="display"
          />
        ) : (
          <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--nt-muted)] tabular-nums">
            {verified || code.length === length
              ? `Code verified · ${code}`
              : `Enter ${length}-digit code (${code.length}/${length})`}
          </p>
        )}
        <button
          type="button"
          disabled={isBusy}
          onClick={() => {
            const sample = '204891'.slice(0, length);
            setCode(sample);
            setVerified(false);
            asyncAction.trigger(() => setVerified(true));
          }}
          className="rounded-md border border-[var(--nt-line-2)] px-2.5 py-1 font-mono text-[10px] text-[var(--nt-secondary)] hover:text-[var(--nt-display)] disabled:opacity-45 cursor-pointer"
        >
          Fill & Verify
        </button>
      </div>
    </div>
  );
}

export function NothingSegmentedControl<T extends string>({
  options,
  value,
  defaultValue,
  onValueChange,
  ariaLabel = 'Segmented control',
  loading,
  loaderVariant,
}: {
  options: { value: T; label: string }[];
  value?: T;
  defaultValue?: T;
  onValueChange?: (val: T) => void;
  ariaLabel?: string;
  loading?: boolean;
  loaderVariant?: LoaderVariant;
}) {
  const resolved = useResolvedLoading({ loading, loaderVariant });
  const isBusy = resolved.isLoading;

  return (
    <div className="inline-flex items-center gap-2.5" aria-busy={isBusy || undefined}>
      <SegmentedControl
        aria-label={ariaLabel}
        value={value}
        disabled={isBusy}
        defaultValue={value === undefined ? defaultValue ?? options[0]?.value : undefined}
        onValueChange={(v) => {
          if (v !== null) onValueChange?.(v);
        }}
        className={cn(
          'inline-flex items-center gap-1 rounded-lg border border-[var(--nt-line-2)] bg-[var(--nt-raised)] p-1',
          isBusy && 'opacity-75'
        )}
      >
        {options.map((opt) => (
          <SegmentedControlItem
            key={opt.value}
            value={opt.value}
            className="rounded-md px-3 py-1.5 font-mono text-xs text-[var(--nt-secondary)] transition-colors cursor-pointer whitespace-nowrap shrink-0 hover:text-[var(--nt-primary)] data-checked:bg-[var(--nt-inverse-bg)] data-checked:text-[var(--nt-inverse-fg)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#D71921]"
          >
            {opt.label}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
      {isBusy && <NothingLoader variant={resolved.variant} size="xs" tone="muted" decorative />}
    </div>
  );
}

export function NothingToggleGroup() {
  return (
    <ToggleGroup
      multiple
      defaultValue={['bold']}
      aria-label="Text formatting"
      className="inline-flex items-center overflow-hidden rounded-md border border-[var(--nt-line-2)] divide-x divide-[var(--nt-line-2)]"
    >
      <Toggle
        value="bold"
        aria-label="Bold"
        className="flex h-9 w-9 items-center justify-center text-[var(--nt-secondary)] transition-colors hover:text-[var(--nt-display)] data-pressed:bg-[var(--nt-inverse-bg)] data-pressed:text-[var(--nt-inverse-fg)] cursor-pointer"
      >
        <Bold className="h-3.5 w-3.5" />
      </Toggle>
      <Toggle
        value="italic"
        aria-label="Italic"
        className="flex h-9 w-9 items-center justify-center text-[var(--nt-secondary)] transition-colors hover:text-[var(--nt-display)] data-pressed:bg-[var(--nt-inverse-bg)] data-pressed:text-[var(--nt-inverse-fg)] cursor-pointer"
      >
        <Italic className="h-3.5 w-3.5" />
      </Toggle>
      <Toggle
        value="underline"
        aria-label="Underline"
        className="flex h-9 w-9 items-center justify-center text-[var(--nt-secondary)] transition-colors hover:text-[var(--nt-display)] data-pressed:bg-[var(--nt-inverse-bg)] data-pressed:text-[var(--nt-inverse-fg)] cursor-pointer"
      >
        <Underline className="h-3.5 w-3.5" />
      </Toggle>
    </ToggleGroup>
  );
}

export function RotaryKnob({
  label = 'GAIN',
  defaultValue = 50,
  min = 0,
  max = 100,
  step = 1,
  loading,
  loaderVariant,
}: {
  label?: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  loading?: boolean;
  loaderVariant?: LoaderVariant;
}) {
  const [value, setValue] = React.useState(defaultValue);
  const dragOrigin = React.useRef<{ y: number; startVal: number } | null>(null);
  const resolved = useResolvedLoading({ loading, loaderVariant });
  const isBusy = resolved.isLoading;

  const angle = valueToKnobAngle(value, min, max);
  const tickCount = 15;

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (isBusy) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragOrigin.current = { y: e.clientY, startVal: value };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragOrigin.current || isBusy) return;
    const deltaY = e.clientY - dragOrigin.current.y;
    setValue(applyDragDelta(dragOrigin.current.startVal, deltaY, min, max, step));
  };

  const handlePointerUp = () => {
    dragOrigin.current = null;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (isBusy) return;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault();
      setValue((v) => clampRotaryValue(v + 5, min, max, step));
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault();
      setValue((v) => clampRotaryValue(v - 5, min, max, step));
    }
  };

  return (
    <div className="inline-flex flex-col items-center gap-3 select-none" aria-busy={isBusy || undefined}>
      <div className="relative flex h-28 w-28 items-center justify-center">
        {/* Radial tick dots */}
        {Array.from({ length: tickCount }).map((_, i) => {
          const ratio = i / (tickCount - 1);
          const tickAngle = -135 + ratio * 270;
          const active = (value - min) / (max - min) >= ratio - 0.01;
          return (
            <span
              key={i}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ transform: `rotate(${tickAngle}deg)` }}
            >
              <span
                className={cn(
                  'mx-auto block h-1.5 w-1.5 rounded-full transition-colors',
                  active ? 'bg-[#D71921]' : 'bg-[var(--nt-line-2)]'
                )}
              />
            </span>
          );
        })}

        <button
          type="button"
          role="slider"
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-busy={isBusy || undefined}
          disabled={isBusy}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={handleKeyDown}
          className="relative flex h-20 w-20 items-center justify-center rounded-full border border-[var(--nt-line-2)] bg-[var(--nt-surface)] shadow-inner cursor-ns-resize focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D71921] disabled:cursor-wait"
        >
          {isBusy ? (
            <NothingLoader variant={resolved.variant} size="md" tone="display" decorative />
          ) : (
            <span className="font-display text-2xl tabular-nums text-[var(--nt-display)]">
              {value}
            </span>
          )}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-1.5 rounded-full"
            style={{ transform: `rotate(${angle}deg)` }}
          >
            <span className="mx-auto block h-2 w-2 rounded-full bg-[#D71921]" />
          </span>
        </button>
      </div>
      <div className="text-center">
        <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--nt-secondary)]">
          {label}
        </div>
        <div className="font-mono text-[9px] text-[var(--nt-muted)]">
          {isBusy ? 'Syncing hardware...' : 'Drag or arrow keys'}
        </div>
      </div>
    </div>
  );
}
