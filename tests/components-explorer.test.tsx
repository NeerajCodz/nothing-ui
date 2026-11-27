import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@nothing-ui/ui';
import { ComponentsExplorer } from '@apps/ui/components/components-explorer';

function renderExplorer(overrides: Partial<React.ComponentProps<typeof ComponentsExplorer>> = {}) {
  const props: React.ComponentProps<typeof ComponentsExplorer> = {
    activeSlug: 'button',
    onSelectSlug: vi.fn(),
    onOpenGlyphStudio: vi.fn(),
    onOpenIconExplorer: vi.fn(),
    ...overrides,
  };

  return {
    props,
    ...render(
      <ThemeProvider defaultTheme="dark">
        <ComponentsExplorer {...props} />
      </ThemeProvider>,
    ),
  };
}

describe('ComponentsExplorer', () => {
  it('renders component metadata, interactive preview, playground, and nthgui CLI command', () => {
    renderExplorer({ activeSlug: 'button' });

    expect(screen.getByRole('heading', { level: 1, name: 'Button' })).toBeInTheDocument();
    expect(screen.getByTestId('cli-command')).toHaveTextContent('npx nthgui add button');
  });

  it('switches package managers, CLI vs Package modes, Web vs Native platform, and toggles Registry JSON', async () => {
    const user = userEvent.setup();
    renderExplorer({ activeSlug: 'timeseries' });

    expect(screen.getByRole('heading', { level: 1, name: 'Timeseries' })).toBeInTheDocument();
    expect(screen.getByTestId('cli-command')).toHaveTextContent('npx nthgui add timeseries');

    // Switch to pnpm
    await user.click(screen.getByRole('button', { name: 'pnpm' }));
    expect(screen.getByTestId('cli-command')).toHaveTextContent('pnpm dlx nthgui add timeseries');

    // Switch to Native platform (plain "Native" without "(stable)" suffix)
    expect(screen.queryByText(/Native\s*\(stable\)/i)).not.toBeInTheDocument();
    expect(screen.getByTestId('explorer-breadcrumb')).not.toHaveTextContent('Native: stable');
    await user.click(screen.getByRole('button', { name: 'Native' }));
    expect(screen.getByTestId('cli-command')).toHaveTextContent('--native');

    // Switch to Package install mode
    await user.click(screen.getByRole('button', { name: 'Package' }));
    expect(screen.getByTestId('cli-command')).toHaveTextContent('pnpm add nthgui');

    // Toggle Registry JSON panel
    await user.click(screen.getByRole('button', { name: 'Registry JSON' }));
    expect(screen.getByRole('button', { name: 'Hide Registry JSON' })).toBeInTheDocument();
  });

  it('wires mobile switcher, contextual Studio/Widgets shortcuts, and 3-track breadcrumbs', async () => {
    const user = userEvent.setup();
    const onSelectSlug = vi.fn();
    const onOpenGlyphStudio = vi.fn();
    const onOpenWidgets = vi.fn();

    const { rerender } = renderExplorer({
      activeSlug: 'glyph-matrix',
      onSelectSlug,
      onOpenGlyphStudio,
      onOpenWidgets,
    });

    expect(screen.getByTestId('explorer-breadcrumb')).toHaveTextContent('Glyph System');
    await user.click(screen.getByRole('button', { name: /Open Full Glyph Studio/i }));
    expect(onOpenGlyphStudio).toHaveBeenCalledTimes(1);

    const mobileSelect = screen.getByLabelText('Select component, widget, or glyph module');
    await user.selectOptions(mobileSelect, 'pie-chart');
    expect(onSelectSlug).toHaveBeenCalledWith('pie-chart');

    rerender(
      <ThemeProvider defaultTheme="dark">
        <ComponentsExplorer
          activeSlug="audio-recorder"
          onSelectSlug={onSelectSlug}
          onOpenGlyphStudio={onOpenGlyphStudio}
          onOpenIconExplorer={vi.fn()}
          onOpenWidgets={onOpenWidgets}
        />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('explorer-breadcrumb')).toHaveTextContent('Widgets');
    expect(screen.getByTestId('explorer-breadcrumb')).toHaveTextContent('Audio & Video');
    await user.click(screen.getByRole('button', { name: /All Widgets & Roadmap/i }));
    expect(onOpenWidgets).toHaveBeenCalledTimes(1);
  });

  it('visually indicates Stable, Alpha, Beta, and Deprecated maturity levels using Nothing UI color tokens', () => {
    const { rerender } = renderExplorer({ activeSlug: 'button' });

    // Stable component uses --nt-success and no warning advisory
    const stableBadge = screen.getByTestId('component-maturity-badge');
    expect(stableBadge).toHaveAttribute('data-maturity', 'stable');
    expect(stableBadge).toHaveAttribute('data-color-token', '--nt-success');
    expect(stableBadge).toHaveTextContent('Stable');
    expect(screen.queryByTestId('component-maturity-advisory')).not.toBeInTheDocument();

    // Alpha component uses --nt-warning and displays lifecycle advisory
    rerender(
      <ThemeProvider defaultTheme="dark">
        <ComponentsExplorer
          activeSlug="custom-chart"
          onSelectSlug={vi.fn()}
          onOpenGlyphStudio={vi.fn()}
          onOpenIconExplorer={vi.fn()}
        />
      </ThemeProvider>,
    );
    const alphaBadge = screen.getByTestId('component-maturity-badge');
    expect(alphaBadge).toHaveAttribute('data-maturity', 'alpha');
    expect(alphaBadge).toHaveAttribute('data-color-token', '--nt-warning');
    expect(alphaBadge).toHaveTextContent('Alpha');
    expect(screen.getByTestId('component-maturity-advisory')).toHaveTextContent(/Alpha preview/i);

    // Beta component uses --nt-display
    rerender(
      <ThemeProvider defaultTheme="dark">
        <ComponentsExplorer
          activeSlug="media-studio"
          onSelectSlug={vi.fn()}
          onOpenGlyphStudio={vi.fn()}
          onOpenIconExplorer={vi.fn()}
        />
      </ThemeProvider>,
    );
    const betaBadge = screen.getByTestId('component-maturity-badge');
    expect(betaBadge).toHaveAttribute('data-maturity', 'beta');
    expect(betaBadge).toHaveAttribute('data-color-token', '--nt-display');
    expect(betaBadge).toHaveTextContent('Beta');

    // Live Deprecated component (native-select) uses --nt-danger (Signal Red) and renders deprecation advisory
    rerender(
      <ThemeProvider defaultTheme="dark">
        <ComponentsExplorer
          activeSlug="native-select"
          onSelectSlug={vi.fn()}
          onOpenGlyphStudio={vi.fn()}
          onOpenIconExplorer={vi.fn()}
        />
      </ThemeProvider>,
    );
    const deprecatedBadge = screen.getByTestId('component-maturity-badge');
    expect(deprecatedBadge).toHaveAttribute('data-maturity', 'deprecated');
    expect(deprecatedBadge).toHaveAttribute('data-color-token', '--nt-danger');
    expect(deprecatedBadge).toHaveTextContent('Deprecated');
    expect(screen.getByTestId('component-maturity-advisory')).toHaveTextContent(/Deprecated module/i);

    // Related component buttons also expose maturity metadata
    const relatedSection = document.getElementById('comp-related');
    expect(relatedSection).not.toBeNull();
    const relatedButtons = within(relatedSection!).getAllByRole('button');
    expect(relatedButtons.length).toBeGreaterThan(0);
    expect(relatedButtons[0]).toHaveAttribute('data-maturity');
  });
});
