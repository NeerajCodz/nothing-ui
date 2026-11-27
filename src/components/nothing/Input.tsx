import * as React from 'react';
import { Field, FieldDescription, FieldError, FieldLabel } from '@ui-sdk/react/field';
import { Input, InputClear, InputGroup } from '@ui-sdk/react/input';
import { Textarea } from '@ui-sdk/react/textarea';
import { Button } from '@ui-sdk/react/button';
import { AlertCircle, Check, CheckCircle2, Copy, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ARIA_INVALID_INPUT_CLASSES,
  NothingLoader,
  isAriaInvalidValue,
  useAsyncAction,
  useResolvedLoading,
  validateWithRegex,
  type LoaderVariant,
  type RegexValidationResult,
  type RegexValidationRule,
} from '@nothing-ui/ui';

export interface NothingInputProps extends Omit<React.ComponentProps<typeof Input>, 'className'> {
  label?: string;
  description?: string;
  error?: string;
  clearable?: boolean;
  leadingIcon?: React.ReactNode;
  loading?: boolean;
  loaderVariant?: LoaderVariant;
  loadingIndicator?: React.ReactNode;
  /** Full regex validation rule configuration (pattern, flags, formatLabel, message, normalize, required). */
  validationRule?: RegexValidationRule;
  /** Shorthand RegExp or regex pattern string for customized validation. */
  validationRegex?: RegExp | string;
  /** Optional regex flags used alongside `validationRegex` when passed as a string. */
  validationFlags?: string;
  /** Custom Nothing UI error message shown when `validationRegex` fails. */
  validationMessage?: string;
  /** Optional monospace format hint shown aligned opposite the label (e.g. 'NP3-XXX-X'). */
  formatHint?: string;
  /** Controls when built-in regex validation surfaces errors ('change' | 'blur' | 'always'). */
  validateOn?: 'change' | 'blur' | 'always';
  /** Called whenever built-in regex validation evaluates the current input value. */
  onValidationChange?: (result: RegexValidationResult) => void;
  className?: string;
}

export function NothingInput({
  label,
  description,
  error,
  clearable = false,
  leadingIcon,
  loading,
  loaderVariant,
  loadingIndicator,
  validationRule,
  validationRegex,
  validationFlags,
  validationMessage,
  formatHint,
  validateOn = 'change',
  onValidationChange,
  className,
  value,
  defaultValue,
  onChange,
  onBlur,
  ...props
}: NothingInputProps) {
  const resolved = useResolvedLoading({ loading, loaderVariant });
  const isBusy = resolved.isLoading;
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string>(
    defaultValue !== undefined ? String(defaultValue) : '',
  );
  const [hasInteracted, setHasInteracted] = React.useState(false);

  const activeRule = React.useMemo<RegexValidationRule | null>(() => {
    if (validationRule) {
      return {
        ...validationRule,
        flags: validationFlags ?? validationRule.flags,
        message: validationMessage ?? validationRule.message,
        formatLabel: formatHint ?? validationRule.formatLabel,
      };
    }
    if (validationRegex !== undefined) {
      return {
        pattern: validationRegex,
        flags: validationFlags,
        message: validationMessage,
        formatLabel: formatHint,
      };
    }
    return null;
  }, [formatHint, validationFlags, validationMessage, validationRegex, validationRule]);

  const currentValue = isControlled ? String(value ?? '') : uncontrolledValue;

  const regexResult = React.useMemo<RegexValidationResult | null>(() => {
    if (!activeRule) return null;
    return validateWithRegex(currentValue, activeRule);
  }, [activeRule, currentValue]);

  const shouldShowRegexState =
    Boolean(activeRule) &&
    (validateOn === 'always' ||
      hasInteracted ||
      (validateOn === 'change' && currentValue.trim().length > 0));

  const regexError =
    shouldShowRegexState && regexResult && !regexResult.valid ? regexResult.error : undefined;
  const resolvedError = error ?? regexError;
  const isInvalid = Boolean(resolvedError) || isAriaInvalidValue(props['aria-invalid']);
  const isRegexValid =
    Boolean(activeRule) &&
    !isInvalid &&
    !isBusy &&
    Boolean(regexResult?.valid) &&
    currentValue.trim().length > 0;
  const resolvedFormatHint = formatHint ?? activeRule?.formatLabel;

  const lastEmittedRef = React.useRef<string>('');
  React.useEffect(() => {
    if (!onValidationChange || !regexResult) return;
    const key = `${regexResult.valid}|${regexResult.invalidPattern}|${regexResult.error ?? ''}|${regexResult.testedValue}`;
    if (lastEmittedRef.current === key) return;
    lastEmittedRef.current = key;
    onValidationChange(regexResult);
  }, [onValidationChange, regexResult]);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    if (!isControlled) {
      setUncontrolledValue(event.target.value);
    }
    if (validateOn === 'change') {
      setHasInteracted(true);
    }
    onChange?.(event);
  };

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = (event) => {
    if (activeRule) {
      setHasInteracted(true);
    }
    onBlur?.(event);
  };

  return (
    <Field invalid={isInvalid} className={cn('flex flex-col gap-1.5', className)}>
      {(label || resolvedFormatHint) && (
        <div className="flex items-center justify-between gap-2">
          {label ? (
            <FieldLabel
              className={cn(
                'font-mono text-[11px] uppercase tracking-[0.12em] transition-colors',
                isInvalid ? 'text-[var(--nt-accent)]' : 'text-[var(--nt-secondary)]',
              )}
            >
              {label}
            </FieldLabel>
          ) : (
            <span />
          )}
          {resolvedFormatHint && (
            <span
              className={cn(
                'font-mono text-[10px] tracking-[0.08em]',
                isInvalid
                  ? 'text-[var(--nt-accent)]'
                  : isRegexValid
                    ? 'text-[var(--nt-success)]'
                    : 'text-[var(--nt-muted)]',
              )}
            >
              {resolvedFormatHint}
            </span>
          )}
        </div>
      )}
      <InputGroup className="relative flex items-center" aria-busy={isBusy || undefined}>
        {leadingIcon && (
          <span className="pointer-events-none absolute left-3 text-[var(--nt-muted)]">
            {leadingIcon}
          </span>
        )}
        <Input
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-busy={isBusy || undefined}
          aria-invalid={isInvalid || undefined}
          className={cn(
            'h-10 w-full rounded-md border border-[var(--nt-line-2)] bg-transparent font-mono text-xs text-[var(--nt-primary)] placeholder:text-[var(--nt-muted)] transition-colors focus:border-[var(--nt-display)] focus:outline-none disabled:opacity-40',
            leadingIcon ? 'pl-9' : 'px-3',
            clearable || isBusy || isInvalid || isRegexValid ? 'pr-9' : 'pr-3',
            ARIA_INVALID_INPUT_CLASSES,
            isInvalid && 'border-[var(--nt-accent)] focus:border-[var(--nt-accent)]',
          )}
          {...props}
        />
        {isBusy ? (
          <span className="pointer-events-none absolute right-2.5 flex h-6 w-6 items-center justify-center text-[var(--nt-secondary)]">
            <NothingLoader
              variant={resolved.variant}
              size="xs"
              indicator={loadingIndicator}
              decorative
            />
          </span>
        ) : isInvalid && !clearable ? (
          <span
            aria-hidden="true"
            data-testid="nothing-input-error-icon"
            className="pointer-events-none absolute right-2.5 flex h-6 w-6 items-center justify-center text-[var(--nt-accent)]"
          >
            <AlertCircle className="h-4 w-4" />
          </span>
        ) : isRegexValid && !clearable ? (
          <span
            aria-hidden="true"
            data-testid="nothing-input-valid-icon"
            className="pointer-events-none absolute right-2.5 flex h-6 w-6 items-center justify-center text-[var(--nt-success)]"
          >
            <CheckCircle2 className="h-4 w-4" />
          </span>
        ) : clearable ? (
          <InputClear
            aria-label="Clear input"
            className="absolute right-2.5 flex h-6 w-6 items-center justify-center rounded text-[var(--nt-muted)] hover:text-[var(--nt-display)] cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </InputClear>
        ) : null}
      </InputGroup>
      {resolvedError ? (
        <FieldError className="font-mono text-[11px] text-[var(--nt-accent)]">{resolvedError}</FieldError>
      ) : isBusy ? (
        <FieldDescription className="font-mono text-[11px] text-[var(--nt-muted)]">
          Validating input...
        </FieldDescription>
      ) : description ? (
        <FieldDescription className="text-xs text-[var(--nt-muted)]">{description}</FieldDescription>
      ) : null}
    </Field>
  );
}

export function NothingSearchInput(props: Omit<NothingInputProps, 'leadingIcon'>) {
  return (
    <NothingInput
      leadingIcon={<Search className="h-3.5 w-3.5" />}
      clearable
      {...props}
    />
  );
}

export interface NothingTextareaProps
  extends Omit<React.ComponentProps<typeof Textarea>, 'className'> {
  label?: string;
  description?: string;
  loading?: boolean;
  loaderVariant?: LoaderVariant;
  className?: string;
}

export function NothingTextarea({
  label,
  description,
  loading,
  loaderVariant,
  className,
  ...props
}: NothingTextareaProps) {
  const resolved = useResolvedLoading({ loading, loaderVariant });
  const isBusy = resolved.isLoading;

  return (
    <Field className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <div className="flex items-center justify-between gap-2">
          <FieldLabel className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--nt-secondary)]">
            {label}
          </FieldLabel>
          {isBusy && (
            <NothingLoader
              variant={resolved.variant}
              size="xs"
              label="Saving..."
              tone="muted"
            />
          )}
        </div>
      )}
      <Textarea
        autoResize
        rows={3}
        aria-busy={isBusy || undefined}
        className="w-full rounded-md border border-[var(--nt-line-2)] bg-transparent p-3 font-mono text-xs leading-relaxed text-[var(--nt-primary)] placeholder:text-[var(--nt-muted)] transition-colors focus:border-[var(--nt-display)] focus:outline-none"
        {...props}
      />
      {description && (
        <FieldDescription className="text-xs text-[var(--nt-muted)]">{description}</FieldDescription>
      )}
    </Field>
  );
}

export interface CopyFieldProps {
  value: string;
  caption?: string;
  loading?: boolean;
  asyncCopy?: boolean;
  loaderVariant?: LoaderVariant;
  className?: string;
}

export function CopyField({
  value,
  caption,
  loading,
  asyncCopy = true,
  loaderVariant,
  className,
}: CopyFieldProps) {
  const [copied, setCopied] = React.useState(false);
  const asyncAction = useAsyncAction(450);
  const resolved = useResolvedLoading({
    loading: loading || asyncAction.loading,
    loaderVariant,
  });
  const isBusy = resolved.isLoading;

  const handleCopy = () => {
    if (isBusy) return;
    if (asyncCopy) {
      asyncAction.trigger(() => {
        navigator.clipboard?.writeText(value).catch(() => {});
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      });
    } else {
      navigator.clipboard?.writeText(value).catch(() => {});
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--nt-line-2)] bg-[var(--nt-raised)]/60 px-3.5 py-2">
        <code className="truncate font-mono text-xs text-[var(--nt-primary)]">{value}</code>
        <Button
          onClick={handleCopy}
          disabled={isBusy}
          aria-busy={isBusy || undefined}
          aria-label={isBusy ? 'Preparing clipboard value' : copied ? 'Copied to clipboard' : 'Copy command'}
          className="inline-flex h-7 items-center gap-1.5 rounded-md bg-[var(--nt-inverse-bg)] px-2.5 font-mono text-[11px] text-[var(--nt-inverse-fg)] transition-opacity hover:opacity-85 disabled:opacity-75 cursor-pointer whitespace-nowrap shrink-0"
        >
          {isBusy ? (
            <>
              <NothingLoader variant={resolved.variant} size="xs" decorative />
              <span>Copying...</span>
            </>
          ) : copied ? (
            <>
              <Check className="h-3 w-3" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </Button>
      </div>
      {caption && (
        <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--nt-muted)]">
          {caption}
        </p>
      )}
    </div>
  );
}
