import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchBarWidget, SEARCH_BAR_HISTORY_KEY } from '@nothing-ui/ui';

describe('SearchBarWidget', () => {
  beforeEach(() => {
    window.localStorage.removeItem(SEARCH_BAR_HISTORY_KEY);
  });

  it('filters results by query and scope, supports keyboard Enter execution, and updates recent history', async () => {
    const user = userEvent.setup();
    const onSelectResult = vi.fn();

    render(<SearchBarWidget onSelectResult={onSelectResult} />);

    const input = screen.getByRole('combobox', { name: 'Search Bar Widget input' });
    await user.type(input, 'glyph');

    const listbox = screen.getByRole('listbox', { name: 'Search Bar suggestions' });
    const options = within(listbox).getAllByRole('option');
    expect(options.length).toBeGreaterThanOrEqual(2);
    expect(options[0]).toHaveTextContent(/Glyph Composer/i);

    // Narrow to Actions scope
    const scopeGroup = screen.getByRole('group', { name: 'Search scope filter' });
    await user.click(within(scopeGroup).getByRole('button', { name: 'Actions' }));
    const actionOptions = within(listbox).getAllByRole('option');
    expect(actionOptions.length).toBe(2);
    expect(actionOptions[0]).toHaveTextContent(/Toggle Glyph Torch/i);

    // Keyboard ArrowDown + Enter selects second matching action
    await user.click(input);
    await user.keyboard('{ArrowDown}{Enter}');

    expect(onSelectResult).toHaveBeenCalledTimes(1);
    expect(onSelectResult.mock.calls[0][0]?.id).toBe('action-flip-glyph');
    expect(screen.getByTestId('search-bar-status')).toHaveTextContent(/Flip to Glyph Focus/i);

    // Clear query -> persisted recent history includes "glyph"
    await user.click(screen.getByRole('button', { name: 'Clear search query' }));
    expect(input).toHaveValue('');
    const recentStrip = screen.getByTestId('search-bar-recent-strip');
    expect(within(recentStrip).getByRole('button', { name: 'glyph' })).toBeInTheDocument();
  });

  it('shows empty state with direct Web Search fallback and toggles Voice capture cleanly', async () => {
    const user = userEvent.setup();
    const onSearchSubmit = vi.fn();

    render(<SearchBarWidget onSearchSubmit={onSearchSubmit} />);

    const input = screen.getByRole('combobox', { name: 'Search Bar Widget input' });
    await user.type(input, 'quantum matrix');

    expect(screen.getByText(/No local matches/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Search Web/i }));
    expect(onSearchSubmit).toHaveBeenCalledWith('quantum matrix', 'all');
    expect(screen.getByTestId('search-bar-status')).toHaveTextContent(/Web search/i);

    // Toggle voice search button
    const voiceBtn = screen.getByRole('button', { name: 'Start voice search' });
    await user.click(voiceBtn);
    expect(screen.getByRole('button', { name: 'Stop voice search' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
