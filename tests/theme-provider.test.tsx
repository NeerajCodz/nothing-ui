import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ScopedTheme, ThemeProvider, useTheme } from '@nothing-ui/ui';

function ThemeConsumer() {
  const { theme, setTheme, cycleTheme, density, setDensity, dir, setDir } = useTheme();
  return (
    <div>
      <output data-testid="theme-state">{`${theme}|${density}|${dir}`}</output>
      <button type="button" onClick={cycleTheme}>
        Cycle Theme
      </button>
      <button type="button" onClick={() => setTheme('high-contrast')}>
        Force HC
      </button>
      <button type="button" onClick={() => setDensity('compact')}>
        Compact
      </button>
      <button type="button" onClick={() => setDir('rtl')}>
        Set RTL
      </button>
    </div>
  );
}

describe('ThemeProvider & ScopedTheme', () => {
  it('syncs data-theme, classes, data-density, and dir on documentElement across transitions', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider defaultTheme="dark" defaultDensity="default" defaultDir="ltr">
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('theme-state')).toHaveTextContent('dark|default|ltr');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('high-contrast')).toBe(false);
    expect(document.documentElement.getAttribute('data-density')).toBe('default');
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');

    // Cycle dark -> light -> high-contrast -> dark
    await user.click(screen.getByRole('button', { name: 'Cycle Theme' }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(window.localStorage.getItem('nthgui-theme')).toBe('light');

    await user.click(screen.getByRole('button', { name: 'Cycle Theme' }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('high-contrast');
    expect(document.documentElement.classList.contains('light')).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
    expect(window.localStorage.getItem('nthgui-theme')).toBe('high-contrast');

    await user.click(screen.getByRole('button', { name: 'Cycle Theme' }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('high-contrast')).toBe(false);
    expect(window.localStorage.getItem('nthgui-theme')).toBe('dark');

    // Density & RTL mutations
    await user.click(screen.getByRole('button', { name: 'Compact' }));
    await user.click(screen.getByRole('button', { name: 'Set RTL' }));
    expect(document.documentElement.getAttribute('data-density')).toBe('compact');
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    expect(screen.getByTestId('theme-state')).toHaveTextContent('dark|compact|rtl');
  });

  it('hydrates persisted theme from localStorage on mount and falls back cleanly on invalid values', () => {
    window.localStorage.setItem('nthgui-theme', 'high-contrast');

    const { unmount } = render(
      <ThemeProvider defaultTheme="dark">
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('theme-state')).toHaveTextContent('high-contrast|default|ltr');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
    unmount();

    // Invalid stored value falls back to defaultTheme
    window.localStorage.setItem('nthgui-theme', 'invalid-mode');
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('theme-state')).toHaveTextContent('light|default|ltr');
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  it('throws a clear error when useTheme is invoked outside ThemeProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<ThemeConsumer />)).toThrow('useTheme must be used inside a ThemeProvider');
    spy.mockRestore();
  });

  it('ScopedTheme isolates data-theme, density, dir, and classes without mutating documentElement', () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <ScopedTheme theme="high-contrast" density="compact" dir="rtl" className="preview-box">
          <span>Isolated Preview</span>
        </ScopedTheme>
      </ThemeProvider>,
    );

    const container = screen.getByText('Isolated Preview').parentElement!;
    expect(container).toHaveAttribute('data-theme', 'high-contrast');
    expect(container).toHaveAttribute('data-density', 'compact');
    expect(container).toHaveAttribute('dir', 'rtl');
    expect(container.className).toContain('dark high-contrast');
    expect(container.className).toContain('preview-box');

    // Global root stays unaffected
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');
  });

  it('syncs colorScheme and responds to cross-tab localStorage storage events', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider defaultTheme="dark">
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(document.documentElement.style.colorScheme).toBe('dark');

    await user.click(screen.getByRole('button', { name: 'Cycle Theme' }));
    expect(document.documentElement.style.colorScheme).toBe('light');

    // Simulate another browser tab switching localStorage to high-contrast
    const storageEvent = new StorageEvent('storage', {
      key: 'nthgui-theme',
      newValue: 'high-contrast',
    });
    window.dispatchEvent(storageEvent);

    await screen.findByText('high-contrast|default|ltr');
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('high-contrast');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
      expect(document.documentElement.style.colorScheme).toBe('dark');
    });

    // Ignore unrelated keys or invalid values
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'nthgui-theme',
        newValue: 'invalid-theme',
      }),
    );
    expect(screen.getByTestId('theme-state')).toHaveTextContent('high-contrast|default|ltr');
  });
});
