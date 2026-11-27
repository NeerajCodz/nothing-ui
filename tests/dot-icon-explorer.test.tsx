import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DOT_ICON_LIST, type DotIconCanonicalName } from '@nothing-ui/dot-icons';
import { ThemeProvider } from '@nothing-ui/ui';
import { DotIconExplorer } from '@apps/ui/components/icons/icon-explorer';

function renderExplorer(initialIcon?: DotIconCanonicalName) {
  return render(
    <ThemeProvider defaultTheme="dark">
      <DotIconExplorer initialIcon={initialIcon} />
    </ThemeProvider>,
  );
}

describe('DotIconExplorer', () => {
  it('exposes 200+ (247) icons with search across aliases and expandable catalog', async () => {
    const user = userEvent.setup();
    renderExplorer('wifi');

    expect(DOT_ICON_LIST.length).toBeGreaterThanOrEqual(200);
    expect(screen.getByTestId('dot-icon-total-count')).toHaveTextContent(`${DOT_ICON_LIST.length} Dot Icons`);

    // Search for one of the newly added icons beyond the original 35
    const searchInput = screen.getByLabelText('Search dot icons');
    await user.type(searchInput, 'bluetooth');

    const bluetoothBtn = screen.getByRole('button', { name: 'bluetooth' });
    expect(bluetoothBtn).toBeInTheDocument();
    await user.click(bluetoothBtn);

    const inspector = screen.getByTestId('dot-icon-inspector');
    expect(within(inspector).getByRole('heading', { name: 'Bluetooth' })).toBeInTheDocument();
  });

  it('configures size, single-dot scale, dot shape, color, and non-square dot grid live', async () => {
    const user = userEvent.setup();
    renderExplorer('bolt');

    const inspector = screen.getByTestId('dot-icon-inspector');

    // Change size, dot scale, cols, and rows via sliders
    fireEvent.change(screen.getByLabelText('Preview icon size'), { target: { value: '48' } });
    fireEvent.change(screen.getByLabelText('Single dot scale'), { target: { value: '0.95' } });
    fireEvent.change(screen.getByLabelText('Grid columns'), { target: { value: '15' } });
    fireEvent.change(screen.getByLabelText('Grid rows'), { target: { value: '11' } });

    expect(screen.getByTestId('inspector-grid-dims')).toHaveTextContent('15×11 Grid');

    // Select rounded dot shape & Signal Red color & toggle Show Matrix Grid
    await user.click(screen.getByRole('button', { name: 'Rounded' }));
    await user.click(screen.getByRole('button', { name: 'Color: Signal Red' }));
    await user.click(screen.getByTestId('toggle-show-grid'));

    // Magnifier should now have 15 * 11 = 165 interactive dot cells
    const magnifier = screen.getByTestId('bitmap-magnifier');
    expect(within(magnifier).getAllByRole('button')).toHaveLength(165);

    // Code preview reflects every configured prop
    const codePreview = screen.getByTestId('dot-icon-code-preview');
    expect(codePreview).toHaveTextContent('size={48}');
    expect(codePreview).toHaveTextContent('color="#D71921"');
    expect(codePreview).toHaveTextContent('dotScale={0.95}');
    expect(codePreview).toHaveTextContent('dotShape="rounded"');
    expect(codePreview).toHaveTextContent('gridCols={15}');
    expect(codePreview).toHaveTextContent('gridRows={11}');
    expect(codePreview).toHaveTextContent('showGrid');

    // Rendered hero SVG has updated viewBox="0 0 15 11"
    const heroSvg = within(inspector).getByRole('img', { name: /bolt dot icon/i });
    expect(heroSvg).toHaveAttribute('viewBox', '0 0 15 11');
  });

  it('supports interactive click-to-paint dot editing and resetting back to canonical grid', async () => {
    const user = userEvent.setup();
    renderExplorer('heart');

    const magnifier = screen.getByTestId('bitmap-magnifier');
    const firstCell = within(magnifier).getByRole('button', { name: /Toggle dot \(0, 0\)/i });
    expect(firstCell).toHaveAttribute('aria-pressed', 'false');

    await user.click(firstCell);
    expect(firstCell).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('dot-icon-code-preview')).toHaveTextContent('grid={[');

    // Reset painted grid
    await user.click(screen.getByTestId('reset-painted-grid'));
    expect(firstCell).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByTestId('dot-icon-code-preview')).not.toHaveTextContent('grid={[');
  });

  it('filters the full Lucide Directory pack, resolves Lucide aliases, and defaults Lucide icons to 15x15 native grid', async () => {
    const user = userEvent.setup();
    renderExplorer('wifi');

    expect(DOT_ICON_LIST.length).toBe(1691);
    expect(screen.getByTestId('source-filter-nothing')).toHaveTextContent('247');
    expect(screen.getByTestId('source-filter-lucide')).toHaveTextContent('1444');

    // Switch to Lucide Directory source filter
    await user.click(screen.getByTestId('source-filter-lucide'));
    expect(screen.getByTestId('source-filter-lucide')).toHaveAttribute('aria-pressed', 'true');

    // Search for a Lucide-only icon and select it
    const searchInput = screen.getByLabelText('Search dot icons');
    await user.type(searchInput, 'alarm-clock');

    const alarmBtn = screen.getByRole('button', { name: 'alarm-clock' });
    await user.click(alarmBtn);

    const inspector = screen.getByTestId('dot-icon-inspector');
    expect(within(inspector).getByRole('heading', { name: 'Alarm Clock' })).toBeInTheDocument();
    expect(within(inspector).getByText('Lucide Directory')).toBeInTheDocument();
    expect(screen.getByTestId('inspector-grid-dims')).toHaveTextContent('15×15 Grid');

    // Interactive editor renders native 15 * 15 = 225 cells
    const magnifier = screen.getByTestId('bitmap-magnifier');
    expect(within(magnifier).getAllByRole('button')).toHaveLength(225);

    // Resampling Lucide icon down to 9x9 updates viewBox and editor cleanly
    await user.click(screen.getByRole('button', { name: '9×9' }));
    expect(screen.getByTestId('inspector-grid-dims')).toHaveTextContent('9×9 Grid');
    expect(within(magnifier).getAllByRole('button')).toHaveLength(81);

    // Search via official Lucide alias "activity-square" -> "square-activity"
    await user.clear(searchInput);
    await user.type(searchInput, 'activity-square');
    expect(screen.getByRole('button', { name: 'square-activity' })).toBeInTheDocument();
  });
});
