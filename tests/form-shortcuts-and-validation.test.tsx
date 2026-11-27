import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { REGEX_VALIDATION_PRESETS } from '@nothing-ui/ui';
import { FormDemo as CompleteFormDemo } from '../apps/ui/src/demos/complete/forms-overlays';
import {
  FormDemo as V04FormDemo,
  useValidation,
} from '../apps/ui/src/demos/expanded/v04-forms-overlays-layout';
import { NothingInput } from '../src/components/nothing/Input';

// ui-sdk's screen-reader announcer keeps the last message in a hidden live region after the
// visible error clears, so "error is gone" checks must look past it.
const IGNORE_LIVE_REGION = 'script, style, [data-ui-sdk-announcer]';

describe('Form keyboard shortcuts, NP3-XXX-X Device Serial validation & custom regex support', () => {
  it('enforces NP3-XXX-X Device Serial format, renders aria-invalid indicators, and triggers Provision Device via Cmd/Ctrl+Enter in complete FormDemo', async () => {
    const user = userEvent.setup();
    render(<CompleteFormDemo />);

    const serialInput = screen.getByLabelText('Device Serial');
    const emailInput = screen.getByLabelText('Telemetry Contact');
    const submitBtn = screen.getByRole('button', { name: /Provision Device/i });

    expect(submitBtn).toHaveAttribute('aria-keyshortcuts', 'Meta+Enter Control+Enter');
    expect(serialInput).toHaveValue('NP3-481-A');
    expect(serialInput).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByTestId('form-device-serial-error-icon')).not.toBeInTheDocument();

    // Trigger invalid states -> NP3-BAD-01 fails NP3-XXX-X check with Nothing UI error copy + Signal Red indicators
    await user.click(screen.getByRole('button', { name: 'Trigger Errors' }));
    expect(serialInput).toHaveAttribute('aria-invalid', 'true');
    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    expect(serialInput.className).toContain('aria-[invalid=true]:border-[var(--nt-accent)]');
    expect(emailInput.className).toContain('aria-[invalid=true]:border-[var(--nt-accent)]');
    expect(screen.getByTestId('form-device-serial-error')).toHaveTextContent(/NP3-XXX-X/);
    expect(screen.getByTestId('form-device-serial-error-icon')).toBeInTheDocument();
    expect(screen.getByTestId('form-email-error-icon')).toBeInTheDocument();
    expect(screen.getByTestId('form-agreed-error-icon')).toBeInTheDocument();
    expect(screen.getByTestId('form-error-summary')).toBeInTheDocument();

    // Entering another non-matching serial keeps aria-invalid true
    await user.clear(serialInput);
    await user.type(serialInput, 'NP2-481-A');
    expect(serialInput).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByTestId('form-device-serial-error')).toHaveTextContent(/NP3-XXX-X/);

    // Fix fields with valid NP3-XXX-X serial -> aria-invalid and error icons clear immediately
    await user.clear(serialInput);
    await user.type(serialInput, 'NP3-LAB-9');
    expect(serialInput).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByTestId('form-device-serial-error-icon')).not.toBeInTheDocument();

    await user.clear(emailInput);
    await user.type(emailInput, 'lab@nothing.tech');
    expect(emailInput).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByTestId('form-email-error-icon')).not.toBeInTheDocument();

    const consentCheckbox = screen.getByRole('checkbox');
    await user.click(consentCheckbox);

    // Press Cmd+Enter inside an input -> triggers Provision Device action without clicking button
    fireEvent.keyDown(emailInput, { key: 'Enter', metaKey: true });

    await waitFor(
      () => {
        expect(screen.getByTestId('form-provisioned-status')).toHaveTextContent(
          /Provisioned NP3-LAB-9 \(stable\).*via shortcut/i,
        );
      },
      { timeout: 2000 },
    );

    // Press Ctrl+Enter inside serial input -> also triggers Provision Device cleanly
    await user.clear(serialInput);
    await user.type(serialInput, 'NP3-777-Z');
    fireEvent.keyDown(serialInput, { key: 'Enter', ctrlKey: true });

    await waitFor(
      () => {
        expect(screen.getByTestId('form-provisioned-status')).toHaveTextContent(
          /Provisioned NP3-777-Z \(stable\).*via shortcut/i,
        );
      },
      { timeout: 2000 },
    );
  });

  it('supports full customized regex validation rules (pattern, flags, custom error copy, syntax diagnostics) inside complete FormDemo', async () => {
    const user = userEvent.setup();
    render(<CompleteFormDemo />);

    const serialInput = screen.getByLabelText('Device Serial');
    await user.click(screen.getByRole('button', { name: 'Customize Regex' }));
    expect(screen.getByTestId('form-regex-configurator')).toBeInTheDocument();

    const patternInput = screen.getByLabelText('Regex Pattern');
    const flagsInput = screen.getByLabelText('Flags');
    const messageInput = screen.getByLabelText('Custom Error Message');

    // Enter a malformed regex -> displays safe syntax error without crashing
    await user.clear(patternInput);
    fireEvent.change(patternInput, { target: { value: '^LAB-[' } });
    expect(screen.getByTestId('form-regex-live-status')).toHaveTextContent('Syntax Error');
    expect(screen.getByTestId('form-device-serial-error')).toHaveTextContent(/Invalid regex pattern/i);

    // Enter a valid custom regex + case-insensitive flag + custom error message
    fireEvent.change(patternInput, { target: { value: '^LAB-\\d{2}$' } });
    await user.clear(flagsInput);
    await user.type(flagsInput, 'i');
    await user.clear(messageInput);
    await user.type(messageInput, 'Custom rule: expected LAB-NN format.');

    // Current value NP3-481-A fails the new custom regex on submit
    fireEvent.keyDown(serialInput, { key: 'Enter', ctrlKey: true });
    expect(serialInput).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByTestId('form-device-serial-error')).toHaveTextContent(
      'Custom rule: expected LAB-NN format.',
    );

    // Matching lowercase input passes because `i` flag is set
    await user.clear(serialInput);
    await user.type(serialInput, 'lab-42');
    expect(serialInput).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByTestId('form-regex-live-status')).toHaveTextContent('Live Match');

    fireEvent.keyDown(serialInput, { key: 'Enter', metaKey: true });
    await waitFor(
      () => {
        expect(screen.getByTestId('form-provisioned-status')).toHaveTextContent(
          /Provisioned lab-42/i,
        );
      },
      { timeout: 2000 },
    );
  });

  it('enforces NP3-XXX-X format and triggers Provision Device via Ctrl+Enter/Cmd+Enter in v04 FormDemo', async () => {
    const user = userEvent.setup();
    render(<V04FormDemo />);

    const serialInput = screen.getByLabelText('Device Serial');
    const emailInput = screen.getByLabelText('Operator Email');

    // Enter bad serial (not matching NP3-XXX-X) & bad email, then hit Ctrl+Enter
    await user.clear(serialInput);
    await user.type(serialInput, 'NP3-CORE-01');
    await user.clear(emailInput);
    await user.type(emailInput, 'not-an-email');
    fireEvent.keyDown(emailInput, { key: 'Enter', ctrlKey: true });

    expect(serialInput).toHaveAttribute('aria-invalid', 'true');
    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText(/Must match NP3-XXX-X/i)).toBeInTheDocument();
    expect(screen.getByTestId('v04-form-serial-error-icon')).toBeInTheDocument();
    expect(screen.getByTestId('v04-form-email-error-icon')).toBeInTheDocument();

    // Fix values to valid NP3-XXX-X and submit via Cmd+Enter
    await user.clear(serialInput);
    await user.type(serialInput, 'NP3-999-Z');
    await user.clear(emailInput);
    await user.type(emailInput, 'ops@nothing.tech');
    fireEvent.keyDown(serialInput, { key: 'Enter', metaKey: true });

    await waitFor(
      () => {
        expect(screen.getByText(/SYNCED/i)).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  it('clears all input fields, resets error states, and dismisses status when Reset is clicked in both FormDemo variants', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<CompleteFormDemo />);

    const serialInput = screen.getByLabelText('Device Serial') as HTMLInputElement;
    const emailInput = screen.getByLabelText('Telemetry Contact') as HTMLInputElement;
    const channelSelect = screen.getByLabelText('Firmware Channel') as HTMLSelectElement;
    const consentCheckbox = screen.getByRole('checkbox') as HTMLInputElement;

    await user.selectOptions(channelSelect, 'nightly');
    await user.click(screen.getByRole('button', { name: 'Trigger Errors' }));
    expect(serialInput).toHaveAttribute('aria-invalid', 'true');
    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByTestId('form-error-summary')).toBeInTheDocument();
    expect(screen.getByTestId('form-email-error-icon')).toBeInTheDocument();

    // Click Reset -> clears every field and removes all validation errors
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(serialInput.value).toBe('');
    expect(emailInput.value).toBe('');
    expect(channelSelect.value).toBe('stable');
    expect(consentCheckbox.checked).toBe(false);
    expect(serialInput).toHaveAttribute('aria-invalid', 'false');
    expect(emailInput).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByTestId('form-error-summary')).not.toBeInTheDocument();
    expect(screen.queryByTestId('form-device-serial-error-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('form-email-error-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('form-agreed-error-icon')).not.toBeInTheDocument();
    expect(serialInput).toHaveFocus();

    unmount();

    render(<V04FormDemo />);
    const v04Serial = screen.getByLabelText('Device Serial') as HTMLInputElement;
    const v04Email = screen.getByLabelText('Operator Email') as HTMLInputElement;
    await user.clear(v04Serial);
    await user.type(v04Serial, 'X');
    fireEvent.keyDown(v04Serial, { key: 'Enter', ctrlKey: true });
    expect(v04Serial).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByTestId('v04-form-serial-error-icon')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(v04Serial.value).toBe('');
    expect(v04Email.value).toBe('');
    expect(v04Serial).toHaveAttribute('aria-invalid', 'false');
    expect(v04Email).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByTestId('v04-form-serial-error-icon')).not.toBeInTheDocument();
    expect(v04Serial).toHaveFocus();
  });

  it('supports customizable regex validation props and aria-invalid indicators on NothingInput', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <NothingInput label="Hardware Key" aria-invalid="true" defaultValue="bad" />
        <NothingInput
          label="Device Serial"
          validationRule={REGEX_VALIDATION_PRESETS.deviceSerial}
          defaultValue="NP3-481-A"
        />
        <NothingInput
          label="Custom Tag"
          validationRegex="^GLYPH-\d{3}$"
          validationFlags="i"
          formatHint="GLYPH-NNN"
          validationMessage="Custom Tag must match GLYPH-NNN."
        />
      </div>,
    );

    const staticInvalid = screen.getByLabelText('Hardware Key');
    expect(staticInvalid).toHaveAttribute('aria-invalid', 'true');
    expect(staticInvalid.className).toContain('aria-[invalid=true]:border-[var(--nt-accent)]');

    const serialInput = screen.getByLabelText('Device Serial');
    expect(serialInput).not.toHaveAttribute('aria-invalid', 'true');
    await user.clear(serialInput);
    await user.type(serialInput, 'NP3-BAD-12');
    expect(serialInput).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText(/Must match NP3-XXX-X/i)).toBeInTheDocument();

    const customInput = screen.getByLabelText('Custom Tag');
    await user.type(customInput, 'bad');
    expect(customInput).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Custom Tag must match GLYPH-NNN.')).toBeInTheDocument();

    await user.clear(customInput);
    await user.type(customInput, 'glyph-481');
    expect(customInput).not.toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByText('Custom Tag must match GLYPH-NNN.', { ignore: IGNORE_LIVE_REGION })).not.toBeInTheDocument();
  });

  it('provides plug-and-play regex validation via the useValidation custom hook for any input', async () => {
    const user = userEvent.setup();

    function HookHarness() {
      const codeField = useValidation(
        /^NP3-[A-Z0-9]{3}-[A-Z0-9]$/,
        'Serial must follow NP3-XXX-X format.',
        { validateOnChange: true },
      );
      const dynamicField = useValidation({
        pattern: '^LAB-\\d{2}$',
        flags: 'i',
        errorMessage: 'Expected LAB-NN code.',
        validateOnBlur: true,
      });

      return (
        <div>
          <label htmlFor="hook-serial">Hook Serial</label>
          <input
            {...codeField.getInputProps({ id: 'hook-serial', errorId: 'hook-serial-err' })}
          />
          {codeField.error && (
            <p id="hook-serial-err" role="alert">
              {codeField.error}
            </p>
          )}
          <button type="button" onClick={() => codeField.reset()}>
            Reset Serial
          </button>

          <label htmlFor="hook-dynamic">Dynamic Field</label>
          <input
            {...dynamicField.getInputProps({ id: 'hook-dynamic', errorId: 'hook-dynamic-err' })}
          />
          {dynamicField.error && (
            <p id="hook-dynamic-err" role="alert">
              {dynamicField.error}
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              dynamicField.setPattern('^UNIT-\\d{3}$');
              dynamicField.setErrorMessage('Expected UNIT-NNN.');
            }}
          >
            Switch Rule
          </button>
          <button type="button" onClick={() => dynamicField.setPattern('^BROKEN-[')}>
            Break Pattern
          </button>
          <button type="button" onClick={() => dynamicField.validate()}>
            Validate Dynamic
          </button>
        </div>
      );
    }

    render(<HookHarness />);

    const serialInput = screen.getByLabelText('Hook Serial') as HTMLInputElement;
    await user.type(serialInput, 'NP3-BAD-01');
    expect(serialInput).toHaveAttribute('aria-invalid', 'true');
    expect(serialInput).toHaveAttribute('aria-describedby', 'hook-serial-err');
    expect(screen.getByText('Serial must follow NP3-XXX-X format.')).toBeInTheDocument();

    await user.clear(serialInput);
    await user.type(serialInput, 'NP3-481-A');
    expect(serialInput).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByText('Serial must follow NP3-XXX-X format.', { ignore: IGNORE_LIVE_REGION })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reset Serial' }));
    expect(serialInput.value).toBe('');
    expect(serialInput).toHaveAttribute('aria-invalid', 'false');

    // Dynamic rule switching & blur validation
    const dynamicInput = screen.getByLabelText('Dynamic Field') as HTMLInputElement;
    await user.type(dynamicInput, 'bad');
    fireEvent.blur(dynamicInput);
    expect(dynamicInput).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Expected LAB-NN code.')).toBeInTheDocument();

    await user.clear(dynamicInput);
    await user.type(dynamicInput, 'lab-07');
    expect(dynamicInput).toHaveAttribute('aria-invalid', 'false');

    await user.click(screen.getByRole('button', { name: 'Switch Rule' }));
    await user.click(screen.getByRole('button', { name: 'Validate Dynamic' }));
    expect(dynamicInput).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Expected UNIT-NNN.')).toBeInTheDocument();

    await user.clear(dynamicInput);
    await user.type(dynamicInput, 'unit-123');
    expect(dynamicInput).toHaveAttribute('aria-invalid', 'false');

    // Malformed regex surfaces syntax diagnostic safely
    await user.click(screen.getByRole('button', { name: 'Break Pattern' }));
    expect(dynamicInput).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText(/Invalid regex pattern/i)).toBeInTheDocument();
  });
});
