import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getComponentCatalog,
  getGlyphCatalog,
  getWidgetCatalog,
} from '@nothing-ui/registry';
import { DOT_ICON_LIST } from '@nothing-ui/dot-icons';
import { ThemeProvider } from '@nothing-ui/ui';
import { SearchDialog } from '@apps/ui/components/layout/search-dialog';
import {
  RECENT_SEARCHES_LIMIT_STORAGE_KEY,
  RECENT_SEARCHES_STORAGE_KEY,
} from '@apps/ui/lib/recent-searches';

function renderSearchDialog(overrides: Partial<React.ComponentProps<typeof SearchDialog>> = {}) {
  const props: React.ComponentProps<typeof SearchDialog> = {
    open: true,
    onOpenChange: vi.fn(),
    onNavigate: vi.fn(),
    onSelectComponent: vi.fn(),
    onSelectIcon: vi.fn(),
    onNavigateDocsTab: vi.fn(),
    ...overrides,
  };

  return {
    props,
    ...render(
      <ThemeProvider defaultTheme="dark">
        <SearchDialog {...props} />
      </ThemeProvider>,
    ),
  };
}

describe('SearchDialog', () => {
  beforeEach(() => {
    window.localStorage.removeItem(RECENT_SEARCHES_STORAGE_KEY);
    window.localStorage.removeItem(RECENT_SEARCHES_LIMIT_STORAGE_KEY);
  });

  it('renders search input and separated Components, Widgets, Glyph, and Dot Icons counts when open', () => {
    renderSearchDialog({ open: true });

    const dialog = screen.getByTestId('search-dialog');
    expect(dialog).toBeInTheDocument();
    expect(
      within(dialog).getByLabelText('Search components, widgets, glyph tools, dot icons, and actions'),
    ).toBeInTheDocument();
    expect(within(dialog).getByText(`Components (${getComponentCatalog().length})`)).toBeInTheDocument();
    expect(within(dialog).getByText(`Widgets (${getWidgetCatalog().length})`)).toBeInTheDocument();
    expect(within(dialog).getByText(`Glyph System (${getGlyphCatalog().length})`)).toBeInTheDocument();
    expect(within(dialog).getByText(`9×9 Dot Icons (${DOT_ICON_LIST.length})`)).toBeInTheDocument();
  });

  it('closes when clicking the explicit Close button', async () => {
    const user = userEvent.setup();
    const { props } = renderSearchDialog({ open: true });

    const dialog = screen.getByTestId('search-dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Close search dialog', hidden: true }));
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('routes workspace, docs tab, component, widget, icon, and theme actions cleanly and closes', async () => {
    const user = userEvent.setup();
    const { props } = renderSearchDialog({ open: true });
    const dialog = screen.getByTestId('search-dialog');

    // Charts Hub navigation action
    await user.click(within(dialog).getByText(/Charts Hub & Data Visualization Registry/i));
    expect(props.onNavigate).toHaveBeenCalledWith('charts');
    expect(props.onOpenChange).toHaveBeenCalledWith(false);

    // Widgets Hub navigation action
    await user.click(within(dialog).getByText(/Widgets Hub & Clock Varieties/i));
    expect(props.onNavigate).toHaveBeenCalledWith('widgets');
    expect(props.onOpenChange).toHaveBeenCalledWith(false);

    // Workspace navigation action
    await user.click(within(dialog).getByText(/Open Glyph Studio/i));
    expect(props.onNavigate).toHaveBeenCalledWith('studio');

    // Docs tab navigation action
    await user.click(within(dialog).getByText(/CLI Init & Single-Package Setup/i));
    expect(props.onNavigateDocsTab).toHaveBeenCalledWith('cli');

    // Component selection action
    await user.click(within(dialog).getByText('Timeseries'));
    expect(props.onSelectComponent).toHaveBeenCalledWith('timeseries');

    // Theme switching action updates documentElement directly via ThemeProvider
    await user.click(within(dialog).getByText(/Switch Theme: Light Paper/i));
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    // Icon selection action
    const wifiItem = within(dialog)
      .getAllByText('wifi')
      .find((el) => el.closest('[data-value="icon:wifi"], [role="option"]'));
    expect(wifiItem).toBeDefined();
    await user.click(wifiItem!);
    expect(props.onSelectIcon).toHaveBeenCalledWith('wifi');
  });

  it('persists the last 5 searched component names in localStorage, restores on remount, and clears cleanly', async () => {
    const user = userEvent.setup();
    const { props, unmount } = renderSearchDialog({ open: true });
    const dialog = screen.getByTestId('search-dialog');

    expect(within(dialog).queryByTestId('recent-searches-group')).not.toBeInTheDocument();

    const selectComponentByText = async (label: string) => {
      const candidates = within(dialog).getAllByText(label);
      // Pick the catalog entry outside the recent group so we exercise recording from search list
      const target =
        candidates.find((el) => !el.closest('[data-testid="recent-searches-group"]')) ??
        candidates[0];
      await user.click(target);
    };

    // Select 6 distinct components -> only the last 5 must survive in MRU order
    await selectComponentByText('Button');
    await selectComponentByText('Slider');
    await selectComponentByText('Switch');
    await selectComponentByText('Tabs');
    await selectComponentByText('Timeseries');
    await selectComponentByText('Sankey');

    const stored = JSON.parse(
      window.localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY) ?? '[]',
    ) as string[];
    expect(stored).toEqual(['Sankey', 'Timeseries', 'Tabs', 'Switch', 'Slider']);

    // Re-selecting an existing component promotes it to the top without duplicating
    await selectComponentByText('Tabs');
    const promoted = JSON.parse(
      window.localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY) ?? '[]',
    ) as string[];
    expect(promoted).toEqual(['Tabs', 'Sankey', 'Timeseries', 'Switch', 'Slider']);

    // Remount SearchDialog and confirm all 5 persisted entries render inside Recent Searches
    unmount();
    const { props: nextProps } = renderSearchDialog({ open: true });
    const reopened = screen.getByTestId('search-dialog');
    const recentGroup = within(reopened).getByTestId('recent-searches-group');
    expect(within(recentGroup).getByText('Recent Searches (5/5)')).toBeInTheDocument();
    expect(within(recentGroup).getByText('Tabs')).toBeInTheDocument();
    expect(within(recentGroup).getByText('Slider')).toBeInTheDocument();
    expect(within(recentGroup).queryByText('Button')).not.toBeInTheDocument();

    // Clicking a recent search entry navigates directly to that component
    await user.click(within(recentGroup).getByText('Timeseries'));
    expect(nextProps.onSelectComponent).toHaveBeenCalledWith('timeseries');
    expect(nextProps.onOpenChange).toHaveBeenCalledWith(false);

    // Clicking Clear removes all persisted recent searches
    await user.click(within(reopened).getByTestId('clear-recent-searches'));
    expect(within(reopened).queryByTestId('recent-searches-group')).not.toBeInTheDocument();
    expect(window.localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY)).toBeNull();
    expect(props.onSelectComponent).toHaveBeenCalled();
  }, 15000);

  it('supports configurable recent search limits via UI selector and maxRecentSearches prop', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(
      RECENT_SEARCHES_STORAGE_KEY,
      JSON.stringify(['Button', 'Slider', 'Switch', 'Tabs', 'Timeseries']),
    );

    const { unmount } = renderSearchDialog({ open: true });
    const dialog = screen.getByTestId('search-dialog');
    const recentGroup = within(dialog).getByTestId('recent-searches-group');
    expect(within(recentGroup).getByText('Recent Searches (5/5)')).toBeInTheDocument();

    // Lower configured limit via UI selector from 5 -> 3
    const limitSelect = within(recentGroup).getByTestId('recent-searches-limit-select');
    await user.selectOptions(limitSelect, '3');

    expect(within(recentGroup).getByText('Recent Searches (3/3)')).toBeInTheDocument();
    expect(window.localStorage.getItem(RECENT_SEARCHES_LIMIT_STORAGE_KEY)).toBe('3');
    expect(JSON.parse(window.localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY) ?? '[]')).toEqual([
      'Button',
      'Slider',
      'Switch',
    ]);

    // Controlled maxRecentSearches prop overrides stored limit cleanly
    unmount();
    renderSearchDialog({ open: true, maxRecentSearches: 2 });
    const reopened = screen.getByTestId('search-dialog');
    const cappedGroup = within(reopened).getByTestId('recent-searches-group');
    expect(within(cappedGroup).getByText('Recent Searches (2/2)')).toBeInTheDocument();
    expect(within(cappedGroup).queryByTestId('recent-searches-limit-select')).not.toBeInTheDocument();
  }, 15000);
});
