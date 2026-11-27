/**
 * Pure form interaction and accessible validation helpers for Nothing UI.
 * Decoupled from React/DOM so shortcut detection and aria-invalid state logic
 * can be verified deterministically with node:test.
 */

export interface SubmitShortcutEventLike {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  isComposing?: boolean;
  defaultPrevented?: boolean;
}

export type AriaInvalidInput = boolean | 'true' | 'false' | 'grammar' | 'spelling' | undefined;

/**
 * Returns true when the keyboard event represents Cmd+Enter (macOS) or Ctrl+Enter (Windows/Linux)
 * without conflicting Alt/Shift modifiers or active IME composition.
 */
export function isFormSubmitShortcut(event: SubmitShortcutEventLike): boolean {
  if (event.defaultPrevented || event.isComposing) return false;
  if (event.key !== 'Enter') return false;
  if (!event.metaKey && !event.ctrlKey) return false;
  if (event.altKey || event.shiftKey) return false;
  return true;
}

/**
 * Evaluates a standard WAI-ARIA `aria-invalid` attribute value into a strict boolean.
 */
export function isAriaInvalidValue(value: AriaInvalidInput): boolean {
  return value === true || value === 'true' || value === 'grammar' || value === 'spelling';
}

/**
 * Formats a concise hardware-style keyboard shortcut badge for form submission.
 */
export function formatSubmitShortcutLabel(platform?: string): string {
  const source =
    platform ??
    (typeof navigator !== 'undefined'
      ? `${navigator.platform ?? ''} ${navigator.userAgent ?? ''}`
      : '');
  if (/mac|iphone|ipad|ipod/i.test(source)) {
    return '⌘↵';
  }
  if (source.trim().length === 0) {
    return '⌘/Ctrl+↵';
  }
  return 'Ctrl+↵';
}

/**
 * Tailwind class string bound directly to the native `aria-invalid="true"` attribute
 * so invalid fields consistently display Signal Red borders, focus rings, surface wash,
 * and clearance for a trailing error icon.
 */
export const ARIA_INVALID_INPUT_CLASSES =
  'aria-[invalid=true]:border-[var(--nt-accent)] aria-[invalid=true]:bg-[var(--nt-accent)]/[0.06] aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-[var(--nt-accent)]/35 aria-[invalid=true]:pr-9 aria-[invalid=true]:focus:border-[var(--nt-accent)] aria-[invalid=true]:focus:ring-2 aria-[invalid=true]:focus:ring-[var(--nt-accent)]/45';

/* ───────────────────────────────────────────────────────────────────────────
 * Customizable Regex-Based Input & Form Validation Engine
 * ─────────────────────────────────────────────────────────────────────────── */

export const DEVICE_SERIAL_FORMAT = 'NP3-XXX-X';
export const DEVICE_SERIAL_REGEX_SOURCE = '^NP3-[A-Z0-9]{3}-[A-Z0-9]$';
export const DEVICE_SERIAL_PATTERN = new RegExp(DEVICE_SERIAL_REGEX_SOURCE);

export type RegexNormalizationMode = 'none' | 'uppercase' | 'lowercase';

export interface RegexValidationRule {
  /** Regular expression instance or raw pattern string (e.g. '^NP3-[A-Z0-9]{3}-[A-Z0-9]$'). */
  pattern: RegExp | string;
  /** Optional regex flags used when `pattern` is a string (stateful g/y flags are ignored safely). */
  flags?: string;
  /** Human-readable format mask shown in helper hints and Nothing UI documentation errors. */
  formatLabel?: string;
  /** Example value satisfying the pattern (e.g. 'NP3-481-A'). */
  example?: string;
  /** Custom error message shown when a non-empty value fails to match the pattern. */
  message?: string;
  /** Custom error message shown when `required` is true and the value is empty. */
  requiredMessage?: string;
  /** Whether an empty value is invalid (default: true). */
  required?: boolean;
  /** Whether leading/trailing whitespace is stripped before testing (default: true). */
  trim?: boolean;
  /** Optional case normalization applied prior to matching (default: 'none'). */
  normalize?: RegexNormalizationMode;
}

export interface RegexValidationPreset extends RegexValidationRule {
  id: string;
  label: string;
  pattern: string;
  flags: string;
  formatLabel: string;
  example: string;
  message: string;
  requiredMessage: string;
}

export interface CompiledRegexResult {
  regex: RegExp | null;
  source: string;
  flags: string;
  error?: string;
}

export interface RegexValidationResult {
  valid: boolean;
  invalidPattern: boolean;
  error?: string;
  patternSource?: string;
  patternFlags?: string;
  testedValue: string;
}

export const REGEX_VALIDATION_PRESETS: Record<
  'deviceSerial' | 'telemetryEmail' | 'firmwareTag' | 'tokenKey' | 'macAddress',
  RegexValidationPreset
> = {
  deviceSerial: {
    id: 'device-serial',
    label: 'Device Serial',
    formatLabel: DEVICE_SERIAL_FORMAT,
    pattern: DEVICE_SERIAL_REGEX_SOURCE,
    flags: '',
    example: 'NP3-481-A',
    required: true,
    requiredMessage: 'Device Serial is required. Expected format: NP3-XXX-X (e.g. NP3-481-A).',
    message:
      'Invalid Device Serial. Must match NP3-XXX-X (3 uppercase alphanumerics, hyphen, 1 check char — e.g. NP3-481-A).',
  },
  telemetryEmail: {
    id: 'telemetry-email',
    label: 'Telemetry Email',
    formatLabel: 'name@domain.tld',
    pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
    flags: '',
    example: 'ops@nthgui.dev',
    required: true,
    requiredMessage: 'Telemetry Contact is required. Expected format: name@domain.tld.',
    message: 'Invalid Telemetry Contact. Expected a valid email address (e.g. ops@nthgui.dev).',
  },
  firmwareTag: {
    id: 'firmware-tag',
    label: 'Firmware Tag',
    formatLabel: 'OS-X.Y.Z',
    pattern: '^OS-\\d+\\.\\d+\\.\\d+$',
    flags: '',
    example: 'OS-3.2.1',
    required: true,
    requiredMessage: 'Firmware Tag is required. Expected format: OS-X.Y.Z.',
    message: 'Invalid Firmware Tag. Must match OS-X.Y.Z semantic format (e.g. OS-3.2.1).',
  },
  tokenKey: {
    id: 'token-key',
    label: 'Token Key',
    formatLabel: 'nt_live_XXXXXXXX',
    pattern: '^nt_live_[A-Za-z0-9]{8,}$',
    flags: '',
    example: 'nt_live_481A9C02',
    required: true,
    requiredMessage: 'Token Key is required. Expected format: nt_live_XXXXXXXX.',
    message: 'Invalid Token Key. Must begin with nt_live_ followed by 8+ alphanumeric characters.',
  },
  macAddress: {
    id: 'mac-address',
    label: 'BLE Hardware MAC',
    formatLabel: 'XX:XX:XX:XX:XX:XX',
    pattern: '^([0-9A-F]{2}:){5}[0-9A-F]{2}$',
    flags: '',
    example: 'A4:8E:01:48:1F:03',
    required: true,
    requiredMessage: 'Hardware MAC is required. Expected format: XX:XX:XX:XX:XX:XX.',
    message: 'Invalid Hardware MAC. Must match XX:XX:XX:XX:XX:XX in uppercase hexadecimal.',
  },
};

const ALLOWED_REGEX_FLAGS = new Set(['i', 'm', 's', 'u', 'v']);

/**
 * Safely compiles a RegExp or raw pattern string + flags for input validation.
 * Strips stateful `g` / `y` flags so repeated `.test()` calls remain deterministic,
 * and returns a structured diagnostic error instead of throwing on invalid syntax.
 */
export function compileValidationRegex(
  pattern: RegExp | string,
  flags?: string,
): CompiledRegexResult {
  const rawSource = pattern instanceof RegExp ? pattern.source : pattern;
  const rawFlags = pattern instanceof RegExp ? (flags ?? pattern.flags) : (flags ?? '');

  if (typeof pattern === 'string' && rawSource.trim().length === 0) {
    return {
      regex: null,
      source: '',
      flags: '',
      error: 'Validation regex pattern cannot be empty.',
    };
  }

  const dedupedFlags: string[] = [];
  for (const ch of rawFlags) {
    if (ch === 'g' || ch === 'y') continue;
    if (!ALLOWED_REGEX_FLAGS.has(ch)) {
      return {
        regex: null,
        source: rawSource,
        flags: rawFlags,
        error: `Unsupported regex flag "${ch}". Supported flags: i, m, s, u, v.`,
      };
    }
    if (!dedupedFlags.includes(ch)) {
      dedupedFlags.push(ch);
    }
  }

  const safeFlags = dedupedFlags.join('');
  try {
    const regex = new RegExp(rawSource, safeFlags);
    return { regex, source: regex.source, flags: regex.flags };
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'Syntax error in regular expression.';
    return {
      regex: null,
      source: rawSource,
      flags: safeFlags,
      error: `Invalid regex pattern: ${detail}`,
    };
  }
}

/**
 * Formats a Nothing UI documentation-style error string when a custom message is omitted.
 */
export function formatRegexErrorMessage(rule: RegexValidationRule, compiled: CompiledRegexResult): string {
  if (rule.message && rule.message.trim().length > 0) {
    return rule.message.trim();
  }
  const mask = rule.formatLabel?.trim();
  const exampleSuffix = rule.example?.trim() ? ` (e.g. ${rule.example.trim()})` : '';
  if (mask) {
    return `Format mismatch. Expected ${mask}${exampleSuffix}.`;
  }
  const flagPart = compiled.flags ? compiled.flags : '';
  return `Value does not match pattern /${compiled.source}/${flagPart}${exampleSuffix}.`;
}

/**
 * Evaluates an input value against any customized RegexValidationRule.
 */
export function validateWithRegex(
  value: string,
  rule: RegexValidationRule,
): RegexValidationResult {
  const trim = rule.trim ?? true;
  const required = rule.required ?? true;
  const normalize = rule.normalize ?? 'none';

  let testedValue = trim ? value.trim() : value;
  if (normalize === 'uppercase') {
    testedValue = testedValue.toUpperCase();
  } else if (normalize === 'lowercase') {
    testedValue = testedValue.toLowerCase();
  }

  const compiled = compileValidationRegex(rule.pattern, rule.flags);
  if (!compiled.regex) {
    return {
      valid: false,
      invalidPattern: true,
      error: compiled.error,
      patternSource: compiled.source,
      patternFlags: compiled.flags,
      testedValue,
    };
  }

  if (testedValue.length === 0) {
    if (!required) {
      return {
        valid: true,
        invalidPattern: false,
        patternSource: compiled.source,
        patternFlags: compiled.flags,
        testedValue,
      };
    }
    const fallbackRequired = rule.formatLabel
      ? `Field is required. Expected format: ${rule.formatLabel}${rule.example ? ` (e.g. ${rule.example})` : ''}.`
      : 'This field is required.';
    return {
      valid: false,
      invalidPattern: false,
      error: rule.requiredMessage?.trim() || fallbackRequired,
      patternSource: compiled.source,
      patternFlags: compiled.flags,
      testedValue,
    };
  }

  const matched = compiled.regex.test(testedValue);
  if (!matched) {
    return {
      valid: false,
      invalidPattern: false,
      error: formatRegexErrorMessage(rule, compiled),
      patternSource: compiled.source,
      patternFlags: compiled.flags,
      testedValue,
    };
  }

  return {
    valid: true,
    invalidPattern: false,
    patternSource: compiled.source,
    patternFlags: compiled.flags,
    testedValue,
  };
}

/**
 * Validates a Nothing hardware Device Serial against the standard NP3-XXX-X spec
 * (`^NP3-[A-Z0-9]{3}-[A-Z0-9]$`) with optional rule customization.
 */
export function validateDeviceSerial(
  value: string,
  overrideRule?: Partial<RegexValidationRule>,
): RegexValidationResult {
  return validateWithRegex(value, {
    ...REGEX_VALIDATION_PRESETS.deviceSerial,
    ...overrideRule,
  });
}

/**
 * Validates a keyed map of string form values against a map of RegexValidationRule definitions,
 * returning a field-keyed error dictionary containing only failing fields.
 */
export function validateFormSchema(
  values: Record<string, string>,
  rules: Record<string, RegexValidationRule>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const [field, rule] of Object.entries(rules)) {
    const result = validateWithRegex(values[field] ?? '', rule);
    if (!result.valid && result.error) {
      errors[field] = result.error;
    }
  }
  return errors;
}
