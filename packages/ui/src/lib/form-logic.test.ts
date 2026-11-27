import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ARIA_INVALID_INPUT_CLASSES,
  DEVICE_SERIAL_FORMAT,
  DEVICE_SERIAL_PATTERN,
  REGEX_VALIDATION_PRESETS,
  compileValidationRegex,
  formatSubmitShortcutLabel,
  isAriaInvalidValue,
  isFormSubmitShortcut,
  validateDeviceSerial,
  validateFormSchema,
  validateWithRegex,
} from './form-logic';

test('isFormSubmitShortcut detects Cmd+Enter and Ctrl+Enter while rejecting non-matching keys', () => {
  assert.equal(isFormSubmitShortcut({ key: 'Enter', metaKey: true }), true);
  assert.equal(isFormSubmitShortcut({ key: 'Enter', ctrlKey: true }), true);
  assert.equal(isFormSubmitShortcut({ key: 'Enter', metaKey: true, ctrlKey: true }), true);

  assert.equal(isFormSubmitShortcut({ key: 'Enter' }), false);
  assert.equal(isFormSubmitShortcut({ key: 'Enter', metaKey: true, shiftKey: true }), false);
  assert.equal(isFormSubmitShortcut({ key: 'Enter', ctrlKey: true, altKey: true }), false);
  assert.equal(isFormSubmitShortcut({ key: 'Enter', metaKey: true, isComposing: true }), false);
  assert.equal(isFormSubmitShortcut({ key: 'Enter', ctrlKey: true, defaultPrevented: true }), false);
  assert.equal(isFormSubmitShortcut({ key: 'Escape', metaKey: true }), false);
});

test('isAriaInvalidValue evaluates standard ARIA invalid attribute states accurately', () => {
  assert.equal(isAriaInvalidValue(true), true);
  assert.equal(isAriaInvalidValue('true'), true);
  assert.equal(isAriaInvalidValue('grammar'), true);
  assert.equal(isAriaInvalidValue('spelling'), true);

  assert.equal(isAriaInvalidValue(false), false);
  assert.equal(isAriaInvalidValue('false'), false);
  assert.equal(isAriaInvalidValue(undefined), false);
});

test('formatSubmitShortcutLabel formats platform-appropriate shortcut hints and invalid classes target aria-invalid', () => {
  assert.equal(formatSubmitShortcutLabel('MacIntel'), '⌘↵');
  assert.equal(formatSubmitShortcutLabel('Linux x86_64'), 'Ctrl+↵');
  assert.equal(formatSubmitShortcutLabel('Win32'), 'Ctrl+↵');
  assert.equal(formatSubmitShortcutLabel(''), '⌘/Ctrl+↵');
  assert.match(ARIA_INVALID_INPUT_CLASSES, /aria-\[invalid=true\]:border-\[var\(--nt-accent\)\]/);
});

test('validateDeviceSerial enforces exact NP3-XXX-X format with Nothing UI documentation-style error messages', () => {
  assert.equal(DEVICE_SERIAL_FORMAT, 'NP3-XXX-X');
  assert.equal(DEVICE_SERIAL_PATTERN.test('NP3-481-A'), true);

  // Valid NP3-XXX-X serials
  for (const serial of ['NP3-481-A', 'NP3-000-0', 'NP3-A9Z-7', '  NP3-LAB-9  ']) {
    const res = validateDeviceSerial(serial);
    assert.equal(res.valid, true, `Expected ${serial} to be valid`);
    assert.equal(res.invalidPattern, false);
    assert.equal(res.error, undefined);
  }

  // Empty serial returns required NP3-XXX-X message
  const emptyRes = validateDeviceSerial('   ');
  assert.equal(emptyRes.valid, false);
  assert.match(emptyRes.error ?? '', /NP3-XXX-X/);
  assert.match(emptyRes.error ?? '', /required/i);

  // Invalid formats fail cleanly with NP3-XXX-X message
  for (const bad of ['NP3-CORE-01', 'NP2-481-A', 'np3-481-a', 'NP3-48-A', 'NP3-481-AB', 'NP3481A']) {
    const res = validateDeviceSerial(bad);
    assert.equal(res.valid, false, `Expected ${bad} to be invalid`);
    assert.equal(res.invalidPattern, false);
    assert.match(res.error ?? '', /NP3-XXX-X/);
  }
});

test('validateWithRegex supports arbitrary custom patterns, flags, normalization, and optional required toggle', () => {
  // Custom string regex + case-insensitive flag
  const caseInsensitive = validateWithRegex('lab-42', {
    pattern: '^LAB-\\d{2}$',
    flags: 'i',
    formatLabel: 'LAB-NN',
    message: 'Enter a two-digit lab identifier (LAB-NN).',
  });
  assert.equal(caseInsensitive.valid, true);

  // Custom failure uses custom message
  const customFail = validateWithRegex('LAB-999', {
    pattern: '^LAB-\\d{2}$',
    message: 'Enter a two-digit lab identifier (LAB-NN).',
  });
  assert.equal(customFail.valid, false);
  assert.equal(customFail.error, 'Enter a two-digit lab identifier (LAB-NN).');

  // Auto-generated Nothing UI doc-style error when message omitted
  const autoMsg = validateWithRegex('bad', {
    pattern: '^OS-\\d+\\.\\d+$',
    formatLabel: 'OS-X.Y',
    example: 'OS-3.2',
  });
  assert.equal(autoMsg.valid, false);
  assert.equal(autoMsg.error, 'Format mismatch. Expected OS-X.Y (e.g. OS-3.2).');

  // Uppercase normalization before regex check
  const normalized = validateWithRegex('np3-481-a', {
    ...REGEX_VALIDATION_PRESETS.deviceSerial,
    normalize: 'uppercase',
  });
  assert.equal(normalized.valid, true);
  assert.equal(normalized.testedValue, 'NP3-481-A');

  // Optional empty value passes when required is false
  const optionalEmpty = validateWithRegex('', {
    pattern: '^NP3-[A-Z0-9]{3}-[A-Z0-9]$',
    required: false,
  });
  assert.equal(optionalEmpty.valid, true);
});

test('compileValidationRegex handles malformed regex, unsupported flags, and strips stateful g/y flags safely', () => {
  const broken = compileValidationRegex('^NP3-[unclosed');
  assert.equal(broken.regex, null);
  assert.match(broken.error ?? '', /Invalid regex pattern/i);

  const badFlag = compileValidationRegex('^NP3$', 'z');
  assert.equal(badFlag.regex, null);
  assert.match(badFlag.error ?? '', /Unsupported regex flag/i);

  const emptyPat = compileValidationRegex('   ');
  assert.equal(emptyPat.regex, null);
  assert.match(emptyPat.error ?? '', /cannot be empty/i);

  // Malformed regex passed to validateWithRegex never throws
  const safeFail = validateWithRegex('NP3-481-A', { pattern: '^NP3-(' });
  assert.equal(safeFail.valid, false);
  assert.equal(safeFail.invalidPattern, true);
  assert.match(safeFail.error ?? '', /Invalid regex pattern/i);

  // Stateful /g flag stripped so consecutive calls are deterministic
  const globalRegex = /^NP3-[A-Z0-9]{3}-[A-Z0-9]$/g;
  assert.equal(validateWithRegex('NP3-481-A', { pattern: globalRegex }).valid, true);
  assert.equal(validateWithRegex('NP3-481-A', { pattern: globalRegex }).valid, true);
});

test('validateFormSchema evaluates multiple fields with custom regex presets', () => {
  const errors = validateFormSchema(
    { serial: 'NP3-BAD-11', email: 'ops@nthgui.dev', token: 'bad_token' },
    {
      serial: REGEX_VALIDATION_PRESETS.deviceSerial,
      email: REGEX_VALIDATION_PRESETS.telemetryEmail,
      token: REGEX_VALIDATION_PRESETS.tokenKey,
    },
  );
  assert.equal(Object.keys(errors).length, 2);
  assert.match(errors.serial, /NP3-XXX-X/);
  assert.equal(errors.email, undefined);
  assert.match(errors.token, /nt_live_/);
});
