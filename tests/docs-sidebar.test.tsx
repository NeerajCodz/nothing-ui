import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CATALOG } from '@nothing-ui/registry';
import { ThemeProvider } from '@nothing-ui/ui';
import { DocsSidebar } from '@apps/ui/components/layout/docs-sidebar';

function renderSidebar(overrides: Partial<React.ComponentProps<typeof DocsSidebar>> = {}) {
  const props: React.ComponentProps<typeof DocsSidebar> = {
    section: 'overview',
    activeSlug: 'button',
    docsTab: 'cli',
    mobileOpen: false,
    onCloseMobile: vi.fn(),
    onNavigate: vi.fn(),
    onSelectComponent: vi.fn(),
    onNavigateDocsTab: vi.fn(),
    ...overrides,
  };

  return {
    props,
    ...render(
      <ThemeProvider defaultTheme="dark">
        <DocsSidebar {...props} />
      </ThemeProvider>,
    ),
  };
}

describe('DocsSidebar', () => {
  it('renders desktop sidebar with catalog count, Getting Started links, and theme controls', () => {
    renderSidebar({ section: 'components', activeSlug: 'button' });

    const sidebar = screen.getByTestId('docs-sidebar');
    expect(within(sidebar).getByRole('button', { name: `All (${CATALOG.length})` })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(within(sidebar).getByRole('button', { name: 'Native Ready' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(within(sidebar).getByText('Getting Started')).toBeInTheDocument();
    expect(within(sidebar).getByText('Architecture & Docs')).toBeInTheDocument();

    const activeComponentBtn = within(sidebar).getByText('Button').closest('button');
    expect(activeComponentBtn).toHaveAttribute('aria-current', 'page');
  });

  it('strictly separates Glyph System, Widgets, and Components (with dedicated Charts subsection)', async () => {
    const user = userEvent.setup();
    const { props } = renderSidebar();

    const glyphSection = screen.getByTestId('sidebar-glyph-section');
    expect(within(glyphSection).getByText('Glyph System')).toBeInTheDocument();
    expect(within(glyphSection).getByRole('button', { name: /Glyph Studio/i })).toBeInTheDocument();
    expect(within(glyphSection).getByRole('button', { name: /Glyph Matrix/i })).toBeInTheDocument();

    const widgetsSection = screen.getByTestId('sidebar-widgets-section');
    expect(within(widgetsSection).getByText('Widgets')).toBeInTheDocument();
    expect(within(widgetsSection).getByRole('button', { name: /Widgets Hub & Clocks/i })).toBeInTheDocument();
    expect(within(widgetsSection).getByRole('button', { name: /Audio Recorder/i })).toBeInTheDocument();
    expect(within(widgetsSection).getByRole('button', { name: /Video Recorder/i })).toBeInTheDocument();
    expect(within(widgetsSection).getByText('Calendar').closest('button')).toBeInTheDocument();
    expect(within(widgetsSection).getByText('Calendar Canvas').closest('button')).toBeInTheDocument();

    const componentsSection = screen.getByTestId('sidebar-components-section');
    expect(within(componentsSection).getByRole('button', { name: /Charts\s*9/i })).toBeInTheDocument();
    const chartsHubBtn = within(componentsSection).getByRole('button', { name: /Charts Hub & Registry/i });
    expect(chartsHubBtn).toBeInTheDocument();
    await user.click(chartsHubBtn);
    expect(props.onNavigate).toHaveBeenCalledWith('charts');

    expect(within(componentsSection).getByRole('button', { name: /Timeseries/i })).toBeInTheDocument();
    expect(within(componentsSection).queryByRole('button', { name: /Audio Recorder/i })).not.toBeInTheDocument();
    expect(within(componentsSection).queryByRole('button', { name: /Glyph Matrix/i })).not.toBeInTheDocument();

    // Components must appear above Glyph System (and Widgets) in the sidebar navigation
    expect(
      componentsSection.compareDocumentPosition(glyphSection) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      glyphSection.compareDocumentPosition(widgetsSection) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('filters catalog modules in real time, shows empty state, and resets via Clear button', async () => {
    const user = userEvent.setup();
    renderSidebar();

    const sidebar = screen.getByTestId('docs-sidebar');
    const filterInput = within(sidebar).getByLabelText('Filter sidebar components');

    await user.type(filterInput, 'timeseries');
    expect(within(sidebar).queryByText('Getting Started')).not.toBeInTheDocument();
    expect(within(sidebar).getByRole('button', { name: /Timeseries/i })).toBeInTheDocument();

    await user.clear(filterInput);
    await user.type(filterInput, 'zzznomatch999');
    expect(within(sidebar).getByText(/No modules match/i)).toBeInTheDocument();

    await user.click(within(sidebar).getByRole('button', { name: 'Clear sidebar filter' }));
    expect(filterInput).toHaveValue('');
    expect(within(sidebar).getByText('Getting Started')).toBeInTheDocument();
  });

  it('toggles platform filter and collapses/expands component category groups', async () => {
    const user = userEvent.setup();
    renderSidebar();

    const sidebar = screen.getByTestId('docs-sidebar');
    const nativeBtn = within(sidebar).getByRole('button', { name: 'Native Ready' });
    await user.click(nativeBtn);
    expect(nativeBtn).toHaveAttribute('aria-pressed', 'true');

    // Collapse the first category group header
    const groupButtons = within(sidebar).getAllByRole('button', { expanded: true });
    expect(groupButtons.length).toBeGreaterThan(0);
    const firstGroupBtn = groupButtons[0];

    await user.click(firstGroupBtn);
    expect(firstGroupBtn).toHaveAttribute('aria-expanded', 'false');

    await user.click(firstGroupBtn);
    expect(firstGroupBtn).toHaveAttribute('aria-expanded', 'true');
  });

  it('does not render its own theme switcher (theme lives in the site header only)', () => {
    renderSidebar();

    const sidebar = screen.getByTestId('docs-sidebar');
    expect(within(sidebar).queryByRole('group', { name: 'Sidebar theme switch' })).not.toBeInTheDocument();
  });

  it('renders portaled mobile drawer when mobileOpen is true and closes on dismiss or selection', async () => {
    const user = userEvent.setup();
    const onCloseMobile = vi.fn();
    const onSelectComponent = vi.fn();
    const onNavigateDocsTab = vi.fn();

    renderSidebar({
      mobileOpen: true,
      onCloseMobile,
      onSelectComponent,
      onNavigateDocsTab,
    });

    const dialog = screen.getByRole('dialog', { name: 'Mobile documentation sidebar' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    await user.click(within(dialog).getByRole('button', { name: /CLI & Setup/i }));
    expect(onNavigateDocsTab).toHaveBeenCalledWith('cli');
    expect(onCloseMobile).toHaveBeenCalledTimes(1);

    await user.click(within(dialog).getByRole('button', { name: 'Close sidebar' }));
    expect(onCloseMobile).toHaveBeenCalledTimes(2);

    await user.click(within(dialog).getByRole('button', { name: 'Dismiss sidebar backdrop' }));
    expect(onCloseMobile).toHaveBeenCalledTimes(3);
  });
});
