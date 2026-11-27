import * as React from 'react';
import {
  CaretDown,
  Check,
  CheckCircle,
  Compass,
  Folder,
  Stack,
  MapPin,
  SlidersHorizontal,
  Sparkle,
  Terminal,
  WarningCircle,
  X,
} from '@phosphor-icons/react';
import {
  ARIA_INVALID_INPUT_CLASSES,
  Button,
  REGEX_VALIDATION_PRESETS,
  cn,
  compileValidationRegex,
  formatSubmitShortcutLabel,
  isFormSubmitShortcut,
  useAsyncAction,
  useResolvedLoading,
  validateWithRegex,
  type RegexValidationRule,
} from '@nothing-ui/ui';

const SERIAL_RULE_PRESETS = [
  { key: 'deviceSerial' as const, label: 'NP3-XXX-X', preset: REGEX_VALIDATION_PRESETS.deviceSerial },
  { key: 'firmwareTag' as const, label: 'OS-X.Y.Z', preset: REGEX_VALIDATION_PRESETS.firmwareTag },
  { key: 'tokenKey' as const, label: 'nt_live_...', preset: REGEX_VALIDATION_PRESETS.tokenKey },
  { key: 'macAddress' as const, label: 'MAC Addr', preset: REGEX_VALIDATION_PRESETS.macAddress },
] as const;

export interface FormDemoProps {
  /** Optional custom regex validation rule override for the Device Serial field. */
  serialRule?: RegexValidationRule;
  /** Optional custom regex validation rule override for the Telemetry Contact field. */
  emailRule?: RegexValidationRule;
}

/* ───────────────────────────────────────────────────────────────────────────
 * 1. Form (Regex-validated Form with NP3-XXX-X Serial, Custom Regex, Reset & Cmd/Ctrl+Enter)
 * ─────────────────────────────────────────────────────────────────────────── */
export function FormDemo({ serialRule, emailRule }: FormDemoProps = {}) {
  const initialSerialPreset = REGEX_VALIDATION_PRESETS.deviceSerial;
  const [deviceSerial, setDeviceSerial] = React.useState(initialSerialPreset.example);
  const [email, setEmail] = React.useState('ops@nthgui.dev');
  const [channel, setChannel] = React.useState('stable');
  const [agreed, setAgreed] = React.useState(true);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submittedAt, setSubmittedAt] = React.useState<string | null>(null);
  const [lastTrigger, setLastTrigger] = React.useState<'button' | 'shortcut'>('button');

  // Full customizable regex state for Device Serial (defaults to NP3-XXX-X)
  const [showRegexEditor, setShowRegexEditor] = React.useState(false);
  const [activePresetId, setActivePresetId] = React.useState<string>(
    serialRule ? 'custom' : initialSerialPreset.id,
  );
  const [customPattern, setCustomPattern] = React.useState<string>(
    serialRule
      ? serialRule.pattern instanceof RegExp
        ? serialRule.pattern.source
        : serialRule.pattern
      : initialSerialPreset.pattern,
  );
  const [customFlags, setCustomFlags] = React.useState<string>(
    serialRule
      ? serialRule.flags ?? (serialRule.pattern instanceof RegExp ? serialRule.pattern.flags : '')
      : initialSerialPreset.flags,
  );
  const [customFormatLabel, setCustomFormatLabel] = React.useState<string>(
    serialRule?.formatLabel ?? initialSerialPreset.formatLabel,
  );
  const [customExample, setCustomExample] = React.useState<string>(
    serialRule?.example ?? initialSerialPreset.example,
  );
  const [customErrorMessage, setCustomErrorMessage] = React.useState<string>(
    serialRule?.message ?? initialSerialPreset.message,
  );
  const [customRequiredMessage, setCustomRequiredMessage] = React.useState<string>(
    serialRule?.requiredMessage ?? initialSerialPreset.requiredMessage,
  );

  const serialInputRef = React.useRef<HTMLInputElement>(null);
  const submitAction = useAsyncAction(650);
  const { loading: isLoading } = useResolvedLoading({ loading: submitAction.loading });
  const shortcutLabel = React.useMemo(() => formatSubmitShortcutLabel(), []);

  const activeSerialRule = React.useMemo<RegexValidationRule>(
    () => ({
      pattern: customPattern,
      flags: customFlags,
      formatLabel: customFormatLabel || undefined,
      example: customExample || undefined,
      message: customErrorMessage || undefined,
      requiredMessage: customRequiredMessage || undefined,
      required: serialRule?.required ?? true,
      trim: serialRule?.trim ?? true,
      normalize: serialRule?.normalize ?? 'none',
    }),
    [
      customErrorMessage,
      customExample,
      customFlags,
      customFormatLabel,
      customPattern,
      customRequiredMessage,
      serialRule?.normalize,
      serialRule?.required,
      serialRule?.trim,
    ],
  );

  const activeEmailRule = React.useMemo<RegexValidationRule>(
    () => emailRule ?? REGEX_VALIDATION_PRESETS.telemetryEmail,
    [emailRule],
  );

  const compiledSerialRegex = React.useMemo(
    () => compileValidationRegex(customPattern, customFlags),
    [customFlags, customPattern],
  );

  const liveSerialCheck = React.useMemo(
    () => validateWithRegex(deviceSerial, activeSerialRule),
    [activeSerialRule, deviceSerial],
  );

  React.useEffect(() => {
    setErrors((prev) => {
      if (!prev.deviceSerial) return prev;
      if (liveSerialCheck.valid) {
        const { deviceSerial: _, ...rest } = prev;
        return rest;
      }
      if (liveSerialCheck.error && prev.deviceSerial !== liveSerialCheck.error) {
        return { ...prev, deviceSerial: liveSerialCheck.error };
      }
      return prev;
    });
  }, [liveSerialCheck]);

  const validateFields = React.useCallback(
    (nextSerial: string, nextEmail: string, nextAgreed: boolean) => {
      const nextErrors: Record<string, string> = {};
      const serialResult = validateWithRegex(nextSerial, activeSerialRule);
      if (!serialResult.valid && serialResult.error) {
        nextErrors.deviceSerial = serialResult.error;
      }
      const emailResult = validateWithRegex(nextEmail, activeEmailRule);
      if (!emailResult.valid && emailResult.error) {
        nextErrors.email = emailResult.error;
      }
      if (!nextAgreed) {
        nextErrors.agreed = 'Confirm signed OTA diagnostics consent before provisioning.';
      }
      return nextErrors;
    },
    [activeEmailRule, activeSerialRule],
  );

  const applySerialPreset = React.useCallback(
    (preset: (typeof SERIAL_RULE_PRESETS)[number]['preset']) => {
      setActivePresetId(preset.id);
      setCustomPattern(preset.pattern);
      setCustomFlags(preset.flags);
      setCustomFormatLabel(preset.formatLabel);
      setCustomExample(preset.example);
      setCustomErrorMessage(preset.message);
      setCustomRequiredMessage(preset.requiredMessage);
      setErrors((prev) => {
        if (!prev.deviceSerial) return prev;
        const { deviceSerial: _, ...rest } = prev;
        return rest;
      });
    },
    [],
  );

  const runProvision = React.useCallback(
    (source: 'button' | 'shortcut') => {
      if (isLoading) return;
      const nextErrors = validateFields(deviceSerial, email, agreed);
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;

      setLastTrigger(source);
      submitAction.trigger(() => {
        setSubmittedAt(
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        );
      });
    },
    [agreed, deviceSerial, email, isLoading, submitAction, validateFields],
  );

  const handleReset = React.useCallback(() => {
    if (isLoading) return;
    setDeviceSerial('');
    setEmail('');
    setChannel('stable');
    setAgreed(false);
    setErrors({});
    setSubmittedAt(null);
    setLastTrigger('button');
    serialInputRef.current?.focus();
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runProvision('button');
  };

  const handleFormReset = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleReset();
  };

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (isFormSubmitShortcut(e)) {
      e.preventDefault();
      runProvision('shortcut');
    }
  };

  const serialInvalid = Boolean(errors.deviceSerial) || !compiledSerialRegex.regex;
  const emailInvalid = Boolean(errors.email);
  const agreedInvalid = Boolean(errors.agreed);
  const serialErrorText = errors.deviceSerial ?? compiledSerialRegex.error;

  return (
    <form
      onSubmit={handleSubmit}
      onReset={handleFormReset}
      onKeyDown={handleFormKeyDown}
      noValidate
      aria-busy={isLoading || undefined}
      data-testid="device-provisioning-form"
      className="mx-auto w-full max-w-lg space-y-4 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-5"
    >
      <div className="flex items-start justify-between gap-3 border-b border-[var(--nt-line)] pb-3">
        <div className="min-w-0">
          <h3 className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--nt-display)]">
            Device Provisioning Form
          </h3>
          <p className="mt-0.5 text-xs text-[var(--nt-muted)]">
            Regex-validated inputs, aria-invalid indicators, and {shortcutLabel} quick submit.
          </p>
        </div>
        <span className="shrink-0 whitespace-nowrap font-mono text-[10px] text-[var(--nt-muted)]">FORM · 72</span>
      </div>

      {Object.keys(errors).length > 0 && (
        <div
          role="alert"
          data-testid="form-error-summary"
          className="flex items-start gap-2 rounded-xl border border-[var(--nt-accent)]/60 bg-[var(--nt-accent)]/10 px-3 py-2.5 text-xs text-[var(--nt-display)]"
        >
          <WarningCircle weight="fill" className="mt-0.5 h-4 w-4 shrink-0 text-[var(--nt-accent)]" />
          <span>
            Validation failed · Resolve {Object.keys(errors).length} schema issue(s) highlighted below.
          </span>
        </div>
      )}

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <label
              htmlFor="form-device-serial"
              className={cn(
                'block font-mono text-[11px] uppercase tracking-[0.08em] transition-colors',
                serialInvalid ? 'text-[var(--nt-accent)]' : 'text-[var(--nt-secondary)]',
              )}
            >
              Device Serial
            </label>
            <span className="font-mono text-[10px] text-[var(--nt-muted)]" aria-hidden="true">
              ·
            </span>
            <span
              data-testid="form-serial-format-label"
              className={cn(
                'font-mono text-[10px] tracking-[0.06em]',
                serialInvalid
                  ? 'text-[var(--nt-accent)]'
                  : liveSerialCheck.valid && deviceSerial.trim().length > 0
                    ? 'text-[var(--nt-success)]'
                    : 'text-[var(--nt-muted)]',
              )}
            >
              {customFormatLabel || `/${customPattern}/${customFlags}`}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {serialInvalid && (
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--nt-accent)]">
                Invalid
              </span>
            )}
            <button
              type="button"
              aria-expanded={showRegexEditor}
              aria-controls="form-regex-configurator"
              onClick={() => setShowRegexEditor((open) => !open)}
              className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--nt-muted)] underline-offset-2 hover:text-[var(--nt-display)] hover:underline cursor-pointer whitespace-nowrap"
            >
              {showRegexEditor ? 'Hide Regex' : 'Customize Regex'}
            </button>
          </div>
        </div>
        <div className="relative flex items-center">
          <input
            ref={serialInputRef}
            id="form-device-serial"
            value={deviceSerial}
            placeholder={customExample || 'NP3-481-A'}
            onChange={(e) => {
              const nextVal = e.target.value;
              setDeviceSerial(nextVal);
              if (errors.deviceSerial) {
                const recheck = validateWithRegex(nextVal, activeSerialRule);
                if (recheck.valid) {
                  setErrors((prev) => {
                    const { deviceSerial: _, ...rest } = prev;
                    return rest;
                  });
                } else if (recheck.error) {
                  setErrors((prev) => ({ ...prev, deviceSerial: recheck.error! }));
                }
              }
            }}
            aria-invalid={serialInvalid}
            aria-describedby={serialInvalid ? 'form-device-serial-error' : 'form-device-serial-hint'}
            className={cn(
              'h-10 w-full rounded-lg border border-[var(--nt-line-2)] bg-[var(--nt-surface)] px-3 font-mono text-xs text-[var(--nt-display)] placeholder:text-[var(--nt-muted)] transition-colors focus:border-[var(--nt-display)] focus:outline-none',
              ARIA_INVALID_INPUT_CLASSES,
            )}
          />
          {serialInvalid && (
            <WarningCircle
              weight="fill"
              aria-hidden="true"
              data-testid="form-device-serial-error-icon"
              className="pointer-events-none absolute right-3 h-4 w-4 text-[var(--nt-accent)]"
            />
          )}
        </div>
        {serialInvalid && serialErrorText ? (
          <p
            id="form-device-serial-error"
            role="alert"
            data-testid="form-device-serial-error"
            className="font-mono text-[11px] leading-relaxed text-[var(--nt-accent)]"
          >
            {serialErrorText}
          </p>
        ) : (
          <p
            id="form-device-serial-hint"
            className="font-mono text-[10px] text-[var(--nt-muted)]"
          >
            Pattern /{customPattern}/{customFlags} · {liveSerialCheck.valid ? 'Matches spec' : `Example: ${customExample || 'NP3-481-A'}`}
          </p>
        )}

        {showRegexEditor && (
          <div
            id="form-regex-configurator"
            data-testid="form-regex-configurator"
            className="mt-2 space-y-3 rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)] p-3.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nt-secondary)]">
                Custom Regex Rule
              </span>
              <span
                data-testid="form-regex-live-status"
                className={cn(
                  'font-mono text-[10px] uppercase tracking-[0.08em]',
                  !compiledSerialRegex.regex
                    ? 'text-[var(--nt-accent)]'
                    : liveSerialCheck.valid
                      ? 'text-[var(--nt-success)]'
                      : 'text-[var(--nt-muted)]',
                )}
              >
                {!compiledSerialRegex.regex
                  ? 'Syntax Error'
                  : liveSerialCheck.valid
                    ? 'Live Match'
                    : 'No Match'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Regex presets">
              {SERIAL_RULE_PRESETS.map(({ key, label, preset }) => {
                const active = activePresetId === preset.id;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => applySerialPreset(preset)}
                    className={cn(
                      'rounded-md border px-2 py-1 font-mono text-[10px] transition-colors cursor-pointer whitespace-nowrap',
                      active
                        ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                        : 'border-[var(--nt-line)] bg-[var(--nt-bg)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_76px]">
              <div className="space-y-1">
                <label
                  htmlFor="form-custom-regex-pattern"
                  className="block font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--nt-muted)]"
                >
                  Regex Pattern
                </label>
                <div className="relative flex items-center">
                  <span className="pointer-events-none absolute left-2.5 font-mono text-xs text-[var(--nt-muted)]">/</span>
                  <input
                    id="form-custom-regex-pattern"
                    value={customPattern}
                    onChange={(e) => {
                      setActivePresetId('custom');
                      setCustomFormatLabel('');
                      setCustomPattern(e.target.value);
                    }}
                    aria-invalid={!compiledSerialRegex.regex}
                    placeholder="^NP3-[A-Z0-9]{3}-[A-Z0-9]$"
                    className={cn(
                      'h-8 w-full rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-bg)] pl-5 pr-5 font-mono text-[11px] text-[var(--nt-display)] focus:border-[var(--nt-display)] focus:outline-none',
                      ARIA_INVALID_INPUT_CLASSES,
                    )}
                  />
                  <span className="pointer-events-none absolute right-2.5 font-mono text-xs text-[var(--nt-muted)]">/</span>
                </div>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="form-custom-regex-flags"
                  className="block font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--nt-muted)]"
                >
                  Flags
                </label>
                <input
                  id="form-custom-regex-flags"
                  value={customFlags}
                  onChange={(e) => {
                    setActivePresetId('custom');
                    setCustomFlags(e.target.value);
                  }}
                  placeholder="i"
                  maxLength={5}
                  className="h-8 w-full rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-bg)] px-2.5 font-mono text-[11px] text-[var(--nt-display)] focus:border-[var(--nt-display)] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="form-custom-regex-message"
                className="block font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--nt-muted)]"
              >
                Custom Error Message
              </label>
              <input
                id="form-custom-regex-message"
                value={customErrorMessage}
                onChange={(e) => {
                  setActivePresetId('custom');
                  setCustomErrorMessage(e.target.value);
                }}
                placeholder="Leave blank for auto-generated Nothing UI error copy"
                className="h-8 w-full rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-bg)] px-2.5 font-mono text-[11px] text-[var(--nt-display)] placeholder:text-[var(--nt-muted)] focus:border-[var(--nt-display)] focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="form-email"
            className={cn(
              'block font-mono text-[11px] uppercase tracking-[0.08em] transition-colors',
              emailInvalid ? 'text-[var(--nt-accent)]' : 'text-[var(--nt-secondary)]',
            )}
          >
            Telemetry Contact
          </label>
          {emailInvalid && (
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--nt-accent)]">
              Invalid
            </span>
          )}
        </div>
        <div className="relative flex items-center">
          <input
            id="form-email"
            type="email"
            value={email}
            placeholder="ops@nthgui.dev"
            onChange={(e) => {
              const nextVal = e.target.value;
              setEmail(nextVal);
              if (errors.email) {
                const recheck = validateWithRegex(nextVal, activeEmailRule);
                if (recheck.valid) {
                  setErrors((prev) => {
                    const { email: _, ...rest } = prev;
                    return rest;
                  });
                } else if (recheck.error) {
                  setErrors((prev) => ({ ...prev, email: recheck.error! }));
                }
              }
            }}
            aria-invalid={emailInvalid}
            aria-describedby={emailInvalid ? 'form-email-error' : undefined}
            className={cn(
              'h-10 w-full rounded-lg border border-[var(--nt-line-2)] bg-[var(--nt-surface)] px-3 font-mono text-xs text-[var(--nt-display)] placeholder:text-[var(--nt-muted)] transition-colors focus:border-[var(--nt-display)] focus:outline-none',
              ARIA_INVALID_INPUT_CLASSES,
            )}
          />
          {emailInvalid && (
            <WarningCircle
              weight="fill"
              aria-hidden="true"
              data-testid="form-email-error-icon"
              className="pointer-events-none absolute right-3 h-4 w-4 text-[var(--nt-accent)]"
            />
          )}
        </div>
        {errors.email && (
          <p id="form-email-error" role="alert" className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--nt-accent)]">
            <span>{errors.email}</span>
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="form-channel" className="block font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--nt-secondary)]">
          Firmware Channel
        </label>
        <select
          id="form-channel"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className="h-10 w-full rounded-lg border border-[var(--nt-line-2)] bg-[var(--nt-surface)] px-3 font-mono text-xs text-[var(--nt-display)] focus:border-[var(--nt-display)] focus:outline-none"
        >
          <option value="stable">Stable (OS 3.1)</option>
          <option value="beta">Beta Telemetry</option>
          <option value="nightly">Nightly Glyph Lab</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label
          className={cn(
            'flex items-start gap-2.5 rounded-lg border px-2.5 py-2 text-xs transition-colors cursor-pointer',
            agreedInvalid
              ? 'border-[var(--nt-accent)] bg-[var(--nt-accent)]/[0.06] text-[var(--nt-display)]'
              : 'border-transparent px-0 py-0 text-[var(--nt-secondary)]',
          )}
        >
          <input
            type="checkbox"
            checked={agreed}
            aria-invalid={agreedInvalid}
            aria-describedby={agreedInvalid ? 'form-agreed-error' : undefined}
            onChange={(e) => {
              setAgreed(e.target.checked);
              if (e.target.checked && errors.agreed) {
                setErrors((prev) => {
                  const { agreed: _, ...rest } = prev;
                  return rest;
                });
              }
            }}
            className="mt-0.5 accent-[var(--nt-accent)]"
          />
          <span className="flex-1">Enable signed OTA telemetry handshake for this hardware node.</span>
          {agreedInvalid && (
            <WarningCircle
              weight="fill"
              aria-hidden="true"
              data-testid="form-agreed-error-icon"
              className="mt-0.5 h-4 w-4 shrink-0 text-[var(--nt-accent)]"
            />
          )}
        </label>
        {errors.agreed && (
          <p id="form-agreed-error" role="alert" className="font-mono text-[11px] text-[var(--nt-accent)]">
            {errors.agreed}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isLoading}
          onClick={() => {
            const invalidSample = 'NP3-BAD-01';
            setDeviceSerial(invalidSample);
            setEmail('invalid');
            setAgreed(false);
            setSubmittedAt(null);
            setErrors(validateFields(invalidSample, 'invalid', false));
          }}
        >
          Trigger Errors
        </Button>
        <div className="flex items-center gap-2">
          <Button
            type="reset"
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            Reset
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={isLoading}
            loadingText="Provisioning..."
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

      <p className="border-t border-[var(--nt-line)] pt-2.5 font-mono text-[10px] text-[var(--nt-muted)]">
        Tip: Press Cmd+Enter or Ctrl+Enter anywhere in the form to provision.
      </p>

      {submittedAt && (
        <div
          role="status"
          data-testid="form-provisioned-status"
          className="flex items-center gap-2 rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] px-3 py-2 font-mono text-[11px] text-[var(--nt-success)]"
        >
          <CheckCircle className="h-3.5 w-3.5 shrink-0" />
          <span>
            Provisioned {deviceSerial.trim()} ({channel}) at {submittedAt}
            {lastTrigger === 'shortcut' ? ' via shortcut' : ''}
          </span>
        </div>
      )}
    </form>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 2. Native Select (Accessible OS-native <select> with optgroups & states)
 * ─────────────────────────────────────────────────────────────────────────── */
export function NativeSelectDemo() {
  const [region, setRegion] = React.useState('eu-london');
  const [invalidMode, setInvalidMode] = React.useState(false);

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="native-region-select" className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--nt-secondary)]">
            Edge Relay Region
          </label>
          <button
            type="button"
            onClick={() => setInvalidMode((v) => !v)}
            className="font-mono text-[10px] text-[var(--nt-muted)] hover:text-[var(--nt-display)] cursor-pointer"
          >
            {invalidMode ? 'Clear Error' : 'Preview Error'}
          </button>
        </div>

        <div className="relative">
          <select
            id="native-region-select"
            value={region}
            aria-invalid={invalidMode}
            onChange={(e) => setRegion(e.target.value)}
            className={cn(
              'h-11 w-full appearance-none rounded-xl border bg-[var(--nt-bg)] pl-3.5 pr-10 font-mono text-xs text-[var(--nt-display)] transition-colors focus:outline-none cursor-pointer',
              invalidMode
                ? 'border-[var(--nt-accent)]'
                : 'border-[var(--nt-line-2)] focus:border-[var(--nt-display)]',
            )}
          >
            <optgroup label="Europe">
              <option value="eu-london">London · LON-01 (11ms)</option>
              <option value="eu-berlin">Berlin · BER-04 (18ms)</option>
            </optgroup>
            <optgroup label="Americas">
              <option value="us-sfo">San Francisco · SFO-02 (24ms)</option>
              <option value="us-nyc">New York · NYC-08 (19ms)</option>
            </optgroup>
            <optgroup label="Asia-Pacific">
              <option value="ap-tokyo">Tokyo · TYO-03 (31ms)</option>
              <option value="ap-sgp" disabled>Singapore · SGP-01 (Maintenance)</option>
            </optgroup>
          </select>
          <CaretDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--nt-muted)]" />
        </div>

        {invalidMode ? (
          <p className="font-mono text-[11px] text-[var(--nt-accent)]">
            Selected relay requires signed hardware credentials.
          </p>
        ) : (
          <p className="font-mono text-[11px] text-[var(--nt-muted)]">
            Active native value: <span className="text-[var(--nt-display)]">{region}</span> · Zero JS popup overhead on iOS/Android.
          </p>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 3. Questionnaire (Multi-step survey with progress & summary)
 * ─────────────────────────────────────────────────────────────────────────── */
const QUESTIONNAIRE_STEPS = [
  {
    id: 'target',
    prompt: 'Which target platforms are you shipping Nothing UI to?',
    options: ['Web (React + Tailwind v4)', 'React Native / Expo', 'Both Web & React Native'],
  },
  {
    id: 'density',
    prompt: 'Select your preferred default telemetry density:',
    options: ['Compact (Hardware Lab)', 'Comfortable (Balanced)', 'Spacious (Editorial)'],
  },
  {
    id: 'glyph',
    prompt: 'Which Glyph Matrix resolution fits your hardware view?',
    options: ['25×25 (481 LEDs)', '13×13 (121 LEDs)', 'Dual Adaptive Matrix'],
  },
] as const;

export function QuestionnaireDemo() {
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({
    target: 'Both Web & React Native',
  });
  const [completed, setCompleted] = React.useState(false);

  const current = QUESTIONNAIRE_STEPS[step];
  const selected = answers[current.id];
  const progressPct = Math.round(((completed ? QUESTIONNAIRE_STEPS.length : step + 1) / QUESTIONNAIRE_STEPS.length) * 100);

  return (
    <div className="mx-auto w-full max-w-lg rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-5 space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between font-mono text-[11px] text-[var(--nt-muted)]">
          <span>
            {completed ? 'SURVEY COMPLETE' : `QUESTION ${step + 1} / ${QUESTIONNAIRE_STEPS.length}`}
          </span>
          <span className="tabular-nums text-[var(--nt-display)]">{progressPct}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--nt-raised)]">
          <div
            className="h-full bg-[var(--nt-accent)] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {completed ? (
        <div className="space-y-3 py-2">
          <div className="flex items-center gap-2 font-mono text-xs text-[var(--nt-display)]">
            <CheckCircle className="h-4 w-4 text-[var(--nt-accent)]" />
            <span>Configuration profile recorded</span>
          </div>
          <dl className="space-y-2 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-3 font-mono text-xs">
            {QUESTIONNAIRE_STEPS.map((q) => (
              <div key={q.id} className="flex items-center justify-between gap-3">
                <dt className="text-[var(--nt-muted)] uppercase">{q.id}</dt>
                <dd className="text-[var(--nt-display)] text-right">{answers[q.id] ?? '—'}</dd>
              </div>
            ))}
          </dl>
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
          <h3 className="font-mono text-sm text-[var(--nt-display)]">{current.prompt}</h3>
          <div className="space-y-2" role="radiogroup" aria-label={current.prompt}>
            {current.options.map((opt) => {
              const active = selected === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setAnswers((prev) => ({ ...prev, [current.id]: opt }))}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left font-mono text-xs transition-colors cursor-pointer',
                    active
                      ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                      : 'border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
                  )}
                >
                  <span>{opt}</span>
                  {active && <Check className="h-3.5 w-3.5 shrink-0" />}
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
              disabled={!selected}
              onClick={() => {
                if (step < QUESTIONNAIRE_STEPS.length - 1) setStep((s) => s + 1);
                else setCompleted(true);
              }}
            >
              {step === QUESTIONNAIRE_STEPS.length - 1 ? 'Finish' : 'Next →'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 4. Layer Dialog (Stacked multi-layer modal with nested depth scale)
 * ─────────────────────────────────────────────────────────────────────────── */
export function LayerDialogDemo() {
  const [depth, setDepth] = React.useState<0 | 1 | 2>(0);

  React.useEffect(() => {
    if (depth === 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDepth((d) => (d > 0 ? ((d - 1) as 0 | 1) : 0));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [depth]);

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <Button variant="primary" size="md" onClick={() => setDepth(1)}>
        Open Layer Dialog (Depth 1 → 2)
      </Button>
      <p className="font-mono text-[11px] text-[var(--nt-muted)]">
        Nested layers recess the parent surface smoothly and unwind one layer per Esc press.
      </p>

      {depth >= 1 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDepth((d) => (d > 0 ? ((d - 1) as 0 | 1) : 0));
          }}
        >
          {/* Layer 1 */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Primary firmware settings"
            className={cn(
              'relative w-full max-w-md rounded-2xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)] p-6 shadow-2xl transition-all duration-200',
              depth === 2 && 'scale-95 -translate-y-4 opacity-60 pointer-events-none',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nt-accent)]">
                  LAYER 01 · PRIMARY SURFACE
                </div>
                <h3 className="mt-1 font-display text-2xl text-[var(--nt-display)]">
                  Glyph Firmware Pack
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close layer 1"
                onClick={() => setDepth(0)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--nt-line)] text-[var(--nt-muted)] hover:text-[var(--nt-display)] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-[var(--nt-secondary)]">
              Inspecting signed LED LUT profiles. Open the stacked confirmation layer to flash over USB-C without losing parent context.
            </p>

            <div className="mt-5 flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setDepth(0)}>
                Dismiss
              </Button>
              <Button variant="signal" size="sm" onClick={() => setDepth(2)}>
                Push Layer 02 →
              </Button>
            </div>
          </div>

          {/* Layer 2 */}
          {depth === 2 && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Confirm firmware flash"
              className="fixed z-[60] w-[min(90vw,380px)] rounded-2xl border border-[var(--nt-display)] bg-[var(--nt-bg)] p-5 shadow-2xl space-y-4"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nt-accent)]">
                LAYER 02 · STACKED CONFIRMATION
              </div>
              <h4 className="font-mono text-sm font-medium text-[var(--nt-display)]">
                Commit 481-LED LUT to Hardware?
              </h4>
              <p className="text-xs text-[var(--nt-secondary)]">
                Pressing Escape pops Layer 02 back to Layer 01 cleanly.
              </p>
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setDepth(1)}>
                  Pop Layer
                </Button>
                <Button variant="primary" size="sm" onClick={() => setDepth(0)}>
                  Confirm &amp; Close All
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 5. Menubar (Application desktop menubar with shortcuts & checkboxes)
 * ─────────────────────────────────────────────────────────────────────────── */
export function MenubarDemo() {
  const [openMenu, setOpenMenu] = React.useState<'file' | 'edit' | 'view' | null>(null);
  const [showGrid, setShowGrid] = React.useState(true);
  const [highContrast, setHighContrast] = React.useState(false);
  const [lastAction, setLastAction] = React.useState('Ready · Click File, Edit, or View');

  const trigger = (label: string) => {
    setLastAction(`Executed: ${label}`);
    setOpenMenu(null);
  };

  return (
    <div className="mx-auto w-full max-w-lg space-y-3">
      <div
        role="menubar"
        aria-label="Application menubar"
        className="relative flex items-center gap-1 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-1.5 font-mono text-xs"
      >
        {(
          [
            {
              id: 'file',
              label: 'File',
              items: [
                { label: 'New Glyph Preset', shortcut: '⌘N', onClick: () => trigger('New Glyph Preset') },
                { label: 'Export SVG Matrix', shortcut: '⇧⌘E', onClick: () => trigger('Export SVG Matrix') },
                { label: 'Save Snapshot', shortcut: '⌘S', onClick: () => trigger('Save Snapshot') },
              ],
            },
            {
              id: 'edit',
              label: 'Edit',
              items: [
                { label: 'Undo Paint Stroke', shortcut: '⌘Z', onClick: () => trigger('Undo Paint Stroke') },
                { label: 'Invert Active LEDs', shortcut: '⌘I', onClick: () => trigger('Invert Active LEDs') },
                { label: 'Clear Matrix', shortcut: '⌫', onClick: () => trigger('Clear Matrix') },
              ],
            },
            {
              id: 'view',
              label: 'View',
              items: [
                {
                  label: `${showGrid ? '✓ ' : '  '}Show 25×25 Guides`,
                  shortcut: '⌘G',
                  onClick: () => {
                    setShowGrid((v) => !v);
                    setLastAction(`Guides ${!showGrid ? 'enabled' : 'hidden'}`);
                    setOpenMenu(null);
                  },
                },
                {
                  label: `${highContrast ? '✓ ' : '  '}WCAG AAA Preview`,
                  shortcut: '⌘H',
                  onClick: () => {
                    setHighContrast((v) => !v);
                    setLastAction(`AAA preview ${!highContrast ? 'enabled' : 'disabled'}`);
                    setOpenMenu(null);
                  },
                },
              ],
            },
          ] as const
        ).map((menu) => (
          <div key={menu.id} className="relative">
            <button
              type="button"
              role="menuitem"
              aria-haspopup="menu"
              aria-expanded={openMenu === menu.id}
              onClick={() => setOpenMenu((curr) => (curr === menu.id ? null : menu.id))}
              className={cn(
                'rounded-lg px-3 py-1.5 transition-colors cursor-pointer',
                openMenu === menu.id
                  ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'text-[var(--nt-secondary)] hover:bg-[var(--nt-raised)] hover:text-[var(--nt-display)]',
              )}
            >
              {menu.label}
            </button>
            {openMenu === menu.id && (
              <div
                role="menu"
                className="absolute left-0 top-full z-30 mt-2 w-56 rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)] p-1.5 shadow-2xl"
              >
                {menu.items.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    role="menuitem"
                    onClick={item.onClick}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs text-[var(--nt-primary)] hover:bg-[var(--nt-raised)] hover:text-[var(--nt-display)] cursor-pointer"
                  >
                    <span>{item.label}</span>
                    <kbd className="font-mono text-[10px] text-[var(--nt-muted)]">{item.shortcut}</kbd>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] px-3.5 py-2.5 font-mono text-[11px] text-[var(--nt-secondary)]">
        {lastAction}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 6. Navigation Menu (Horizontal mega-menu with dropdown panels)
 * ─────────────────────────────────────────────────────────────────────────── */
export function NavigationMenuDemo() {
  const [openSection, setOpenSection] = React.useState<'system' | 'packages' | null>('system');
  const [selectedLink, setSelectedLink] = React.useState('nthgui/glyph');

  return (
    <div className="mx-auto w-full max-w-xl space-y-3">
      <nav aria-label="Primary mega menu" className="relative rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-2">
        <div className="flex flex-wrap items-center gap-1 font-mono text-xs">
          <button
            type="button"
            aria-expanded={openSection === 'system'}
            onClick={() => setOpenSection((s) => (s === 'system' ? null : 'system'))}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 cursor-pointer transition-colors',
              openSection === 'system'
                ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
            )}
          >
            <span>Design System</span>
            <CaretDown className="h-3 w-3" />
          </button>
          <button
            type="button"
            aria-expanded={openSection === 'packages'}
            onClick={() => setOpenSection((s) => (s === 'packages' ? null : 'packages'))}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 cursor-pointer transition-colors',
              openSection === 'packages'
                ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
            )}
          >
            <span>Subpaths</span>
            <CaretDown className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => {
              setOpenSection(null);
              setSelectedLink('CLI: npx nthgui init');
            }}
            className="rounded-lg px-3 py-1.5 text-[var(--nt-secondary)] hover:text-[var(--nt-display)] cursor-pointer"
          >
            CLI Docs
          </button>
        </div>

        {openSection && (
          <div className="mt-2 grid grid-cols-1 gap-2 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-3 sm:grid-cols-2">
            {(openSection === 'system'
              ? [
                  { title: 'Glyph Matrix Core', desc: '13×13 and 25×25 circular LED matrices', icon: Sparkle, key: 'nthgui/glyph' },
                  { title: 'Dot Icons', desc: '1,691 configurable dot-matrix icons (incl. full Lucide)', icon: Compass, key: 'nthgui/icons' },
                  { title: 'Hardware Controls', desc: 'RotaryKnob, LEDIndicator, SignalMeter', icon: SlidersHorizontal, key: 'nthgui' },
                  { title: 'React Native Parity', desc: 'All 136 components mapped to RN primitives', icon: Folder, key: 'nthgui/native' },
                ]
              : [
                  { title: 'nthgui', desc: 'Core Web components & ThemeProvider', icon: Terminal, key: 'nthgui' },
                  { title: 'nthgui/native', desc: 'Expo & React Native components', icon: Stack, key: 'nthgui/native' },
                  { title: 'nthgui/tokens', desc: 'OLED Dark, Light & AAA token sets', icon: Sparkle, key: 'nthgui/tokens' },
                  { title: 'nthgui/styles.css', desc: 'Zero-config CSS variables & dot-field', icon: Compass, key: 'nthgui/styles.css' },
                ]
            ).map(({ title, desc, icon: Icon, key }) => (
              <button
                key={title}
                type="button"
                onClick={() => setSelectedLink(key)}
                className={cn(
                  'flex items-start gap-2.5 rounded-lg border p-2.5 text-left transition-colors cursor-pointer',
                  selectedLink === key
                    ? 'border-[var(--nt-display)] bg-[var(--nt-bg)]'
                    : 'border-transparent hover:border-[var(--nt-line)] hover:bg-[var(--nt-bg)]/60',
                )}
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--nt-accent)]" />
                <div>
                  <div className="font-mono text-xs font-medium text-[var(--nt-display)]">{title}</div>
                  <div className="mt-0.5 text-[11px] text-[var(--nt-muted)]">{desc}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </nav>
      <div className="font-mono text-[11px] text-[var(--nt-muted)]">
        Active destination: <span className="text-[var(--nt-display)]">{selectedLink}</span>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 7. Layer Card (Multi-depth stacked hardware surface card)
 * ─────────────────────────────────────────────────────────────────────────── */
export function LayerCardDemo() {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="mx-auto w-full max-w-md py-4">
      <div className="relative">
        {/* Back layer 2 */}
        <div
          aria-hidden="true"
          className={cn(
            'absolute inset-x-4 -top-4 h-full rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-raised)]/50 transition-all duration-300',
            expanded && '-top-7 inset-x-2 opacity-90',
          )}
        />
        {/* Back layer 1 */}
        <div
          aria-hidden="true"
          className={cn(
            'absolute inset-x-2 -top-2 h-full rounded-2xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)]/80 transition-all duration-300',
            expanded && '-top-3.5 inset-x-1',
          )}
        />

        {/* Front primary card */}
        <div className="relative rounded-2xl border border-[var(--nt-line-2)] bg-[var(--nt-bg)] p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em]">
            <span className="text-[var(--nt-accent)]">3-LAYER HARDWARE DECK</span>
            <span className="text-[var(--nt-muted)]">ELEVATION Z-3</span>
          </div>
          <h3 className="font-display text-2xl text-[var(--nt-display)]">Nothing Ear (3) Telemetry</h3>
          <p className="text-xs leading-relaxed text-[var(--nt-secondary)]">
            Stacked physical card elevation communicating queue depth without heavy blur shadows.
          </p>

          {expanded && (
            <div className="grid grid-cols-3 gap-2 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-3 font-mono text-[11px]">
              <div>
                <div className="text-[var(--nt-muted)]">LEFT</div>
                <div className="text-[var(--nt-display)] tabular-nums">94%</div>
              </div>
              <div>
                <div className="text-[var(--nt-muted)]">RIGHT</div>
                <div className="text-[var(--nt-display)] tabular-nums">92%</div>
              </div>
              <div>
                <div className="text-[var(--nt-muted)]">CASE</div>
                <div className="text-[var(--nt-accent)] tabular-nums">78%</div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="font-mono text-[11px] text-[var(--nt-muted)]">
              {expanded ? 'Showing nested stack metadata' : '2 stacked cards behind'}
            </span>
            <Button variant="outline" size="sm" onClick={() => setExpanded((v) => !v)}>
              {expanded ? 'Collapse Stack' : 'Inspect Layers'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 8. Marker (Precision status, coordinate, & numeric markers)
 * ─────────────────────────────────────────────────────────────────────────── */
export function MarkerDemo() {
  const [activePin, setActivePin] = React.useState<'lon' | 'tyo' | 'sfo'>('lon');
  const pins = [
    { id: 'lon' as const, label: 'LON-01', x: '28%', y: '34%', latency: '11ms', tone: 'signal' },
    { id: 'sfo' as const, label: 'SFO-02', x: '16%', y: '48%', latency: '24ms', tone: 'default' },
    { id: 'tyo' as const, label: 'TYO-03', x: '78%', y: '42%', latency: '31ms', tone: 'default' },
  ];

  const selected = pins.find((p) => p.id === activePin)!;

  return (
    <div className="mx-auto w-full max-w-lg space-y-4">
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] px-4 py-3 font-mono text-xs">
        <span className="inline-flex items-center gap-2 text-[var(--nt-display)]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--nt-accent)] opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--nt-accent)]" />
          </span>
          LIVE SIGNAL
        </span>
        <span className="inline-flex items-center gap-2 text-[var(--nt-secondary)]">
          <span className="h-2 w-2 rounded-full bg-[var(--nt-display)]" />
          NOMINAL
        </span>
        <span className="inline-flex items-center gap-1.5 text-[var(--nt-secondary)]">
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-[var(--nt-display)] px-1 text-[10px] text-[var(--nt-display)] tabular-nums">
            04
          </span>
          INDEX MARKER
        </span>
      </div>

      <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)]">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: 'radial-gradient(var(--nt-muted) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        />
        {pins.map((pin) => {
          const isSelected = pin.id === activePin;
          return (
            <button
              key={pin.id}
              type="button"
              onClick={() => setActivePin(pin.id)}
              style={{ left: pin.x, top: pin.y }}
              className={cn(
                'absolute -translate-x-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] transition-all cursor-pointer',
                isSelected
                  ? 'border-[var(--nt-accent)] bg-[var(--nt-accent)] text-white scale-105'
                  : 'border-[var(--nt-line-2)] bg-[var(--nt-surface)] text-[var(--nt-display)] hover:border-[var(--nt-display)]',
              )}
            >
              <MapPin className="h-3 w-3" weight="fill" />
              <span>{pin.label}</span>
            </button>
          );
        })}
        <div className="absolute bottom-2.5 right-3 font-mono text-[11px] text-[var(--nt-muted)]">
          Selected Marker: <span className="text-[var(--nt-display)]">{selected.label}</span> · {selected.latency}
        </div>
      </div>
    </div>
  );
}
