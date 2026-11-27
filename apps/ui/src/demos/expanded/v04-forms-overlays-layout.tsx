import * as React from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CaretDown,
  CaretLeft,
  CaretRight,
  Check,
  GridFour,
  MapPin,
  Plus,
  Stack,
  WarningCircle,
  X,
} from '@phosphor-icons/react';
import {
  ARIA_INVALID_INPUT_CLASSES,
  Button,
  REGEX_VALIDATION_PRESETS,
  appToaster,
  cn,
  compileValidationRegex,
  formatSubmitShortcutLabel,
  isFormSubmitShortcut,
  useAsyncAction,
  validateWithRegex,
  type RegexNormalizationMode,
  type RegexValidationResult,
  type RegexValidationRule,
} from '@nothing-ui/ui';

export interface UseValidationOptions {
  /** Starting input value (default: ''). */
  initialValue?: string;
  /** Optional regex flags used when `pattern` is a string (e.g. 'i'). */
  flags?: string;
  /** Whether an empty value is invalid (default: true). */
  required?: boolean;
  /** Custom message when required and empty. */
  requiredMessage?: string;
  /** Human-readable format hint (e.g. 'NP3-XXX-X'). */
  formatLabel?: string;
  /** Example value shown in placeholders or fallback error copy. */
  example?: string;
  /** Whether to trim whitespace before matching (default: true). */
  trim?: boolean;
  /** Optional case normalization before matching (default: 'none'). */
  normalize?: RegexNormalizationMode;
  /** Validate immediately on every change event instead of only after first error/submit (default: false). */
  validateOnChange?: boolean;
  /** Validate automatically when the input loses focus (default: false). */
  validateOnBlur?: boolean;
}

export interface UseValidationConfig extends UseValidationOptions {
  /** Regular expression instance or raw pattern string. */
  pattern: RegExp | string;
  /** Custom error message shown when the value fails to match the pattern. */
  errorMessage?: string;
}

export interface UseValidationInputPropsOptions {
  id?: string;
  errorId?: string;
  describedBy?: string;
}

export interface UseValidationReturn {
  value: string;
  setValue: (nextValue: string) => void;
  error: string | undefined;
  patternError: string | undefined;
  invalid: boolean;
  isValid: boolean;
  touched: boolean;
  pattern: string;
  setPattern: React.Dispatch<React.SetStateAction<string>>;
  flags: string;
  setFlags: React.Dispatch<React.SetStateAction<string>>;
  errorMessage: string;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  rule: RegexValidationRule;
  validate: (overrideValue?: string) => RegexValidationResult;
  clearError: () => void;
  reset: (nextValue?: string) => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur: () => void;
  getInputProps: (options?: UseValidationInputPropsOptions) => {
    id?: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onBlur: () => void;
    'aria-invalid': boolean;
    'aria-describedby'?: string;
  };
}

/**
 * Reusable plug-and-play regex validation hook for any form input.
 * Accepts either `(pattern, errorMessage?, options?)` or a single config object,
 * supports dynamic runtime updates to pattern/flags/message, and exposes
 * `getInputProps()` for instant ARIA-accessible input binding.
 */
export function useValidation(
  pattern: RegExp | string,
  errorMessage?: string,
  options?: UseValidationOptions,
): UseValidationReturn;
export function useValidation(config: UseValidationConfig): UseValidationReturn;
export function useValidation(
  patternOrConfig: RegExp | string | UseValidationConfig,
  errorMessageArg?: string,
  optionsArg?: UseValidationOptions,
): UseValidationReturn {
  const isConfigObject =
    typeof patternOrConfig === 'object' && !(patternOrConfig instanceof RegExp);

  const rawPattern = isConfigObject ? patternOrConfig.pattern : patternOrConfig;
  const incomingSource = rawPattern instanceof RegExp ? rawPattern.source : rawPattern;
  const incomingFlags = isConfigObject
    ? (patternOrConfig.flags ?? (rawPattern instanceof RegExp ? rawPattern.flags : ''))
    : (optionsArg?.flags ?? (rawPattern instanceof RegExp ? rawPattern.flags : ''));
  const incomingMessage = isConfigObject
    ? (patternOrConfig.errorMessage ?? '')
    : (errorMessageArg ?? '');

  const options: UseValidationOptions = isConfigObject ? patternOrConfig : (optionsArg ?? {});
  const {
    initialValue = '',
    required = true,
    requiredMessage,
    formatLabel,
    example,
    trim = true,
    normalize = 'none',
    validateOnChange = false,
    validateOnBlur = false,
  } = options;

  const [value, setValueState] = React.useState<string>(initialValue);
  const [pattern, setPattern] = React.useState<string>(incomingSource);
  const [flags, setFlags] = React.useState<string>(incomingFlags);
  const [errorMessage, setErrorMessage] = React.useState<string>(incomingMessage);
  const [fieldError, setFieldError] = React.useState<string | undefined>(undefined);
  const [touched, setTouched] = React.useState<boolean>(false);

  // Sync dynamic pattern/flags/message when caller updates arguments across renders
  React.useEffect(() => {
    setPattern(incomingSource);
  }, [incomingSource]);

  React.useEffect(() => {
    setFlags(incomingFlags);
  }, [incomingFlags]);

  React.useEffect(() => {
    setErrorMessage(incomingMessage);
  }, [incomingMessage]);

  const rule = React.useMemo<RegexValidationRule>(
    () => ({
      pattern,
      flags,
      message: errorMessage || undefined,
      required,
      requiredMessage: pattern === incomingSource ? requiredMessage : undefined,
      formatLabel: pattern === incomingSource && flags === incomingFlags ? formatLabel : undefined,
      example: pattern === incomingSource ? example : undefined,
      trim,
      normalize,
    }),
    [
      errorMessage,
      example,
      flags,
      formatLabel,
      incomingFlags,
      incomingSource,
      normalize,
      pattern,
      required,
      requiredMessage,
      trim,
    ],
  );

  const compiled = React.useMemo(() => compileValidationRegex(pattern, flags), [flags, pattern]);
  const liveResult = React.useMemo(() => validateWithRegex(value, rule), [rule, value]);

  // Keep any active field error synchronized when value or custom regex rule changes
  React.useEffect(() => {
    setFieldError((prev) => {
      if (!prev) return prev;
      return liveResult.valid ? undefined : liveResult.error;
    });
  }, [liveResult]);

  const validate = React.useCallback(
    (overrideValue?: string): RegexValidationResult => {
      const target = overrideValue !== undefined ? overrideValue : value;
      const result = validateWithRegex(target, rule);
      setTouched(true);
      setFieldError(result.valid ? undefined : result.error);
      return result;
    },
    [rule, value],
  );

  const setValue = React.useCallback(
    (nextValue: string) => {
      setValueState(nextValue);
      if (validateOnChange || fieldError !== undefined) {
        const result = validateWithRegex(nextValue, rule);
        setFieldError(result.valid ? undefined : result.error);
      }
    },
    [fieldError, rule, validateOnChange],
  );

  const onChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValue(event.target.value);
    },
    [setValue],
  );

  const onBlur = React.useCallback(() => {
    setTouched(true);
    if (validateOnBlur) {
      const result = validateWithRegex(value, rule);
      setFieldError(result.valid ? undefined : result.error);
    }
  }, [rule, validateOnBlur, value]);

  const clearError = React.useCallback(() => {
    setFieldError(undefined);
  }, []);

  const reset = React.useCallback((nextValue = '') => {
    setValueState(nextValue);
    setFieldError(undefined);
    setTouched(false);
  }, []);

  const patternError = compiled.regex ? undefined : compiled.error;
  const error = fieldError ?? patternError;
  const invalid = Boolean(error);

  const getInputProps = React.useCallback(
    (inputOptions?: UseValidationInputPropsOptions) => {
      const describedBy = invalid
        ? inputOptions?.errorId
        : inputOptions?.describedBy;
      return {
        ...(inputOptions?.id ? { id: inputOptions.id } : {}),
        value,
        onChange,
        onBlur,
        'aria-invalid': invalid,
        ...(describedBy ? { 'aria-describedby': describedBy } : {}),
      };
    },
    [invalid, onBlur, onChange, value],
  );

  return {
    value,
    setValue,
    error,
    patternError,
    invalid,
    isValid: liveResult.valid,
    touched,
    pattern,
    setPattern,
    flags,
    setFlags,
    errorMessage,
    setErrorMessage,
    rule,
    validate,
    clearError,
    reset,
    onChange,
    onBlur,
    getInputProps,
  };
}

export interface V04FormDemoProps {
  serialRule?: RegexValidationRule;
  emailRule?: RegexValidationRule;
}

/* ───────────────────────────────────────────────────────────────────────────
 * 01. Form (NP3-XXX-X Regex Validation via useValidation + Custom Regex + Reset + Cmd/Ctrl+Enter)
 * ─────────────────────────────────────────────────────────────────────────── */
export function FormDemo({ serialRule, emailRule }: V04FormDemoProps = {}) {
  const defaultSerialRule = REGEX_VALIDATION_PRESETS.deviceSerial;
  const defaultEmailRule = REGEX_VALIDATION_PRESETS.telemetryEmail;

  const serialField = useValidation(
    serialRule?.pattern ?? defaultSerialRule.pattern,
    serialRule?.message ?? defaultSerialRule.message,
    {
      initialValue: serialRule?.example ?? defaultSerialRule.example,
      flags: serialRule?.flags ?? defaultSerialRule.flags,
      formatLabel: serialRule?.formatLabel ?? defaultSerialRule.formatLabel,
      example: serialRule?.example ?? defaultSerialRule.example,
      required: serialRule?.required ?? true,
      requiredMessage: serialRule?.requiredMessage ?? defaultSerialRule.requiredMessage,
      trim: serialRule?.trim ?? true,
      normalize: serialRule?.normalize ?? 'none',
    },
  );

  const emailField = useValidation(
    emailRule?.pattern ?? defaultEmailRule.pattern,
    emailRule?.message ?? defaultEmailRule.message,
    {
      initialValue: 'ops@nothing.tech',
      flags: emailRule?.flags ?? defaultEmailRule.flags,
      formatLabel: emailRule?.formatLabel ?? defaultEmailRule.formatLabel,
      example: emailRule?.example ?? defaultEmailRule.example,
      required: emailRule?.required ?? true,
      requiredMessage: emailRule?.requiredMessage ?? defaultEmailRule.requiredMessage,
      trim: emailRule?.trim ?? true,
      normalize: emailRule?.normalize ?? 'none',
    },
  );

  const [channel, setChannel] = React.useState<'stable' | 'canary'>('stable');
  const [submittedAt, setSubmittedAt] = React.useState<string | null>(null);
  const [showRegexRule, setShowRegexRule] = React.useState(false);
  const deviceIdInputRef = React.useRef<HTMLInputElement>(null);
  const { loading, trigger } = useAsyncAction(600);
  const shortcutLabel = React.useMemo(() => formatSubmitShortcutLabel(), []);

  const runProvision = React.useCallback(() => {
    if (loading) return;
    const serialResult = serialField.validate();
    const emailResult = emailField.validate();
    if (!serialResult.valid || !emailResult.valid) return;

    trigger(() => {
      const ts = new Date().toLocaleTimeString([], { hour12: false });
      setSubmittedAt(ts);
      appToaster('Device Registered', {
        description: `${serialField.value.trim()} bound to ${channel} channel`,
      });
    });
  }, [channel, emailField, loading, serialField, trigger]);

  const handleReset = React.useCallback(() => {
    if (loading) return;
    serialField.reset('');
    emailField.reset('');
    setChannel('stable');
    setSubmittedAt(null);
    deviceIdInputRef.current?.focus();
  }, [emailField, loading, serialField]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    runProvision();
  };

  const handleFormReset = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleReset();
  };

  const handleFormKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (isFormSubmitShortcut(event)) {
      event.preventDefault();
      runProvision();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      onReset={handleFormReset}
      onKeyDown={handleFormKeyDown}
      noValidate
      data-testid="v04-device-provisioning-form"
      className="mx-auto w-full max-w-lg space-y-4 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-5"
    >
      <div className="flex items-center justify-between border-b border-[var(--nt-line)] pb-2.5 font-mono text-xs">
        <span className="text-[var(--nt-display)]">DEVICE PROVISIONING FORM</span>
        <span className="text-[var(--nt-muted)]">{submittedAt ? `SYNCED ${submittedAt}` : 'SCHEMA v2'}</span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <label
              htmlFor="v04-form-serial"
              className={cn(
                'block font-mono text-[11px] uppercase tracking-[0.1em] transition-colors',
                serialField.invalid ? 'text-[var(--nt-accent)]' : 'text-[var(--nt-muted)]',
              )}
            >
              Device Serial
            </label>
            <span className="font-mono text-[10px] text-[var(--nt-muted)]">
              {serialField.rule.formatLabel ?? `/${serialField.pattern}/${serialField.flags}`}
            </span>
          </div>
          <button
            type="button"
            aria-expanded={showRegexRule}
            onClick={() => setShowRegexRule((v) => !v)}
            className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--nt-muted)] hover:text-[var(--nt-display)] cursor-pointer"
          >
            {showRegexRule ? 'Hide Regex' : 'Customize Regex'}
          </button>
        </div>
        <div className="relative flex items-center">
          <input
            ref={deviceIdInputRef}
            placeholder={serialField.rule.example ?? 'NP3-481-A'}
            {...serialField.getInputProps({
              id: 'v04-form-serial',
              errorId: 'v04-form-serial-error',
            })}
            className={cn(
              'h-9 w-full rounded-lg border border-[var(--nt-line-2)] bg-[var(--nt-surface)] px-3 font-mono text-xs text-[var(--nt-display)] transition-colors focus:border-[var(--nt-display)] focus:outline-none',
              ARIA_INVALID_INPUT_CLASSES,
            )}
          />
          {serialField.invalid && (
            <WarningCircle
              weight="fill"
              aria-hidden="true"
              data-testid="v04-form-serial-error-icon"
              className="pointer-events-none absolute right-2.5 h-4 w-4 text-[var(--nt-accent)]"
            />
          )}
        </div>
        {serialField.invalid && serialField.error && (
          <p id="v04-form-serial-error" role="alert" className="font-mono text-[11px] text-[var(--nt-accent)]">
            {serialField.error}
          </p>
        )}

        {showRegexRule && (
          <div className="space-y-2 rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)] p-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_72px]">
              <input
                aria-label="Custom regex pattern"
                value={serialField.pattern}
                onChange={(e) => serialField.setPattern(e.target.value)}
                placeholder="^NP3-[A-Z0-9]{3}-[A-Z0-9]$"
                className="h-8 rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-bg)] px-2.5 font-mono text-[11px] text-[var(--nt-display)] focus:border-[var(--nt-display)] focus:outline-none"
              />
              <input
                aria-label="Custom regex flags"
                value={serialField.flags}
                onChange={(e) => serialField.setFlags(e.target.value)}
                placeholder="flags"
                className="h-8 rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-bg)] px-2.5 font-mono text-[11px] text-[var(--nt-display)] focus:border-[var(--nt-display)] focus:outline-none"
              />
            </div>
            <input
              aria-label="Custom error message"
              value={serialField.errorMessage}
              onChange={(e) => serialField.setErrorMessage(e.target.value)}
              placeholder="Custom error copy..."
              className="h-8 w-full rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-bg)] px-2.5 font-mono text-[11px] text-[var(--nt-display)] focus:border-[var(--nt-display)] focus:outline-none"
            />
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="v04-form-email"
          className={cn(
            'block font-mono text-[11px] uppercase tracking-[0.1em] transition-colors',
            emailField.invalid ? 'text-[var(--nt-accent)]' : 'text-[var(--nt-muted)]',
          )}
        >
          Operator Email
        </label>
        <div className="relative flex items-center">
          <input
            type="email"
            {...emailField.getInputProps({
              id: 'v04-form-email',
              errorId: 'v04-form-email-error',
            })}
            className={cn(
              'h-9 w-full rounded-lg border border-[var(--nt-line-2)] bg-[var(--nt-surface)] px-3 font-mono text-xs text-[var(--nt-display)] transition-colors focus:border-[var(--nt-display)] focus:outline-none',
              ARIA_INVALID_INPUT_CLASSES,
            )}
          />
          {emailField.invalid && (
            <WarningCircle
              weight="fill"
              aria-hidden="true"
              data-testid="v04-form-email-error-icon"
              className="pointer-events-none absolute right-2.5 h-4 w-4 text-[var(--nt-accent)]"
            />
          )}
        </div>
        {emailField.invalid && emailField.error && (
          <p id="v04-form-email-error" role="alert" className="font-mono text-[11px] text-[var(--nt-accent)]">
            {emailField.error}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="inline-flex rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] p-0.5 font-mono text-[11px]">
          {(['stable', 'canary'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setChannel(c)}
              className={cn(
                'rounded-md px-2.5 py-1 uppercase cursor-pointer',
                channel === c ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]' : 'text-[var(--nt-muted)]',
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="reset"
            variant="outline"
            size="sm"
            disabled={loading}
          >
            Reset
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={loading}
            aria-keyshortcuts="Meta+Enter Control+Enter"
          >
            <span>Provision Device</span>
            <kbd
              aria-hidden="true"
              className="ml-1.5 rounded border border-current/25 px-1 py-0.5 font-mono text-[10px] leading-none opacity-80"
            >
              {shortcutLabel}
            </kbd>
          </Button>
        </div>
      </div>
    </form>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 02. Native Select
 * ─────────────────────────────────────────────────────────────────────────── */
export function NativeSelectDemo() {
  const [region, setRegion] = React.useState('eu-west-2');
  const [rate, setRate] = React.useState('120hz');

  return (
    <div className="mx-auto w-full max-w-md space-y-4 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="v04-ns-region" className="block font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
            Telemetry Region
          </label>
          <div className="relative">
            <select
              id="v04-ns-region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="h-10 w-full appearance-none rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)] pl-3 pr-9 font-mono text-xs text-[var(--nt-display)] focus:border-[var(--nt-display)] focus:outline-none cursor-pointer"
            >
              <optgroup label="Europe">
                <option value="eu-west-2">London (eu-west-2)</option>
                <option value="eu-central-1">Berlin (eu-central-1)</option>
              </optgroup>
              <optgroup label="Asia-Pacific & Americas">
                <option value="ap-northeast-1">Tokyo (ap-northeast-1)</option>
                <option value="us-west-2">San Francisco (us-west-2)</option>
              </optgroup>
            </select>
            <CaretDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--nt-muted)]" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="v04-ns-rate" className="block font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
            Refresh Cadence
          </label>
          <div className="relative">
            <select
              id="v04-ns-rate"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="h-10 w-full appearance-none rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)] pl-3 pr-9 font-mono text-xs text-[var(--nt-display)] focus:border-[var(--nt-display)] focus:outline-none cursor-pointer"
            >
              <option value="60hz">60 Hz · Eco</option>
              <option value="90hz">90 Hz · Balanced</option>
              <option value="120hz">120 Hz · LTPO Adaptive</option>
            </select>
            <CaretDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--nt-muted)]" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] px-3.5 py-2.5 font-mono text-xs">
        <span className="text-[var(--nt-muted)]">Resolved Config</span>
        <span className="text-[var(--nt-display)]">
          {region} · {rate.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 03. Questionnaire (Multi-step Hardware Intake)
 * ─────────────────────────────────────────────────────────────────────────── */
const QUESTIONS = [
  {
    id: 'surface',
    prompt: 'Select primary OLED surface mode',
    options: ['Pure Black (#000000)', 'Paper Light (#F5F5F5)', 'High Contrast AAA'],
  },
  {
    id: 'matrix',
    prompt: 'Choose default Glyph Matrix resolution',
    options: ['25×25 (481 LEDs)', '13×13 (121 LEDs)', 'Adaptive Dual'],
  },
  {
    id: 'haptics',
    prompt: 'Configure hardware haptic cadence',
    options: ['Crisp Linear', 'Subtle Detent', 'Silent Visual Only'],
  },
] as const;

export function QuestionnaireDemo() {
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({
    surface: 'Pure Black (#000000)',
    matrix: '25×25 (481 LEDs)',
    haptics: 'Crisp Linear',
  });
  const [completed, setCompleted] = React.useState(false);

  const current = QUESTIONS[step];
  const progress = Math.round(((step + (completed ? 1 : 0)) / QUESTIONS.length) * 100);

  return (
    <div className="mx-auto w-full max-w-md space-y-4 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between font-mono text-[11px] text-[var(--nt-muted)]">
          <span>{completed ? 'INTAKE COMPLETE' : `STEP ${step + 1} / ${QUESTIONS.length}`}</span>
          <span className="tabular-nums text-[var(--nt-display)]">{progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--nt-raised)]">
          <div
            className="h-full bg-[var(--nt-display)] transition-all duration-200"
            style={{ width: `${Math.max(progress, 15)}%` }}
          />
        </div>
      </div>

      {completed ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-3.5 space-y-1.5 font-mono text-xs">
            {QUESTIONS.map((q) => (
              <div key={q.id} className="flex items-center justify-between gap-2">
                <span className="text-[var(--nt-muted)] uppercase">{q.id}</span>
                <span className="text-[var(--nt-display)]">{answers[q.id]}</span>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCompleted(false);
              setStep(0);
            }}
          >
            Restart Questionnaire
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="font-mono text-xs font-medium text-[var(--nt-display)]">{current.prompt}</p>
          <div className="space-y-1.5">
            {current.options.map((option) => {
              const selected = answers[current.id] === option;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setAnswers((prev) => ({ ...prev, [current.id]: option }))}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left font-mono text-xs transition-colors cursor-pointer',
                    selected
                      ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                      : 'border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
                  )}
                >
                  <span>{option}</span>
                  {selected && <Check className="h-3.5 w-3.5" />}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between pt-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              Back
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (step < QUESTIONS.length - 1) setStep((s) => s + 1);
                else setCompleted(true);
              }}
            >
              {step < QUESTIONS.length - 1 ? 'Next Step' : 'Finish'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 04. Layer Dialog (Depth-Stacked Nested Modal)
 * ─────────────────────────────────────────────────────────────────────────── */
export function LayerDialogDemo() {
  const [depth, setDepth] = React.useState<0 | 1 | 2>(1);

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-[var(--nt-muted)]">Active Stack Depth: L{depth}</span>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={() => setDepth(1)}>
            Open Layer 1
          </Button>
          <Button variant="signal" size="sm" onClick={() => setDepth(2)}>
            Push Layer 2
          </Button>
        </div>
      </div>

      <div className="relative min-h-[190px] rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-4 flex items-end justify-center overflow-hidden">
        {depth === 0 && (
          <div className="self-center font-mono text-xs text-[var(--nt-muted)]">
            No active dialog layer. Trigger Layer 1 above.
          </div>
        )}

        {depth >= 1 && (
          <div
            className={cn(
              'w-full rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)] p-4 transition-all duration-200',
              depth === 2 && 'scale-[0.94] -translate-y-7 opacity-60',
            )}
          >
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-[var(--nt-display)]">Layer 01 · Firmware Update</span>
              <button
                type="button"
                aria-label="Close Layer 1"
                onClick={() => setDepth(0)}
                className="text-[var(--nt-muted)] hover:text-[var(--nt-display)] cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="mt-1.5 text-xs text-[var(--nt-secondary)]">
              Nothing OS 3.2 telemetry bundle ready (48.4 MB). Push nested verification before flashing.
            </p>
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setDepth(0)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={() => setDepth(2)}>
                Verify Checksum →
              </Button>
            </div>
          </div>
        )}

        {depth === 2 && (
          <div className="absolute inset-x-4 bottom-4 rounded-xl border border-[var(--nt-display)] bg-[var(--nt-bg)] p-4 shadow-2xl">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-[var(--nt-accent)]">Layer 02 · SHA-256 Confirmation</span>
              <button
                type="button"
                aria-label="Pop Layer 2"
                onClick={() => setDepth(1)}
                className="text-[var(--nt-muted)] hover:text-[var(--nt-display)] cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="mt-1 font-mono text-[11px] text-[var(--nt-secondary)]">
              9F82·C1A0·481D verified against hardware root key.
            </p>
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setDepth(1)}>
                Pop Layer
              </Button>
              <Button
                variant="signal"
                size="sm"
                onClick={() => {
                  setDepth(0);
                  appToaster('Firmware Flash Queued', { description: 'Checksum verified on Layer 02' });
                }}
              >
                Flash Now
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 05. Menubar
 * ─────────────────────────────────────────────────────────────────────────── */
const MENUBAR_DATA: Record<string, Array<{ label: string; shortcut: string }>> = {
  File: [
    { label: 'New Glyph Sequence', shortcut: '⌘N' },
    { label: 'Export JSON Spec', shortcut: '⌘E' },
    { label: 'Print Wireframe', shortcut: '⌘P' },
  ],
  Edit: [
    { label: 'Undo Matrix Stroke', shortcut: '⌘Z' },
    { label: 'Invert Active LEDs', shortcut: '⇧⌘I' },
    { label: 'Clear Frame', shortcut: '⌫' },
  ],
  Hardware: [
    { label: 'Sync Ear (3) Telemetry', shortcut: '⌘S' },
    { label: 'Calibrate 25×25 Ring', shortcut: '⌘K' },
  ],
};

export function MenubarDemo() {
  const [openMenu, setOpenMenu] = React.useState<string | null>('File');
  const [lastAction, setLastAction] = React.useState('Ready');

  return (
    <div className="mx-auto w-full max-w-md space-y-3">
      <div
        role="menubar"
        aria-label="Hardware studio menubar"
        className="relative flex items-center gap-1 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-1.5 font-mono text-xs"
      >
        {Object.keys(MENUBAR_DATA).map((menuName) => {
          const active = openMenu === menuName;
          return (
            <div key={menuName} className="relative">
              <button
                type="button"
                role="menuitem"
                aria-expanded={active}
                onClick={() => setOpenMenu(active ? null : menuName)}
                className={cn(
                  'rounded-lg px-3 py-1.5 transition-colors cursor-pointer',
                  active
                    ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                    : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
                )}
              >
                {menuName}
              </button>
              {active && (
                <div
                  role="menu"
                  className="absolute left-0 top-full z-20 mt-2 w-56 rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-bg)] p-1.5 shadow-xl"
                >
                  {MENUBAR_DATA[menuName].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setLastAction(`${menuName} → ${item.label}`);
                        setOpenMenu(null);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs text-[var(--nt-primary)] hover:bg-[var(--nt-raised)] cursor-pointer"
                    >
                      <span>{item.label}</span>
                      <span className="text-[10px] text-[var(--nt-muted)]">{item.shortcut}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] px-3.5 py-2.5 font-mono text-[11px] text-[var(--nt-muted)]">
        Last Command: <span className="text-[var(--nt-display)]">{lastAction}</span>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 06. Navigation Menu
 * ─────────────────────────────────────────────────────────────────────────── */
const NAV_PANELS = {
  Primitives: [
    { name: 'Actions & Forms', desc: 'Buttons, inputs, comboboxes, and validated forms.' },
    { name: 'Overlays & Sheets', desc: 'Dialogs, drawers, menubars, and popovers.' },
  ],
  Exclusive: [
    { name: 'Glyph Matrix', desc: '25×25 (481 LED) and 13×13 (121 LED) arrays.' },
    { name: 'Dotted & Hardware', desc: '35 9×9 Dot Icons, rotary encoders, and LED indicators.' },
  ],
  Native: [
    { name: 'nthgui/native', desc: 'Full React Native + Expo SDK parity across all 136 items.' },
    { name: 'Offline CLI', desc: 'Copy-in source scaffolding with zero extra npm installs.' },
  ],
} as const;

type NavPanelKey = keyof typeof NAV_PANELS;

export function NavigationMenuDemo() {
  const [activePanel, setActivePanel] = React.useState<NavPanelKey>('Exclusive');

  return (
    <div className="mx-auto w-full max-w-lg space-y-3 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-4">
      <nav aria-label="Primary sections" className="flex flex-wrap items-center gap-1 border-b border-[var(--nt-line)] pb-3 font-mono text-xs">
        {(Object.keys(NAV_PANELS) as NavPanelKey[]).map((key) => (
          <button
            key={key}
            type="button"
            aria-expanded={activePanel === key}
            onClick={() => setActivePanel(key)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors cursor-pointer',
              activePanel === key
                ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
            )}
          >
            <span>{key}</span>
            <CaretDown className="h-3 w-3" />
          </button>
        ))}
      </nav>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {NAV_PANELS[activePanel].map((card) => (
          <div
            key={card.name}
            className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-3.5 space-y-1"
          >
            <div className="font-mono text-xs font-medium text-[var(--nt-display)]">{card.name}</div>
            <p className="text-xs leading-relaxed text-[var(--nt-secondary)]">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 07. Layer Card
 * ─────────────────────────────────────────────────────────────────────────── */
export function LayerCardDemo() {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="mx-auto w-full max-w-md pt-3">
      <div className="relative">
        <div
          className={cn(
            'mx-3 rounded-t-2xl border border-b-0 border-[var(--nt-line)] bg-[var(--nt-raised)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)] transition-all duration-200',
            expanded ? 'pb-4' : 'pb-2',
          )}
        >
          <span>Recessed Telemetry Layer · 481 LEDs · 98% Battery</span>
          {expanded && (
            <div className="mt-2 grid grid-cols-3 gap-2 text-[var(--nt-display)]">
              <div>CPU 14%</div>
              <div>TEMP 31°C</div>
              <div>5G -82dBm</div>
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-[var(--nt-line-2)] bg-[var(--nt-bg)] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs text-[var(--nt-display)]">
              <Stack className="h-4 w-4 text-[var(--nt-accent)]" />
              <span>Nothing Phone (3) Deck</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setExpanded((v) => !v)}>
              {expanded ? 'Collapse Layer' : 'Inspect Back Layer'}
            </Button>
          </div>
          <p className="text-xs text-[var(--nt-secondary)]">
            Dual-plane card architecture separating primary action focus from recessed hardware diagnostics.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 08. Marker
 * ─────────────────────────────────────────────────────────────────────────── */
const MARKERS = [
  { id: 'LON', label: 'London HQ', x: 46, y: 34, latency: '11 ms', status: 'NOMINAL' },
  { id: 'SFO', label: 'San Francisco', x: 18, y: 44, latency: '42 ms', status: 'NOMINAL' },
  { id: 'TYO', label: 'Tokyo Relay', x: 82, y: 42, latency: '19 ms', status: 'ACTIVE' },
] as const;

export function MarkerDemo() {
  const [selected, setSelected] = React.useState<string>('LON');
  const active = MARKERS.find((m) => m.id === selected) ?? MARKERS[0];

  return (
    <div className="mx-auto w-full max-w-md space-y-3">
      <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)]">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: 'radial-gradient(var(--nt-muted) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        />
        {MARKERS.map((m) => {
          const isCurrent = m.id === selected;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelected(m.id)}
              style={{ left: `${m.x}%`, top: `${m.y}%` }}
              className={cn(
                'absolute -translate-x-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[10px] transition-transform cursor-pointer',
                isCurrent
                  ? 'scale-110 border-[var(--nt-accent)] bg-[var(--nt-accent)] text-white'
                  : 'border-[var(--nt-line-2)] bg-[var(--nt-surface)] text-[var(--nt-display)] hover:border-[var(--nt-display)]',
              )}
            >
              <MapPin className="h-3 w-3" weight="fill" />
              <span>{m.id}</span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] px-3.5 py-2.5 font-mono text-xs">
        <span className="text-[var(--nt-display)]">{active.label}</span>
        <span className="text-[var(--nt-muted)]">
          {active.latency} · <span className="text-[var(--nt-accent)]">{active.status}</span>
        </span>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 09. Carousel
 * ─────────────────────────────────────────────────────────────────────────── */
const SLIDES = [
  { id: '01', title: 'Glyph Matrix 25×25', metric: '481 LEDs', desc: 'Circular micro-LED array with 3-state luminance.' },
  { id: '02', title: 'Ear (3) Acoustic Deck', metric: '45 dB ANC', desc: 'Dual-driver active noise cancellation profile.' },
  { id: '03', title: 'Dot Icon Library', metric: '35 · 9×9', desc: 'Original monochrome round-dot pixel glyphs.' },
] as const;

export function CarouselDemo() {
  const [index, setIndex] = React.useState(0);
  const slide = SLIDES[index];

  return (
    <div className="mx-auto w-full max-w-md space-y-3">
      <div className="rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-5 space-y-3">
        <div className="flex items-center justify-between font-mono text-[11px] text-[var(--nt-muted)]">
          <span>SLIDE {slide.id} / 0{SLIDES.length}</span>
          <span className="text-[var(--nt-accent)]">{slide.metric}</span>
        </div>
        <div className="font-display text-2xl text-[var(--nt-display)]">{slide.title}</div>
        <p className="text-xs text-[var(--nt-secondary)]">{slide.desc}</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                'h-2 rounded-full transition-all cursor-pointer',
                i === index ? 'w-6 bg-[var(--nt-display)]' : 'w-2 bg-[var(--nt-line-2)]',
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            aria-label="Previous slide"
            onClick={() => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length)}
          >
            <CaretLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            aria-label="Next slide"
            onClick={() => setIndex((i) => (i + 1) % SLIDES.length)}
          >
            <CaretRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 10. Resizable Panels
 * ─────────────────────────────────────────────────────────────────────────── */
export function ResizablePanelsDemo() {
  const [split, setSplit] = React.useState(45);

  return (
    <div className="mx-auto w-full max-w-lg space-y-3">
      <div className="flex items-center justify-between font-mono text-[11px] text-[var(--nt-muted)]">
        <span>SPLIT RATIO: {split}% / {100 - split}%</span>
        <div className="flex items-center gap-1">
          {[30, 50, 70].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setSplit(preset)}
              className={cn(
                'rounded-md border px-2 py-0.5 cursor-pointer',
                split === preset
                  ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'border-[var(--nt-line)] text-[var(--nt-secondary)]',
              )}
            >
              {preset}/{100 - preset}
            </button>
          ))}
        </div>
      </div>

      <div className="flex h-36 w-full overflow-hidden rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)]">
        <div style={{ width: `${split}%` }} className="flex flex-col justify-between p-4 transition-all duration-150">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">Pane A · Explorer</span>
          <span className="font-mono text-lg tabular-nums text-[var(--nt-display)]">{split}%</span>
        </div>
        <div className="w-1 shrink-0 bg-[var(--nt-line-2)]" aria-hidden="true" />
        <div style={{ width: `${100 - split}%` }} className="flex flex-col justify-between bg-[var(--nt-surface)] p-4 transition-all duration-150">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">Pane B · Inspector</span>
          <span className="font-mono text-lg tabular-nums text-[var(--nt-accent)]">{100 - split}%</span>
        </div>
      </div>

      <input
        type="range"
        min={25}
        max={75}
        value={split}
        aria-label="Resize panel split percentage"
        onChange={(e) => setSplit(Number(e.target.value))}
        className="w-full accent-[var(--nt-display)] cursor-pointer"
      />
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 11. Scroll Area
 * ─────────────────────────────────────────────────────────────────────────── */
const LOG_LINES = Array.from({ length: 14 }, (_, idx) => ({
  id: idx + 1,
  code: `EVT-${String(idx + 101)}`,
  msg: idx % 3 === 0 ? 'Glyph ring heartbeat OK (481 LEDs)' : idx % 3 === 1 ? 'BLE Ear (3) battery telemetry 94%' : 'Subpath bundle nthgui/native verified',
}));

export function ScrollAreaDemo() {
  const boxRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <div className="mx-auto w-full max-w-md space-y-2.5">
      <div className="flex items-center justify-between font-mono text-[11px] text-[var(--nt-muted)]">
        <span>TELEMETRY STREAM ({LOG_LINES.length} ROWS)</span>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => boxRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
            className="rounded border border-[var(--nt-line)] px-2 py-0.5 text-[var(--nt-display)] cursor-pointer"
          >
            Top
          </button>
          <button
            type="button"
            onClick={() => boxRef.current?.scrollTo({ top: 9999, behavior: 'smooth' })}
            className="rounded border border-[var(--nt-line)] px-2 py-0.5 text-[var(--nt-display)] cursor-pointer"
          >
            Bottom
          </button>
        </div>
      </div>

      <div
        ref={boxRef}
        tabIndex={0}
        className="h-44 overflow-y-auto rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-3 font-mono text-xs divide-y divide-[var(--nt-line)]"
      >
        {LOG_LINES.map((row) => (
          <div key={row.id} className="flex items-center justify-between gap-3 py-2">
            <span className="text-[var(--nt-accent)]">{row.code}</span>
            <span className="truncate text-[var(--nt-secondary)]">{row.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 12. Aspect Ratio
 * ─────────────────────────────────────────────────────────────────────────── */
const RATIOS = [
  { id: '16/9', label: '16:9 Cinema', value: '16 / 9' },
  { id: '4/3', label: '4:3 Sensor', value: '4 / 3' },
  { id: '1/1', label: '1:1 Square', value: '1 / 1' },
  { id: '21/9', label: '21:9 Scope', value: '21 / 9' },
] as const;

export function AspectRatioDemo() {
  const [ratio, setRatio] = React.useState<(typeof RATIOS)[number]>(RATIOS[0]);

  return (
    <div className="mx-auto w-full max-w-md space-y-3">
      <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
        {RATIOS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRatio(r)}
            className={cn(
              'rounded-lg border px-2.5 py-1 cursor-pointer',
              ratio.id === r.id
                ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                : 'border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-secondary)]',
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="mx-auto w-full max-w-[300px]">
        <div
          style={{ aspectRatio: ratio.value }}
          className="relative flex w-full items-center justify-center rounded-2xl border border-[var(--nt-line-2)] bg-[var(--nt-bg)] transition-all duration-200"
        >
          <div className="text-center font-mono">
            <div className="text-sm text-[var(--nt-display)]">{ratio.id}</div>
            <div className="text-[10px] text-[var(--nt-muted)]">LOCKED VIEWPORT</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 13. Grid
 * ─────────────────────────────────────────────────────────────────────────── */
export function GridDemo() {
  const [cols, setCols] = React.useState<2 | 3 | 4>(3);

  return (
    <div className="mx-auto w-full max-w-md space-y-3">
      <div className="flex items-center justify-between font-mono text-xs">
        <span className="inline-flex items-center gap-1.5 text-[var(--nt-muted)]">
          <GridFour className="h-3.5 w-3.5" />
          <span>Columns: {cols}</span>
        </span>
        <div className="inline-flex rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] p-0.5 text-[11px]">
          {([2, 3, 4] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCols(c)}
              className={cn(
                'rounded-md px-2.5 py-1 cursor-pointer',
                cols === c ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]' : 'text-[var(--nt-muted)]',
              )}
            >
              {c} Col
            </button>
          ))}
        </div>
      </div>

      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {['01 · CPU', '02 · GPU', '03 · NPU', '04 · RF', '05 · LED', '06 · PWR'].map((tile) => (
          <div
            key={tile}
            className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] px-3 py-4 text-center font-mono text-[11px] text-[var(--nt-display)]"
          >
            {tile}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 14. Direction (LTR / RTL Provider)
 * ─────────────────────────────────────────────────────────────────────────── */
export function DirectionDemo() {
  const [dir, setDir] = React.useState<'ltr' | 'rtl'>('ltr');

  return (
    <div className="mx-auto w-full max-w-md space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-[var(--nt-muted)]">Writing Direction</span>
        <div className="inline-flex rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] p-0.5 font-mono text-[11px]">
          {(['ltr', 'rtl'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setDir(mode)}
              className={cn(
                'rounded-md px-3 py-1 uppercase cursor-pointer',
                dir === mode ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]' : 'text-[var(--nt-muted)]',
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div
        dir={dir}
        className="rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-4 space-y-3"
      >
        <div className="flex items-center justify-between font-mono text-xs">
          <span className="text-[var(--nt-display)]">
            {dir === 'ltr' ? 'Logical Start → End' : 'البداية المنطقية ← النهاية'}
          </span>
          {dir === 'ltr' ? <ArrowRight className="h-4 w-4 text-[var(--nt-accent)]" /> : <ArrowLeft className="h-4 w-4 text-[var(--nt-accent)]" />}
        </div>
        <p className="text-xs text-[var(--nt-secondary)]">
          {dir === 'ltr'
            ? 'All paddings, borders, and controls mirror automatically via logical CSS properties.'
            : 'تتعكس الهوامش والأزرار تلقائياً باستخدام الخصائص المنطقية في واجهة Nothing UI.'}
        </p>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 15. Message Scroller
 * ─────────────────────────────────────────────────────────────────────────── */
export function MessageScrollerDemo() {
  const [messages, setMessages] = React.useState([
    { id: 1, sender: 'NODE', text: 'Glyph ring initialized on channel 04.' },
    { id: 2, sender: 'OPS', text: 'Confirming 136/136 components stable across Web + Native.' },
    { id: 3, sender: 'NODE', text: 'Offline template bundle checksum matched.' },
  ]);
  const listRef = React.useRef<HTMLDivElement | null>(null);

  const pushMessage = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        sender: prev.length % 2 === 0 ? 'NODE' : 'OPS',
        text: `Telemetry packet #${prev.length + 1} delivered in 12 ms.`,
      },
    ]);
    window.requestAnimationFrame(() => {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    });
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-2.5">
      <div
        ref={listRef}
        className="h-44 overflow-y-auto rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-3 space-y-2"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              'rounded-xl border px-3 py-2 text-xs',
              m.sender === 'OPS'
                ? 'ml-8 border-[var(--nt-line-2)] bg-[var(--nt-surface)] text-[var(--nt-display)]'
                : 'mr-8 border-[var(--nt-line)] bg-[var(--nt-raised)]/50 text-[var(--nt-secondary)]',
            )}
          >
            <div className="font-mono text-[10px] text-[var(--nt-muted)]">{m.sender}</div>
            <div className="mt-0.5">{m.text}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={pushMessage}>
          <Plus className="h-3.5 w-3.5" />
          Stream Packet
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })}
        >
          <ArrowDown className="h-3.5 w-3.5" />
          Latest
        </Button>
      </div>
    </div>
  );
}
